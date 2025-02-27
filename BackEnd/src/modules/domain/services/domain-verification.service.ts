import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dns from 'dns';
import { promisify } from 'util';
import { Domain } from '../entities/domain.entity';
import { DomainVerificationToken } from '../entities/domain-verification-token.entity';
import { DomainVerificationStatus } from '../enums/domain-verification-status.enum';
import { DomainVerificationMethod } from '../enums/domain-verification-method.enum';

@Injectable()
export class DomainVerificationService {
    private readonly logger = new Logger(DomainVerificationService.name);
    private readonly resolveTxt = promisify(dns.resolveTxt);
    private readonly resolveCname = promisify(dns.resolveCname);

    constructor(
        @InjectRepository(Domain)
        private readonly domainRepository: Repository<Domain>,
        @InjectRepository(DomainVerificationToken)
        private readonly verificationTokenRepository: Repository<DomainVerificationToken>,
        private readonly configService: ConfigService,
    ) {}

    async initiateDomainVerification(
        domainId: string, 
        method: DomainVerificationMethod
    ): Promise<DomainVerificationToken> {
        try {
            const domain = await this.domainRepository.findOneByOrFail({ id: domainId });

            // Generate verification token
            const token = await this.generateVerificationToken(domain, method);

            // Create verification record
            const verificationToken = this.verificationTokenRepository.create({
                domain,
                token: token,
                method,
                status: DomainVerificationStatus.PENDING,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            });

            await this.verificationTokenRepository.save(verificationToken);

            // Update domain status
            domain.verificationStatus = DomainVerificationStatus.PENDING;
            await this.domainRepository.save(domain);

            return verificationToken;
        } catch (error) {
            this.logger.error(`Error initiating domain verification: ${error.message}`);
            throw error;
        }
    }

    async verifyDomain(domainId: string): Promise<boolean> {
        try {
            const domain = await this.domainRepository.findOne({
                where: { id: domainId },
                relations: ['verificationTokens']
            });

            if (!domain) {
                throw new NotFoundException(`Domain with ID ${domainId} not found`);
            }

            const activeToken = domain.verificationTokens.find(
                token => token.status === DomainVerificationStatus.PENDING
            );

            if (!activeToken) {
                throw new Error('No active verification token found');
            }

            let isVerified = false;

            switch (activeToken.method) {
                case DomainVerificationMethod.DNS_TXT:
                    isVerified = await this.verifyDnsTxtRecord(domain.name, activeToken.token);
                    break;
                case DomainVerificationMethod.DNS_CNAME:
                    isVerified = await this.verifyDnsCnameRecord(domain.name, activeToken.token);
                    break;
                case DomainVerificationMethod.FILE:
                    isVerified = await this.verifyFileRecord(domain.name, activeToken.token);
                    break;
                default:
                    throw new Error(`Unsupported verification method: ${activeToken.method}`);
            }

            // Update verification status
            activeToken.status = isVerified 
                ? DomainVerificationStatus.VERIFIED 
                : DomainVerificationStatus.FAILED;
            activeToken.verifiedAt = isVerified ? new Date() : undefined;
            await this.verificationTokenRepository.save(activeToken);

            // Update domain status
            domain.verificationStatus = isVerified 
                ? DomainVerificationStatus.VERIFIED 
                : DomainVerificationStatus.FAILED;
            domain.verifiedAt = isVerified ? new Date() : undefined;
            await this.domainRepository.save(domain);

            return isVerified;
        } catch (error) {
            this.logger.error(`Error verifying domain: ${error.message}`);
            throw error;
        }
    }

    private async verifyDnsTxtRecord(domain: string, token: string): Promise<boolean> {
        try {
            const records = await this.resolveTxt(domain);
            const flatRecords = records.flat();
            return flatRecords.some(record => record.includes(token));
        } catch (error) {
            this.logger.error(`Error verifying DNS TXT record: ${error.message}`);
            return false;
        }
    }

    private async verifyDnsCnameRecord(domain: string, token: string): Promise<boolean> {
        try {
            const expectedValue = `${token}.${this.configService.get('VERIFICATION_DOMAIN')}`;
            const records = await this.resolveCname(domain);
            return records.some(record => record === expectedValue);
        } catch (error) {
            this.logger.error(`Error verifying DNS CNAME record: ${error.message}`);
            return false;
        }
    }

    private async verifyFileRecord(domain: string, token: string): Promise<boolean> {
        try {
            const verificationUrl = `https://${domain}/.well-known/domain-verification.txt`;
            const response = await fetch(verificationUrl);
            if (!response.ok) {
                return false;
            }
            const content = await response.text();
            return content.trim() === token;
        } catch (error) {
            this.logger.error(`Error verifying file record: ${error.message}`);
            return false;
        }
    }

    private async generateVerificationToken(
        domain: Domain,
        method: DomainVerificationMethod
    ): Promise<string> {
        const prefix = method === DomainVerificationMethod.DNS_TXT ? 'domain-verify' : 'verify';
        const randomString = Math.random().toString(36).substring(2, 15);
        return `${prefix}-${domain.id}-${randomString}`;
    }

    async cleanupExpiredTokens(): Promise<void> {
        try {
            const expiredTokens = await this.verificationTokenRepository.find({
                where: {
                    status: DomainVerificationStatus.PENDING,
                    expiresAt: LessThan(new Date())
                }
            });

            for (const token of expiredTokens) {
                token.status = DomainVerificationStatus.EXPIRED;
                await this.verificationTokenRepository.save(token);

                const domain = await this.domainRepository.findOne({
                    where: { id: token.domainId },
                    relations: ['verificationTokens']
                });

                if (domain) {
                    const hasActiveTokens = domain.verificationTokens.some(
                        t => t.status === DomainVerificationStatus.PENDING
                    );

                    if (!hasActiveTokens) {
                        domain.verificationStatus = DomainVerificationStatus.EXPIRED;
                        await this.domainRepository.save(domain);
                    }
                }
            }
        } catch (error) {
            this.logger.error(`Error cleaning up expired tokens: ${error.message}`);
            throw error;
        }
    }

    async getDomainVerificationStatus(domainId: string): Promise<{
        status: DomainVerificationStatus;
        method?: DomainVerificationMethod;
        token?: string;
        expiresAt?: Date;
        verifiedAt?: Date;
    }> {
        try {
            const domain = await this.domainRepository.findOne({
                where: { id: domainId },
                relations: ['verificationTokens']
            });

            if (!domain) {
                throw new NotFoundException(`Domain with ID ${domainId} not found`);
            }

            const activeToken = domain.verificationTokens.find(
                token => token.status === DomainVerificationStatus.PENDING
            );

            return {
                status: domain.verificationStatus,
                method: activeToken?.method,
                token: activeToken?.token,
                expiresAt: activeToken?.expiresAt,
                verifiedAt: domain.verifiedAt
            };
        } catch (error) {
            this.logger.error(`Error getting domain verification status: ${error.message}`);
            throw error;
        }
    }
}