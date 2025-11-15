'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
        <Card className={`group h-full overflow-hidden transition-all ${car.available === false ? 'opacity-75' : ''}`}>
          <div className="relative h-48 w-full overflow-hidden sm:h-56">
            <Image
              src={car.images[0] || '/placeholder.svg'}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110 rounded-t-xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute right-2 top-2 flex flex-col gap-2">
              {car.available === false && (
                <Badge className="bg-[#FF4444]/90 text-white">
                  Unavailable
                </Badge>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-[#1A1A2E] sm:text-xl">
                {car.make} {car.model}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-[#2D2D44]">
                    {car.rating > 0 ? car.rating.toFixed(1) : 'New'}
                  </span>
                  {car.totalReviews > 0 && (
                    <span className="text-xs text-[#6C6C80]">
                      ({car.totalReviews})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-3 flex items-center gap-4 text-sm text-[#6C6C80]">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate text-xs sm:text-sm">{car.location}</span>
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
                {car.seats} Seats
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-[#E5E5EA] p-4 pt-0">
            <span className="text-xl font-bold text-[#00D09C]">
              ₹{car.pricePerDay}
              <span className="text-sm font-normal text-[#6C6C80]">/day</span>
            </span>
            <Button variant="outline" size="sm" className="border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]">
              View Details
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

