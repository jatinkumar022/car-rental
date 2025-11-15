'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, Car, LogOut, User, Calendar, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserStore } from '@/stores/useUserStore';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { profile, fetchProfile } = useUserStore();

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id, fetchProfile]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#E5E5EA] bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-[#00D09C]" />
            <span className="text-xl font-bold text-[#1A1A2E]">
              Carido
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-6 md:flex">
            <Link
              href="/cars"
              className="text-sm font-semibold text-[#2D2D44] transition-colors hover:text-[#00D09C]"
            >
              Browse Cars
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-semibold text-[#2D2D44] transition-colors hover:text-[#00D09C]"
            >
              How it Works
            </Link>
            <Link
              href="/my-cars"
              className="text-sm font-semibold text-[#2D2D44] transition-colors hover:text-[#00D09C]"
            >
              List Your Car
            </Link>
            {session ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      type="button"
                      className="relative h-10 w-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
                      aria-label="User menu"
                    >
                      <Avatar className="h-10 w-10 border-2 border-gray-200 ring-2 ring-white" key={profile?.avatar || 'no-avatar'}>
                        <AvatarImage 
                          src={profile?.avatar || ''} 
                          alt={session.user?.name || 'User'}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-linear-to-br from-blue-600 to-purple-600 text-white font-semibold text-base flex items-center justify-center">
                          {session.user?.name?.charAt(0).toUpperCase() || session.user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">
                        {profile?.firstName && profile?.lastName
                          ? `${profile.firstName} ${profile.lastName}`
                          : profile?.name || session.user.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-cars" className="cursor-pointer">
                        <Car className="mr-2 h-4 w-4" />
                        My Cars
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/my-bookings" className="cursor-pointer">
                        <Calendar className="mr-2 h-4 w-4" />
                        My Bookings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/messages" className="cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        Messages
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Favorites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="cursor-pointer text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="bg-[#00D09C] hover:bg-[#00B386] text-white">
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <div className="flex flex-col space-y-3">
              <Link
                href="/cars"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-[#2563EB]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Cars
              </Link>
              {session ? (
                <>
                  <div className="flex items-center space-x-3 pt-2">
                    <Avatar className="h-10 w-10 border-2 border-gray-200" key={profile?.profileImage || profile?.avatar || 'no-avatar'}>
                      <AvatarImage src={profile?.profileImage || profile?.avatar || ''} alt={session.user?.name || 'User'} />
                      <AvatarFallback className="bg-[#00D09C] text-white font-semibold text-base flex items-center justify-center">
                        {(profile?.firstName?.charAt(0) || session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {profile?.firstName && profile?.lastName
                          ? `${profile.firstName} ${profile.lastName}`
                          : profile?.name || session.user.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/my-cars"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#6366f1]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Cars
                  </Link>
                  <Link
                    href="/my-bookings"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#6366f1]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <Link
                    href="/profile"
                    className="text-sm font-medium text-gray-700 transition-colors hover:text-[#6366f1]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-linear-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white"
                  >
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

