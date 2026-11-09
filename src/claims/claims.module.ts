import { Module } from '@nestjs/common';
import { ClaimsService } from './claims.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Claim } from '../entities/claim.entity.js';
import { Preauth } from '../entities/pre-auth.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Claim, Preauth])],
  providers: [ClaimsService],
  controllers: [],
  exports: [ClaimsService]
})
export class ClaimsModule {}
