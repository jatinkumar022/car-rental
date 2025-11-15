'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Users, Fuel } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface CarCardProps {
  car: {
    _id: string;
    make: string;
    model: string;
    year: number;
    images: string[];
    pricePerDay: number;
    location: string;
    rating: number;
    totalReviews: number;
    seats: number;
    fuelType: string;
    transmission: string;
    available?: boolean;
  };
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/cars/${car._id}`}>
        <Card className={`group h-full overflow-hidden transition-shadow hover:shadow-lg ${car.available === false ? 'opacity-75' : ''}`}>
          <div className="relative h-48 w-full overflow-hidden sm:h-56">
            <Image
              src={car.images[0] || '/placeholder.svg'}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute right-2 top-2 flex flex-col gap-2">
              <Badge className="bg-white/90 text-gray-900">
                ₹{car.pricePerDay}/day
              </Badge>
              {car.available === false && (
                <Badge className="bg-red-500/90 text-white">
                  Unavailable
                </Badge>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                {car.make} {car.model}
              </h3>
              <p className="text-sm text-gray-500">{car.year}</p>
            </div>
            <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate text-xs sm:text-sm">{car.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="h-4 w-4" />
                <span>{car.seats}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Fuel className="h-4 w-4" />
                <span className="capitalize">{car.fuelType}</span>
              </div>
              <Badge variant="outline" className="text-xs capitalize">
                {car.transmission}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t p-4 pt-0">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {car.rating > 0 ? car.rating.toFixed(1) : 'New'}
              </span>
              {car.totalReviews > 0 && (
                <span className="text-xs text-gray-500">
                  ({car.totalReviews})
                </span>
              )}
            </div>
            <span className="text-sm font-semibold text-[#6366f1] sm:text-base">
              ₹{car.pricePerDay}
              <span className="text-xs font-normal text-gray-500">/day</span>
            </span>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

