'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Save, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Loader from '@/components/Loader';
import AvatarCropper from '@/components/AvatarCropper';
import { useUserStore } from '@/stores/useUserStore';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { profile, loading, fetchProfile, updateProfile } = useUserStore();
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: '',
  });
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    profileImage: '',
  });
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  // Check if form is dirty
  const isDirty = 
    profileData.firstName !== initialData.firstName ||
    profileData.lastName !== initialData.lastName ||
    profileData.phone !== initialData.phone ||
    profileData.profileImage !== initialData.profileImage;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.id) {
      fetchProfile();
    }
  }, [status, router, session?.user?.id, fetchProfile]);

  useEffect(() => {
    if (profile) {
      const data = {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        profileImage: profile.profileImage || '',
      };
      // Sync external state (Zustand store) to local form state
      // This is necessary to sync Zustand store data to local form state for editing
      // Using functional updates to avoid unnecessary re-renders
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitialData((prev) => {
        const hasChanged = 
          prev.firstName !== data.firstName ||
          prev.lastName !== data.lastName ||
          prev.email !== data.email ||
          prev.phone !== data.phone ||
          prev.profileImage !== data.profileImage;
        return hasChanged ? data : prev;
      });
      setProfileData((prev) => {
        const hasChanged = 
          prev.firstName !== data.firstName ||
          prev.lastName !== data.lastName ||
          prev.email !== data.email ||
          prev.phone !== data.phone ||
          prev.profileImage !== data.profileImage;
        return hasChanged ? data : prev;
      });
    }
  }, [profile]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    setSaving(true);
    const success = await updateProfile({ profileImage: croppedImageUrl });
    if (success) {
      const updatedData = { ...profileData, profileImage: croppedImageUrl };
      setProfileData(updatedData);
      setInitialData(updatedData);
      router.refresh();
    }
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await updateProfile({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      profileImage: profileData.profileImage,
    });
    if (success) {
      setInitialData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        profileImage: profileData.profileImage,
      });
      router.refresh();
    }
    setSaving(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (!session) return null;

  const displayName = profileData.firstName && profileData.lastName
    ? `${profileData.firstName} ${profileData.lastName}`
    : profileData.firstName || profileData.lastName || 'User';

  return (
    <div className="min-h-screen bg-[#F7F7FA] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
            Profile Settings
          </h1>
          <p className="mt-2 text-base text-[#6C6C80] sm:text-lg">
            Customize your profile information
          </p>
        </div>

        <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#1A1A2E]">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4 pb-6 border-b border-[#E5E5EA]">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profileData.profileImage} alt={displayName} />
                  <AvatarFallback className="text-4xl bg-[#00D09C] text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-[#00D09C] rounded-full cursor-pointer hover:bg-[#00B386] transition-all shadow-lg"
                >
                  <Camera className="h-5 w-5 text-white" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-[#6C6C80] text-center">
                Click the camera icon to upload a new profile picture
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="flex items-center gap-2 text-[#2D2D44]">
                    <User className="h-4 w-4" />
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, firstName: e.target.value })
                    }
                    placeholder="Enter your first name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="flex items-center gap-2 text-[#2D2D44]">
                    <User className="h-4 w-4" />
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, lastName: e.target.value })
                    }
                    placeholder="Enter your last name"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2 text-[#2D2D44]">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="mt-2 bg-[#F7F7FA] cursor-not-allowed text-[#6C6C80]"
                />
                <p className="mt-1 text-xs text-[#6C6C80]">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 text-[#2D2D44]">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Save Button - Only show when form is dirty */}
            {isDirty && (
              <div className="flex justify-end pt-4 border-t border-[#E5E5EA]">
                <Button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="bg-[#00D09C] hover:bg-[#00B386] text-white rounded-xl font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Avatar Cropper Dialog */}
      <AvatarCropper
        open={cropperOpen}
        onOpenChange={setCropperOpen}
        imageSrc={imageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}

