import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config.js';
import { SeedService } from './seed/seed.service.js';
import { SeedModule } from './seed/seed.module.js';
import { AuthModule } from './auth/auth.module.js';
import { jwtConfig } from './config/jwt.config.js';
import { PackagesModule } from './packages/packages.module.js';

@Module({
  imports: [ConfigModule.forRoot({isGlobal : true, load : [databaseConfig, jwtConfig]}), DatabaseModule, SeedModule, AuthModule, PackagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
