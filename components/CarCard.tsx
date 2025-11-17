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
          <div className="relative h-48 w-full overflow-hidden sm:h-56 bg-[#F7F7FA]">
            <Image
              src={car.images[0] || '/placeholder.svg'}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-105 rounded-t-xl"
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
          <CardContent className="p-3 sm:p-4">
            <div className="mb-1.5 sm:mb-2">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#1A1A2E] line-clamp-2 break-words">
                {car.make} {car.model}
              </h3>
              <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-[#2D2D44]">
                    {car.rating > 0 ? car.rating.toFixed(1) : 'New'}
                  </span>
                  {car.totalReviews > 0 && (
                    <span className="text-[10px] sm:text-xs text-[#6C6C80]">
                      ({car.totalReviews})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="mb-2 sm:mb-3 flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#6C6C80]">
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="truncate">{car.location}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs mb-2 sm:mb-3">
              <Badge variant="outline" className="text-[10px] sm:text-xs text-[#6C6C80] border-[#E5E5EA] px-1.5 sm:px-2 py-0.5">
                <span className="truncate">{car.transmission}</span>
              </Badge>
              <Badge variant="outline" className="text-[10px] sm:text-xs text-[#6C6C80] border-[#E5E5EA] capitalize px-1.5 sm:px-2 py-0.5">
                <span className="truncate">{car.fuelType}</span>
              </Badge>
              <Badge variant="outline" className="text-[10px] sm:text-xs text-[#6C6C80] border-[#E5E5EA] px-1.5 sm:px-2 py-0.5">
                {car.seats} Seats
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-[#E5E5EA] p-3 sm:p-4 pt-0">
            <span className="text-lg sm:text-xl font-bold text-[#00D09C]">
              ₹{car.pricePerDay}
              <span className="text-xs sm:text-sm font-normal text-[#6C6C80]">/day</span>
            </span>
            <Button variant="outline" size="sm" className="border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9] text-xs sm:text-sm">
              View Details
            </Button>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}

