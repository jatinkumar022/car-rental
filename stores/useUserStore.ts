import { create } from 'zustand';
import { toast } from 'sonner';

interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Fallback for backward compatibility
  email: string;
  phone?: string;
  profileImage?: string;
  avatar?: string; // Fallback for backward compatibility
  role?: string;
  userType?: string;
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  loading: false,

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/users/profile');
      const data = await res.json();
      if (res.ok) {
        set({ profile: data.user, loading: false });
      } else {
        set({ loading: false });
        toast.error(data.error || 'Failed to fetch profile');
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error fetching profile:', error);
      toast.error('Error fetching profile');
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();
      if (res.ok) {
        set({ profile: responseData.user, loading: false });
        toast.success('Profile updated successfully!');
        return true;
      } else {
        set({ loading: false });
        toast.error(responseData.error || 'Failed to update profile');
        return false;
      }
    } catch (error) {
      set({ loading: false });
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
      return false;
    }
  },

  uploadAvatar: async (file: File): Promise<string | null> => {
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
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading avatar');
      return null;
    }
  },
}));

