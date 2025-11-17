'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Shield, Clock, ChevronLeft, ChevronRight, MapPin, IndianRupee, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePickerSingle } from '@/components/ui/date-picker-single';
import { Checkbox } from '@/components/ui/checkbox';
import CarCard from '@/components/CarCard';
import Loader from '@/components/Loader';
import { motion } from 'framer-motion';
import { useCarStore } from '@/stores/useCarStore';

export default function Home() {
  const { cars: featuredCars, loading, fetchCars } = useCarStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [searchData, setSearchData] = useState({
    location: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [isMoreThanOneDay, setIsMoreThanOneDay] = useState(false);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1600&h=900&fit=crop",
      title: "Drive Your Dream Car Today",
      subtitle: "Premium car rentals at your fingertips"
    },
    {
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&h=900&fit=crop",
      title: "List Your Car, Earn Money",
      subtitle: "Turn your idle car into passive income"
    },
    {
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1600&h=900&fit=crop",
      title: "Seamless Booking Experience",
      subtitle: "Book in minutes, drive in hours"
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Car Owner",
      text: "I've earned over ₹12,00,000 by listing my car. The platform is incredibly easy to use!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop"
    },
    {
      name: "Rahul Kumar",
      role: "Frequent Renter",
      text: "Amazing selection of cars and transparent pricing. I rent cars every weekend for my adventures.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"
    },
    {
      name: "Anjali Patel",
      role: "Car Owner",
      text: "The insurance coverage gives me peace of mind. Highly recommend to other car owners!",
      rating: 5,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop"
    },
  ];

  const features = [
    { icon: Shield, title: "Insurance Covered", desc: "Every trip is protected with comprehensive insurance" },
    { icon: Clock, title: "24/7 Support", desc: "Round-the-clock assistance whenever you need it" },
    { icon: IndianRupee, title: "Best Prices", desc: "Competitive rates with no hidden fees" },
    { icon: Check, title: "Verified Users", desc: "All users are verified for your safety" },
  ];

  useEffect(() => {
    fetchCars({ limit: '6' });
  }, [fetchCars]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // heroSlides.length is constant, no need to include in deps

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // testimonials.length is constant, no need to include in deps

  return (
    <div className="min-h-screen bg-[#F7F7FA]">
      {/* Hero Carousel */}
      <div className="relative h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <div className="relative w-full h-full">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
            <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent z-10" />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8">{slide.subtitle}</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                    <Button asChild size="lg" className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-[#00D09C] hover:bg-[#00B386] text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base shadow-lg transition-all duration-300 hover:scale-105">
                      <Link href="/cars">Browse Cars</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base border-2 border-white hover:bg-white hover:text-[#1A1A2E] transition-all duration-300">
                      <Link href="/my-cars">List Your Car</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 backdrop-blur-sm p-2 sm:p-3 rounded-full hover:bg-white/50 transition"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 backdrop-blur-sm p-2 sm:p-3 rounded-full hover:bg-white/50 transition"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
        </button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-30">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 sm:p-6 md:p-8 max-w-[900px] mx-auto">
          <form
            action="/cars"
            method="get"
            onSubmit={(e) => {
              e.preventDefault();
              const params = new URLSearchParams();
              if (searchData.location) params.set('location', searchData.location);
              if (searchData.startDate) {
                params.set('startDate', searchData.startDate.toISOString().split('T')[0]);
              }
              if (isMoreThanOneDay && searchData.endDate) {
                params.set('endDate', searchData.endDate.toISOString().split('T')[0]);
              }
              window.location.href = `/cars?${params.toString()}`;
            }}
            className="flex flex-col gap-4 sm:gap-6"
          >
            <div className="space-y-1.5 sm:space-y-2 ">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0 absolute left-3 top-1/2 -translate-y-1/2 z-20 " />
                <Input
                  type="text"
                  name="location"
                  placeholder="Enter city"
                  value={searchData.location}
                  onChange={(e) => setSearchData({ ...searchData, location: e.target.value })}
                  className="flex-1 pl-8 md:pl-10 border-0 outline-none focus-visible:ring-0 text-sm sm:text-base"
                />
                </div>
            </div>
            <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row items-center">
              <div className="space-y-2 w-full">
                <DatePickerSingle
                  label="Pick-up Date"
                  date={searchData.startDate}
                  onDateChange={(date) => {
                    setSearchData({ ...searchData, startDate: date });
                    if (!isMoreThanOneDay && date) {
                      setSearchData({ ...searchData, startDate: date, endDate: undefined });
                    }
                  }}
                  minDate={new Date()}
                  placeholder="Select start date"
                  className="w-full"
                />
              </div>
             
              <div className="space-y-2 w-full">

                {isMoreThanOneDay && (
                  <DatePickerSingle
                    label="Return Date"
                    date={searchData.endDate}
                    onDateChange={(date) => setSearchData({ ...searchData, endDate: date })}
                    minDate={searchData.startDate || new Date()}
                    placeholder="Select end date"
                    className="w-full"
                  />
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 py-2 ">
                <Checkbox
                  id="more-than-one-day-home"
                  checked={isMoreThanOneDay}
                  onCheckedChange={(checked) => {
                    setIsMoreThanOneDay(!!checked);
                    if (!checked) {
                      setSearchData({ ...searchData, endDate: undefined });
                    }
                  }}
                />
                <label
                  htmlFor="more-than-one-day-home"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  More than one day
                </label>
              </div>
            <div className="flex items-end">
              <Button
                type="submit"
                size="lg"
                className="w-full py-2.5 sm:py-3 bg-[#00D09C] hover:bg-[#00B386] text-white rounded-lg font-semibold text-sm sm:text-base shadow-lg transition-all duration-300 hover:scale-105"
              >
                Search Cars
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Features Section - Why Choose Us */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#1A1A2E] mb-4">Why Choose Our Platform</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-[#E6FFF9] rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-[#00D09C]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2">{feature.title}</h3>
              <p className="text-[#6C6C80] text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Cars Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-1.5 sm:mb-2">Featured Cars</h2>
            <p className="text-sm sm:text-base text-[#6C6C80]">Handpicked premium vehicles for your journey</p>
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]">
            <Link href="/cars">View All →</Link>
          </Button>
        </div>
        {loading ? (
          <Loader fullHeight text="Loading featured cars..." />
        ) : featuredCars.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCars.map((car) => {
              const carImages: string[] = Array.isArray(car.images)
                ? (typeof car.images[0] === 'string'
                  ? car.images as string[]
                  : (car.images as Array<{ url: string }>).map(img => img.url))
                : [];
              const location = car.locationCity || car.locationAddress || car.location || '';
              const carCardCar = {
                _id: car._id,
                make: car.make,
                model: car.model,
                year: car.year,
                images: carImages,
                pricePerDay: car.dailyPrice || car.pricePerDay || 0,
                location: location,
                seats: car.seatingCapacity || car.seats || 0,
                totalReviews: car.totalTrips || car.totalReviews || 0,
                transmission: car.transmission,
                fuelType: car.fuelType,
                rating: car.rating,
                available: car.available ?? (car.status === 'active'),
              };
              return <CarCard key={car._id} car={carCardCar} />;
            })}
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

      {/* How It Works */}
      <div className="bg-linear-to-br from-[#E6FFF9] to-white py-20" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1A1A2E] mb-4">How It Works</h2>
            <p className="text-xl text-[#6C6C80]">Simple steps to get you on the road</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Search", desc: "Find the perfect car for your journey", icon: "🔍" },
              { step: "2", title: "Select", desc: "Choose your preferred vehicle", icon: "✓" },
              { step: "3", title: "Book", desc: "Reserve with instant confirmation", icon: "💳" },
              { step: "4", title: "Drive", desc: "Pick up and start your adventure", icon: "🚗" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-xl p-8 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 text-center">
                  <div className="w-16 h-16 bg-[#00D09C] rounded-full flex items-center justify-center mb-6 text-white text-2xl font-bold mx-auto">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A2E] mb-3">{item.title}</h3>
                  <p className="text-[#6C6C80] text-sm">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#00D09C]" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1A2E] mb-2 sm:mb-3 md:mb-4">What Our Customers Say</h2>
          <p className="text-base sm:text-lg md:text-xl text-[#6C6C80]">Join thousands of satisfied customers</p>
        </div>
        <div className="relative max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`transition-opacity duration-500 ${index === currentTestimonial ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
            >
              <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 shadow-[0_4px_16px_rgba(0,0,0,0.12)] max-w-[320px] sm:max-w-[360px] mx-auto">
                <div className="flex items-center mb-4 sm:mb-5 md:mb-6">
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden mr-3 sm:mr-4 shrink-0">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg truncate">{testimonial.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{testimonial.role}</p>
                  </div>
                  <div className="ml-auto flex space-x-0.5 sm:space-x-1 shrink-0">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed break-words">{testimonial.text}</p>
              </div>
            </div>
          ))}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${index === currentTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300'
                  }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-linear-to-r from-[#00D09C] to-[#00B386] py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6">Ready to Start Your Journey?</h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-4">Join thousands of happy customers renting and listing cars on our platform</p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
            <Button asChild size="lg" className="px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 bg-white text-[#00D09C] rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Link href="/cars">Browse Cars Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4 bg-white/20 backdrop-blur-sm text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg border-2 border-white hover:bg-white hover:text-[#00D09C] transition-all duration-300">
              <Link href="/my-cars">List Your Car</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
