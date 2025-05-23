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
    if (!decodedToken || decodedToken.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Access is restricted to administrators.' });
    }

    const reservationsFromDb = await prisma.reservation.findMany({
      include: {
        customer: { // Assuming 'customer' is the relation field in Prisma schema for User
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Optional: order by creation date
      },
    });

    // Prisma's findMany returns an array, so we cast it before mapping
    const typedReservationsFromDb = reservationsFromDb as unknown as PrismaReservationWithCustomer[];
    
    const transformedReservations = typedReservationsFromDb.map(transformReservationForAPI);

    return res.status(200).json(transformedReservations);

  } catch (error) {
    console.error('API Error fetching admin reservations:', error);
    if (error instanceof Error) {
        if (error.message === 'No token provided' || error.message === 'Invalid token') {
            return res.status(401).json({ error: 'Unauthorized: ' + error.message });
        }
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
