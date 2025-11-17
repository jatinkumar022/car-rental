'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Calendar,
  IndianRupee,
  User,
  Car,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  ArrowLeft,
  FileText,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Loader from '@/components/Loader';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useBookingStore } from '@/stores/useBookingStore';

interface Booking {
  _id: string;
  carId?: {
    _id: string;
    make: string;
    model: string;
    year: number;
    images: Array<{ url: string }> | string[];
    dailyPrice: number;
    locationCity?: string;
    locationAddress?: string;
    location?: string;
    transmission: string;
    fuelType: string;
    seatingCapacity?: number;
    seats?: number;
  };
  car?: {
    _id: string;
    make: string;
    model: string;
    year: number;
    images: Array<{ url: string }> | string[];
    dailyPrice: number;
    locationCity?: string;
    locationAddress?: string;
    location?: string;
    transmission: string;
    fuelType: string;
    seatingCapacity?: number;
    seats?: number;
  };
  renterId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
    phone?: string;
  };
  renter?: {
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
  };
  hostId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
    phone?: string;
  };
  owner?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
  };
  startDate: string;
  endDate: string;
  pickupTime?: string;
  returnTime?: string;
  totalDays: number;
  totalAmount: number;
  totalPrice?: number; // Fallback
  dailyRate: number;
  subtotal: number;
  serviceFee: number;
  insuranceFee: number;
  gst: number;
  discount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const { updateBookingStatus, processPayment } = useBookingStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.id && params.id) {
      fetchBookingDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, session?.user?.id, params.id]);

  const fetchBookingDetails = async () => {
    try {
      const res = await fetch(`/api/bookings/${params.id}`);
      const data = await res.json();
      if (res.ok && data.booking) {
        setBooking(data.booking);
      } else {
        toast.error(data.error || 'Failed to fetch booking details');
        setTimeout(() => router.push('/my-bookings'), 2000);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Error fetching booking details');
      setTimeout(() => router.push('/my-bookings'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-[#E6FFF9] text-[#00B386] border-[#00D09C]';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-[#FFE5E5] text-[#FF4444] border-[#FF4444]';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ongoing':
        return 'bg-[#E6F3FF] text-[#2196F3] border-[#2196F3]';
      default:
        return 'bg-[#F7F7FA] text-[#6C6C80] border-[#E5E5EA]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!booking) return;
    const success = await updateBookingStatus(booking._id, newStatus);
    if (success) {
      await fetchBookingDetails();
    }
  };

  const handlePayment = async () => {
    if (!booking) return;
    const success = await processPayment(booking._id);
    if (success) {
      await fetchBookingDetails();
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader size="lg" text="Loading booking details..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Booking not found</p>
          <Link href="/my-bookings">
            <Button>Back to Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Helper to get ID from object or string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getId = (obj: any): string | null => {
    if (!obj) return null;
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object' && '_id' in obj) return obj._id.toString();
    return null;
  };

  const getCarId = (): string | null => {
    if (!booking.car) return null;
    return getId(booking.car);
  };

  const car = booking.carId || booking.car;
  const renter = booking.renterId || booking.renter;
  const host = booking.hostId || booking.owner;
  const totalAmount = booking.totalAmount || booking.totalPrice || 0;
  
  // Handle images
  const carImages = car?.images 
    ? (typeof car.images[0] === 'string' 
        ? car.images as string[]
        : (car.images as Array<{ url: string }>).map(img => img.url))
    : ['/placeholder.svg'];

  // Type guard to check if object has firstName property (renterId/hostId type)
  const isRenterIdType = (obj: typeof renter): obj is { firstName?: string; lastName?: string; email: string; _id: string; phone?: string } => {
    return obj !== null && obj !== undefined && 'firstName' in obj;
  };

  const isHostIdType = (obj: typeof host): obj is { firstName?: string; lastName?: string; email: string; _id: string; phone?: string } => {
    return obj !== null && obj !== undefined && 'firstName' in obj;
  };

  const getRenterName = (r: typeof renter): string => {
    if (!r) return 'Unknown';
    if (isRenterIdType(r)) {
      if (r.firstName && r.lastName) return `${r.firstName} ${r.lastName}`;
      return r.email;
    }
    // TypeScript now knows it's the 'renter' type
    const renterType = r as { name?: string; email: string };
    if (renterType.name) return renterType.name;
    return renterType.email;
  };

  const getHostName = (h: typeof host): string => {
    if (!h) return 'Unknown';
    if (isHostIdType(h)) {
      if (h.firstName && h.lastName) return `${h.firstName} ${h.lastName}`;
      return h.email;
    }
    // TypeScript now knows it's the 'owner' type
    const ownerType = h as { name?: string; email: string };
    if (ownerType.name) return ownerType.name;
    return ownerType.email;
  };

  const renterName = getRenterName(renter);
  const hostName = getHostName(host);

  const isOwner = host && getId(host) === session?.user?.id;
  const isRenter = renter && getId(renter) === session?.user?.id;
  const isUpcoming = new Date(booking.startDate) > new Date() && booking.status !== 'cancelled';
  const isPast = new Date(booking.endDate) < new Date();

  return (
    <div className="min-h-screen bg-[#F7F7FA] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/my-bookings">
            <Button variant="ghost" className="mb-4 text-[#6C6C80] hover:text-[#00D09C]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-[#1A1A2E]">Booking Details</h1>
          <p className="text-[#6C6C80] mt-2">Booking ID: {booking._id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Information */}
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1A1A2E]">
                  <Car className="h-5 w-5" />
                  Car Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-6">
                  {car && typeof car === 'object' && 'make' in car ? (
                    <>
                      <div className="relative h-48 w-full sm:w-64 rounded-lg overflow-hidden bg-[#F7F7FA]">
                        <Image
                          src={carImages[0] || '/placeholder.svg'}
                          alt={`${car.make || ''} ${car.model || ''}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 100vw, 256px"
                        />
                      </div>
                      <div className="flex-1">
                        <Link href={`/cars/${car._id || getCarId() || ''}`}>
                          <h2 className="text-2xl font-bold text-[#1A1A2E] hover:text-[#00D09C] transition mb-2">
                            {car.make} {car.model} {car.year}
                          </h2>
                        </Link>
                        <div className="space-y-2 text-sm text-[#6C6C80]">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{car.locationCity || car.locationAddress || ('location' in car ? car.location : undefined) || 'Location not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <span className="capitalize">{car.transmission}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{car.fuelType}</span>
                            <span className="mx-2">•</span>
                            <span>{(car.seatingCapacity || ('seats' in car ? car.seats : undefined) || 0)} Seats</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-[#6C6C80]">Car information loading...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Dates */}
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1A1A2E]">
                  <Calendar className="h-5 w-5" />
                  Booking Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-[#6C6C80] mb-1">Start Date</p>
                    <p className="text-lg font-semibold text-[#1A1A2E]">
                      {format(new Date(booking.startDate), 'EEEE, MMMM dd, yyyy')}
                    </p>
                    {booking.pickupTime && (
                      <p className="text-sm text-[#6C6C80]">
                        Pickup: {booking.pickupTime}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-[#6C6C80] mb-1">End Date</p>
                    <p className="text-lg font-semibold text-[#1A1A2E]">
                      {format(new Date(booking.endDate), 'EEEE, MMMM dd, yyyy')}
                    </p>
                    {booking.returnTime && (
                      <p className="text-sm text-[#6C6C80]">
                        Return: {booking.returnTime}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2 pt-4 border-t border-[#E5E5EA]">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[#6C6C80]">Total Duration</p>
                      <p className="text-lg font-semibold text-[#1A1A2E]">
                        {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1A1A2E]">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isOwner && renter && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-[#6C6C80] mb-1">Renter</p>
                      <p className="text-lg font-semibold text-[#1A1A2E]">{renterName}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-[#6C6C80]">
                        <Mail className="h-4 w-4" />
                        <span>{isRenterIdType(renter) ? renter.email : (renter && 'email' in renter ? renter.email : 'N/A')}</span>
                      </div>
                      {(isRenterIdType(renter) ? renter.phone : (renter && 'phone' in renter ? renter.phone : undefined)) && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-[#6C6C80]">
                          <Phone className="h-4 w-4" />
                          <span>{isRenterIdType(renter) ? renter.phone : (renter && 'phone' in renter ? renter.phone : '')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {isRenter && host && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-[#6C6C80] mb-1">Host</p>
                      <p className="text-lg font-semibold text-[#1A1A2E]">{hostName}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-[#6C6C80]">
                        <Mail className="h-4 w-4" />
                        <span>{isHostIdType(host) ? host.email : (host && 'email' in host ? host.email : 'N/A')}</span>
                      </div>
                      {(isHostIdType(host) ? host.phone : (host && 'phone' in host ? host.phone : undefined)) && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-[#6C6C80]">
                          <Phone className="h-4 w-4" />
                          <span>{isHostIdType(host) ? host.phone : (host && 'phone' in host ? host.phone : '')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Payment */}
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1A1A2E]">
                  <FileText className="h-5 w-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-[#6C6C80] mb-2">Booking Status</p>
                  <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1 w-fit`}>
                    {getStatusIcon(booking.status)}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-[#6C6C80] mb-2">Payment Status</p>
                  <Badge
                    variant="outline"
                    className={
                      booking.paymentStatus === 'paid'
                        ? 'border-[#00D09C] text-[#00B386] bg-[#E6FFF9] w-fit'
                        : 'border-yellow-500 text-yellow-700 w-fit'
                    }
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                  </Badge>
                </div>
                {isUpcoming && (
                  <>
                    <Separator />
                    <Badge variant="outline" className="border-blue-500 text-blue-700 w-fit">
                      Upcoming
                    </Badge>
                  </>
                )}
                {isPast && booking.status === 'completed' && (
                  <>
                    <Separator />
                    <Badge variant="outline" className="border-gray-500 text-gray-700 w-fit">
                      Completed
                    </Badge>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1A1A2E]">
                  <IndianRupee className="h-5 w-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C6C80]">Daily rate</span>
                  <span className="font-semibold text-[#1A1A2E]">₹{booking.dailyRate || car?.dailyPrice || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C6C80]">Total days</span>
                  <span className="font-semibold text-[#1A1A2E]">{booking.totalDays}</span>
                </div>
                {booking.subtotal && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6C6C80]">Subtotal</span>
                      <span className="font-semibold text-[#1A1A2E]">₹{booking.subtotal.toFixed(2)}</span>
                    </div>
                    {booking.serviceFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6C6C80]">Service Fee</span>
                        <span className="font-semibold text-[#1A1A2E]">₹{booking.serviceFee.toFixed(2)}</span>
                      </div>
                    )}
                    {booking.insuranceFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6C6C80]">Insurance</span>
                        <span className="font-semibold text-[#1A1A2E]">₹{booking.insuranceFee.toFixed(2)}</span>
                      </div>
                    )}
                    {booking.gst > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6C6C80]">GST (18%)</span>
                        <span className="font-semibold text-[#1A1A2E]">₹{booking.gst.toFixed(2)}</span>
                      </div>
                    )}
                    {booking.discount > 0 && (
                      <div className="flex justify-between text-sm text-[#00D09C]">
                        <span>Discount</span>
                        <span className="font-semibold">-₹{booking.discount.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-[#1A1A2E]">Total Amount</span>
                  <span className="text-[#00D09C]">₹{totalAmount.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="text-[#1A1A2E]">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isOwner && booking.status === 'pending' && (
                  <>
                    <Button
                      className="w-full bg-[#00D09C] hover:bg-[#00B386] text-white"
                      onClick={() => handleStatusChange('confirmed')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Booking
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-[#FF4444] text-[#FF4444] hover:bg-[#FFE5E5]"
                      onClick={() => handleStatusChange('cancelled')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline Booking
                    </Button>
                  </>
                )}
                {isRenter && booking.status === 'pending' && booking.paymentStatus === 'pending' && (
                  <Button
                    className="w-full bg-[#00D09C] hover:bg-[#00B386] text-white"
                    onClick={handlePayment}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </Button>
                )}
                {isRenter && booking.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="w-full border-[#FF4444] text-[#FF4444] hover:bg-[#FFE5E5]"
                    onClick={() => handleStatusChange('cancelled')}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </Button>
                )}
                <Link href={`/cars/${getCarId() || ''}`} className="block">
                  <Button variant="outline" className="w-full border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]">
                    <Car className="mr-2 h-4 w-4" />
                    View Car Details
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Booking Info */}
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="text-[#1A1A2E]">Booking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-[#6C6C80]">Booking Created</p>
                  <p className="font-semibold text-[#1A1A2E]">
                    {format(new Date(booking.createdAt), 'MMM dd, yyyy hh:mm a')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

