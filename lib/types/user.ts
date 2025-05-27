export type UserRole = "customer" | "clerk" | "manager" | "admin";
export type CustomerType = "individual" | "agency";

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
};

export type Customer = User & {
  customerId: number;
  phone: string;
  homeTown: string;
  customerType: CustomerType;
  agencyId?: number;
};

export type Agency = Customer & {
  agencyId: number;
  agencyName: string;
  agencyPhone: string;
};

export type HotelUser = User & {
  hotelUserId: number;
  hotelId: number;
  hotelName: string;
};
