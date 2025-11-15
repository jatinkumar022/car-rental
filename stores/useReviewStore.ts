import { create } from 'zustand';
import { toast } from 'sonner';

interface Review {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewState {
  reviews: Review[];
  loading: boolean;
  fetchReviews: (carId: string) => Promise<void>;
  createReview: (carId: string, bookingId: string, rating: number, comment: string) => Promise<boolean>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  loading: false,

  fetchReviews: async (carId: string) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/reviews?carId=${carId}`);
      const data = await res.json();
      if (res.ok) {
        set({ reviews: data.reviews || [], loading: false });
      } else {
        set({ loading: false });
        toast.error(data.error || 'Failed to fetch reviews');
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching reviews:', error);
      toast.error('Error fetching reviews');
    }
  },

  createReview: async (carId: string, bookingId: string, rating: number, comment: string) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId, bookingId, rating, comment }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Review submitted successfully!');
        await get().fetchReviews(carId);
        set({ loading: false });
        return true;
      } else {
        set({ loading: false });
        toast.error(data.error || 'Failed to submit review');
        return false;
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
      return false;
    }
  },
}));

