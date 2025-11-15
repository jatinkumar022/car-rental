'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, IndianRupee, User, Car, Search, Filter, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Loader from '@/components/Loader';
import BookingCardSkeleton from '@/components/BookingCardSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useBookingStore } from '@/stores/useBookingStore';
import { toast } from 'sonner';

interface Booking {
  _id: string;
  carId?: {
    _id: string;
    make: string;
    model: string;
    images: Array<{ url: string }> | string[];
    dailyPrice: number;
    locationCity?: string;
    locationAddress?: string;
  };
  car?: any; // Fallback
  renterId?: {
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
    phone?: string;
  };
  renter?: any; // Fallback
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  totalPrice?: number; // Fallback
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { renterBookings, ownerBookings, loading, stats, fetchRenterBookings, fetchOwnerBookings, updateBookingStatus } = useBookingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('renter');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.id) {
      fetchRenterBookings();
      fetchOwnerBookings();
    }
  }, [status, router, session?.user?.id, fetchRenterBookings, fetchOwnerBookings]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const success = await updateBookingStatus(bookingId, newStatus);
    if (success) {
      setStatusDialogOpen(false);
      setSelectedBooking(null);
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

  const filteredBookings = (bookings: Booking[]) => {
    return bookings.filter((booking) => {
      const car = booking.carId || booking.car;
      const renter = booking.renterId || booking.renter;
      const renterName = renter 
        ? (renter.firstName && renter.lastName 
            ? `${renter.firstName} ${renter.lastName}` 
            : renter.name || renter.email || '')
        : '';
      
      const matchesSearch = 
        (car?.make?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (car?.model?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (car?.locationCity?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (car?.locationAddress?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (renterName.toLowerCase().includes(searchQuery.toLowerCase()) || false);
      
      const matchesFilter = 
        filterStatus === 'all' || booking.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  };

  const renderBookingCard = (booking: Booking, showRenter: boolean = false) => {
    const isUpcoming = new Date(booking.startDate) > new Date() && booking.status !== 'cancelled';
    const isPast = new Date(booking.endDate) < new Date();

    const car = booking.carId || booking.car;
    const renter = booking.renterId || booking.renter;
    const totalAmount = booking.totalAmount || booking.totalPrice || 0;
    
    const carImages = car?.images 
      ? (typeof car.images[0] === 'string' 
          ? car.images as string[]
          : (car.images as Array<{ url: string }>).map(img => img.url))
      : ['/placeholder.svg'];

    const renterName = renter 
      ? (renter.firstName && renter.lastName 
          ? `${renter.firstName} ${renter.lastName}` 
          : renter.name || renter.email || 'Unknown')
      : 'Unknown';

    return (
      <Card key={booking._id} className="overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-shadow">
        <div className="flex flex-col sm:flex-row">
          <Link href={`/cars/${car?._id || ''}`} className="relative h-48 w-full sm:h-auto sm:w-48 shrink-0">
            <Image
              src={carImages[0] || '/placeholder.svg'}
              alt={`${car?.make || ''} ${car?.model || ''}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          </Link>
          <CardContent className="flex-1 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="mb-3">
                  <Link href={`/cars/${car?._id || ''}`}>
                    <h3 className="text-xl font-semibold text-[#1A1A2E] hover:text-[#00D09C] transition">
                      {car?.make} {car?.model}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-sm text-[#6C6C80]">
                    <MapPin className="h-4 w-4" />
                    <span>{car?.locationCity || car?.locationAddress || car?.location || 'Location not specified'}</span>
                  </div>
                </div>

                {showRenter && renter && (
                  <div className="mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#6C6C80]" />
                    <span className="text-sm text-[#2D2D44]">{renterName}</span>
                    {renter.email && (
                      <span className="text-xs text-[#6C6C80]">({renter.email})</span>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-sm text-[#6C6C80] mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(booking.startDate), 'MMM dd, yyyy')} -{' '}
                      {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{booking.totalDays} {booking.totalDays === 1 ? 'day' : 'days'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4" />
                    <span className="font-semibold text-[#1A1A2E]">₹{totalAmount.toFixed(2)}</span>
                    <span className="text-xs text-[#6C6C80]">
                      (₹{car?.dailyPrice || car?.pricePerDay || 0}/day)
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
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
                  {isUpcoming && (
                    <Badge variant="outline" className="border-blue-500 text-blue-700">
                      Upcoming
                    </Badge>
                  )}
                  {isPast && booking.status === 'completed' && (
                    <Badge variant="outline" className="border-gray-500 text-gray-700">
                      Completed
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                {/* Owner's view - can confirm/decline bookings */}
                {showRenter && booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-[#00D09C] hover:bg-[#00B386] text-white"
                      onClick={() => handleStatusChange(booking._id, 'confirmed')}
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#FF4444] text-[#FF4444] hover:bg-[#FFE5E5]"
                      onClick={() => handleStatusChange(booking._id, 'cancelled')}
                    >
                      Decline
                    </Button>
                  </div>
                )}
                {/* Renter's view - can pay for pending bookings */}
                {!showRenter && booking.status === 'pending' && booking.paymentStatus === 'pending' && (
                  <Button
                    size="sm"
                    className="bg-[#00D09C] hover:bg-[#00B386] text-white"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/payments', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ bookingId: booking._id }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          toast.success('Payment processed successfully!');
                          fetchRenterBookings();
                          fetchOwnerBookings();
                        } else {
                          toast.error(data.error || 'Payment failed');
                        }
                      } catch {
                        toast.error('Error processing payment');
                      }
                    }}
                  >
                    Pay Now
                  </Button>
                )}
                {/* Renter's view - can cancel their own pending bookings */}
                {!showRenter && booking.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setStatusDialogOpen(true);
                    }}
                  >
                    Cancel Booking
                  </Button>
                )}
                <Link href={`/bookings/${booking._id}`}>
                  <Button size="sm" className="bg-[#00D09C] hover:bg-[#00B386] text-white">
                    View Details
                  </Button>
                </Link>
                <Link href={`/cars/${car?._id || ''}`}>
                  <Button size="sm" variant="outline" className="border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]">
                    View Car
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F7F7FA] py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const currentBookings = activeTab === 'renter' ? renterBookings : ownerBookings;
  const filtered = filteredBookings(currentBookings);

  return (
    <div className="min-h-screen bg-[#F7F7FA] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
            My Bookings
          </h1>
          <p className="mt-2 text-base text-[#6C6C80] sm:text-lg">
            Manage your car rentals and bookings
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6C6C80] mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{stats.upcomingBookings}</p>
                </div>
                <div className="p-3 bg-[#E6FFF9] rounded-lg">
                  <Clock className="h-6 w-6 text-[#00D09C]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6C6C80] mb-1">Completed</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{stats.completedBookings}</p>
                </div>
                <div className="p-3 bg-[#E6F3FF] rounded-lg">
                  <CheckCircle className="h-6 w-6 text-[#2196F3]" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6C6C80] mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">₹{stats.totalSpent.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-[#E6FFF9] rounded-lg">
                  <IndianRupee className="h-6 w-6 text-[#00D09C]" />
                </div>
              </div>
            </CardContent>
          </Card>
          {session.user.role === 'owner' && (
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6C6C80] mb-1">Total Earned</p>
                    <p className="text-2xl font-bold text-[#1A1A2E]">₹{stats.totalEarned.toFixed(2)}</p>
                  </div>
                  <div className="p-3 bg-[#E6FFF9] rounded-lg">
                    <IndianRupee className="h-6 w-6 text-[#00D09C]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
              <TabsTrigger value="renter">My Rentals</TabsTrigger>
              {session.user.role === 'owner' && (
                <TabsTrigger value="owner">Bookings for My Cars</TabsTrigger>
              )}
            </TabsList>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 sm:justify-end">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6C6C80]" />
                <Input
                  placeholder="Search bookings..."
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
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <TabsContent value="renter" className="space-y-6">
            {filtered.length > 0 ? (
              <div className="space-y-4">
                {filtered.map((booking) => renderBookingCard(booking, false))}
              </div>
            ) : (
              <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto mb-6 w-20 h-20 bg-[#E6FFF9] rounded-full flex items-center justify-center">
                    <Car className="h-10 w-10 text-[#00D09C]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">
                    {searchQuery || filterStatus !== 'all' ? 'No bookings found' : 'No rentals yet'}
                  </h3>
                  <p className="text-[#6C6C80] mb-6">
                    {searchQuery || filterStatus !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Start exploring and book your first car'}
                  </p>
                  {!searchQuery && filterStatus === 'all' && (
                    <Button asChild className="bg-[#00D09C] hover:bg-[#00B386] text-white rounded-xl font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
                      <Link href="/cars">Browse Cars</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {session.user.role === 'owner' && (
            <TabsContent value="owner" className="space-y-6">
              {filteredBookings(ownerBookings).length > 0 ? (
                <div className="space-y-4">
                  {filteredBookings(ownerBookings).map((booking) => renderBookingCard(booking, true))}
                </div>
              ) : (
                <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
                  <CardContent className="py-16 text-center">
                    <div className="mx-auto mb-6 w-20 h-20 bg-[#E6FFF9] rounded-full flex items-center justify-center">
                      <Calendar className="h-10 w-10 text-[#00D09C]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">
                      {searchQuery || filterStatus !== 'all' ? 'No bookings found' : 'No bookings yet'}
                    </h3>
                    <p className="text-[#6C6C80]">
                      {searchQuery || filterStatus !== 'all'
                        ? 'Try adjusting your search or filters'
                        : 'Your cars haven\'t received any bookings yet'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Status Change Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Booking</DialogTitle>
              <DialogDescription>
                Update the status of this booking
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Current Status:</p>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {selectedBooking.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusChange(selectedBooking._id, 'cancelled')}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel Booking
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

