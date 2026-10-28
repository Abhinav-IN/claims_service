import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { AuthDto, AuthResponseDto } from '../dto/auth.dto.js';

@ApiTags('auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  async login(@Body() user: AuthDto): Promise<AuthResponseDto> {
    return this.auth.login_service(user.userName, user.password);
  }

  @Post('login-doctor')
  async login_doctor(@Body() user: AuthDto): Promise<AuthResponseDto> {
    return this.auth.login_doctor_service(user.userName, user.password);
  }

  @Post('login-patient1')
  async login_patient1(@Body() user: AuthDto): Promise<AuthResponseDto> {
    return this.auth.login_patient1_service(user.userName, user.password);
  }

  @Post('login-patient2')
  async login_patient2(@Body() user: AuthDto): Promise<AuthResponseDto> {
    return this.auth.login_patient2_service(user.userName, user.password);
  }

  @Post('login-patient3')
  async login_patient3(@Body() user: AuthDto): Promise<AuthResponseDto> {
    return this.auth.login_patient3_service(user.userName, user.password);
  }

  @Post('login-patient4')
  async login_patient4(@Body() user: AuthDto): Promise<AuthResponseDto> {
    return this.auth.login_patient4_service(user.userName, user.password);
  }

  @Post('login-patient5')
  async login_patient5(@Body() user: AuthDto): Promise<AuthResponseDto> {
    return this.auth.login_patient5_service(user.userName, user.password);
  }
}
