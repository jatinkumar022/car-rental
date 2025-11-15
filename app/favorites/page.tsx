'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import Loader from '@/components/Loader';
import { toast } from 'sonner';
import CarCard from '@/components/CarCard';

interface Favorite {
  _id: string;
  carId: {
    _id: string;
    make: string;
    model: string;
    year: number;
    images: Array<{ url: string }> | string[];
    dailyPrice: number;
    locationCity?: string;
    locationAddress?: string;
    status: string;
    rating: number;
    totalTrips: number;
    transmission: string;
    fuelType: string;
    seatingCapacity: number;
  };
  createdAt: string;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.id) {
      fetchFavorites();
    }
  }, [status, router, session?.user?.id]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      if (res.ok) {
        setFavorites(data.favorites || []);
      } else {
        toast.error(data.error || 'Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Error fetching favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (carId: string) => {
    try {
      const res = await fetch(`/api/favorites?carId=${carId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Removed from favorites');
        fetchFavorites();
      } else {
        toast.error(data.error || 'Failed to remove favorite');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Error removing favorite');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F7F7FA] flex items-center justify-center">
        <Loader size="lg" text="Loading favorites..." />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#F7F7FA] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
            My Favorites
          </h1>
          <p className="mt-2 text-base text-[#6C6C80] sm:text-lg">
            Cars you've saved for later
          </p>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => {
              const car = favorite.carId;
              const carImages = Array.isArray(car.images) && car.images.length > 0
                ? (typeof car.images[0] === 'string'
                    ? car.images as string[]
                    : (car.images as Array<{ url: string }>).map(img => img.url))
                : ['/placeholder.svg'];

              return (
                <Card key={favorite._id} className="group h-full overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-shadow">
                  <div className="relative h-48 w-full overflow-hidden sm:h-56">
                    <Image
                      src={carImages[0] || '/placeholder.svg'}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110 rounded-t-xl"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute right-2 top-2">
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-10 w-10 rounded-full bg-white/90 hover:bg-white"
                        onClick={() => handleRemoveFavorite(car._id)}
                      >
                        <Trash2 className="h-5 w-5 text-[#FF4444]" />
                      </Button>
                    </div>
                    {car.status !== 'active' && (
                      <div className="absolute left-2 top-2">
                        <Badge className="bg-[#FF4444]/90 text-white">
                          Unavailable
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Link href={`/cars/${car._id}`}>
                        <h3 className="text-lg font-semibold text-[#1A1A2E] sm:text-xl hover:text-[#00D09C] transition">
                          {car.make} {car.model}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-[#2D2D44]">
                            {car.rating > 0 ? car.rating.toFixed(1) : 'New'}
                          </span>
                          {car.totalTrips > 0 && (
                            <span className="text-xs text-[#6C6C80]">
                              ({car.totalTrips})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 flex items-center gap-4 text-sm text-[#6C6C80]">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate text-xs sm:text-sm">
                          {car.locationCity || car.locationAddress || 'Location not specified'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm mb-3">
                      <Badge variant="outline" className="text-xs text-[#6C6C80] border-[#E5E5EA]">
                        {car.transmission}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-[#6C6C80] border-[#E5E5EA] capitalize">
                        {car.fuelType}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-[#6C6C80] border-[#E5E5EA]">
                        {car.seatingCapacity} Seats
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between border-t border-[#E5E5EA] p-4 pt-0">
                    <span className="text-xl font-bold text-[#00D09C]">
                      ₹{car.dailyPrice}
                      <span className="text-sm font-normal text-[#6C6C80]">/day</span>
                    </span>
                    <Button variant="outline" size="sm" asChild className="border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]">
                      <Link href={`/cars/${car._id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-6 w-20 h-20 bg-[#E6FFF9] rounded-full flex items-center justify-center">
                <Heart className="h-10 w-10 text-[#00D09C]" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">
                No favorites yet
              </h3>
              <p className="text-[#6C6C80] mb-6">
                Start exploring and save your favorite cars for later
              </p>
              <Button asChild className="bg-[#00D09C] hover:bg-[#00B386] text-white rounded-xl font-semibold px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/cars">Browse Cars</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

