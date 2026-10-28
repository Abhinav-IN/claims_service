import { Role } from "../common/enums/claims.enums.js";
import { Request } from 'express';

export interface JwtPayload {
  id: number;
  userName: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}