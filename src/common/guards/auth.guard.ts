import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from '../../interfaces/auth.interface.js';
import { Role } from '../enums/claims.enums.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const userId = request.headers['user_id'];
    const role = request.headers['role'];
    const userName = request.headers['user_name'];

    if (!userId || !role || !userName) {
      throw new UnauthorizedException('Authentication required');
    }

    if (
      typeof userId !== 'string' || typeof userName !== 'string' || !Object.values(Role).includes(role as Role)
    ) {
      throw new UnauthorizedException('Invalid user credentials');
    }

    request.user = {
      id: Number(userId),
      userName: userName,
      role: role as Role,
    };

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    if (!requiredRoles.includes(role as Role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}