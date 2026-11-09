import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config.js';
import { SeedService } from './seed/seed.service.js';
import { SeedModule } from './seed/seed.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PackagesModule } from './packages/packages.module.js';
import { CoverageModule } from './coverage/coverage.module.js';
import { CasesModule } from './cases/cases.module.js';
import { ClaimsModule } from './claims/claims.module.js';
import { DeskModule } from './desk/desk.module.js';
import { PreauthsModule } from './preauths/preauths.module.js';

@Module({
  imports: [ConfigModule.forRoot({isGlobal : true, load : [databaseConfig]}), DatabaseModule, SeedModule, AuthModule, PackagesModule, CoverageModule, CasesModule, ClaimsModule, DeskModule, PreauthsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
