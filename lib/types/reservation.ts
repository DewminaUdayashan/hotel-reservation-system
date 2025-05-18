export type ReservationStatus =
  | "reserved"
  | "checked-in"
  | "checked-out"
  | "canceled";
export type PaymentStatus = "paid" | "pending" | "partial" | "failed";
export type PaymentMethod = "credit-card" | "cash" | "bank-transfer" | "paypal";
export type AdditionalCharge = {
  id: number;
  description: string;
  amount: number;
  date: Date;
};

export type Reservation = {
  id: number;
  customerId: number;
  roomId: number;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  additionalCharges: AdditionalCharge[];
  specialRequests: string;
  createdAt: Date;
};
