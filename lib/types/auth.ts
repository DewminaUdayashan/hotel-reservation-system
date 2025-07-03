import { Agency, Customer, HotelUser, User, UserRole } from "./user";

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
  agencyName?: string;
  agencyPhone?: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  user: User;
  customer?: Customer;
  agency?: Agency;
  hotelUser?: HotelUser;
  isEmailVerified?: boolean;
  mustResetPassword?: boolean;
};
