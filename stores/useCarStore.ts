import { create } from 'zustand';
import { toast } from 'sonner';

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  type?: string;
  transmission: string;
  fuelType: string;
  seats?: number;
  seatingCapacity?: number;
  pricePerDay?: number;
  dailyPrice?: number;
  location?: string;
  locationCity?: string;
  locationAddress?: string;
  images: Array<{ url: string; isPrimary?: boolean; orderIndex?: number }> | string[];
  description: string;
  features: string[];
  rating: number;
  totalReviews?: number;
  totalTrips?: number;
  available?: boolean;
  status?: 'pending' | 'active' | 'inactive' | 'suspended';
  hostId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    profileImage?: string;
    avatar?: string;
    phone?: string;
  };
  owner?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    profileImage?: string;
    avatar?: string;
    phone?: string;
  };
}

interface CarFilters {
  search?: string;
  type?: string;
  transmission?: string;
  fuelType?: string;
  minPrice?: string;
  maxPrice?: string;
  location?: string;
  ownerId?: string;
  limit?: string;
}

interface CarState {
  cars: Car[];
  currentCar: Car | null;
  similarCars: Car[];
  loading: boolean;
  filters: CarFilters;
  stats: {
    totalCars: number;
    availableCars: number;
    totalEarnings: number;
    totalBookings: number;
  };
  fetchCars: (filters?: CarFilters) => Promise<void>;
  fetchCarById: (id: string) => Promise<void>;
  fetchSimilarCars: (type: string, excludeId: string) => Promise<void>;
  createCar: (carData: Partial<Car>) => Promise<boolean>;
  updateCar: (id: string, carData: Partial<Car>) => Promise<boolean>;
  deleteCar: (id: string) => Promise<boolean>;
  uploadCarImage: (file: File) => Promise<string | null>;
  setFilters: (filters: CarFilters) => void;
  fetchStats: () => Promise<void>;
}

export const useCarStore = create<CarState>((set, get) => ({
  cars: [],
  currentCar: null,
  similarCars: [],
  loading: false,
  filters: {},
  stats: {
    totalCars: 0,
    availableCars: 0,
    totalEarnings: 0,
    totalBookings: 0,
  },

  fetchCars: async (filters?: CarFilters) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams();
      const activeFilters = filters || get().filters;
      
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await fetch(`/api/cars?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        set({ cars: data.cars || [], loading: false });
      } else {
        set({ loading: false });
        toast.error(data.error || 'Failed to fetch cars');
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching cars:', error);
      toast.error('Error fetching cars');
    }
  },

  fetchCarById: async (id: string) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/cars/${id}`);
      const data = await res.json();
      if (res.ok) {
        set({ currentCar: data.car, loading: false });
      } else {
        set({ loading: false });
        toast.error(data.error || 'Failed to fetch car');
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching car:', error);
      toast.error('Error fetching car');
    }
  },

  fetchSimilarCars: async (type: string, excludeId: string) => {
    try {
      const res = await fetch(`/api/cars?type=${type}&limit=4`);
      const data = await res.json();
      if (res.ok) {
        const similar = (data.cars || []).filter((c: Car) => c._id !== excludeId).slice(0, 3);
        set({ similarCars: similar });
      }
    } catch (error) {
      console.error('Error fetching similar cars:', error);
    }
  },

  createCar: async (carData: Partial<Car>) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Car added successfully!');
        await get().fetchCars();
        set({ loading: false });
        return true;
      } else {
        set({ loading: false });
        toast.error(data.error || 'Failed to add car');
        return false;
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error creating car:', error);
      toast.error('Error creating car');
      return false;
    }
  },

  updateCar: async (id: string, carData: Partial<Car>) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Car updated successfully!');
        await get().fetchCars();
        if (get().currentCar?._id === id) {
          set({ currentCar: data.car });
        }
        set({ loading: false });
        return true;
      } else {
        set({ loading: false });
        toast.error(data.error || 'Failed to update car');
        return false;
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error updating car:', error);
      toast.error('Error updating car');
      return false;
    }
  },

  deleteCar: async (id: string) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/cars/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Car deleted successfully');
        await get().fetchCars();
        set({ loading: false });
        return true;
      } else {
        set({ loading: false });
        toast.error('Failed to delete car');
        return false;
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error deleting car:', error);
      toast.error('Error deleting car');
      return false;
    }
  },

  uploadCarImage: async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        return data.url;
      } else {
        toast.error(data.error || 'Upload failed');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
      return null;
    }
  },

  setFilters: (filters: CarFilters) => {
    set({ filters });
  },

  fetchStats: async () => {
    try {
      // Fetch user's cars
      const carsRes = await fetch('/api/cars?ownerId=' + get().filters.ownerId);
      const carsData = await carsRes.json();
      const fetchedCars = carsData.cars || [];

      // Fetch bookings for stats
      const bookingsRes = await fetch('/api/bookings?role=owner');
      const bookingsData = await bookingsRes.json();
      const bookings = bookingsData.bookings || [];

      // Calculate stats
      const totalEarnings = bookings
        .filter((b: { status: string; paymentStatus: string }) => 
          b.status === 'completed' && b.paymentStatus === 'paid'
        )
        .reduce((sum: number, b: { totalAmount?: number; totalPrice?: number }) => 
          sum + (b.totalAmount || b.totalPrice || 0), 0);

      set({
        stats: {
          totalCars: fetchedCars.length,
          availableCars: fetchedCars.filter((c: Car) => c.status === 'active').length,
          totalEarnings,
          totalBookings: bookings.length,
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  },
}));

