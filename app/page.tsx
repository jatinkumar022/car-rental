'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, Shield, Clock, ChevronLeft, ChevronRight, MapPin, Calendar, IndianRupee, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CarCard from '@/components/CarCard';
import Loader from '@/components/Loader';
import { motion } from 'framer-motion';
import { useCarStore } from '@/stores/useCarStore';

export default function Home() {
  const { cars: featuredCars, loading, fetchCars } = useCarStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Carousel */}
      <div className="relative h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl text-gray-200 mb-8">{slide.subtitle}</p>
                  <div className="flex flex-wrap gap-4">
                    <Button asChild size="lg" className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <Link href="/cars">Browse Cars</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold border-2 border-white hover:bg-white hover:text-gray-900 transition-all duration-300">
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
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 backdrop-blur-sm p-3 rounded-full hover:bg-white/50 transition"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 backdrop-blur-sm p-3 rounded-full hover:bg-white/50 transition"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-30">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <form action="/cars" method="get" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-4 py-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <Input 
                  type="text" 
                  name="location"
                  placeholder="Enter city" 
                  className="flex-1 border-0 outline-none focus-visible:ring-0" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Pick-up Date</label>
              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-4 py-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <Input 
                  type="date" 
                  name="startDate"
                  className="flex-1 border-0 outline-none focus-visible:ring-0" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Return Date</label>
              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-4 py-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <Input 
                  type="date" 
                  name="endDate"
                  className="flex-1 border-0 outline-none focus-visible:ring-0" 
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button 
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Search Cars
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Cars Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Cars</h2>
            <p className="text-gray-600">Handpicked premium vehicles for your journey</p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/cars">View All →</Link>
          </Button>
        </div>
        {loading ? (
          <Loader fullHeight text="Loading featured cars..." />
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

      {/* How It Works */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to get you on the road</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Choose Your Car", desc: "Browse our extensive collection of vehicles and pick your perfect match" },
              { step: "2", title: "Book Instantly", desc: "Reserve your car with just a few clicks and instant confirmation" },
              { step: "3", title: "Hit the Road", desc: "Pick up your car and start your adventure with confidence" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 text-white text-2xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600">Join thousands of satisfied customers</p>
        </div>
        <div className="relative max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`transition-opacity duration-500 ${
                index === currentTestimonial ? 'opacity-100' : 'opacity-0 absolute inset-0'
              }`}
            >
              <div className="bg-white rounded-3xl p-10 shadow-xl">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-16 h-16 rounded-full object-cover mr-4" 
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                  <div className="ml-auto flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">{testimonial.text}</p>
              </div>
            </div>
          ))}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">Join thousands of happy customers renting and listing cars on our platform</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="px-10 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <Link href="/cars">Browse Cars Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-10 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-300">
              <Link href="/dashboard">List Your Car</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
