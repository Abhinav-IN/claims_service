import { Injectable, UnauthorizedException,} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { DeskUser } from '../entities/desk-user.entity.js';
import { AuthResponseDto } from '../dto/auth.dto.js';
import { Role } from '../common/enums/claims.enums.js';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(DeskUser) private deskUsers: Repository<DeskUser>, private jwt: JwtService, private config: ConfigService) {}

  async login_service(userName: string, password: string) : Promise<AuthResponseDto> {
    const user = await this.deskUsers.findOne({ where: { userName } });
    const ok = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !ok) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const newToken = await this.jwt.signAsync({id : user.id, userName: user.userName, role: user.role});
    return {token : newToken};
  }

  async login_doctor_service(userName: string, password: string) : Promise<AuthResponseDto> {
    const newToken = await this.jwt.signAsync({id : 5, userName: "Dr. Gupta", role: Role.DOCTOR});
    return {token : newToken};
  }

  async login_patient1_service(userName: string, password: string) : Promise<AuthResponseDto> {
    const newToken = await this.jwt.signAsync({id : 1, userName: "Ram", role: Role.PATIENT});
    return {token : newToken};
  }

  async login_patient2_service(userName: string, password: string) : Promise<AuthResponseDto> {
    const newToken = await this.jwt.signAsync({id : 2, userName: "Ashu", role: Role.PATIENT});
    return {token : newToken};
  }

  async login_patient3_service(userName: string, password: string) : Promise<AuthResponseDto> {
    const newToken = await this.jwt.signAsync({id : 3, userName: "Rohan", role: Role.PATIENT});
    return {token : newToken};
  }

  async login_patient4_service(userName: string, password: string) : Promise<AuthResponseDto> {
    const newToken = await this.jwt.signAsync({id : 4, userName: "Mehak", role: Role.PATIENT});
    return {token : newToken};
  }

  async login_patient5_service(userName: string, password: string) : Promise<AuthResponseDto> {
    const newToken = await this.jwt.signAsync({id : 5, userName: "Shyam", role: Role.PATIENT});
    return {token : newToken};
  }
}