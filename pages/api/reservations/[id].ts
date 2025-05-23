import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { transformReservationForAPI, PrismaReservationWithCustomer } from '@/lib/apiHelpers';
import { Reservation as FrontendReservation } from '@/lib/types/reservation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FrontendReservation | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string' || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: 'Invalid or missing reservation ID.' });
  }

  const reservationId = parseInt(id, 10);

  try {
    const decodedToken = verifyToken(req);
    if (!decodedToken || !decodedToken.id) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token or user ID missing.' });
    }

    const reservationFromDb = await prisma.reservation.findUnique({
      where: {
        id: reservationId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!reservationFromDb) {
      return res.status(404).json({ error: 'Reservation not found.' });
    }

    // Authorization check:
    // If the user is not an admin, they can only access their own reservations.
    if (decodedToken.role !== 'admin' && reservationFromDb.customerId !== decodedToken.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this reservation.' });
    }
    
    const typedReservationFromDb = reservationFromDb as unknown as PrismaReservationWithCustomer;
    const transformedReservation = transformReservationForAPI(typedReservationFromDb);

    return res.status(200).json(transformedReservation);

  } catch (error) {
    console.error(`API Error fetching reservation ${reservationId}:`, error);
    if (error instanceof Error) {
        if (error.message === 'No token provided' || error.message === 'Invalid token') {
            return res.status(401).json({ error: 'Unauthorized: ' + error.message });
        }
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
