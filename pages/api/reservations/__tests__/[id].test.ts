import { createMocks, createRequest, createResponse } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../[id]'; // The API route handler for /api/reservations/[id]
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { transformReservationForAPI } from '@/lib/apiHelpers'; // Assuming this is used
import { Reservation as FrontendReservation } from '@/lib/types/reservation';

// Mock Prisma client
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    reservation: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock auth module
jest.mock('@/lib/auth');

const mockPrismaReservationFindUnique = prisma.reservation.findUnique as jest.Mock;
const mockVerifyToken = verifyToken as jest.Mock;

const sampleCustomerUser = { id: 1, email: 'user1@example.com', role: 'customer' };
const anotherCustomerUser = { id: 2, email: 'user2@example.com', role: 'customer' };
const sampleAdminUser = { id: 99, email: 'admin@example.com', role: 'admin' };

const mockReservationUser1 = {
  id: 101, customerId: 1, roomId: 202, checkIn: new Date(), checkOut: new Date(), guests: 1, status: 'reserved', paymentStatus: 'paid', paymentMethod: 'credit-card', totalAmount: 250, specialRequests: '', createdAt: new Date(),
  customer: { id: 1, name: 'User One', email: 'user1@example.com' }
};

const mockReservationUser2 = {
  id: 202, customerId: 2, roomId: 303, checkIn: new Date(), checkOut: new Date(), guests: 2, status: 'checked-in', paymentStatus: 'pending', paymentMethod: 'cash', totalAmount: 450, specialRequests: '', createdAt: new Date(),
  customer: { id: 2, name: 'User Two', email: 'user2@example.com' }
};


describe('GET /api/reservations/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 if method is not GET', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'POST', query: { id: '101' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it('should return 400 if reservation ID is missing or invalid', async () => {
    mockVerifyToken.mockReturnValue(sampleCustomerUser);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ 
        method: 'GET', 
        query: { id: 'invalid-id' },
        headers: { 'Authorization': 'Bearer sometoken' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().error).toBe('Invalid or missing reservation ID.');

    const { req: req2, res: res2 } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET', query: {} }); // No ID
    await handler(req2, res2);
    expect(res2._getStatusCode()).toBe(400);
  });

  it('should return 401 if no token is provided', async () => {
    mockVerifyToken.mockImplementation(() => { throw new Error('No token provided'); });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({ method: 'GET', query: { id: '101' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(401);
  });

  it('should return 404 if reservation not found', async () => {
    mockVerifyToken.mockReturnValue(sampleCustomerUser);
    mockPrismaReservationFindUnique.mockResolvedValue(null);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { id: '999' }, // Non-existent ID
      headers: { 'Authorization': 'Bearer customertoken' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData().error).toBe('Reservation not found.');
  });

  it('should return 200 and the reservation if customer requests their own reservation', async () => {
    mockVerifyToken.mockReturnValue(sampleCustomerUser);
    mockPrismaReservationFindUnique.mockResolvedValue(mockReservationUser1);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { id: mockReservationUser1.id.toString() },
      headers: { 'Authorization': 'Bearer customertoken' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const responseData = res._getJSONData() as FrontendReservation;
    expect(responseData.id).toBe(mockReservationUser1.id);
    expect(responseData.customerName).toBe(mockReservationUser1.customer.name);
    expect(prisma.reservation.findUnique).toHaveBeenCalledWith({
      where: { id: mockReservationUser1.id },
      include: { customer: { select: { id: true, name: true, email: true } } },
    });
  });

  it('should return 403 if customer requests another user\'s reservation', async () => {
    mockVerifyToken.mockReturnValue(sampleCustomerUser); // User 1 trying to access
    mockPrismaReservationFindUnique.mockResolvedValue(mockReservationUser2); // Reservation belonging to User 2
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { id: mockReservationUser2.id.toString() },
      headers: { 'Authorization': 'Bearer user1token' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(403);
    expect(res._getJSONData().error).toBe('Forbidden: You do not have permission to access this reservation.');
  });

  it('should return 200 and the reservation if admin requests any reservation', async () => {
    mockVerifyToken.mockReturnValue(sampleAdminUser);
    mockPrismaReservationFindUnique.mockResolvedValue(mockReservationUser2); // Admin accessing User 2's reservation
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { id: mockReservationUser2.id.toString() },
      headers: { 'Authorization': 'Bearer admintoken' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const responseData = res._getJSONData() as FrontendReservation;
    expect(responseData.id).toBe(mockReservationUser2.id);
    expect(responseData.customerName).toBe(mockReservationUser2.customer.name);
  });
  
  it('should return 200 and their own reservation if admin requests their own reservation', async () => {
    const adminOwnReservation = {
      ...mockReservationUser1,
      customerId: sampleAdminUser.id, // Reservation now belongs to admin
      customer: { id: sampleAdminUser.id, name: sampleAdminUser.email, email: sampleAdminUser.email }
    };
    mockVerifyToken.mockReturnValue(sampleAdminUser);
    mockPrismaReservationFindUnique.mockResolvedValue(adminOwnReservation);
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { id: adminOwnReservation.id.toString() },
      headers: { 'Authorization': 'Bearer admintoken' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    const responseData = res._getJSONData() as FrontendReservation;
    expect(responseData.id).toBe(adminOwnReservation.id);
  });

  it('should return 500 if Prisma call fails', async () => {
    mockVerifyToken.mockReturnValue(sampleCustomerUser);
    mockPrismaReservationFindUnique.mockRejectedValue(new Error('Database error'));
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { id: '101' },
      headers: { 'Authorization': 'Bearer customertoken' }
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData().error).toBe('Internal Server Error');
  });
});
