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
  car: {
    _id: string;
    make: string;
    model: string;
    year: number;
    images: string[];
    pricePerDay: number;
    location: string;
    type: string;
    transmission: string;
    fuelType: string;
    seats: number;
  };
  renter?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
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
  totalDays: number;
  totalPrice: number;
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const isOwner = booking.owner && getId(booking.owner) === session?.user?.id;
  const isRenter = booking.renter && getId(booking.renter) === session?.user?.id;
  const isUpcoming = new Date(booking.startDate) > new Date() && booking.status !== 'cancelled';
  const isPast = new Date(booking.endDate) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/my-bookings">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600 mt-2">Booking ID: {booking._id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Car Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-6">
                  {booking.car && typeof booking.car === 'object' && 'make' in booking.car ? (
                    <>
                      <div className="relative h-48 w-full sm:w-64 rounded-lg overflow-hidden">
                        <Image
                          src={booking.car.images?.[0] || '/placeholder.svg'}
                          alt={`${booking.car.make || ''} ${booking.car.model || ''}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 256px"
                        />
                      </div>
                      <div className="flex-1">
                        <Link href={`/cars/${getCarId() || ''}`}>
                          <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition mb-2">
                            {booking.car.make} {booking.car.model} {booking.car.year}
                          </h2>
                        </Link>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.car.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            <span className="capitalize">{booking.car.type}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{booking.car.transmission}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{booking.car.fuelType}</span>
                            <span className="mx-2">•</span>
                            <span>{booking.car.seats} Seats</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-600">Car information loading...</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Dates */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Booking Dates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(booking.startDate), 'EEEE, MMMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(booking.startDate), 'hh:mm a')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">End Date</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {format(new Date(booking.endDate), 'EEEE, MMMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(booking.endDate), 'hh:mm a')}
                    </p>
                  </div>
                  <div className="sm:col-span-2 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Total Duration</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isOwner && booking.renter && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Renter</p>
                      <p className="text-lg font-semibold text-gray-900">{booking.renter.name}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{booking.renter.email}</span>
                      </div>
                      {booking.renter.phone && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{booking.renter.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {isRenter && booking.owner && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Car Owner</p>
                      <p className="text-lg font-semibold text-gray-900">{booking.owner.name}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{booking.owner.email}</span>
                      </div>
                      {booking.owner.phone && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{booking.owner.phone}</span>
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
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Booking Status</p>
                  <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1 w-fit`}>
                    {getStatusIcon(booking.status)}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600 mb-2">Payment Status</p>
                  <Badge
                    variant="outline"
                    className={
                      booking.paymentStatus === 'paid'
                        ? 'border-green-500 text-green-700 w-fit'
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
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price per day</span>
                  <span className="font-semibold">₹{booking.car?.pricePerDay || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total days</span>
                  <span className="font-semibold">{booking.totalDays}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{booking.totalPrice}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isOwner && booking.status === 'pending' && (
                  <>
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleStatusChange('confirmed')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Booking
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleStatusChange('cancelled')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline Booking
                    </Button>
                  </>
                )}
                {isRenter && booking.status === 'pending' && booking.paymentStatus === 'pending' && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handlePayment}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </Button>
                )}
                {isRenter && booking.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusChange('cancelled')}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </Button>
                )}
                <Link href={`/cars/${getCarId() || ''}`} className="block">
                  <Button variant="outline" className="w-full">
                    <Car className="mr-2 h-4 w-4" />
                    View Car Details
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Booking Info */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Booking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Booking Created</p>
                  <p className="font-semibold">
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

