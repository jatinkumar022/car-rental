'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  MapPin,
  Users,
  Fuel,
  Settings,
  Star,
  Phone,
  Mail,
  Car,
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import CarCard from '@/components/CarCard';
import { useCarStore } from '@/stores/useCarStore';
import { useBookingStore } from '@/stores/useBookingStore';
import { useReviewStore } from '@/stores/useReviewStore';
import { toast } from 'sonner';
import { DatePickerSingle } from '@/components/ui/date-picker-single';

interface CarHost {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  profileImage?: string;
  phone?: string;
}

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  transmission: string;
  fuelType: string;
  seatingCapacity?: number;
  seats?: number;
  dailyPrice?: number;
  pricePerDay?: number;
  locationCity?: string;
  locationAddress?: string;
  location?: string;
  images: Array<{ url: string; isPrimary?: boolean; orderIndex?: number }> | string[];
  description: string;
  features: string[];
  rating: number;
  totalTrips?: number;
  totalReviews?: number;
  status?: string;
  hostId?: CarHost;
  owner?: CarHost;
}

interface Review {
  _id: string;
  reviewerId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
  };
  rating: number;
  reviewText?: string;
  comment?: string;
  createdAt: string;
}

interface Favorite {
  _id: string;
  carId?: {
    _id: string;
  };
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { currentCar: car, similarCars, loading, fetchCarById, fetchSimilarCars } = useCarStore();
  const { reviews, fetchReviews, createReview } = useReviewStore();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('location');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
  });
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [isMoreThanOneDay, setIsMoreThanOneDay] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const resetBookingForm = useCallback(() => {
    setBookingData({
      startDate: '',
      endDate: '',
    });
    setIsMoreThanOneDay(false);
  }, []);

  useEffect(() => {
    if (!bookingOpen) {
      resetBookingForm();
    }
  }, [bookingOpen, resetBookingForm]);

  const checkFavorite = useCallback(async () => {
    if (!session?.user?.id || !params.id) return;
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      if (res.ok && data.favorites) {
        const favorite = data.favorites.find((f: Favorite) => 
          f.carId?._id === params.id || f.carId?._id?.toString() === params.id
        );
        setIsFavorite(!!favorite);
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  }, [session?.user?.id, params.id]);

  const fetchBookedDates = useCallback(async () => {
    if (!params.id) return;
    try {
      const res = await fetch(`/api/cars/${params.id}/booked-dates`);
      const data = await res.json();
      if (res.ok && data.bookedDates) {
        setBookedDates(data.bookedDates);
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchCarById(params.id as string);
      fetchReviews(params.id as string);
      checkFavorite();
      fetchBookedDates();
    }
  }, [params.id, fetchCarById, fetchReviews, checkFavorite, fetchBookedDates]);

  const handleToggleFavorite = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        const res = await fetch(`/api/favorites?carId=${params.id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setIsFavorite(false);
          toast.success('Removed from favorites');
        } else {
          toast.error('Failed to remove from favorites');
        }
      } else {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carId: params.id }),
        });
        if (res.ok) {
          setIsFavorite(true);
          toast.success('Added to favorites');
        } else {
          const data = await res.json();
          if (data.error?.includes('already')) {
            setIsFavorite(true);
          } else {
            toast.error(data.error || 'Failed to add to favorites');
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error updating favorite');
    } finally {
      setFavoriteLoading(false);
    }
  };

  useEffect(() => {
    if (car && car._id) {
      const carType = ('type' in car && car.type) ? car.type : car.make || 'sedan';
      fetchSimilarCars(carType, car._id);
    }
  }, [car, fetchSimilarCars]);

  // Reset selected image when car changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [car?._id]);

  const handleStartDateChange = (date: Date | undefined) => {
    setBookingData((prev) => {
      const nextStart = date ? format(date, 'yyyy-MM-dd') : '';
      const shouldClearEnd =
        !date ||
        !isMoreThanOneDay ||
        (date && prev.endDate && date > new Date(prev.endDate));

      return {
        ...prev,
        startDate: nextStart,
        endDate: shouldClearEnd ? '' : prev.endDate,
      };
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setBookingData({
      ...bookingData,
      endDate: date ? format(date, 'yyyy-MM-dd') : '',
    });
  };

  const handleMoreThanOneDayChange = (checked: boolean) => {
    setIsMoreThanOneDay(checked);
    if (!checked) {
      // Clear end date when unchecking
      setBookingData({
        ...bookingData,
        endDate: '',
      });
    }
  };

  const handleBooking = () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (!bookingData.startDate) {
      toast.error('Please select a start date');
      return;
    }

    if (isMoreThanOneDay && !bookingData.endDate) {
      toast.error('Please select an end date');
      return;
    }

    // Redirect to checkout with booking details
    setBookingOpen(false);
    router.push(
      `/checkout?carId=${params.id}&startDate=${bookingData.startDate}&endDate=${bookingData.endDate}`
    );
  };

  const handleReview = async () => {
    if (!session) return;

      // First, find a completed booking for this car
    const { renterBookings, fetchRenterBookings } = useBookingStore.getState();
    await fetchRenterBookings();
    
    const booking = renterBookings.find(
      (b) => b.car._id === params.id && b.status === 'completed'
      );

      if (!booking) {
      toast.error('You can only review cars you have completed bookings for');
        return;
      }

    const success = await createReview(
      params.id as string,
      booking._id,
      reviewData.rating,
      reviewData.comment
    );

    if (success) {
        setReviewOpen(false);
      setReviewData({ rating: 5, comment: '' });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-96 animate-pulse rounded-2xl bg-[#E5E5EA]" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-[#6C6C80]">Car not found</p>
      </div>
    );
  }

  const totalDays =
    bookingData.startDate
      ? bookingData.endDate
        ? Math.ceil(
            (new Date(bookingData.endDate).getTime() -
              new Date(bookingData.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        : 1 // Single day booking
      : 0;
  const dailyPrice = car?.dailyPrice || car?.pricePerDay || 0;
  const subtotal = totalDays * dailyPrice;
  const serviceFee = subtotal * 0.10;
  const insuranceFee = 150 * totalDays;
  const gst = (subtotal + serviceFee + insuranceFee) * 0.18;
  const totalPrice = subtotal + serviceFee + insuranceFee + gst;

  // Handle images - can be array of strings or array of objects
  const carImages = Array.isArray(car.images) && car.images.length > 0
    ? (typeof car.images[0] === 'string' 
        ? (car.images as string[])
        : ((car.images as unknown as Array<{ url: string }>).map(img => img.url)))
    : ['/placeholder.svg'];

  const host: CarHost | undefined = (car && 'hostId' in car ? car.hostId : undefined) || (car && 'owner' in car ? car.owner : undefined);
  const hostName = host 
    ? (host.firstName && host.lastName
        ? `${host.firstName} ${host.lastName}`
        : host.firstName
        ? host.firstName
        : host.lastName
        ? host.lastName
        : host.name || host.email)
    : 'Host';

  return (
    <div className="min-h-screen bg-[#F7F7FA] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 hover:bg-white"
          >
            ← Back
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <Card className="mb-4 sm:mb-6 overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <div className="relative w-full aspect-video min-h-[200px] sm:min-h-[300px] md:min-h-[400px] lg:min-h-[500px]">
                <Image
                  src={carImages[selectedImageIndex] || carImages[0] || '/placeholder.svg'}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 66vw"
                  priority
                />
              </div>
              {carImages.length > 1 && (
                <div className="p-2 sm:p-3 md:p-4 bg-white">
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2 flex-wrap">
                    {carImages.map((img, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedImageIndex(i)}
                        className={`relative h-14 sm:h-16 md:h-20 w-full rounded-md sm:rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedImageIndex === i
                            ? 'ring-2 ring-[#00D09C] ring-offset-1 sm:ring-offset-2 opacity-100 scale-105'
                            : 'hover:opacity-80 opacity-70 hover:scale-105'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${car.make} ${car.model} ${i + 1}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 20vw, 12vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Booking Card - Mobile Only (shows after images) */}
            <div className="lg:hidden mb-4 sm:mb-6">
              <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1A2E]">₹{dailyPrice}</span>
                    <span className="text-[#6C6C80] text-sm sm:text-base md:text-lg">/day</span>
                  </div>
                  {(car?.status !== 'active' && car?.status !== undefined) && (
                    <Badge className="mt-2 bg-[#FF4444] text-white w-fit">
                      Currently Unavailable
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        className="w-full bg-[#00D09C] hover:bg-[#00B386] text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-5 hover:shadow-lg transition-all duration-300"
                        disabled={session?.user.id === host?._id || (car?.status !== 'active' && car?.status !== undefined)}
                      >
                        {session?.user.id === host?._id
                          ? 'Your Car'
                          : (car?.status !== 'active' && car?.status !== undefined)
                          ? 'Currently Unavailable'
                          : 'Book Now'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md max-w-[95vw]">
                      <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl md:text-2xl">Book {car.make} {car.model}</DialogTitle>
                        <DialogDescription className="text-sm">
                          Select your rental dates
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <DatePickerSingle
                            label="Start Date"
                            date={bookingData.startDate ? new Date(bookingData.startDate) : undefined}
                            onDateChange={handleStartDateChange}
                            disabledDates={bookedDates}
                            minDate={new Date()}
                            placeholder="Select start date"
                            className="w-full"
                          />
                        </div>
                        <div className="flex items-center space-x-2 py-2">
                          <Checkbox
                            id="more-than-one-day-mobile"
                            checked={isMoreThanOneDay}
                            onCheckedChange={handleMoreThanOneDayChange}
                          />
                          <label
                            htmlFor="more-than-one-day-mobile"
                            className="text-sm font-medium text-[#1A1A2E] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            More than one day
                          </label>
                        </div>
                        {isMoreThanOneDay && (
                          <div>
                        <DatePickerSingle
                          label="End Date"
                          date={bookingData.endDate ? new Date(bookingData.endDate) : undefined}
                          onDateChange={handleEndDateChange}
                          disabledDates={bookedDates}
                          minDate={bookingData.startDate ? new Date(bookingData.startDate) : new Date()}
                          placeholder="Select end date"
                          className="w-full"
                          highlightedDates={
                            bookingData.startDate ? [new Date(bookingData.startDate)] : []
                          }
                          lockedDates={
                            bookingData.startDate ? [new Date(bookingData.startDate)] : []
                          }
                        />
                          </div>
                        )}
                        {bookedDates.length > 0 && (
                          <p className="text-xs text-[#6C6C80]">
                            Booked dates are shown in red and cannot be selected
                          </p>
                        )}
                        {totalDays > 0 && (
                          <div className="rounded-lg sm:rounded-xl bg-[#E6FFF9] p-3 sm:p-4 border-2 border-[#00D09C]">
                            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-2 sm:mb-3">
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-[#6C6C80] truncate">Subtotal ({totalDays} days):</span>
                                <span className="font-semibold text-[#1A1A2E] shrink-0">₹{subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-[#6C6C80] truncate">Service Fee (10%):</span>
                                <span className="font-semibold text-[#1A1A2E] shrink-0">₹{serviceFee.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-[#6C6C80] truncate">Insurance:</span>
                                <span className="font-semibold text-[#1A1A2E] shrink-0">₹{insuranceFee.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between items-center gap-2">
                                <span className="text-[#6C6C80] truncate">GST (18%):</span>
                                <span className="font-semibold text-[#1A1A2E] shrink-0">₹{gst.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="flex justify-between text-base sm:text-lg font-bold text-[#1A1A2E] pt-2 sm:pt-3 border-t border-[#00D09C]">
                              <span>Total:</span>
                              <span>₹{totalPrice.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleBooking}
                          className="w-full bg-[#00D09C] hover:bg-[#00B386] text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base py-3 sm:py-4 md:py-5"
                          disabled={!bookingData.startDate || (isMoreThanOneDay && !bookingData.endDate)}
                        >
                          Confirm Booking
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Separator className="my-4 sm:my-6" />

                  {host && (
                  <div>
                    <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-[#1A1A2E]">Host</h3>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#00D09C] flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg shrink-0">
                        {hostName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm sm:text-base font-semibold text-[#1A1A2E] break-words">{hostName}</p>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#6C6C80]">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                          <span>Verified Host</span>
                        </div>
                      </div>
                    </div>
                    {host.phone && (
                      <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#6C6C80] min-w-0">
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                        <span className="truncate">{host.phone}</span>
                      </div>
                    )}
                    <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#6C6C80] min-w-0">
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate break-all">{host.email}</span>
                    </div>
                  </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Car Details */}
            <Card className="mb-6 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#1A1A2E] line-clamp-2 break-words">
                          {car.make} {car.model} {car.year}
                        </CardTitle>
                        <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-[#6C6C80] shrink-0" />
                          <span className="text-sm sm:text-base text-[#6C6C80] truncate">
                            {car?.locationCity || car?.locationAddress || car?.location || 'Location not specified'}
                          </span>
                        </div>
                      </div>
                      {session && (
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={handleToggleFavorite}
                          disabled={favoriteLoading}
                          className={`h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full border-2 shrink-0 ${
                            isFavorite
                              ? 'border-[#FF4444] bg-[#FFE5E5] text-[#FF4444] hover:bg-[#FFE5E5]'
                              : 'border-[#E5E5EA] hover:border-[#00D09C] hover:bg-[#E6FFF9]'
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${
                              isFavorite ? 'fill-[#FF4444] text-[#FF4444]' : 'text-[#6C6C80]'
                            }`}
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-[#E6FFF9] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl">
                    <Star className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 fill-yellow-400 text-yellow-400 shrink-0" />
                    <span className="text-base sm:text-lg md:text-xl font-bold text-[#1A1A2E]">
                      {car.rating > 0 ? car.rating.toFixed(1) : 'New'}
                    </span>
                    {(car?.totalTrips || car?.totalReviews || 0) > 0 && (
                      <span className="text-xs sm:text-sm text-[#6C6C80]">
                        ({(car?.totalTrips || car?.totalReviews || 0)} trips)
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-4 bg-[#E6FFF9] p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl">
                  <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white rounded-md sm:rounded-lg flex items-center justify-center shrink-0">
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#00D09C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-[#6C6C80]">Seats</p>
                      <p className="text-sm sm:text-base font-bold text-[#1A1A2E] truncate">{car?.seatingCapacity || car?.seats || 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white rounded-md sm:rounded-lg flex items-center justify-center shrink-0">
                      <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#00D09C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-[#6C6C80]">Transmission</p>
                      <p className="text-sm sm:text-base font-bold text-[#1A1A2E] capitalize truncate">{car.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white rounded-md sm:rounded-lg flex items-center justify-center shrink-0">
                      <Fuel className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#00D09C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-[#6C6C80]">Fuel</p>
                      <p className="text-sm sm:text-base font-bold text-[#1A1A2E] capitalize truncate">{car.fuelType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-white rounded-md sm:rounded-lg flex items-center justify-center shrink-0">
                      <Car className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-[#00D09C]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-[#6C6C80]">Year</p>
                      <p className="text-sm sm:text-base font-bold text-[#1A1A2E] truncate">{car.year}</p>
                    </div>
                  </div>
                </div>
                <Separator className="my-4 sm:my-6" />
                <div>
                  <h3 className="mb-2 sm:mb-3 text-base sm:text-lg font-semibold text-[#1A1A2E]">Description</h3>
                  <p className="text-sm sm:text-base text-[#6C6C80] leading-relaxed break-words">{car.description}</p>
                </div>
                {car.features.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-[#1A1A2E]">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {car.features.map((feature, i) => (
                          <Badge key={i} variant="outline" className="px-3 py-1 text-sm border-[#00D09C] text-[#00D09C] max-w-full">
                            <span className="truncate block">{feature}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-bold">Car Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="overflow-x-auto -mx-6 px-6 mb-6 scrollbar-hide">
                    <TabsList className="inline-flex w-auto gap-2 min-w-full sm:min-w-0">
                      <TabsTrigger value="location" className="min-w-[120px] whitespace-nowrap shrink-0">Location</TabsTrigger>
                      <TabsTrigger value="reviews" className="min-w-[120px] whitespace-nowrap shrink-0">Reviews ({reviews.length})</TabsTrigger>
                      <TabsTrigger value="features" className="min-w-[120px] whitespace-nowrap shrink-0">Features</TabsTrigger>
                      <TabsTrigger value="benefits" className="min-w-[120px] whitespace-nowrap shrink-0">Benefits</TabsTrigger>
                      <TabsTrigger value="faqs" className="min-w-[120px] whitespace-nowrap shrink-0">FAQs</TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value="location" className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                        Car Location
                      </h3>
                      <p className="text-sm sm:text-base text-[#2D2D44] mb-1.5 sm:mb-2 break-words">{car?.locationCity || car?.locationAddress || car?.location || 'Location not specified'}</p>
                      <p className="text-xs sm:text-sm text-[#6C6C80] break-words">
                        The exact pickup location will be shared after booking confirmation.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-[#1A1A2E]">Host Information</h3>
                      {host && (
                        <>
                          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#00D09C] flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg shrink-0">
                              {hostName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm sm:text-base font-semibold text-[#1A1A2E] break-words">Hosted by {hostName}</p>
                              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#6C6C80] mt-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                                <span>Verified Host</span>
                              </div>
                            </div>
                          </div>
                          {host && host.phone && (
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#6C6C80] mb-1.5 sm:mb-2 min-w-0">
                              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                              <span className="truncate">{host.phone}</span>
                            </div>
                          )}
                          {host && (
                            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#6C6C80] min-w-0">
                              <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                              <span className="truncate break-all">{host.email}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-4 sm:space-y-6">
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold">{car.rating > 0 ? car.rating.toFixed(1) : 'New'}</div>
                        <div>
                          <div className="flex items-center gap-0.5 sm:gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 ${
                                  i < Math.floor(car.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs sm:text-sm text-[#6C6C80]">Based on {(car?.totalTrips || car?.totalReviews || 0)} {(car?.totalTrips || car?.totalReviews || 0) === 1 ? 'trip' : 'trips'}</p>
                        </div>
                      </div>
                      {session && (
                        <Button
                          onClick={() => setReviewOpen(true)}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]"
                        >
                          Write a Review
                        </Button>
                      )}
                    </div>
                    <Separator />
                    {reviews.length > 0 ? (
                      <div className="space-y-4 sm:space-y-6">
                        {reviews.map((review: Review) => (
                          <div key={review._id} className="border-b border-[#E5E5EA] pb-4 sm:pb-6 last:border-0">
                            <div className="mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
                              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#00D09C] flex items-center justify-center text-white font-semibold text-sm sm:text-base shrink-0">
                                {review.reviewerId?.firstName?.charAt(0)?.toUpperCase() || 
                                 review.reviewerId?.email?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                  <span className="text-sm sm:text-base font-semibold text-[#1A1A2E] truncate">
                                    {review.reviewerId?.firstName && review.reviewerId?.lastName
                                      ? `${review.reviewerId.firstName} ${review.reviewerId.lastName}`
                                      : review.reviewerId?.email || 'User'}
                                  </span>
                                  <span className="text-xs text-[#6C6C80] shrink-0">
                                    {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5 sm:gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                        i < review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm sm:text-base text-[#2D2D44] leading-relaxed break-words">{review.reviewText || review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-[#6C6C80]">No reviews yet. Be the first to review!</p>
                      </div>
                    )}
                  {session && (
                      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Write a Review</DialogTitle>
                          </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-medium mb-2 block">Rating</Label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() =>
                                  setReviewData({ ...reviewData, rating })
                                }
                                className="hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`h-8 w-8 ${
                                    rating <= reviewData.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="text-base font-medium mb-2 block">Comment</Label>
                          <Textarea
                            value={reviewData.comment}
                            onChange={(e) =>
                              setReviewData({ ...reviewData, comment: e.target.value })
                            }
                            placeholder="Share your experience..."
                            rows={5}
                            className="text-base"
                          />
                        </div>
                        <Button 
                          onClick={handleReview}
                          className="w-full bg-[#00D09C] hover:bg-[#00B386] text-white rounded-xl font-semibold py-6"
                        >
                          Submit Review
                        </Button>
                      </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    </TabsContent>

                  <TabsContent value="features" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Car Features</h3>
                      {car.features.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {car.features.map((feature, i) => (
                            <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">No additional features listed.</p>
                      )}
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Car Specifications</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Seats</p>
                          <p className="font-semibold">{car.seats}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Transmission</p>
                          <p className="font-semibold capitalize">{car.transmission}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Fuel Type</p>
                          <p className="font-semibold capitalize">{car.fuelType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Car Type</p>
                          <p className="font-semibold">{car.type}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="benefits" className="space-y-4">
                    <div className="bg-[#E6FFF9] p-6 rounded-xl mb-4 border border-[#00D09C]">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="h-6 w-6 text-[#00D09C]" />
                        <h3 className="text-lg font-semibold text-[#1A1A2E]">Trip Protection</h3>
                      </div>
                      <p className="text-[#2D2D44] mb-4">
                        Your trip is secured against accidental damage. Travel with confidence knowing you&apos;re protected.
                      </p>
                      <Button variant="outline" size="sm" className="border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]">Learn More</Button>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Benefits of Renting This Car</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Comprehensive Insurance</p>
                            <p className="text-sm text-gray-600">Full coverage for peace of mind</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">24/7 Support</p>
                            <p className="text-sm text-gray-600">Round-the-clock assistance</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Flexible Cancellation</p>
                            <p className="text-sm text-gray-600">Cancel with reasonable notice</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Verified Host</p>
                            <p className="text-sm text-gray-600">Trusted and verified car owner</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Security Deposit</h3>
                      <p className="text-gray-700 mb-2">
                        A refundable security deposit may be required. The amount will be clearly displayed during booking.
                      </p>
                      <p className="text-sm text-gray-600">
                        The deposit is fully refundable upon return of the car in the same condition.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Cancellation Policy</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700">
                          <strong>50% Refund:</strong> If cancelled 24 hours before pickup
                        </p>
                        <p className="text-gray-700">
                          <strong>0% Refund:</strong> If cancelled less than 24 hours before pickup
                        </p>
                        <p className="text-gray-600 mt-2">
                          Convenience fee is non-refundable in all cases.
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Inclusions/Exclusions</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            Not Included
                          </h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-6">
                            <li>Fuel - Guest should return the car with the same fuel level</li>
                            <li>Toll/Fastag charges - Check with host for Fastag recharge</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Included
                          </h4>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-6">
                            <li>Basic insurance coverage</li>
                            <li>24/7 roadside assistance</li>
                            <li>Standard maintenance</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="faqs" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
                      <div className="space-y-4">
                        <div className="border-b pb-4">
                          <h4 className="font-medium mb-2">Who pays for the Fuel and FASTag?</h4>
                          <p className="text-sm text-gray-600">
                            Fuel is not included. You should return the car with the same fuel level as at the start. 
                            Toll/Fastag charges are also not included. Please check with the host for Fastag recharge details.
                          </p>
                        </div>
                        <div className="border-b pb-4">
                          <h4 className="font-medium mb-2">Can I modify or extend my trip after booking creation?</h4>
                          <p className="text-sm text-gray-600">
                            Yes, you can modify or extend your trip by contacting the host directly or through our support team. 
                            Additional charges may apply for extensions.
                          </p>
                        </div>
                        <div className="border-b pb-4">
                          <h4 className="font-medium mb-2">How do I cancel my booking?</h4>
                          <p className="text-sm text-gray-600">
                            You can cancel your booking through your account dashboard. Refund policies apply based on 
                            cancellation timing. Please refer to the cancellation policy for details.
                          </p>
                        </div>
                        <div className="border-b pb-4">
                          <h4 className="font-medium mb-2">What is refundable security deposit and why do I pay it?</h4>
                          <p className="text-sm text-gray-600">
                            The security deposit is a refundable amount held to cover any potential damages or violations. 
                            It is fully refunded upon return of the car in the same condition.
                          </p>
                        </div>
                        <div className="border-b pb-4">
                          <h4 className="font-medium mb-2">What is the policy around Limited Kms in Subscription?</h4>
                          <p className="text-sm text-gray-600">
                            This car includes unlimited kilometers for your rental period. No additional charges for distance traveled.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Policies and Agreement</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        By booking this car, you agree to the terms and conditions of the Lease Agreement with the Host.
                      </p>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        View Agreement Details
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block">
            <Card className="sticky top-20 sm:top-24 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-baseline gap-1.5 sm:gap-2">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1A2E]">₹{dailyPrice}</span>
                  <span className="text-[#6C6C80] text-sm sm:text-base md:text-lg">/day</span>
                </div>
                {(car?.status !== 'active' && car?.status !== undefined) && (
                  <Badge className="mt-2 bg-[#FF4444] text-white w-fit">
                    Currently Unavailable
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full bg-[#00D09C] hover:bg-[#00B386] text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg py-3 sm:py-4 md:py-5 hover:shadow-lg transition-all duration-300"
                      disabled={session?.user.id === host?._id || (car?.status !== 'active' && car?.status !== undefined)}
                    >
                      {session?.user.id === host?._id
                        ? 'Your Car'
                        : (car?.status !== 'active' && car?.status !== undefined)
                        ? 'Currently Unavailable'
                        : 'Book Now'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md max-w-[95vw]">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl md:text-2xl">Book {car.make} {car.model}</DialogTitle>
                      <DialogDescription className="text-sm">
                        Select your rental dates
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <DatePickerSingle
                          label="Start Date"
                          date={bookingData.startDate ? new Date(bookingData.startDate) : undefined}
                          onDateChange={handleStartDateChange}
                          disabledDates={bookedDates}
                          minDate={new Date()}
                          placeholder="Select start date"
                          className="w-full"
                        />
                      </div>
                        <div className="flex items-center space-x-2 py-2">
                          <Checkbox
                            id="more-than-one-day-desktop"
                            checked={isMoreThanOneDay}
                            onCheckedChange={handleMoreThanOneDayChange}
                          />
                          <label
                            htmlFor="more-than-one-day-desktop"
                            className="text-sm font-medium text-[#1A1A2E] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            More than one day
                          </label>
                        </div>
                      {isMoreThanOneDay && (
                        <div>
                          <DatePickerSingle
                            label="End Date"
                            date={bookingData.endDate ? new Date(bookingData.endDate) : undefined}
                            onDateChange={handleEndDateChange}
                            disabledDates={bookedDates}
                            minDate={bookingData.startDate ? new Date(bookingData.startDate) : new Date()}
                            placeholder="Select end date"
                            className="w-full"
                            highlightedDates={
                              bookingData.startDate ? [new Date(bookingData.startDate)] : []
                            }
                            lockedDates={
                              bookingData.startDate ? [new Date(bookingData.startDate)] : []
                            }
                          />
                        </div>
                      )}
                      {bookedDates.length > 0 && (
                        <p className="text-xs text-[#6C6C80]">
                          Booked dates are shown in red and cannot be selected
                        </p>
                      )}
                      {totalDays > 0 && (
                        <div className="rounded-lg sm:rounded-xl bg-[#E6FFF9] p-3 sm:p-4 border-2 border-[#00D09C]">
                          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm mb-2 sm:mb-3">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[#6C6C80] truncate">Subtotal ({totalDays} days):</span>
                              <span className="font-semibold text-[#1A1A2E] shrink-0">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[#6C6C80] truncate">Service Fee (10%):</span>
                              <span className="font-semibold text-[#1A1A2E] shrink-0">₹{serviceFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[#6C6C80] truncate">Insurance:</span>
                              <span className="font-semibold text-[#1A1A2E] shrink-0">₹{insuranceFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[#6C6C80] truncate">GST (18%):</span>
                              <span className="font-semibold text-[#1A1A2E] shrink-0">₹{gst.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between text-base sm:text-lg font-bold text-[#1A1A2E] pt-2 sm:pt-3 border-t border-[#00D09C]">
                            <span>Total:</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleBooking}
                        className="w-full bg-[#00D09C] hover:bg-[#00B386] text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base py-3 sm:py-4 md:py-5"
                        disabled={!bookingData.startDate || (isMoreThanOneDay && !bookingData.endDate)}
                      >
                        Confirm Booking
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Separator className="my-6" />

                {host && (
                <div>
                  <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-[#1A1A2E]">Host</h3>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#00D09C] flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg shrink-0">
                      {hostName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-semibold text-[#1A1A2E] break-words">{hostName}</p>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#6C6C80]">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                        <span>Verified Host</span>
                      </div>
                    </div>
                  </div>
                  {host.phone && (
                    <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#6C6C80] min-w-0">
                      <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span className="truncate">{host.phone}</span>
                    </div>
                  )}
                  <div className="mt-1.5 sm:mt-2 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#6C6C80] min-w-0">
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate break-all">{host.email}</span>
                  </div>
                </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Listings */}
        {similarCars.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Listings</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similarCars.map((similarCar) => {
                  // Transform store Car type to CarCard expected format
                  const carImages: string[] = Array.isArray(similarCar.images) 
                    ? (typeof similarCar.images[0] === 'string' 
                        ? similarCar.images as string[]
                        : (similarCar.images as Array<{ url: string }>).map(img => img.url))
                    : [];
                  const location = similarCar.locationCity || similarCar.locationAddress || similarCar.location || '';
                  const carCardCar = {
                    _id: similarCar._id,
                    make: similarCar.make,
                    model: similarCar.model,
                    year: similarCar.year,
                    images: carImages,
                    pricePerDay: similarCar.dailyPrice || similarCar.pricePerDay || 0,
                    location: location,
                    seats: similarCar.seatingCapacity || similarCar.seats || 0,
                    totalReviews: similarCar.totalTrips || similarCar.totalReviews || 0,
                    transmission: similarCar.transmission,
                    fuelType: similarCar.fuelType,
                    rating: similarCar.rating,
                    available: similarCar.available ?? (similarCar.status === 'active'),
                  };
                  return <CarCard key={similarCar._id} car={carCardCar} />;
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



