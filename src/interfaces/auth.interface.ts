import { Role } from "../common/enums/claims.enums.js";
import { Request } from 'express';

export interface JwtPayload {
  id: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}