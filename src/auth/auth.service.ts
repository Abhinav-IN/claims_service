import { Injectable, UnauthorizedException,} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { DeskUser } from '../entities/desk-user.entity.js';
import { AuthResponseDto } from '../dto/auth.dto.js';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(DeskUser) private deskUsers: Repository<DeskUser>, private jwt: JwtService, private config: ConfigService) {}

  async login_service(userName: string, password: string) : Promise<AuthResponseDto> {
    const user = await this.deskUsers.findOne({ where: { userName } });
    const ok = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !ok) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const newToken = await this.jwt.signAsync({id : user.id, role: user.role})
    return {token : newToken};
  }
}