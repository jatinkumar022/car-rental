'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, X, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CarCard from '@/components/CarCard';
import Loader from '@/components/Loader';
import { Card } from '@/components/ui/card';
import { useCarStore } from '@/stores/useCarStore';

function CarsPageContent() {
  const searchParams = useSearchParams();
  const { cars, loading, fetchCars, setFilters } = useCarStore();
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || '',
    transmission: searchParams.get('transmission') || '',
    fuelType: searchParams.get('fuelType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    location: searchParams.get('location') || '',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setFilters(localFilters);
    fetchCars(localFilters);
  }, [localFilters, setFilters, fetchCars]);

  const updateFilter = (key: string, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    const cleared = {
      search: '',
      type: '',
      transmission: '',
      fuelType: '',
      minPrice: '',
      maxPrice: '',
      location: '',
    };
    setLocalFilters(cleared);
    setFilters(cleared);
  };

  const hasActiveFilters = Object.values(localFilters).some((v) => v);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2">
            Browse Cars
          </h1>
          <p className="text-gray-600">
            Find your perfect ride from our collection
          </p>
        </div>

        {/* Enhanced Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by make, model, or location..."
                    value={localFilters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="sm:w-auto h-12"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} className="sm:w-auto h-12">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
                      <Select
                        value={localFilters.type}
                        onValueChange={(value) => updateFilter('type', value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          <SelectItem value="Sedan">Sedan</SelectItem>
                          <SelectItem value="SUV">SUV</SelectItem>
                          <SelectItem value="Hatchback">Hatchback</SelectItem>
                          <SelectItem value="Coupe">Coupe</SelectItem>
                          <SelectItem value="Convertible">Convertible</SelectItem>
                          <SelectItem value="Van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Transmission
                      </label>
                      <Select
                        value={localFilters.transmission}
                        onValueChange={(value) => updateFilter('transmission', value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Fuel Type</label>
                      <Select
                        value={localFilters.fuelType}
                        onValueChange={(value) => updateFilter('fuelType', value)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All</SelectItem>
                          <SelectItem value="petrol">Petrol</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Location</label>
                      <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-4 h-11">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="City or area"
                          value={localFilters.location}
                          onChange={(e) => updateFilter('location', e.target.value)}
                          className="border-0 outline-none focus-visible:ring-0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Min Price</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={localFilters.minPrice || ''}
                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Max Price</label>
                      <Input
                        type="number"
                        placeholder="1000"
                        value={localFilters.maxPrice || ''}
                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <Loader fullHeight text="Loading cars..." />
        ) : cars.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Found {cars.length} {cars.length === 1 ? 'car' : 'cars'}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car) => (
                <CarCard key={car._id} car={car} />
              ))}
            </div>
          </>
        ) : (
          <Card className="py-12 text-center">
            <div className="max-w-md mx-auto">
              <p className="text-gray-600 mb-4">No cars found matching your criteria.</p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2">
                Browse Cars
              </h1>
              <p className="text-gray-600">
                Find your perfect ride from our collection
              </p>
            </div>
            <Loader fullHeight text="Loading cars..." />
          </div>
        </div>
      }
    >
      <CarsPageContent />
    </Suspense>
  );
}
