import { User, UserRole } from "./user";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  firstName: string;
  lastName: string;
  phone: string;
  homeTown?: string;
  role: UserRole;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: User;
};
