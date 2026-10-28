import { PayerType, Role } from "./enums/claims.enums.js";

export function deskPayerType(role: Role): PayerType {
  return role === Role.TPA_DESK ? PayerType.TPA : PayerType.AYUSHMAN;
}