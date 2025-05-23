import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReservationsPage from '../page'; // Adjust path as necessary
import { useAuth } from '@/hooks/auth/useAuth';
import { useReservations } from '@/hooks/reservation';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn().mockReturnValue('/reservations'),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}));

// Mock hooks
jest.mock('@/hooks/auth/useAuth');
jest.mock('@/hooks/reservation');

// Mock Toaster and toast (if they cause issues, otherwise can be omitted for basic tests)
jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster"></div>,
}));
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));
// Mock AuthDialog if it's complex or makes external calls
jest.mock('@/components/auth-dialog', () => ({
    AuthDialog: ({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess: () => void }) => 
        open ? <div data-testid="auth-dialog">Auth Dialog Mock</div> : null,
}));


const mockUseAuth = useAuth as jest.Mock;
const mockUseReservations = useReservations as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();

// Sample reservation data
const mockReservationsData = [
  {
    id: 1,
    customerId: 1,
    customerName: 'John Doe',
    roomId: 101,
    roomType: 'Single Room',
    checkIn: new Date('2024-08-01T14:00:00.000Z'),
    checkOut: new Date('2024-08-03T11:00:00.000Z'),
    guests: 1,
    status: 'reserved',
    paymentStatus: 'paid',
    paymentMethod: 'credit-card',
    totalAmount: 200,
    additionalCharges: [],
    specialRequests: 'Early check-in if possible',
    createdAt: new Date('2024-07-15T10:00:00.000Z'),
  },
  {
    id: 2,
    customerId: 2, // Different customer for admin view
    customerName: 'Jane Smith',
    roomId: 202,
    roomType: 'Double Room',
    checkIn: new Date('2024-08-05T14:00:00.000Z'),
    checkOut: new Date('2024-08-07T11:00:00.000Z'),
    guests: 2,
    status: 'checked-in',
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    totalAmount: 350,
    additionalCharges: [],
    specialRequests: '',
    createdAt: new Date('2024-07-20T11:00:00.000Z'),
  },
  {
    id: 3,
    customerId: 1, // Belongs to John Doe
    customerName: 'John Doe',
    roomId: 303,
    roomType: 'Suite',
    checkIn: new Date('2024-07-10T14:00:00.000Z'), // Past reservation
    checkOut: new Date('2024-07-12T11:00:00.000Z'),
    guests: 2,
    status: 'checked-out',
    paymentStatus: 'paid',
    paymentMethod: 'credit-card',
    totalAmount: 500,
    additionalCharges: [],
    specialRequests: '',
    createdAt: new Date('2024-07-01T09:00:00.000Z'),
  },
];

