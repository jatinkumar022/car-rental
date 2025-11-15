'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle,
  Calendar,
  MapPin,
  Car,
  IndianRupee,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/Loader';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Booking {
  _id: string;
  carId?: {
    _id: string;
    make: string;
    model: string;
    year: number;
    images: Array<{ url: string }> | string[];
    locationCity?: string;
    locationAddress?: string;
  };
  car?: {
    _id: string;
    make: string;
    model: string;
    year: number;
    images: Array<{ url: string }> | string[];
    locationCity?: string;
    locationAddress?: string;
    location?: string;
    dailyPrice?: number;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  dailyRate: number;
  subtotal: number;
  serviceFee: number;
  insuranceFee: number;
  gst: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBookingDetails = useCallback(async () => {
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
  }, [params.id, router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.id && params.id) {
      fetchBookingDetails();
    }
  }, [status, router, session?.user?.id, params.id, fetchBookingDetails]);

  const handleShare = async () => {
    if (navigator.share && booking) {
      try {
        await navigator.share({
          title: 'My Car Booking Confirmation',
          text: `I&apos;ve booked ${booking.carId?.make || booking.car?.make} ${booking.carId?.model || booking.car?.model} from ${format(new Date(booking.startDate), 'MMM dd')} to ${format(new Date(booking.endDate), 'MMM dd')}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Booking link copied to clipboard!');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F7F7FA] flex items-center justify-center">
        <Loader size="lg" text="Loading booking confirmation..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F7F7FA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6C6C80] mb-4">Booking not found</p>
          <Button asChild className="bg-[#00D09C] hover:bg-[#00B386] text-white">
            <Link href="/my-bookings">Back to Bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  const car = booking.carId || booking.car;
  const carImages = car?.images
    ? (typeof car.images[0] === 'string'
        ? car.images as string[]
        : (car.images as Array<{ url: string }>).map(img => img.url))
    : ['/placeholder.svg'];

  const totalAmount = booking.totalAmount || 0;

  return (
    <div className="min-h-screen bg-[#F7F7FA] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-[#E6FFF9] rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-[#00D09C]" />
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A2E] mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-[#6C6C80] mb-4">
            Your booking has been successfully confirmed
          </p>
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-[#00D09C] text-white">
              {booking.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
            </Badge>
            <Badge variant="outline" className="border-[#00D09C] text-[#00B386]">
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Booking Summary Card */}
        <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)] mb-6">
          <CardHeader>
            <CardTitle className="text-[#1A1A2E]">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6 mb-6">
              {car && typeof car === 'object' && 'make' in car && (
                <>
                  <div className="relative h-48 w-full sm:w-64 rounded-lg overflow-hidden">
                    <Image
                      src={carImages[0] || '/placeholder.svg'}
                      alt={`${car.make || ''} ${car.model || ''}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 256px"
                    />
                  </div>
                  <div className="flex-1">
                    <Link href={`/cars/${car._id || ''}`}>
                      <h2 className="text-2xl font-bold text-[#1A1A2E] hover:text-[#00D09C] transition mb-2">
                        {car.make} {car.model} {car.year}
                      </h2>
                    </Link>
                    <div className="space-y-2 text-sm text-[#6C6C80]">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{car.locationCity || car.locationAddress || car.location || 'Location not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        <span className="font-semibold text-[#1A1A2E]">₹{booking.dailyRate || car.dailyPrice || 0} per day</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#E5E5EA]">
              <div>
                <p className="text-sm text-[#6C6C80] mb-1">Pickup Date</p>
                <p className="text-lg font-semibold text-[#1A1A2E]">
                  {format(new Date(booking.startDate), 'EEEE, MMMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#6C6C80] mb-1">Return Date</p>
                <p className="text-lg font-semibold text-[#1A1A2E]">
                  {format(new Date(booking.endDate), 'EEEE, MMMM dd, yyyy')}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-[#6C6C80] mb-1">Total Duration</p>
                <p className="text-lg font-semibold text-[#1A1A2E]">
                  {booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#E5E5EA]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#6C6C80]">Subtotal</span>
                <span className="font-semibold text-[#1A1A2E]">₹{booking.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              {booking.serviceFee > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6C6C80]">Service Fee</span>
                  <span className="font-semibold text-[#1A1A2E]">₹{booking.serviceFee.toFixed(2)}</span>
                </div>
              )}
              {booking.insuranceFee > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6C6C80]">Insurance</span>
                  <span className="font-semibold text-[#1A1A2E]">₹{booking.insuranceFee.toFixed(2)}</span>
                </div>
              )}
              {booking.gst > 0 && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#6C6C80]">GST (18%)</span>
                  <span className="font-semibold text-[#1A1A2E]">₹{booking.gst.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-[#E5E5EA]">
                <span className="text-lg font-bold text-[#1A1A2E]">Total Amount</span>
                <span className="text-2xl font-bold text-[#00D09C]">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking ID Card */}
        <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)] mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6C6C80] mb-1">Booking ID</p>
                <p className="text-lg font-mono font-semibold text-[#1A1A2E]">{booking._id}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            asChild
            className="flex-1 bg-[#00D09C] hover:bg-[#00B386] text-white rounded-xl font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link href={`/bookings/${booking._id}`}>
              View Booking Details
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9] rounded-xl font-semibold py-6"
          >
            <Link href="/my-bookings">
              My Bookings
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 border-[#E5E5EA] text-[#6C6C80] hover:bg-[#F7F7FA] rounded-xl font-semibold py-6"
          >
            <Link href="/cars">
              Browse More Cars
            </Link>
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)] mt-6">
          <CardHeader>
            <CardTitle className="text-[#1A1A2E]">What&apos;s Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-[#E6FFF9] rounded-lg">
                  <Calendar className="h-5 w-5 text-[#00D09C]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A2E] mb-1">Mark Your Calendar</h3>
                  <p className="text-sm text-[#6C6C80]">
                    Make sure you&apos;re available on {format(new Date(booking.startDate), 'MMMM dd, yyyy')} for pickup.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-[#E6FFF9] rounded-lg">
                  <Car className="h-5 w-5 text-[#00D09C]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A2E] mb-1">Prepare for Pickup</h3>
                  <p className="text-sm text-[#6C6C80]">
                    You&apos;ll receive detailed pickup instructions and contact information via email.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-[#E6FFF9] rounded-lg">
                  <CheckCircle className="h-5 w-5 text-[#00D09C]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A2E] mb-1">Stay Updated</h3>
                  <p className="text-sm text-[#6C6C80]">
                    Check your booking status and communicate with the host through the booking details page.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

