import { Module } from '@nestjs/common';
import { DeskController } from './desk.controller.js';
import { PreauthsModule } from '../preauths/preauths.module.js';
import { ClaimsModule } from '../claims/claims.module.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [PreauthsModule, ClaimsModule, AuthModule],
  controllers: [DeskController]
})
export class DeskModule {}
