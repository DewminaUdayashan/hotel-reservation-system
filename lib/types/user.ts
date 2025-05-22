export type UserRole = "customer" | "clerk" | "manager" | "admin";

export type User = {
  id: number;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  homeTown?: string;
  createdAt: string;
};
