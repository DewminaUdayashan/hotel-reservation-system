import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../index'; // The API route handler
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
    // Mock other models if needed by other tests or relations
  },
}));

// Mock auth module
jest.mock('@/lib/auth');

// Mock apiHelpers (optional, if you want to test its usage specifically or simplify)
// jest.mock('@/lib/apiHelpers', () => ({
//   transformReservationForAPI: jest.fn((reservation) => ({ ...reservation, transformed: true })),
// }));


const mockPrismaReservationFindMany = prisma.reservation.findMany as jest.Mock;
const mockVerifyToken = verifyToken as jest.Mock;
// const mockTransformReservation = transformReservationForAPI as jest.Mock;


const sampleAdminUser = { id: 1, email: 'admin@example.com', role: 'admin' };
const sampleCustomerUser = { id: 2, email: 'user@example.com', role: 'customer' };

const mockDbReservations = [
  {
    id: 1, customerId: 10, roomId: 101, checkIn: new Date(), checkOut: new Date(), guests: 1, status: 'reserved', paymentStatus: 'paid', paymentMethod: 'credit-card', totalAmount: 200, specialRequests: '', createdAt: new Date(),
    customer: { id: 10, name: 'Customer A', email: 'custA@example.com' }
  },
  {
    id: 2, customerId: 11, roomId: 102, checkIn: new Date(), checkOut: new Date(), guests: 2, status: 'checked-in', paymentStatus: 'pending', paymentMethod: 'cash', totalAmount: 300, specialRequests: 'Late check-out', createdAt: new Date(),
    customer: { id: 11, name: 'Customer B', email: 'custB@example.com' }
  },
];

// This is what transformReservationForAPI is expected to produce from mockDbReservations
const mockTransformedReservations = mockDbReservations.map(r => transformReservationForAPI({
    ...r,
    // Ensure all fields expected by PrismaReservationWithCustomer are present
    additionalCharges: r.additionalCharges || null, // Assuming it might be null from DB
    notes: r.notes || null, // Assuming it might be null from DB
}));


describe('GET /api/admin/reservations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 if method is not GET', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData().error).toBe('Method POST Not Allowed');
  });

  it('should return 401 if no token is provided', async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error('No token provided');
    });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(res._getJSONData().error).toContain('No token provided');
  });
  
  it('should return 401 if token is invalid', async () => {
    mockVerifyToken.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { 'Authorization': 'Bearer invalidtoken' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(res._getJSONData().error).toContain('Invalid token');
  });

  it('should return 403 if user is not an admin', async () => {
    mockVerifyToken.mockReturnValue(sampleCustomerUser); // Simulate customer user
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { 'Authorization': 'Bearer customertoken' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(res._getJSONData().error).toBe('Forbidden: Access is restricted to administrators.');
  });

  it('should return 200 and all reservations for an admin user', async () => {
    mockVerifyToken.mockReturnValue(sampleAdminUser);
    mockPrismaReservationFindMany.mockResolvedValue(mockDbReservations);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { 'Authorization': 'Bearer admintoken' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const responseData = res._getJSONData() as FrontendReservation[];
    expect(responseData.length).toBe(mockDbReservations.length);
    // Check if data matches the structure of transformed reservations
    // This relies on the actual transformReservationForAPI function logic
    expect(responseData[0].id).toBe(mockDbReservations[0].id);
    expect(responseData[0].customerName).toBe(mockDbReservations[0].customer.name);
    expect(responseData[1].id).toBe(mockDbReservations[1].id);
    expect(responseData[1].customerName).toBe(mockDbReservations[1].customer.name);
    
    expect(prisma.reservation.findMany).toHaveBeenCalledWith({
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return 500 if Prisma call fails', async () => {
    mockVerifyToken.mockReturnValue(sampleAdminUser);
    mockPrismaReservationFindMany.mockRejectedValue(new Error('Database error'));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      headers: { 'Authorization': 'Bearer admintoken' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData().error).toBe('Internal Server Error');
  });
});
