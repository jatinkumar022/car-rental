import { create } from 'zustand';
import { toast } from 'sonner';

interface Booking {
  _id: string;
  car: {
    _id: string;
    make: string;
    model: string;
    images: string[];
    pricePerDay: number;
    location: string;
  };
  renter?: {
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  totalAmount?: number; // New field from API
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}

interface BookingStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  totalSpent: number;
  totalEarned: number;
}

interface BookingState {
  renterBookings: Booking[];
  ownerBookings: Booking[];
  loading: boolean;
  stats: BookingStats;
  fetchRenterBookings: () => Promise<void>;
  fetchOwnerBookings: () => Promise<void>;
  createBooking: (carId: string, startDate: string, endDate: string) => Promise<boolean>;
  updateBookingStatus: (id: string, status: string) => Promise<boolean>;
  processPayment: (bookingId: string) => Promise<boolean>;
  fetchStats: () => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  renterBookings: [],
  ownerBookings: [],
  loading: false,
  stats: {
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    totalEarned: 0,
  },

  fetchRenterBookings: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/bookings?role=renter');
      const data = await res.json();
      if (res.ok) {
        set({ renterBookings: data.bookings || [], loading: false });
        await get().fetchStats();
      } else {
        set({ loading: false });
        toast.error(data.error || 'Failed to fetch bookings');
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching renter bookings:', error);
      toast.error('Error fetching bookings');
    }
  },

  fetchOwnerBookings: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/bookings?role=owner');
      const data = await res.json();
      if (res.ok) {
        set({ ownerBookings: data.bookings || [], loading: false });
        await get().fetchStats();
      } else {
        set({ loading: false });
        toast.error(data.error || 'Failed to fetch bookings');
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching owner bookings:', error);
      toast.error('Error fetching bookings');
    }
  },

  createBooking: async (carId: string, startDate: string, endDate: string) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId, startDate, endDate }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Booking created successfully! Processing payment...');
        
        // Process payment
        const paymentSuccess = await get().processPayment(data.booking._id);
        if (paymentSuccess) {
          await get().fetchRenterBookings();
        }
        set({ loading: false });
        return true;
      } else {
        set({ loading: false });
        toast.error(data.error || 'Failed to create booking');
        return false;
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error creating booking:', error);
      toast.error('Error creating booking');
      return false;
    }
  },

  updateBookingStatus: async (id: string, status: string) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success('Booking status updated successfully');
        await get().fetchRenterBookings();
        await get().fetchOwnerBookings();
        set({ loading: false });
        return true;
      } else {
        set({ loading: false });
        toast.error('Failed to update booking');
        return false;
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error updating booking:', error);
      toast.error('Error updating booking');
      return false;
    }
  },

  processPayment: async (bookingId: string) => {
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      await res.json();
      if (res.ok) {
        toast.success('Payment processed successfully!');
        return true;
      } else {
        toast.warning('Booking created but payment failed. Please complete payment from My Bookings.');
        return false;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.warning('Booking created but payment processing failed. Please complete payment from My Bookings.');
      return false;
    }
  },

  fetchStats: async () => {
    try {
      const renterBookings = get().renterBookings;
      const now = new Date();
      
      const upcoming = renterBookings.filter(
        (b) => new Date(b.startDate) > now && b.status !== 'cancelled'
      );
      const completed = renterBookings.filter(
        (b) => b.status === 'completed'
      );
      const totalSpent = completed
        .filter((b) => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalPrice, 0);
      
      const completedOwner = get().ownerBookings.filter(
        (b) => b.status === 'completed'
      );
      const totalEarned = completedOwner
        .filter((b) => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalPrice, 0);

      set({
        stats: {
          totalBookings: renterBookings.length,
          upcomingBookings: upcoming.length,
          completedBookings: completed.length,
          totalSpent,
          totalEarned,
        },
      });
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  },
}));

