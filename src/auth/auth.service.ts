import { Injectable, UnauthorizedException,} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { DeskUser } from '../entities/desk-user.entity.js';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(DeskUser) private deskUsers: Repository<DeskUser>, private config: ConfigService) {}

  async login_service(userName: string, password: string) {
    const user = await this.deskUsers.findOne({ where: { userName } });
    const ok = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !ok) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return {
      "user_id" : user.id,
      "role" : user.role,
      "user_name" : user.userName
    };
  }

  async login_any_service(userName: string, password: string) {
    return;
  }
}