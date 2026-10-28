import { Module } from '@nestjs/common';
import { CasesService } from './cases.service.js';
import { CasesController } from './cases.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentCase } from '../entities/treatment-case.entity.js';
import { Preauth } from '../entities/pre-auth.entity.js';
import { Claim } from '../entities/claim.entity.js';
import { PatientCoverage } from '../entities/patient-coverage.entity.js';
import { CoverageModule } from '../coverage/coverage.module.js';
import { PackagesModule } from '../packages/packages.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([TreatmentCase, Preauth, Claim, PatientCoverage]), CoverageModule, PackagesModule, AuthModule],
  providers: [CasesService],
  controllers: [CasesController]
})
export class CasesModule {}
