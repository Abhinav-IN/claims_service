import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeskUser } from '../entities/desk-user.entity.js';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule], 
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const jwt = config.get('jwt');

        return {
          secret: jwt.secret,
          signOptions: {
            expiresIn: jwt.expiresIn,
          },
        };
      },
    }), TypeOrmModule.forFeature([DeskUser])
  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
