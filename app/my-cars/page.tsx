'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Car, Calendar, IndianRupee, TrendingUp, Eye, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import Image from 'next/image';
import Loader from '@/components/Loader';
import { validateRequired, validateYear, validatePrice, validateNumber } from '@/lib/validation';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useCarStore } from '@/stores/useCarStore';
import { useBookingStore } from '@/stores/useBookingStore';

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
  type: string;
  description: string;
  features: string[];
}

export default function MyCarsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cars, loading, stats, fetchCars, createCar, deleteCar, updateCar, uploadCarImage, fetchStats, setFilters } = useCarStore();
  const { fetchOwnerBookings } = useBookingStore();
  const [addCarOpen, setAddCarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.id) {
      setFilters({ ownerId: session.user.id });
      fetchCars({ ownerId: session.user.id });
      fetchOwnerBookings();
      fetchStats();
    }
  }, [status, router, session?.user?.id, fetchCars, fetchOwnerBookings, fetchStats, setFilters]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await uploadCarImage(file);
    if (url) {
      setCarForm({
        ...carForm,
        images: [...carForm.images, url],
      });
    }
    setUploading(false);
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

    const success = await createCar({
      ...carForm,
      features: carForm.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      pricePerDay: parseFloat(carForm.pricePerDay),
    });

    if (success) {
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
      if (session?.user?.id) {
        fetchCars({ ownerId: session.user.id });
        fetchStats();
      }
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    await deleteCar(carId);
    if (session?.user?.id) {
      fetchCars({ ownerId: session.user.id });
      fetchStats();
    }
  };

  const handleToggleAvailability = async (carId: string, currentStatus: boolean) => {
    const success = await updateCar(carId, { available: !currentStatus });
    if (success && session?.user?.id) {
      fetchCars({ ownerId: session.user.id });
      fetchStats();
    }
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch = 
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'available' && car.available) ||
      (filterStatus === 'unavailable' && !car.available);

    return matchesSearch && matchesFilter;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader size="lg" text="Loading your cars..." />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                My Cars
              </h1>
              <p className="mt-2 text-base text-gray-600 sm:text-lg">
                Manage your car listings and track performance
              </p>
            </div>
            <Dialog open={addCarOpen} onOpenChange={setAddCarOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Car
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Add New Car</DialogTitle>
                  <DialogDescription className="text-base">
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
                      <Label>Price per Day (₹) *</Label>
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
                      multiple
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
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Add Car
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cars</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCars}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Available</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.availableCars}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalEarnings.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by make, model, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cars</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cars Grid */}
        {filteredCars.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCars.map((car) => (
              <Card key={car._id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <Link href={`/cars/${car._id}`}>
                  <div className="relative h-48 w-full">
                    <Image
                      src={car.images[0] || '/placeholder.svg'}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={car.available ? 'bg-green-500' : 'bg-red-500'}>
                        {car.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>
                </Link>
                <CardContent className="p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {car.make} {car.model} {car.year}
                    </h3>
                    <p className="text-sm text-gray-600">{car.location}</p>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">₹{car.pricePerDay}</p>
                      <p className="text-xs text-gray-500">per day</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{car.totalReviews} reviews</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-sm font-semibold">{car.rating > 0 ? car.rating.toFixed(1) : 'New'}</span>
                        <span className="text-xs text-gray-500">rating</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleAvailability(car._id, car.available)}
                      className="flex-1"
                    >
                      {car.available ? 'Mark Unavailable' : 'Mark Available'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCar(car._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Car className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || filterStatus !== 'all' ? 'No cars found' : 'No cars listed yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start earning by listing your first car'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Button
                  onClick={() => setAddCarOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Add Your First Car
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

