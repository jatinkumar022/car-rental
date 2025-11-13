'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Search, Car, Star, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CarCard from '@/components/CarCard';
import { CardSkeleton } from '@/components/Loader';
import { motion } from 'framer-motion';

interface Car {
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
}

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFeaturedCars = useCallback(async () => {
    try {
      const res = await fetch('/api/cars?limit=6');
      const data = await res.json();
      setFeaturedCars(data.cars || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedCars();
  }, [fetchFeaturedCars]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] text-white">
        <div className="container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
              Find Your Perfect Ride
            </h1>
            <p className="mt-4 text-base text-blue-100 sm:text-lg md:text-xl">
              Rent premium cars at affordable prices. Experience the freedom of the
              open road.
            </p>

            {/* Search Bar */}
            <div className="mt-8">
              <form
                action="/cars"
                method="get"
                className="flex flex-col gap-2 sm:flex-row"
              >
                <Input
                  type="text"
                  name="search"
                  placeholder="Search by make, model, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white text-gray-900 placeholder:text-gray-500"
                />
                <Button
                  type="submit"
                  className="bg-white text-[#6366f1] hover:bg-gray-50 sm:w-auto"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6366f1]/10">
              <Car className="h-6 w-6 text-[#6366f1]" />
              </div>
              <h3 className="text-lg font-semibold">Wide Selection</h3>
              <p className="mt-2 text-sm text-gray-600">
                Choose from hundreds of premium vehicles
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6366f1]/10">
                <Star className="h-6 w-6 text-[#6366f1]" />
              </div>
              <h3 className="text-lg font-semibold">Verified Owners</h3>
              <p className="mt-2 text-sm text-gray-600">
                All cars are verified and well-maintained
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6366f1]/10">
                <Shield className="h-6 w-6 text-[#6366f1]" />
              </div>
              <h3 className="text-lg font-semibold">Secure Booking</h3>
              <p className="mt-2 text-sm text-gray-600">
                Safe and secure payment processing
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#6366f1]/10">
                <Clock className="h-6 w-6 text-[#6366f1]" />
              </div>
              <h3 className="text-lg font-semibold">24/7 Support</h3>
              <p className="mt-2 text-sm text-gray-600">
                Round-the-clock customer assistance
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Featured Cars
              </h2>
              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                Discover our most popular rental options
              </p>
            </div>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/cars">View All</Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : featuredCars.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-600">No cars available at the moment.</p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link href="/cars">View All Cars</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
