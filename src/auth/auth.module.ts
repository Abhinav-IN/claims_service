import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { DeskUser } from '../entities/desk-user.entity.js';
import { AuthGuard } from '../common/guards/auth.guard.js';

@Module({
  imports: [ TypeOrmModule.forFeature([DeskUser])],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
