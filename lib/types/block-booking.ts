export type BlockBookingStatus = "pending" | "confirmed" | "cancelled";

export type BlockBooking = {
  id: number;
  agencyId: number;
  totalRooms: number;
  checkInDate: Date;
  checkOutDate: Date;
  totalAmount: number;
  discountPercentage: number;
  discountAmount: number;
  specialRequests?: string;
  status: BlockBookingStatus;
  createdAt: Date;
};

// Declare the ReservationWithAdditionalDetails type before using it
export type ReservationWithAdditionalDetails = {
  // Define the properties of ReservationWithAdditionalDetails here
  id: number;
  roomId: number;
  guestName: string;
  numberOfGuests: number;
  checkInDate: Date;
  checkOutDate: Date;
  additionalNotes?: string;
};

export type BlockBookingWithDetails = BlockBooking & {
  agencyName: string;
  reservations: ReservationWithAdditionalDetails[];
};

export type CreateBlockBookingInput = {
  agencyId: number;
  roomIds: number[];
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  discountPercentage?: number;
  email?: string;
  customerId?: number;
  cardNumber?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardCVC?: string;
  cardHolderName?: string;
};

export type BlockBookingDiscount = {
  percentage: number;
  minimumRooms: number;
};

// Constants
export const BLOCK_BOOKING_DISCOUNT: BlockBookingDiscount = {
  percentage: 15, // 15% discount for block bookings
  minimumRooms: 3,
};
