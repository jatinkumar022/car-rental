'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  IndianRupee,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';

import { useBookingStore } from '@/stores/useBookingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import BookingCardSkeleton from '@/components/BookingCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';

interface OwnerBooking {
  _id: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  paymentStatus: string;
  totalAmount?: number;
  totalPrice?: number;
  car?: {
    _id?: string;
    make?: string;
    model?: string;
    images?: Array<{ url: string }> | string[];
    dailyPrice?: number;
    pricePerDay?: number;
    locationCity?: string;
    locationAddress?: string;
    location?: string;
  };
  carId?: OwnerBooking['car'];
  renter?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profileImage?: string;
    phone?: string;
    name?: string;
    avatar?: string;
  };
  renterId?: OwnerBooking['renter'];
}

const STATUS_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const formatMoney = (value?: number) => {
  if (!value) return '₹0.00';
  return `₹${value.toFixed(2)}`;
};

interface HostBookingsSectionProps {
  embedded?: boolean;
  heading?: string;
  description?: string;
}

export default function HostBookingsSection({
  embedded = false,
  heading = 'Car Booking Requests',
  description = 'Track and manage reservations for your listed cars.',
}: HostBookingsSectionProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { ownerBookings, loading, fetchOwnerBookings, updateBookingStatus } = useBookingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    if (status === 'authenticated') {
      fetchOwnerBookings();
    }
  }, [status, router, fetchOwnerBookings]);

  const filteredBookings = useMemo(() => {
    return ownerBookings.filter((booking) => {
      const normalizedBooking = booking as OwnerBooking;
      const car = normalizedBooking.car || normalizedBooking.carId;
      const renter = normalizedBooking.renter || normalizedBooking.renterId;

      const renterName =
        renter && typeof renter === 'object'
          ? ('firstName' in renter && renter.firstName && renter.lastName
              ? `${renter.firstName} ${renter.lastName}`
              : 'name' in renter && renter.name
                ? renter.name
                : renter.email || '')
          : '';

      const matchesSearch =
        (car?.make?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (car?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (car?.locationCity?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (car?.locationAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        renterName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [ownerBookings, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = ownerBookings.length;
    const pending = ownerBookings.filter((b) => b.status === 'pending').length;
    const confirmed = ownerBookings.filter((b) => b.status === 'confirmed').length;
    const totalEarned = ownerBookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.totalAmount ?? b.totalPrice ?? 0), 0);

    return { total, pending, confirmed, totalEarned };
  }, [ownerBookings]);

  const getStatusBadgeClasses = (status: string) => {
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
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (status === 'loading' || loading) {
    const skeletons = (
      <>
        <Skeleton className="h-10 w-64" />
        {[...Array(3)].map((_, idx) => (
          <BookingCardSkeleton key={idx} />
        ))}
      </>
    );
    if (embedded) {
      return (
        <section className="rounded-3xl border border-[#E5E5EA] bg-white p-6 sm:p-8 space-y-6">
          {skeletons}
        </section>
      );
    }
    return (
      <div className="min-h-screen bg-[#F7F7FA] py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {skeletons}
        </div>
      </div>
    );
  }

  if (!session) return null;

  const content = (
    <>
    <div className="space-y-8">
      <div>
        <p className="text-sm font-medium text-[#00B386] uppercase tracking-wide">Host Dashboard</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-[#1A1A2E]">{heading}</h2>
        <p className="mt-2 text-sm sm:text-base text-[#6C6C80]">{description}</p>
      </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="shadow-sm border border-[#E5E5EA]">
            <CardContent className="py-4">
              <p className="text-sm text-[#6C6C80]">Total Requests</p>
              <p className="mt-1 text-2xl font-semibold text-[#1A1A2E]">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-[#E5E5EA]">
            <CardContent className="py-4">
              <p className="text-sm text-[#6C6C80]">Pending Approval</p>
              <p className="mt-1 text-2xl font-semibold text-[#FF9800]">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-[#E5E5EA]">
            <CardContent className="py-4">
              <p className="text-sm text-[#6C6C80]">Confirmed</p>
              <p className="mt-1 text-2xl font-semibold text-[#00B386]">{stats.confirmed}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border border-[#E5E5EA]">
            <CardContent className="py-4">
              <p className="text-sm text-[#6C6C80]">Total Earned</p>
              <p className="mt-1 text-2xl font-semibold text-[#1A1A2E]">
                {formatMoney(stats.totalEarned)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6C6C80]" />
              <Input
                placeholder="Search by car, location or renter"
                className="pl-9 rounded-xl border-2 border-[#E5E5EA]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#6C6C80]" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px] rounded-xl border-2 border-[#E5E5EA]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[#E5E5EA]">
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button asChild variant="outline" className="rounded-xl border-[#00D09C] text-[#00B386] hover:bg-[#E6FFF9]">
            <Link href="/my-cars">Manage Cars</Link>
          </Button>
        </div>

        {filteredBookings.length === 0 ? (
          <Card className="border-dashed border-2 border-[#E5E5EA] bg-white/60 text-center py-12">
            <p className="text-lg font-semibold text-[#1A1A2E]">No booking requests yet</p>
            <p className="mt-2 text-sm text-[#6C6C80]">
              Once renters book your cars, you&apos;ll be able to review and manage them here.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const normalizedBooking = booking as OwnerBooking;
              const car = normalizedBooking.car || normalizedBooking.carId;
              const renter = normalizedBooking.renter || normalizedBooking.renterId;
              const carImages = car?.images
                ? typeof car.images[0] === 'string'
                  ? (car.images as string[])
                  : (car.images as Array<{ url: string }>).map((img) => img.url)
                : ['/placeholder.svg'];

              const renterName =
                renter && typeof renter === 'object'
                  ? ('firstName' in renter && renter.firstName && renter.lastName
                      ? `${renter.firstName} ${renter.lastName}`
                      : renter.email || renter.name || 'Unknown')
                  : 'Unknown';

              const totalAmount = booking.totalAmount ?? booking.totalPrice ?? 0;

              return (
                <Card key={booking._id} className="shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-48 w-full sm:w-52 bg-[#F7F7FA]">
                      <Image
                        src={carImages[0] || '/placeholder.svg'}
                        alt={`${car?.make || ''} ${car?.model || ''}`}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 100vw, 208px"
                      />
                    </div>
                    <CardContent className="flex-1 p-6 space-y-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <Link href={`/cars/${car?._id || ''}`}>
                            <h2 className="text-xl font-semibold text-[#1A1A2E]">
                              {car?.make} {car?.model}
                            </h2>
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-[#6C6C80]">
                            <MapPin className="h-4 w-4" />
                            <span>{car?.locationCity || car?.locationAddress || 'Location not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#2D2D44]">
                            <User className="h-4 w-4 text-[#6C6C80]" />
                            <span>{renterName}</span>
                            {renter?.email && (
                              <span className="text-xs text-[#6C6C80]">({renter.email})</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`${getStatusBadgeClasses(booking.status)} flex items-center gap-1`}>
                            {getStatusIcon(booking.status)}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              booking.paymentStatus === 'paid'
                                ? 'border-[#00D09C] text-[#00B386] bg-[#E6FFF9]'
                                : 'border-yellow-500 text-yellow-700'
                            }
                          >
                            {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[#6C6C80]">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(booking.startDate).toLocaleDateString()} -{' '}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          <span className="font-semibold text-[#1A1A2E]">{formatMoney(totalAmount)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-[#00D09C] hover:bg-[#00B386] text-white"
                              onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#FF4444] text-[#FF4444] hover:bg-[#FFE5E5]"
                              onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        <Link href={`/bookings/${booking._id}`}>
                          <Button size="sm" variant="outline" className="border-[#00D09C] text-[#00B386]">
                            View Booking
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  if (embedded) {
    return (
      <section className="rounded-3xl border border-[#E5E5EA] bg-white p-4 sm:p-6 lg:p-8">
        {content}
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7FA] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {content}
      </div>
    </div>
  );
}


