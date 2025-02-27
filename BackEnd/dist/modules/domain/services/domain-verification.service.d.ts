import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Domain } from '../entities/domain.entity';
import { DomainVerificationToken } from '../entities/domain-verification-token.entity';
import { DomainVerificationStatus } from '../enums/domain-verification-status.enum';
import { DomainVerificationMethod } from '../enums/domain-verification-method.enum';
export declare class DomainVerificationService {
    private readonly domainRepository;
    private readonly verificationTokenRepository;
    private readonly configService;
    private readonly logger;
    private readonly resolveTxt;
    private readonly resolveCname;
    constructor(domainRepository: Repository<Domain>, verificationTokenRepository: Repository<DomainVerificationToken>, configService: ConfigService);
    initiateDomainVerification(domainId: string, method: DomainVerificationMethod): Promise<DomainVerificationToken>;
    verifyDomain(domainId: string): Promise<boolean>;
    private verifyDnsTxtRecord;
    private verifyDnsCnameRecord;
    private verifyFileRecord;
    private generateVerificationToken;
    cleanupExpiredTokens(): Promise<void>;
    getDomainVerificationStatus(domainId: string): Promise<{
        status: DomainVerificationStatus;
        method?: DomainVerificationMethod;
        token?: string;
        expiresAt?: Date;
        verifiedAt?: Date;
    }>;
}