describe('ReservationsPage', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockRouterPush,
      back: mockRouterBack,
      prefetch: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
    });
    // Reset mocks before each test
    mockUseAuth.mockReset();
    mockUseReservations.mockReset();
    mockRouterPush.mockClear();
    mockRouterBack.mockClear();
    (useAuth as jest.Mock).mockReturnValue({ user: null, isAdmin: false, isLoading: false }); // Default to logged out
    (useReservations as jest.Mock).mockReturnValue({ data: [], isLoading: false, error: null }); // Default to no data
  });

  describe('Loading and Error States', () => {
    it('should display loading state when isLoading is true', () => {
      mockUseAuth.mockReturnValue({ user: { id: 1 }, isAdmin: false, isLoading: false });
      mockUseReservations.mockReturnValue({ data: null, isLoading: true, error: null });
      render(<ReservationsPage />);
      expect(screen.getByText(/Loading reservations.../i)).toBeInTheDocument();
      expect(screen.getByTestId('loader2-icon')).toBeInTheDocument(); // Assuming Loader2 has a specific test id or role
    });

    it('should display error message when error is present', () => {
      mockUseAuth.mockReturnValue({ user: { id: 1 }, isAdmin: false, isLoading: false });
      const errorMessage = 'Failed to fetch reservations';
      mockUseReservations.mockReturnValue({ data: null, isLoading: false, error: { message: errorMessage } });
      render(<ReservationsPage />);
      expect(screen.getByText(`Error loading reservations: ${errorMessage}`)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    });

    it('should show AuthDialog if user is not authenticated and not loading', async () => {
      mockUseAuth.mockReturnValue({ user: null, isAdmin: false, isLoading: false }); // Not logged in, not loading
      mockUseReservations.mockReturnValue({ data: [], isLoading: false, error: null });
      render(<ReservationsPage />);
      // The AuthDialog is shown based on useEffect, so we might need to wait for it
      await waitFor(() => {
        expect(screen.getByTestId('auth-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Customer View', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'customer' },
        isAdmin: false,
        isLoading: false,
      });
      mockUseReservations.mockReturnValue({
        data: mockReservationsData.filter(r => r.customerId === 1), // Only John's reservations
        isLoading: false,
        error: null,
      });
    });

    it('renders "My Reservations" title', () => {
      render(<ReservationsPage />);
      expect(screen.getByRole('heading', { name: /My Reservations/i })).toBeInTheDocument();
    });

    it('displays reservations for the logged-in customer', () => {
      render(<ReservationsPage />);
      expect(screen.getByText(/Single Room/i)).toBeInTheDocument(); // Reservation ID 1
      expect(screen.getByText(/Suite/i)).toBeInTheDocument(); // Reservation ID 3
      expect(screen.queryByText(/Double Room/i)).not.toBeInTheDocument(); // Reservation ID 2 (Jane's)
    });

    it('filters customer\'s reservations by search term (room type)', () => {
      render(<ReservationsPage />);
      const searchInput = screen.getByPlaceholderText(/Search your reservations.../i);
      fireEvent.change(searchInput, { target: { value: 'Suite' } });
      expect(screen.getByText(/Suite/i)).toBeInTheDocument();
      expect(screen.queryByText(/Single Room/i)).not.toBeInTheDocument();
    });
    
    it('filters customer\'s reservations by search term (reservation ID)', () => {
      render(<ReservationsPage />);
      const searchInput = screen.getByPlaceholderText(/Search your reservations.../i);
      fireEvent.change(searchInput, { target: { value: '1' } }); // Reservation ID 1
      expect(screen.getByText(/Single Room/i)).toBeInTheDocument();
      expect(screen.queryByText(/Suite/i)).not.toBeInTheDocument();
    });

    it('does not show admin filter tabs', () => {
      render(<ReservationsPage />);
      expect(screen.queryByRole('button', { name: /Current/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Past/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /All/i })).not.toBeInTheDocument();
    });

    it('shows "New Reservation" button', () => {
        render(<ReservationsPage />);
        expect(screen.getByRole('link', { name: /New Reservation/i })).toBeInTheDocument();
    });
  });

  describe('Admin View', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 99, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
        isAdmin: true,
        isLoading: false,
      });
      mockUseReservations.mockReturnValue({
        data: mockReservationsData, // All reservations
        isLoading: false,
        error: null,
      });
    });

    it('renders "Manage Reservations" title', () => {
      render(<ReservationsPage />);
      expect(screen.getByRole('heading', { name: /Manage Reservations/i })).toBeInTheDocument();
    });

    it('displays all reservations', () => {
      render(<ReservationsPage />);
      expect(screen.getByText(/Single Room/i)).toBeInTheDocument(); // Reservation ID 1
      expect(screen.getByText(/Double Room/i)).toBeInTheDocument(); // Reservation ID 2
      expect(screen.getByText(/Suite/i)).toBeInTheDocument(); // Reservation ID 3
      // Check for customer ID display
      expect(screen.getByText(/Customer ID: 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Customer ID: 2/i)).toBeInTheDocument();
    });

    it('shows admin filter tabs', () => {
      render(<ReservationsPage />);
      expect(screen.getByRole('button', { name: /Current/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Past/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /All/i })).toBeInTheDocument();
    });

    it('filters admin\'s view by "Current" tab (reserved or checked-in)', () => {
      render(<ReservationsPage />);
      const currentTab = screen.getByRole('button', { name: /Current/i });
      fireEvent.click(currentTab); // Default is 'current', but explicitly click for test clarity
      
      expect(screen.getByText(/Single Room/i)).toBeInTheDocument(); // status: 'reserved'
      expect(screen.getByText(/Double Room/i)).toBeInTheDocument(); // status: 'checked-in'
      expect(screen.queryByText(/Suite/i)).not.toBeInTheDocument(); // status: 'checked-out'
    });

    it('filters admin\'s view by "Past" tab (checked-out or canceled)', () => {
      render(<ReservationsPage />);
      const pastTab = screen.getByRole('button', { name: /Past/i });
      fireEvent.click(pastTab);
      
      expect(screen.queryByText(/Single Room/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Double Room/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Suite/i)).toBeInTheDocument(); // status: 'checked-out'
      // Add a 'canceled' reservation to mockReservationsData and test for it here if needed.
    });

    it('filters admin\'s view by "All" tab', () => {
      render(<ReservationsPage />);
      const allTab = screen.getByRole('button', { name: /All/i });
      fireEvent.click(allTab);
      
      expect(screen.getByText(/Single Room/i)).toBeInTheDocument();
      expect(screen.getByText(/Double Room/i)).toBeInTheDocument();
      expect(screen.getByText(/Suite/i)).toBeInTheDocument();
    });
    
    it('filters admin\'s view by search term (customer ID)', () => {
      render(<ReservationsPage />);
      const searchInput = screen.getByPlaceholderText(/Search by ID, Customer, Room.../i);
      fireEvent.change(searchInput, { target: { value: 'customer id: 2' } });
      expect(screen.queryByText(/Single Room/i)).not.toBeInTheDocument(); // Customer 1
      expect(screen.getByText(/Double Room/i)).toBeInTheDocument(); // Customer 2
      expect(screen.queryByText(/Suite/i)).not.toBeInTheDocument(); // Customer 1
    });

    it('filters admin\'s view by search term (room type)', () => {
      render(<ReservationsPage />);
      const searchInput = screen.getByPlaceholderText(/Search by ID, Customer, Room.../i);
      fireEvent.change(searchInput, { target: { value: 'Double Room' } });
      expect(screen.queryByText(/Single Room/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Double Room/i)).toBeInTheDocument();
      expect(screen.queryByText(/Suite/i)).not.toBeInTheDocument();
    });

    it('does not show "New Reservation" button for admin', () => {
        render(<ReservationsPage />);
        expect(screen.queryByRole('link', { name: /New Reservation/i })).not.toBeInTheDocument();
    });
  });
});

// Helper to mock Loader2 icon if not already covered by a more general SVG mock
// For instance, if it's directly rendered as an SVG component:
jest.mock('lucide-react', () => {
    const original = jest.requireActual('lucide-react');
    return {
        ...original,
        Loader2: (props: any) => <svg data-testid="loader2-icon" {...props} />,
        // Add other icons used in the component if they cause issues during tests
        Search: (props: any) => <svg data-testid="search-icon" {...props} />,
        Hotel: (props: any) => <svg data-testid="hotel-icon" {...props} />,
        Calendar: (props: any) => <svg data-testid="calendar-icon" {...props} />,
        CreditCard: (props: any) => <svg data-testid="creditcard-icon" {...props} />,
        Eye: (props: any) => <svg data-testid="eye-icon" {...props} />,
        Edit: (props: any) => <svg data-testid="edit-icon" {...props} />,
        Trash: (props: any) => <svg data-testid="trash-icon" {...props} />,
        ChevronLeft: (props: any) => <svg data-testid="chevronleft-icon" {...props} />,
    };
});

// Note: More specific tests for cancel dialog, payment status badges, etc., can be added.
// This set covers the primary requirements of role-based views and filtering.
