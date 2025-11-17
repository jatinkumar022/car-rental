'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Car, ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PaymentModal } from '@/components/ui/payment-modal';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DatePickerSingle } from '@/components/ui/date-picker-single';
import { Checkbox } from '@/components/ui/checkbox';
import { TimePicker } from '@/components/ui/time-picker';

interface CheckoutCar {
  _id: string;
  make: string;
  model: string;
  year: number;
  images: Array<{ url: string }> | string[];
  dailyPrice?: number;
  pricePerDay?: number;
  locationCity?: string;
  locationAddress?: string;
  location?: string;
  transmission?: string;
  fuelType?: string;
  seatingCapacity?: number;
  seats?: number;
  hostId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  owner?: {
    _id: string;
    name?: string;
    email: string;
  };
}

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const [car, setCar] = useState<CheckoutCar | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const initialStartDate = searchParams.get('startDate') || '';
  const initialEndDate = searchParams.get('endDate') || '';
  const [bookingData, setBookingData] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
    pickupTime: '',
    returnTime: '',
  });
  const [isMoreThanOneDay, setIsMoreThanOneDay] = useState(
    Boolean(initialStartDate && initialEndDate && initialEndDate !== initialStartDate)
  );
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  const carId = searchParams.get('carId');

  const fetchCar = useCallback(async () => {
    try {
      const res = await fetch(`/api/cars/${carId}`);
      const data = await res.json();
      if (res.ok && data.car) {
        setCar(data.car);
      } else {
        toast.error(data.error || 'Failed to fetch car details');
        router.push('/cars');
      }
    } catch (error) {
      console.error('Error fetching car:', error);
      toast.error('Error fetching car details');
      router.push('/cars');
    } finally {
      setLoading(false);
    }
  }, [carId, router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && carId) {
      fetchCar();
    }
  }, [status, router, carId, fetchCar]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!carId) return;
      try {
        const res = await fetch(`/api/cars/${carId}/booked-dates`);
        const data = await res.json();
        if (res.ok && data.bookedDates) {
          setBookedDates(data.bookedDates);
        }
      } catch (error) {
        console.error('Error fetching booked dates:', error);
      }
    };
    fetchBookedDates();
  }, [carId]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F7F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00D09C] mx-auto mb-4"></div>
          <p className="text-[#6C6C80]">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-[#F7F7FA] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6C6C80] mb-4">Car not found</p>
          <Button asChild>
            <Link href="/cars">Browse Cars</Link>
          </Button>
        </div>
      </div>
    );
  }

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
    setBookingData((prev) => ({
      ...prev,
      endDate: date ? format(date, 'yyyy-MM-dd') : '',
    }));
  };

  const handleMoreThanOneDayChange = (checked: boolean) => {
    setIsMoreThanOneDay(checked);
    if (!checked) {
      setBookingData((prev) => ({
        ...prev,
        endDate: '',
      }));
    }
  };

  const startDate = bookingData.startDate ? new Date(bookingData.startDate) : null;
  const endDate = bookingData.endDate ? new Date(bookingData.endDate) : (startDate ? new Date(startDate) : null);
  const totalDays = startDate
    ? endDate && endDate.getTime() !== startDate.getTime()
      ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      : 1 // Single day booking
    : 0;

  const dailyPrice = car.dailyPrice || 0;
  const subtotal = dailyPrice * totalDays;
  const serviceFee = subtotal * 0.10;
  const insuranceFee = 150 * totalDays;
  const gst = (subtotal + serviceFee + insuranceFee) * 0.18;
  const totalAmount = subtotal + serviceFee + insuranceFee + gst;

  const carImages = Array.isArray(car.images) && car.images.length > 0
    ? (typeof car.images[0] === 'string'
        ? car.images as string[]
        : (car.images as Array<{ url: string }>).map(img => img.url))
    : ['/placeholder.svg'];

  const handleProceedToPayment = () => {
    if (!bookingData.startDate) {
      toast.error('Please select a start date');
      return;
    }
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      // Calculate pricing
      const dailyRate = car.dailyPrice || 0;
      const subtotal = dailyRate * totalDays;
      const serviceFee = subtotal * 0.10;
      const insuranceFee = 150 * totalDays;
      const gst = (subtotal + serviceFee + insuranceFee) * 0.18;
      const totalAmount = subtotal + serviceFee + insuranceFee + gst;

      // Create booking
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: car._id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate || bookingData.startDate, // Use startDate as endDate for single day bookings
          pickupTime: bookingData.pickupTime || '10:00',
          returnTime: bookingData.returnTime || '10:00',
          totalDays,
          dailyRate,
          subtotal,
          serviceFee,
          insuranceFee,
          gst,
          totalAmount,
        }),
      });

      const data = await res.json();
      if (res.ok && data.booking) {
        // Process payment
        const paymentRes = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: data.booking._id,
            paymentMethod: 'card',
          }),
        });

        if (paymentRes.ok) {
          toast.success('Booking confirmed!');
          router.push(`/bookings/confirmation/${data.booking._id}`);
        } else {
          toast.error('Payment failed');
        }
      } else {
        toast.error(data.error || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Error processing booking');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7FA] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/cars/${carId}`}>
            <Button variant="ghost" className="mb-4 text-[#6C6C80] hover:text-[#00D09C]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Car Details
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-[#1A1A2E]">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Car Summary */}
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="text-[#1A1A2E]">Car Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="relative h-32 w-48 rounded-lg overflow-hidden bg-[#F7F7FA]">
                    <Image
                      src={carImages[0] || '/placeholder.svg'}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-contain"
                      sizes="192px"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">
                      {car.make} {car.model} {car.year}
                    </h2>
                    <div className="space-y-1 text-sm text-[#6C6C80]">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{car.locationCity || car.locationAddress || 'Location not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span className="capitalize">{car.transmission}</span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{car.fuelType}</span>
                        <span className="mx-2">•</span>
                        <span>{car.seatingCapacity} Seats</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="text-[#1A1A2E]">Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="flex items-center gap-2 mt-2 sm:mt-7">
                    <Checkbox
                      id="checkout-more-than-one-day"
                      checked={isMoreThanOneDay}
                      onCheckedChange={(checked) => handleMoreThanOneDayChange(!!checked)}
                    />
                    <Label
                      htmlFor="checkout-more-than-one-day"
                      className="text-sm font-medium text-[#1A1A2E]"
                    >
                      More than one day
                    </Label>
                  </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TimePicker
                    label="Pickup Time (Optional)"
                    value={bookingData.pickupTime}
                    onChange={(value) => setBookingData({ ...bookingData, pickupTime: value })}
                    placeholder="Select pickup time"
                  />
                  <TimePicker
                    label="Return Time (Optional)"
                    value={bookingData.returnTime}
                    onChange={(value) => setBookingData({ ...bookingData, returnTime: value })}
                    placeholder="Select return time"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Pricing */}
          <div>
            <Card className="sticky top-24 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="text-[#1A1A2E]">Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C6C80]">Daily rate</span>
                  <span className="font-semibold text-[#1A1A2E]">₹{dailyPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C6C80]">Total days</span>
                  <span className="font-semibold text-[#1A1A2E]">{totalDays}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C6C80]">Subtotal</span>
                  <span className="font-semibold text-[#1A1A2E]">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C6C80]">Service Fee (10%)</span>
                  <span className="font-semibold text-[#1A1A2E]">₹{serviceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C6C80]">Insurance</span>
                  <span className="font-semibold text-[#1A1A2E]">₹{insuranceFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6C6C80]">GST (18%)</span>
                  <span className="font-semibold text-[#1A1A2E]">₹{gst.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-[#1A1A2E]">Total Amount</span>
                  <span className="text-[#00D09C]">₹{totalAmount.toFixed(2)}</span>
                </div>
                <Button
                  onClick={handleProceedToPayment}
                  disabled={
                    !bookingData.startDate ||
                    totalDays <= 0 ||
                    (isMoreThanOneDay && !bookingData.endDate)
                  }
                  className="w-full mt-4 bg-[#00D09C] hover:bg-[#00B386] text-white"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        amount={totalAmount}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F7FA] flex items-center justify-center">
        <Card className="w-full max-w-md shadow-[0_4px_16px_rgba(0,0,0,0.12)] border-0">
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#00D09C]" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}

