import { Module } from '@nestjs/common';
import { PreauthsService } from './preauths.service.js';
import { PreauthsController } from './preauths.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preauth } from '../entities/pre-auth.entity.js';
import { CoverageModule } from '../coverage/coverage.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Preauth]), CoverageModule, AuthModule],
  providers: [PreauthsService],
  controllers: [PreauthsController],
  exports: [PreauthsService]
})
export class PreauthsModule {}
