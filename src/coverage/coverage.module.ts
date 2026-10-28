import { Module } from '@nestjs/common';
import { CoverageService } from './coverage.service.js';
import { CoverageController } from './coverage.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientCoverage } from '../entities/patient-coverage.entity.js';
import { TpaPolicy } from '../entities/tpa-policy.entity.js';
import { PmjayFamily } from '../entities/pmjay-family.entity.js';
import { PmjayMember } from '../entities/pmjay-member.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([PatientCoverage, TpaPolicy, PmjayFamily, PmjayMember]), AuthModule],
  providers: [CoverageService],
  controllers: [CoverageController],
  exports: [CoverageService]
})
export class CoverageModule {}
