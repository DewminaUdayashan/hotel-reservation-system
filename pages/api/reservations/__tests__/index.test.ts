import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../index'; // The API route handler for /api/reservations
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { transformReservationForAPI } from '@/lib/apiHelpers';
import { Reservation as FrontendReservation } from '@/lib/types/reservation';

// Mock Prisma client
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    reservation: {
      findMany: jest.fn(),
    },
  },
}));

// Mock auth module
jest.mock('@/lib/auth');

const mockPrismaReservationFindMany = prisma.reservation.findMany as jest.Mock;
const mockVerifyToken = verifyToken as jest.Mock;

const sampleCustomerUser = { id: 1, email: 'user1@example.com', role: 'customer' };
const sampleAdminUser = { id: 99, email: 'admin@example.com', role: 'admin' }; // Admin user might have own reservations

const mockDbReservationsUser1 = [
  {
    id: 1, customerId: 1, roomId: 101, checkIn: new Date(), checkOut: new Date(), guests: 1, status: 'reserved', paymentStatus: 'paid', paymentMethod: 'credit-card', totalAmount: 200, specialRequests: '', createdAt: new Date(),
    customer: { id: 1, name: 'User One', email: 'user1@example.com' }
  },
  {
    id: 3, customerId: 1, roomId: 103, checkIn: new Date(), checkOut: new Date(), guests: 2, status: 'checked-out', paymentStatus: 'paid', paymentMethod: 'cash', totalAmount: 150, specialRequests: '', createdAt: new Date(),
    customer: { id: 1, name: 'User One', email: 'user1@example.com' }
  },
];

// Mock reservations for admin user, if they can have their own
const mockDbReservationsAdmin = [
    {
        id: 100, customerId: 99, roomId: 707, checkIn: new Date(), checkOut: new Date(), guests: 1, status: 'reserved', paymentStatus: 'paid', paymentMethod: 'credit-card', totalAmount: 1000, specialRequests: 'Admin suite', createdAt: new Date(),
        customer: { id: 99, name: 'Admin User', email: 'admin@example.com' }
    }
];


describe('GET /api/reservations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 if method is not GET', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it('should return 401 if no token is provided', async () => {
    mockVerifyToken.mockImplementation(() => { throw new Error('No token provided'); });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
    expect(res._getJSONData().error).toContain('No token provided');
  });

  it('should return 401 if token is invalid', async () => {
    mockVerifyToken.mockImplementation(() => { throw new Error('Invalid token'); });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ 
        method: 'GET', 
        headers: { 'Authorization': 'Bearer invalidtoken' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
    expect(res._getJSONData().error).toContain('Invalid token');
  });

  it('should return 200 and reservations for the authenticated customer', async () => {
    mockVerifyToken.mockReturnValue(sampleCustomerUser);
    mockPrismaReservationFindMany.mockResolvedValue(mockDbReservationsUser1);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { 'Authorization': 'Bearer customertoken' }
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = res._getJSONData() as FrontendReservation[];
    expect(responseData.length).toBe(mockDbReservationsUser1.length);
    expect(responseData[0].id).toBe(mockDbReservationsUser1[0].id);
    expect(responseData[0].customerName).toBe(mockDbReservationsUser1[0].customer.name);
    expect(prisma.reservation.findMany).toHaveBeenCalledWith({
      where: { customerId: sampleCustomerUser.id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return 200 and reservations for an admin user (their own, as per current logic)', async () => {
    // This test assumes that if an admin hits /api/reservations,
    // they get *their own* reservations, not all reservations.
    // The /api/admin/reservations endpoint is for all reservations.
    mockVerifyToken.mockReturnValue(sampleAdminUser);
    mockPrismaReservationFindMany.mockResolvedValue(mockDbReservationsAdmin);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { 'Authorization': 'Bearer admintoken' }
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = res._getJSONData() as FrontendReservation[];
    expect(responseData.length).toBe(mockDbReservationsAdmin.length);
    if (mockDbReservationsAdmin.length > 0) {
        expect(responseData[0].id).toBe(mockDbReservationsAdmin[0].id);
        expect(responseData[0].customerName).toBe(mockDbReservationsAdmin[0].customer.name);
    }
    expect(prisma.reservation.findMany).toHaveBeenCalledWith({
      where: { customerId: sampleAdminUser.id }, // Admin gets their own based on user ID
      include: {
        customer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
  
  it('should return 200 and an empty array if customer has no reservations', async () => {
    mockVerifyToken.mockReturnValue(sampleCustomerUser);
    mockPrismaReservationFindMany.mockResolvedValue([]); // No reservations

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { 'Authorization': 'Bearer customertoken' }
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual([]);
  });


  it('should return 500 if Prisma call fails', async () => {
    mockVerifyToken.mockReturnValue(sampleCustomerUser);
    mockPrismaReservationFindMany.mockRejectedValue(new Error('Database error'));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { 'Authorization': 'Bearer customertoken' }
    });
    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData().error).toBe('Internal Server Error');
  });
});
