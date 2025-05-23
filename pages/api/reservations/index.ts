import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { transformReservationForAPI, PrismaReservationWithCustomer } from '@/lib/apiHelpers';
import { Reservation as FrontendReservation } from '@/lib/types/reservation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FrontendReservation[] | { error: string }>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const decodedToken = verifyToken(req);
    if (!decodedToken || !decodedToken.id) {
      // This case should ideally be caught by verifyToken throwing an error
      return res.status(401).json({ error: 'Unauthorized: Invalid token or user ID missing.' });
    }

    const userId = decodedToken.id;

    const reservationsFromDb = await prisma.reservation.findMany({
      where: {
        customerId: userId,
      },
      include: {
        customer: { // Include customer to have access to name, even if it's the user themselves
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Prisma's findMany returns an array, so we cast it before mapping
    const typedReservationsFromDb = reservationsFromDb as unknown as PrismaReservationWithCustomer[];

    const transformedReservations = typedReservationsFromDb.map(transformReservationForAPI);

    return res.status(200).json(transformedReservations);

  } catch (error) {
    console.error('API Error fetching user reservations:', error);
    if (error instanceof Error) {
        if (error.message === 'No token provided' || error.message === 'Invalid token') {
            return res.status(401).json({ error: 'Unauthorized: ' + error.message });
        }
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
