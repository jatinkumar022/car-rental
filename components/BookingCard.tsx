'use client';

import Image from 'next/image';
import { Calendar, DollarSign, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: {
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
  };
  onStatusChange?: (bookingId: string, status: string) => void;
  showRenter?: boolean;
}

export default function BookingCard({
  booking,
  onStatusChange,
  showRenter = false,
}: BookingCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-48 w-full sm:h-auto sm:w-48">
          <Image
            src={booking.car.images[0] || '/placeholder.svg'}
            alt={`${booking.car.make} ${booking.car.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 192px"
          />
        </div>
        <CardContent className="flex-1 p-4 sm:p-6">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
              {booking.car.make} {booking.car.model}
            </h3>
            {showRenter && booking.renter && (
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{booking.renter.name}</span>
              </div>
            )}
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(booking.startDate), 'MMM dd, yyyy')} -{' '}
                {format(new Date(booking.endDate), 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>
                ${booking.totalPrice} ({booking.totalDays} days)
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
            <Badge
              variant="outline"
              className={
                booking.paymentStatus === 'paid'
                  ? 'border-green-500 text-green-700'
                  : ''
              }
            >
              {booking.paymentStatus}
            </Badge>
          </div>
          {onStatusChange && booking.status === 'pending' && (
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onStatusChange(booking._id, 'confirmed')}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(booking._id, 'cancelled')}
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

