// src/modules/domain/domain.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domain } from './entities/domain.entity';
import { DnsRecord } from './entities/dns-record.entity';
import { DomainVerificationToken } from './entities/domain-verification-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Domain,
      DnsRecord,
      DomainVerificationToken
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class DomainModule {}