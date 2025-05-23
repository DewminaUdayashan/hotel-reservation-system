import { Reservation as PrismaReservation, User as PrismaUser } from '@prisma/client';
import { Reservation as FrontendReservation, ReservationStatus, PaymentStatus, PaymentMethod } from './types/reservation';

// Helper type for Prisma Reservation with an included Customer
export type PrismaReservationWithCustomer = PrismaReservation & {
  customer?: Pick<PrismaUser, 'id' | 'name' | 'email'> | null; // Making customer optional and allowing null
};

export function transformReservationForAPI(
  prismaReservation: PrismaReservationWithCustomer
): FrontendReservation & { customerName?: string | null; customerEmail?: string | null } { // Extend FrontendReservation for optional customer details
  
  // Ensure all fields from FrontendReservation are mapped
  // And add optional customerName and customerEmail
  const transformed = {
    id: prismaReservation.id,
    customerId: prismaReservation.customerId, // This is directly from the Prisma model
    roomId: prismaReservation.roomId,
    checkIn: prismaReservation.checkIn, // Prisma returns Date objects as ISO strings in JSON
    checkOut: prismaReservation.checkOut, // Prisma returns Date objects as ISO strings in JSON
    guests: prismaReservation.guests,
    status: prismaReservation.status as ReservationStatus, // Assuming string types match
    paymentStatus: prismaReservation.paymentStatus as PaymentStatus, // Assuming string types match
    paymentMethod: prismaReservation.paymentMethod as PaymentMethod, // Assuming string types match
    totalAmount: prismaReservation.totalAmount,
    // additionalCharges: prismaReservation.additionalCharges ? JSON.parse(prismaReservation.additionalCharges as string) : [], // Assuming additionalCharges is a JSON string in DB
    additionalCharges: [], // Placeholder, as it's not in the current Prisma schema example as a direct JSON field.
    specialRequests: prismaReservation.specialRequests || '',
    createdAt: prismaReservation.createdAt, // Prisma returns Date objects as ISO strings in JSON
    customerName: prismaReservation.customer?.name,
    customerEmail: prismaReservation.customer?.email,
  };

  // Validate that all required fields of FrontendReservation are present
  // This is more of a conceptual step, actual runtime validation might be too verbose here
  // For example, ensuring `status` is one of the FrontendReservation.ReservationStatus types
  // Prisma's generated types usually ensure this if the schema is aligned.

  return transformed;
}
