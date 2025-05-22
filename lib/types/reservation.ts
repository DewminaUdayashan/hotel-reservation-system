export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "checked-in"
  | "checked-out"
  | "canceled"
  | "no-show";
export type PaymentStatus = "paid" | "unpaid" | "partially_paid";
export type PaymentMethod =
  | "credit-card"
  | "debit-card"
  | "cash"
  | "bank-transfer";

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

export type ReservationWithAdditionalDetails = Reservation & {
  roomName: string;
  roomType: string;
};

export type ReservationDetails = ReservationWithAdditionalDetails & {
  // Customer details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Credit card details
  card?: CardDetails;
};

export type CardDetails = {
  cardHolderName: string;
  cardNumber: string;
  cardType: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
};

export type ReserveRoomInput = {
  customerId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
};
