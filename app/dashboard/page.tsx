'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Car, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import BookingCard from '@/components/BookingCard';
import CarCard from '@/components/CarCard';
import Image from 'next/image';
import Loader from '@/components/Loader';
import { validateRequired, validateYear, validatePrice, validateNumber } from '@/lib/validation';

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  images: string[];
  pricePerDay: number;
  location: string;
  rating: number;
  totalReviews: number;
  seats: number;
  fuelType: string;
  transmission: string;
  available: boolean;
  owner?: string;
}

interface Booking {
  _id: string;
  car: {
    _id: string;
    make: string;
    model: string;
    images: string[];
  };
  renter?: {
    name: string;
    email: string;
    avatar?: string;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [addCarOpen, setAddCarOpen] = useState(false);
  const [carForm, setCarForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    type: '',
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    pricePerDay: '',
    location: '',
    description: '',
    features: '',
    images: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      // Fetch user's cars
      const carsRes = await fetch(`/api/cars?ownerId=${session.user.id}`);
      const carsData = await carsRes.json();
      setCars(carsData.cars || []);

      // Fetch bookings
      const bookingsRes = await fetch('/api/bookings?role=renter');
      const ownerBookingsRes = await fetch('/api/bookings?role=owner');
      const bookingsData = await bookingsRes.json();
      const ownerBookingsData = await ownerBookingsRes.json();
      setBookings([
        ...(bookingsData.bookings || []),
        ...(ownerBookingsData.bookings || []),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.id) {
      fetchData();
    }
  }, [status, router, session?.user?.id, fetchData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setCarForm({
          ...carForm,
          images: [...carForm.images, data.url],
        });
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch {
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (validateRequired(carForm.make, 'Make')) newErrors.make = validateRequired(carForm.make, 'Make')!;
    if (validateRequired(carForm.model, 'Model')) newErrors.model = validateRequired(carForm.model, 'Model')!;
    if (validateYear(carForm.year)) newErrors.year = validateYear(carForm.year)!;
    if (validateRequired(carForm.type, 'Type')) newErrors.type = validateRequired(carForm.type, 'Type')!;
    if (validateRequired(carForm.location, 'Location')) newErrors.location = validateRequired(carForm.location, 'Location')!;
    if (validateRequired(carForm.description, 'Description')) newErrors.description = validateRequired(carForm.description, 'Description')!;
    if (validatePrice(carForm.pricePerDay)) newErrors.pricePerDay = validatePrice(carForm.pricePerDay)!;
    if (validateNumber(carForm.seats, 'Seats', 2, 20)) newErrors.seats = validateNumber(carForm.seats, 'Seats', 2, 20)!;
    if (carForm.images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCar = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const res = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...carForm,
          features: carForm.features
            .split(',')
            .map((f) => f.trim())
            .filter(Boolean),
          pricePerDay: parseFloat(carForm.pricePerDay),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAddCarOpen(false);
        setErrors({});
        setCarForm({
          make: '',
          model: '',
          year: new Date().getFullYear(),
          type: '',
          transmission: 'automatic',
          fuelType: 'petrol',
          seats: 5,
          pricePerDay: '',
          location: '',
          description: '',
          features: '',
          images: [],
        });
        fetchData();
      } else {
        alert(data.error || 'Failed to add car');
      }
    } catch {
      alert('Error adding car');
    }
  };

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchData();
      } else {
        alert('Failed to update booking');
      }
    } catch {
      alert('Error updating booking');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!session) return null;

