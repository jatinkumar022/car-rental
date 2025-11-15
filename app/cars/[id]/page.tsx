'use client';

import { useEffect, useState } from 'react';
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
  Calendar,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import CarCard from '@/components/CarCard';
import { useCarStore } from '@/stores/useCarStore';
import { useBookingStore } from '@/stores/useBookingStore';
import { useReviewStore } from '@/stores/useReviewStore';
import { toast } from 'sonner';

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
  available?: boolean;
  owner: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    phone?: string;
  };
}

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { currentCar: car, similarCars, loading, fetchCarById, fetchSimilarCars } = useCarStore();
  const { reviews, fetchReviews, createReview } = useReviewStore();
  const { createBooking } = useBookingStore();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('location');
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
  });
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchCarById(params.id as string);
      fetchReviews(params.id as string);
    }
  }, [params.id, fetchCarById, fetchReviews]);

  useEffect(() => {
    if (car) {
      fetchSimilarCars(car.type, car._id);
    }
  }, [car, fetchSimilarCars]);

  const handleBooking = async () => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (!bookingData.startDate || !bookingData.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const success = await createBooking(
      params.id as string,
      bookingData.startDate,
      bookingData.endDate
    );
    
    if (success) {
        setBookingOpen(false);
      router.push('/my-bookings');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
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
            <Card className="mb-6 overflow-hidden shadow-xl">
              <div className="relative h-64 w-full sm:h-96 lg:h-[500px]">
                <Image
                  src={car.images[0] || '/placeholder.svg'}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              </div>
              {car.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 p-4 bg-white">
                  {car.images.slice(1, 5).map((img, i) => (
                    <div key={i} className="relative h-20 w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition">
                      <Image
                        src={img}
                        alt={`${car.make} ${car.model} ${i + 2}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 25vw, 16vw"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Car Details */}
            <Card className="mb-6 shadow-lg">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-3xl sm:text-4xl font-bold">
                      {car.make} {car.model} {car.year}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <span className="text-base text-gray-600">{car.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-br from-yellow-50 to-orange-50 px-4 py-2 rounded-xl">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold">
                      {car.rating > 0 ? car.rating.toFixed(1) : 'New'}
                    </span>
                    {car.totalReviews > 0 && (
                      <span className="text-sm text-gray-600">
                        ({car.totalReviews} reviews)
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Seats</p>
                      <p className="font-bold text-gray-900">{car.seats}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Transmission</p>
                      <p className="font-bold text-gray-900 capitalize">{car.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Fuel className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fuel</p>
                      <p className="font-bold text-gray-900 capitalize">{car.fuelType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Car className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Type</p>
                      <p className="font-bold text-gray-900">{car.type}</p>
                    </div>
                  </div>
                </div>
                <Separator className="my-6" />
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">Description</h3>
                  <p className="text-base text-gray-600 leading-relaxed">{car.description}</p>
                </div>
                {car.features.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h3 className="mb-3 text-lg font-semibold text-gray-900">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {car.features.map((feature, i) => (
                          <Badge key={i} variant="outline" className="px-3 py-1 text-sm">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Car Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="flex w-full gap-2 mb-6 overflow-x-auto scrollbar-hide">
                    <TabsTrigger value="location" className="min-w-[120px] whitespace-nowrap flex-shrink-0">Location</TabsTrigger>
                    <TabsTrigger value="reviews" className="min-w-[120px] whitespace-nowrap flex-shrink-0">Reviews ({reviews.length})</TabsTrigger>
                    <TabsTrigger value="features" className="min-w-[120px] whitespace-nowrap flex-shrink-0">Features</TabsTrigger>
                    <TabsTrigger value="benefits" className="min-w-[120px] whitespace-nowrap flex-shrink-0">Benefits</TabsTrigger>
                    <TabsTrigger value="faqs" className="min-w-[120px] whitespace-nowrap flex-shrink-0">FAQs</TabsTrigger>
                  </TabsList>
                  <TabsContent value="location" className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Car Location
                      </h3>
                      <p className="text-gray-700 mb-2">{car.location}</p>
                      <p className="text-sm text-gray-600">
                        The exact pickup location will be shared after booking confirmation.
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Host Information</h3>
                      {car.owner && (
                        <>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              {car.owner.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Hosted by {car.owner.name}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>Verified Owner</span>
                              </div>
                            </div>
                          </div>
                          {car.owner.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Phone className="h-4 w-4" />
                              <span>{car.owner.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{car.owner.email}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="space-y-6">
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-4xl font-bold">{car.rating > 0 ? car.rating.toFixed(1) : 'New'}</div>
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.floor(car.rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">Based on {car.totalReviews} {car.totalReviews === 1 ? 'trip' : 'trips'}</p>
                        </div>
                      </div>
                      {session && (
                        <Button
                          onClick={() => setReviewOpen(true)}
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          Write a Review
                        </Button>
                      )}
                    </div>
                    <Separator />
                    {reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                            <div className="mb-3 flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {review.user.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">{review.user.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                                  </span>
                                </div>
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
                              </div>
                            </div>
                            <p className="text-base text-gray-700 leading-relaxed">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-gray-600">No reviews yet. Be the first to review!</p>
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
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold py-6"
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
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-semibold">Trip Protection</h3>
                      </div>
                      <p className="text-gray-700 mb-4">
                        Your trip is secured against accidental damage. Travel with confidence knowing you&apos;re protected.
                      </p>
                      <Button variant="outline" size="sm">Learn More</Button>
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

          {/* Sidebar */}
          <div>
            <Card className="sticky top-24 shadow-xl">
              <CardHeader>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-900">₹{car.pricePerDay}</span>
                  <span className="text-gray-500 text-lg">/day</span>
                </div>
                {car.available === false && (
                  <Badge className="mt-2 bg-red-500 text-white w-fit">
                    Currently Unavailable
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg py-6 hover:shadow-lg transition-all duration-300"
                      disabled={session?.user.id === car.owner?._id || car.available === false}
                    >
                      {session?.user.id === car.owner?._id
                        ? 'Your Car'
                        : car.available === false
                        ? 'Currently Unavailable'
                        : 'Book Now'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">Book {car.make} {car.model}</DialogTitle>
                      <DialogDescription>
                        Select your rental dates
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-4 py-3 mt-2">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <Input
                            type="date"
                            value={bookingData.startDate}
                            onChange={(e) =>
                              setBookingData({ ...bookingData, startDate: e.target.value })
                            }
                            min={format(new Date(), 'yyyy-MM-dd')}
                            className="border-0 outline-none focus-visible:ring-0"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">End Date</Label>
                        <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-4 py-3 mt-2">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <Input
                            type="date"
                            value={bookingData.endDate}
                            onChange={(e) =>
                              setBookingData({ ...bookingData, endDate: e.target.value })
                            }
                            min={bookingData.startDate || format(new Date(), 'yyyy-MM-dd')}
                            className="border-0 outline-none focus-visible:ring-0"
                          />
                        </div>
                      </div>
                      {totalDays > 0 && (
                        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-4 border-2 border-blue-100">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Days:</span>
                            <span className="font-semibold">{totalDays}</span>
                          </div>
                          <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-blue-200">
                            <span>Total:</span>
                            <span>₹{totalPrice}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleBooking}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold py-6"
                        disabled={!bookingData.startDate || !bookingData.endDate}
                      >
                        Confirm Booking
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Separator className="my-6" />

                {car.owner && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Owner</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {car.owner.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{car.owner.name}</p>
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
              {similarCars.map((similarCar) => (
                <CarCard key={similarCar._id} car={similarCar} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



