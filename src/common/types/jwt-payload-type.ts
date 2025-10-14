import { Roles } from '../enums/role.enum';

export type JwtPayload = {
  id: string;
  role: Roles;
};
