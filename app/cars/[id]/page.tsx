'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  Calendar,
  MapPin,
  Users,
  Fuel,
  Settings,
  Star,
  DollarSign,
  User,
  Phone,
  Mail,
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import BookingCard from '@/components/BookingCard';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface Car {
  _id: string;
  make: string;
  model: string;
  year: number;
  type: string;
  transmission: string;
  fuelType: string;
  seats: number;
  pricePerDay: number;
  location: string;
  images: string[];
  description: string;
  features: string[];
  rating: number;
  totalReviews: number;
  owner: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
  };
}

interface Review {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [car, setCar] = useState<Car | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
  });
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });

  const fetchCar = useCallback(async () => {
    if (!params.id) return;
    
    try {
      const res = await fetch(`/api/cars/${params.id}`);
      const data = await res.json();
      setCar(data.car);
    } catch (error) {
      console.error('Error fetching car:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchReviews = useCallback(async () => {
    if (!params.id) return;
    
    try {
      const res = await fetch(`/api/reviews?carId=${params.id}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) {
      fetchCar();
      fetchReviews();
    }
  }, [params.id, fetchCar, fetchReviews]);

  const handleBooking = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: params.id,
          ...bookingData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBookingOpen(false);
        router.push('/dashboard');
      } else {
        alert(data.error || 'Failed to create booking');
      }
    } catch (error) {
      alert('Error creating booking');
    }
  };

  const handleReview = async () => {
    if (!session) return;

    try {
      // First, find a completed booking for this car
      const bookingsRes = await fetch('/api/bookings?role=renter');
      const bookingsData = await bookingsRes.json();
      const booking = bookingsData.bookings?.find(
        (b: any) =>
          b.car._id === params.id && b.status === 'completed' && !b.reviewed
      );

      if (!booking) {
        alert('You can only review cars you have completed bookings for');
        return;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: params.id,
          bookingId: booking._id,
          ...reviewData,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviewOpen(false);
        fetchReviews();
        fetchCar();
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (error) {
      alert('Error submitting review');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-96 animate-pulse rounded-2xl bg-gray-200" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Car not found</p>
      </div>
    );
  }

  const totalDays =
    bookingData.startDate && bookingData.endDate
      ? Math.ceil(
          (new Date(bookingData.endDate).getTime() -
            new Date(bookingData.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
  const totalPrice = totalDays * car.pricePerDay;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <Card className="mb-6 overflow-hidden">
              <div className="relative h-64 w-full sm:h-96">
                <Image
                  src={car.images[0] || '/placeholder.svg'}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              </div>
              {car.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4">
                  {car.images.slice(1, 5).map((img, i) => (
                    <div key={i} className="relative h-20 w-full">
                      <Image
                        src={img}
                        alt={`${car.make} ${car.model} ${i + 2}`}
                        fill
                        className="rounded-lg object-cover"
                        sizes="(max-width: 768px) 25vw, 16vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Car Details */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl">
                      {car.make} {car.model} {car.year}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{car.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold">
                      {car.rating > 0 ? car.rating.toFixed(1) : 'New'}
                    </span>
                    {car.totalReviews > 0 && (
                      <span className="text-sm text-gray-500">
                        ({car.totalReviews})
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Seats</p>
                      <p className="font-semibold">{car.seats}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Transmission</p>
                      <p className="font-semibold capitalize">{car.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Fuel</p>
                      <p className="font-semibold capitalize">{car.fuelType}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="font-semibold">{car.type}</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div>
                  <h3 className="mb-2 font-semibold">Description</h3>
                  <p className="text-sm text-gray-600">{car.description}</p>
                </div>
                {car.features.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="mb-2 font-semibold">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {car.features.map((feature, i) => (
                          <Badge key={i} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="reviews">
                  <TabsList className="mb-4">
                    <TabsTrigger value="reviews">
                      Reviews ({reviews.length})
                    </TabsTrigger>
                    {session && (
                      <TabsTrigger value="write">Write Review</TabsTrigger>
                    )}
                  </TabsList>
                  <TabsContent value="reviews">
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div key={review._id} className="border-b pb-4 last:border-0">
                            <div className="mb-2 flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-semibold">{review.user.name}</span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">No reviews yet.</p>
                    )}
                  </TabsContent>
                  {session && (
                    <TabsContent value="write">
                      <div className="space-y-4">
                        <div>
                          <Label>Rating</Label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <button
                                key={rating}
                                type="button"
                                onClick={() =>
                                  setReviewData({ ...reviewData, rating })
                                }
                              >
                                <Star
                                  className={`h-6 w-6 ${
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
                          <Label>Comment</Label>
                          <Textarea
                            value={reviewData.comment}
                            onChange={(e) =>
                              setReviewData({ ...reviewData, comment: e.target.value })
                            }
                            placeholder="Share your experience..."
                            rows={4}
                          />
                        </div>
                        <Button onClick={handleReview}>Submit Review</Button>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">${car.pricePerDay}</span>
                  <span className="text-gray-500">/day</span>
                </div>
              </CardHeader>
              <CardContent>
                <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white"
                      disabled={session?.user.id === car.owner._id}
                    >
                      {session?.user.id === car.owner._id
                        ? 'Your Car'
                        : 'Book Now'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Book {car.make} {car.model}</DialogTitle>
                      <DialogDescription>
                        Select your rental dates
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="date"
                          value={bookingData.startDate}
                          onChange={(e) =>
                            setBookingData({ ...bookingData, startDate: e.target.value })
                          }
                          min={format(new Date(), 'yyyy-MM-dd')}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="date"
                          value={bookingData.endDate}
                          onChange={(e) =>
                            setBookingData({ ...bookingData, endDate: e.target.value })
                          }
                          min={bookingData.startDate || format(new Date(), 'yyyy-MM-dd')}
                        />
                      </div>
                      {totalDays > 0 && (
                        <div className="rounded-lg bg-gray-50 p-4">
                          <div className="flex justify-between text-sm">
                            <span>Days:</span>
                            <span>{totalDays}</span>
                          </div>
                          <div className="mt-2 flex justify-between font-semibold">
                            <span>Total:</span>
                            <span>${totalPrice}</span>
                          </div>
                        </div>
                      )}
                      <Button
                        onClick={handleBooking}
                        className="w-full"
                        disabled={!bookingData.startDate || !bookingData.endDate}
                      >
                        Confirm Booking
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Separator className="my-4" />

                <div>
                  <h3 className="mb-3 font-semibold">Owner</h3>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200" />
                    <div>
                      <p className="font-medium">{car.owner.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>Verified Owner</span>
                      </div>
                    </div>
                  </div>
                  {car.owner.phone && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{car.owner.phone}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{car.owner.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

