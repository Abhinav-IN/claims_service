import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { AuthDto } from '../dto/auth.dto.js';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  async login(@Body() user: AuthDto) {
    return this.auth.login_service(user.userName, user.password);
  }

  @Post('login-any')
  async login_any(@Body() user: AuthDto) {
    return this.auth.login_any_service(user.userName, user.password);
  }
}
