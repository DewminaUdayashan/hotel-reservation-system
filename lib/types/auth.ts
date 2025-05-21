export type LoginPayload = {
  email: string;
  password: string;
};

export type UserRole = "customer" | "clerk" | "manager" | "admin";

export type LoginResponse = {
  message: string;
  token: string;
  user: User;
};
