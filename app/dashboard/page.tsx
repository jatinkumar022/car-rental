'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Car, 
  Calendar, 
  IndianRupee, 
  TrendingUp, 
  Eye, 
  Star,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Loader from '@/components/Loader';
import { useCarStore } from '@/stores/useCarStore';
import { useBookingStore } from '@/stores/useBookingStore';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { stats: carStats, fetchStats: fetchCarStats } = useCarStore();
  const { stats: bookingStats, fetchRenterBookings, fetchOwnerBookings } = useBookingStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.id) {
      loadDashboardData();
    }
  }, [status, router, session?.user?.id]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCarStats(),
        fetchRenterBookings(),
        fetchOwnerBookings(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F7F7FA] flex items-center justify-center">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!session) return null;

  const isHost = session.user.role === 'owner' || session.user.role === 'host' || session.user.role === 'both';

  return (
    <div className="min-h-screen bg-[#F7F7FA] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-base text-[#6C6C80] sm:text-lg">
            Overview of your activity and statistics
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button asChild variant="outline" className="h-auto p-4 border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]">
            <Link href="/cars" className="flex flex-col items-center gap-2">
              <Car className="h-6 w-6" />
              <span className="font-semibold">Browse Cars</span>
            </Link>
          </Button>
          {isHost && (
            <Button asChild variant="outline" className="h-auto p-4 border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]">
              <Link href="/my-cars" className="flex flex-col items-center gap-2">
                <Car className="h-6 w-6" />
                <span className="font-semibold">My Cars</span>
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="h-auto p-4 border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]">
            <Link href="/my-bookings" className="flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span className="font-semibold">My Bookings</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto p-4 border-[#00D09C] text-[#00D09C] hover:bg-[#E6FFF9]">
            <Link href="/favorites" className="flex flex-col items-center gap-2">
              <Star className="h-6 w-6" />
              <span className="font-semibold">Favorites</span>
            </Link>
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6C6C80] mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{bookingStats.totalBookings}</p>
                </div>
                <div className="p-3 bg-[#E6F3FF] rounded-lg">
                  <Calendar className="h-6 w-6 text-[#2196F3]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6C6C80] mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">{bookingStats.upcomingBookings}</p>
                </div>
                <div className="p-3 bg-[#E6FFF9] rounded-lg">
                  <Clock className="h-6 w-6 text-[#00D09C]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#6C6C80] mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-[#1A1A2E]">₹{bookingStats.totalSpent.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-[#E6FFF9] rounded-lg">
                  <IndianRupee className="h-6 w-6 text-[#00D09C]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {isHost && (
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#6C6C80] mb-1">My Cars</p>
                    <p className="text-2xl font-bold text-[#1A1A2E]">{carStats.totalCars || 0}</p>
                  </div>
                  <div className="p-3 bg-[#E6FFF9] rounded-lg">
                    <Car className="h-6 w-6 text-[#00D09C]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
            <CardHeader>
              <CardTitle className="text-[#1A1A2E]">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookingStats.totalBookings > 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-[#6C6C80] mx-auto mb-4" />
                    <p className="text-[#6C6C80] mb-4">View all your bookings</p>
                    <Button asChild className="bg-[#00D09C] hover:bg-[#00B386] text-white">
                      <Link href="/my-bookings">View All Bookings</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-[#6C6C80] mx-auto mb-4" />
                    <p className="text-[#6C6C80] mb-4">No bookings yet</p>
                    <Button asChild className="bg-[#00D09C] hover:bg-[#00B386] text-white">
                      <Link href="/cars">Browse Cars</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isHost && (
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="text-[#1A1A2E]">My Cars</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {carStats.totalCars > 0 ? (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 text-[#6C6C80] mx-auto mb-4" />
                      <p className="text-[#6C6C80] mb-4">Manage your car listings</p>
                      <Button asChild className="bg-[#00D09C] hover:bg-[#00B386] text-white">
                        <Link href="/my-cars">Manage Cars</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Car className="h-12 w-12 text-[#6C6C80] mx-auto mb-4" />
                      <p className="text-[#6C6C80] mb-4">List your first car</p>
                      <Button asChild className="bg-[#00D09C] hover:bg-[#00B386] text-white">
                        <Link href="/my-cars">List Your Car</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

