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
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
  });
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  // Check if form is dirty
  const isDirty = 
    profileData.name !== initialData.name ||
    profileData.phone !== initialData.phone ||
    profileData.avatar !== initialData.avatar;

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
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        avatar: profile.avatar || '',
      };
      setInitialData(data);
      setProfileData(data);
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
    const success = await updateProfile({ avatar: croppedImageUrl });
    if (success) {
      const updatedData = { ...profileData, avatar: croppedImageUrl };
      setProfileData(updatedData);
      setInitialData(updatedData);
      router.refresh();
    }
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const success = await updateProfile({
      name: profileData.name,
      phone: profileData.phone,
      avatar: profileData.avatar,
    });
    if (success) {
      setInitialData({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        avatar: profileData.avatar,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Profile Settings
          </h1>
          <p className="mt-2 text-base text-gray-600 sm:text-lg">
            Customize your profile information
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4 pb-6 border-b">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profileData.avatar} alt={profileData.name} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                    {profileData.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
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
              <p className="text-sm text-gray-600 text-center">
                Click the camera icon to upload a new profile picture
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="mt-2 bg-gray-50 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-2">
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
              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
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

