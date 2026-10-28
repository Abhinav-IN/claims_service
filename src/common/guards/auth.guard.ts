
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException,} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest, JwtPayload } from '../../interfaces/auth.interface.js';
import { Role } from '../enums/claims.enums.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication required');
    }

    const token = authHeader.slice(7);

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (!payload.id || !Object.values(Role).includes(payload.role)) {
      throw new UnauthorizedException('Invalid token payload');
    }

    request.user = payload;

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    if (!requiredRoles.includes(payload.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
