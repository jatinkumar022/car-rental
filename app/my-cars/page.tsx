'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Plus, Car, Calendar, IndianRupee, TrendingUp, Eye, Trash2, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  images: Array<{ url: string }> | string[];
  dailyPrice?: number;
  pricePerDay?: number; // Fallback
  locationCity?: string;
  locationAddress?: string;
  location?: string; // Fallback
  rating: number;
  totalTrips?: number;
  totalReviews?: number; // Fallback
  seatingCapacity?: number;
  seats?: number; // Fallback
  fuelType: string;
  transmission: string;
  status?: 'pending' | 'active' | 'inactive' | 'suspended' | string;
  available?: boolean; // Fallback
  owner?: string;
  type?: string;
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
    year: new Date().getFullYear().toString(),
    type: '',
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: '5',
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

  const handleRemoveImage = (index: number) => {
    setCarForm({
      ...carForm,
      images: carForm.images.filter((_, i) => i !== index),
    });
    // Clear image error if images exist after removal
    if (carForm.images.length > 1 && errors.images) {
      setErrors({ ...errors, images: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (validateRequired(carForm.make, 'Make')) newErrors.make = validateRequired(carForm.make, 'Make')!;
    if (validateRequired(carForm.model, 'Model')) newErrors.model = validateRequired(carForm.model, 'Model')!;
    const yearNum = parseInt(carForm.year);
    if (validateYear(yearNum)) newErrors.year = validateYear(yearNum)!;
    if (validateRequired(carForm.type, 'Type')) newErrors.type = validateRequired(carForm.type, 'Type')!;
    if (validateRequired(carForm.location, 'Location')) newErrors.location = validateRequired(carForm.location, 'Location')!;
    if (validateRequired(carForm.description, 'Description')) newErrors.description = validateRequired(carForm.description, 'Description')!;
    if (validatePrice(carForm.pricePerDay)) newErrors.pricePerDay = validatePrice(carForm.pricePerDay)!;
    const seatsNum = parseInt(carForm.seats);
    if (validateNumber(seatsNum, 'Seats', 2, 20)) newErrors.seats = validateNumber(seatsNum, 'Seats', 2, 20)!;
    if (carForm.images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCar = async () => {
    if (!validateForm()) {
      return;
    }

    // Parse and validate numeric values
    const year = parseInt(carForm.year);
    const seats = parseInt(carForm.seats);
    const pricePerDay = parseFloat(carForm.pricePerDay);

    // Double-check that required numeric fields are valid
    if (isNaN(year) || isNaN(seats) || isNaN(pricePerDay)) {
      setErrors({ 
        ...errors, 
        ...(isNaN(year) && { year: 'Please provide a valid year' }),
        ...(isNaN(seats) && { seats: 'Please provide a valid number of seats' }),
        ...(isNaN(pricePerDay) && { pricePerDay: 'Please provide a valid price' }),
      });
      return;
    }

    const carData = {
      make: carForm.make.trim(),
      model: carForm.model.trim(),
      year: year,
      transmission: carForm.transmission,
      fuelType: carForm.fuelType,
      seats: seats, // Will be mapped to seatingCapacity in API
      features: carForm.features
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      pricePerDay: pricePerDay, // Will be mapped to dailyPrice in API
      location: carForm.location.trim(), // Will be mapped to locationCity in API
      description: carForm.description.trim(),
      images: carForm.images, // Include images - API will convert to proper format
    };
    
    const success = await createCar(carData as Parameters<typeof createCar>[0]);

    if (success) {
      setAddCarOpen(false);
      setErrors({});
      setCarForm({
        make: '',
        model: '',
        year: new Date().getFullYear().toString(),
        type: '',
        transmission: 'automatic',
        fuelType: 'petrol',
        seats: '5',
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
    // Update status field: 'active' for available, 'inactive' for unavailable
    const updateData = { status: currentStatus ? 'inactive' : 'active' };
    const success = await updateCar(carId, updateData as Parameters<typeof updateCar>[1]);
    if (success && session?.user?.id) {
      fetchCars({ ownerId: session.user.id });
      fetchStats();
    }
  };

  const filteredCars = cars.filter((car) => {
    const matchesSearch = 
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (car.locationCity?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (car.locationAddress?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (car.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'available' && (car.status === 'active' || car.available === true)) ||
      (filterStatus === 'unavailable' && (car.status !== 'active' && car.available !== true));

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
    <div className="min-h-screen bg-[#F7F7FA] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
                My Cars
              </h1>
              <p className="mt-2 text-base text-[#6C6C80] sm:text-lg">
                Manage your car listings and track performance
              </p>
            </div>
            <Dialog open={addCarOpen} onOpenChange={setAddCarOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#00D09C] hover:bg-[#00B386] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Car
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
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
                          setCarForm({
                            ...carForm,
                            year: e.target.value,
                          });
                          if (errors.year) setErrors({ ...errors, year: '' });
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === '' || isNaN(parseInt(value, 10))) {
                            setCarForm({
                              ...carForm,
                              year: new Date().getFullYear().toString(),
                            });
                          }
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
                          setCarForm({
                            ...carForm,
                            seats: e.target.value,
                          });
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === '' || isNaN(parseInt(value, 10))) {
                            setCarForm({
                              ...carForm,
                              seats: '5',
                            });
                          }
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
                          <div key={i} className="relative h-20 w-full group">
                            <Image
                              src={img}
                              alt={`Upload ${i + 1}`}
                              fill
                              className="rounded-lg object-cover"
                              sizes="(max-width: 768px) 25vw, 20vw"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(i)}
                              className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                              aria-label="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddCar}
                    className="w-full bg-[#00D09C] hover:bg-[#00B386] text-white rounded-xl font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Add Car
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6C6C80] mb-1">Total Cars</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{stats.totalCars}</p>
                </div>
                <div className="p-3 bg-[#E6F3FF] rounded-lg">
                  <Car className="h-6 w-6 text-[#2196F3]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6C6C80] mb-1">Available</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{stats.availableCars}</p>
                </div>
                <div className="p-3 bg-[#E6FFF9] rounded-lg">
                  <TrendingUp className="h-6 w-6 text-[#00D09C]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6C6C80] mb-1">Total Earnings</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">₹{stats.totalEarnings.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-[#E6FFF9] rounded-lg">
                  <IndianRupee className="h-6 w-6 text-[#00D09C]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6C6C80] mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{stats.totalBookings}</p>
                </div>
                <div className="p-3 bg-[#E6F3FF] rounded-lg">
                  <Calendar className="h-6 w-6 text-[#2196F3]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6C6C80]" />
            <Input
              placeholder="Search by make, model, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#6C6C80]" />
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
            {filteredCars.map((car) => {
              const carImages = Array.isArray(car.images) && car.images.length > 0
                ? (typeof car.images[0] === 'string'
                    ? car.images as string[]
                    : (car.images as unknown as Array<{ url: string }>).map((img: { url: string }) => img.url))
                : ['/placeholder.svg'];

              return (
                <Card key={car._id} className="overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-shadow">
                  <Link href={`/cars/${car._id}`}>
                    <div className="relative h-48 w-full">
                      <Image
                        src={carImages[0] || '/placeholder.svg'}
                        alt={`${car.make} ${car.model}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={(car.status === 'active' || car.available === true) ? 'bg-[#00D09C] text-white' : 'bg-[#FF4444] text-white'}>
                          {(car.status === 'active' || car.available === true) ? 'Available' : 'Unavailable'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-[#1A1A2E]">
                        {car.make} {car.model} {car.year}
                      </h3>
                      <p className="text-sm text-[#6C6C80]">{car.locationCity || car.locationAddress || car.location || 'Location not specified'}</p>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-[#00D09C]">₹{car.dailyPrice || car.pricePerDay || 0}</p>
                        <p className="text-xs text-[#6C6C80]">per day</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-[#6C6C80]" />
                          <span className="text-sm text-[#6C6C80]">{car.totalTrips || car.totalReviews || 0} trips</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-sm font-semibold text-[#1A1A2E]">{car.rating > 0 ? car.rating.toFixed(1) : 'New'}</span>
                          <span className="text-xs text-[#6C6C80]">rating</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleAvailability(car._id, car.status === 'active' || car.available === true)}
                        className="flex-1 border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]"
                      >
                        {(car.status === 'active' || car.available === true) ? 'Mark Unavailable' : 'Mark Available'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteCar(car._id)}
                        className="border-[#FF4444] text-[#FF4444] hover:bg-[#FFE5E5]"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-[#E6FFF9] rounded-full flex items-center justify-center">
                <Car className="h-10 w-10 text-[#00D09C]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">
                {searchQuery || filterStatus !== 'all' ? 'No cars found' : 'No cars listed yet'}
              </h3>
              <p className="text-[#6C6C80] mb-6">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start earning by listing your first car'}
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Button
                  onClick={() => setAddCarOpen(true)}
                  className="bg-[#00D09C] hover:bg-[#00B386] text-white rounded-xl font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
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