  const myBookings = bookings.filter(
    (b) => b.renter?.email === session.user.email
  );
  const ownerBookings = bookings.filter(
    (b) => b.car && cars.some((c) => c._id === b.car._id)
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Manage your cars and bookings
          </p>
        </div>

        <Tabs defaultValue="cars" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:w-auto">
            <TabsTrigger value="cars">My Cars</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="cars" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Cars</h2>
              <Dialog open={addCarOpen} onOpenChange={setAddCarOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Car
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Car</DialogTitle>
                    <DialogDescription>
                      List your car for rent on Carido
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Make *</Label>
                        <Input
                          value={carForm.make}
                          onChange={(e) => {
                            setCarForm({ ...carForm, make: e.target.value });
                            if (errors.make) setErrors({ ...errors, make: '' });
                          }}
                          placeholder="Enter Make"
                          aria-invalid={!!errors.make}
                        />
                        {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make}</p>}
                      </div>
                      <div>
                        <Label>Model *</Label>
                        <Input
                          value={carForm.model}
                          onChange={(e) => {
                            setCarForm({ ...carForm, model: e.target.value });
                            if (errors.model) setErrors({ ...errors, model: '' });
                          }}
                          placeholder="Enter Model"
                          aria-invalid={!!errors.model}
                        />
                        {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Year *</Label>
                        <Input
                          type="number"
                          value={carForm.year}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? new Date().getFullYear() : parseInt(value, 10);
                            setCarForm({
                              ...carForm,
                              year: isNaN(numValue) ? new Date().getFullYear() : numValue,
                            });
                            if (errors.year) setErrors({ ...errors, year: '' });
                          }}
                          aria-invalid={!!errors.year}
                        />
                        {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                      </div>
                      <div>
                        <Label>Type *</Label>
                        <Select
                          value={carForm.type}
                          onValueChange={(value) =>
                            setCarForm({ ...carForm, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sedan">Sedan</SelectItem>
                            <SelectItem value="SUV">SUV</SelectItem>
                            <SelectItem value="Hatchback">Hatchback</SelectItem>
                            <SelectItem value="Coupe">Coupe</SelectItem>
                            <SelectItem value="Convertible">Convertible</SelectItem>
                            <SelectItem value="Van">Van</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Transmission *</Label>
                        <Select
                          value={carForm.transmission}
                          onValueChange={(value) =>
                            setCarForm({ ...carForm, transmission: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automatic">Automatic</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Fuel Type *</Label>
                        <Select
                          value={carForm.fuelType}
                          onValueChange={(value) =>
                            setCarForm({ ...carForm, fuelType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="petrol">Petrol</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Seats *</Label>
                        <Input
                          type="number"
                          value={carForm.seats}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? 5 : parseInt(value, 10);
                            setCarForm({
                              ...carForm,
                              seats: isNaN(numValue) ? 5 : numValue,
                            });
                          }}
                          min={2}
                          max={20}
                        />
                      </div>
                    <div>
                      <Label>Price per Day ($) *</Label>
                      <Input
                        type="number"
                        value={carForm.pricePerDay}
                        onChange={(e) => {
                          setCarForm({ ...carForm, pricePerDay: e.target.value });
                          if (errors.pricePerDay) setErrors({ ...errors, pricePerDay: '' });
                        }}
                        placeholder="50"
                        aria-invalid={!!errors.pricePerDay}
                      />
                      {errors.pricePerDay && <p className="mt-1 text-sm text-red-600">{errors.pricePerDay}</p>}
                    </div>
                    </div>
                    <div>
                      <Label>Location *</Label>
                      <Input
                        value={carForm.location}
                        onChange={(e) => {
                          setCarForm({ ...carForm, location: e.target.value });
                          if (errors.location) setErrors({ ...errors, location: '' });
                        }}
                        placeholder="Enter City"
                        aria-invalid={!!errors.location}
                      />
                      {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
                    </div>
                    <div>
                      <Label>Description *</Label>
                      <Textarea
                        value={carForm.description}
                        onChange={(e) => {
                          setCarForm({ ...carForm, description: e.target.value });
                          if (errors.description) setErrors({ ...errors, description: '' });
                        }}
                        placeholder="Describe your car..."
                        rows={4}
                        aria-invalid={!!errors.description}
                      />
                      {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>
                    <div>
                      <Label>Features (comma-separated)</Label>
                      <Input
                        value={carForm.features}
                        onChange={(e) =>
                          setCarForm({ ...carForm, features: e.target.value })
                        }
                        placeholder="GPS, Bluetooth, Leather Seats"
                      />
                    </div>
                    <div>
                      <Label>Images *</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        aria-invalid={!!errors.images}
                      />
                      {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
                      {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
                      {carForm.images.length > 0 && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {carForm.images.map((img, i) => (
                            <div key={i} className="relative h-20 w-full">
                              <Image
                                src={img}
                                alt={`Upload ${i + 1}`}
                                fill
                                className="rounded-lg object-cover"
                                sizes="(max-width: 768px) 25vw, 20vw"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleAddCar}
                      className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white"
                    >
                      Add Car
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {cars.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cars.map((car) => (
                  <CarCard key={car._id} car={car} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Car className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">No cars listed yet.</p>
                  <Button
                    onClick={() => setAddCarOpen(true)}
                    className="mt-4 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white"
                  >
                    Add Your First Car
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div>
              <h2 className="mb-4 text-xl font-semibold">My Bookings</h2>
              {myBookings.length > 0 ? (
                <div className="space-y-4">
                  {myBookings.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-gray-600">No bookings yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {session.user.role === 'owner' && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">Bookings for My Cars</h2>
                {ownerBookings.length > 0 ? (
                  <div className="space-y-4">
                    {ownerBookings.map((booking) => (
                      <BookingCard
                        key={booking._id}
                        booking={booking}
                        showRenter={true}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p className="text-gray-600">No bookings for your cars yet.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

