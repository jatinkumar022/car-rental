'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, Car, LogOut, User, Calendar, Bell, Heart, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserStore } from '@/stores/useUserStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [hostDashboardOpen, setHostDashboardOpen] = useState(false);
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false);
  const { profile, fetchProfile } = useUserStore();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session?.user?.id, fetchProfile]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && event.target instanceof Node && !dropdownRef.current.contains(event.target)) {
        setDesktopMenuOpen(false);
        setHostDashboardOpen(false);
      }
    }

    if (desktopMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [desktopMenuOpen]);

  const avatarSrc = profile?.profileImage || profile?.avatar || '';
  const avatarKey = avatarSrc || profile?.firstName || profile?.lastName || session?.user?.name || session?.user?.email || 'no-avatar';

  const userName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : profile?.name || session?.user?.name || 'User';

  const closeAllMenus = () => {
    setDesktopMenuOpen(false);
    setMobileMenuOpen(false);
    setHostDashboardOpen(false);
  };

  const handleSignOutConfirm = () => {
    closeAllMenus();
    setConfirmSignOutOpen(false);
    signOut();
  };

  const handleSignOutRequest = () => {
    setConfirmSignOutOpen(true);
  };

  const handleSignOutCancel = () => {
    setConfirmSignOutOpen(false);
  };

  return (
    <>
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-br from-[#00D09C] to-[#00B386] p-2 rounded-xl group-hover:shadow-lg transition-all duration-300">
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#1A1A2E] to-[#2D2D44] bg-clip-text text-transparent">
              Carido
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/cars"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#00D09C] hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              Browse Cars
            </Link>
            <Link
              href="/#how-it-works"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#00D09C] hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              How it Works
            </Link>
            <Link
              href="/my-cars"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#00D09C] hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              List Your Car
            </Link>
          </div>

          {/* Right Side - Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  type="button"
                  onClick={() => {
                    setDesktopMenuOpen(!desktopMenuOpen);
                    setHostDashboardOpen(false);
                  }}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00D09C] focus:ring-offset-2"
                  aria-label="User menu"
                >
                  <Avatar className="h-9 w-9 ring-2 ring-gray-100" key={avatarKey}>
                    <AvatarImage 
                      src={avatarSrc}
                      alt={userName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-[#00D09C] to-[#00B386] text-white font-semibold text-sm">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-500">View profile</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${desktopMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Custom Dropdown Menu */}
                {desktopMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur animate-in fade-in zoom-in-95 origin-top-right shadow-[0_20px_45px_rgba(15,23,42,0.12)] transition-all duration-200 py-2 overflow-hidden">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100 animate-in fade-in slide-in-from-top-1 duration-300">
                      <p className="text-sm font-semibold text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500">{session.user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#00D09C] transition-all animate-in fade-in slide-in-from-top-2 duration-300 delay-75"
                        onClick={() => setDesktopMenuOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4 text-gray-500" />
                        Profile Settings
                      </Link>
                      
                      <Link
                        href="/my-bookings"
                        className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#00D09C] transition-all animate-in fade-in slide-in-from-top-3 duration-300 delay-100"
                        onClick={() => setDesktopMenuOpen(false)}
                      >
                        <Calendar className="mr-3 h-4 w-4 text-gray-500" />
                        My Bookings
                      </Link>
                      
                      <Link
                        href="/messages"
                        className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#00D09C] transition-all animate-in fade-in slide-in-from-top-4 duration-300 delay-150"
                        onClick={() => setDesktopMenuOpen(false)}
                      >
                        <Bell className="mr-3 h-4 w-4 text-gray-500" />
                        Messages
                      </Link>
                      
                      <Link
                        href="/favorites"
                        className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#00D09C] transition-all animate-in fade-in slide-in-from-top-5 duration-300 delay-200"
                        onClick={() => setDesktopMenuOpen(false)}
                      >
                        <Heart className="mr-3 h-4 w-4 text-gray-500" />
                        Favorites
                      </Link>
                    </div>

                    {/* Host Dashboard Section */}
                    <div className="border-t border-gray-100 animate-in fade-in slide-in-from-top-6 duration-300 delay-300">
                      <button
                        onClick={() => setHostDashboardOpen(!hostDashboardOpen)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#00D09C] transition-all"
                      >
                        <div className="flex items-center">
                          <Car className="mr-3 h-4 w-4 text-gray-500" />
                          Host Dashboard
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${hostDashboardOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Host Dashboard Submenu */}
                      {hostDashboardOpen && (
                        <div className="bg-gray-50 border-t border-gray-100">
                          <Link
                            href="/my-cars"
                            className="flex items-center px-4 py-2.5 pl-12 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#00D09C] transition-all animate-in fade-in slide-in-from-top-1 duration-300"
                            onClick={() => setDesktopMenuOpen(false)}
                          >
                            Manage Cars
                          </Link>
                          <Link
                            href="/my-cars/bookings"
                            className="flex items-center px-4 py-2.5 pl-12 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[#00D09C] transition-all animate-in fade-in slide-in-from-top-2 duration-300 delay-75"
                            onClick={() => setDesktopMenuOpen(false)}
                          >
                            Car Bookings
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-100 pt-2 animate-in fade-in slide-in-from-top-7 duration-300 delay-350">
                      <button
                        onClick={handleSignOutRequest}
                        className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" className="text-sm font-medium hover:bg-gray-50">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-[#00D09C] to-[#00B386] hover:from-[#00B386] hover:to-[#009876] text-white shadow-md hover:shadow-lg transition-all duration-200">
                  <Link href="/auth/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="px-4 py-6 space-y-4">
            {session ? (
              <>
                {/* User Info Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-1 duration-500">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm" key={avatarKey}>
                      <AvatarImage src={avatarSrc} alt={userName} />
                      <AvatarFallback className="bg-gradient-to-br from-[#00D09C] to-[#00B386] text-white font-semibold">
                        {userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-600">{session.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* User Menu Links */}
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#00D09C] rounded-lg transition-all active:scale-95 animate-in fade-in slide-in-from-top-2 duration-500 delay-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5 text-gray-400" />
                    <span>Profile Settings</span>
                  </Link>
                  <Link
                    href="/my-bookings"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#00D09C] rounded-lg transition-all active:scale-95 animate-in fade-in slide-in-from-top-3 duration-500 delay-150"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span>My Bookings</span>
                  </Link>
                  <Link
                    href="/messages"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#00D09C] rounded-lg transition-all active:scale-95 animate-in fade-in slide-in-from-top-4 duration-500 delay-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Bell className="h-5 w-5 text-gray-400" />
                    <span>Messages</span>
                  </Link>
                  <Link
                    href="/favorites"
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#00D09C] rounded-lg transition-all active:scale-95 animate-in fade-in slide-in-from-top-5 duration-500 delay-250"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5 text-gray-400" />
                    <span>Favorites</span>
                  </Link>
                </div>

                {/* Host Tools Section */}
                <div className="pt-2 animate-in fade-in slide-in-from-top-6 duration-500 delay-300">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Host Dashboard
                    </p>
                    <div className="h-px flex-1 bg-gray-200 ml-3"></div>
                  </div>
                  <div className="space-y-1 mt-2">
                    <Link
                      href="/my-cars"
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#00D09C] rounded-lg transition-all active:scale-95 animate-in fade-in slide-in-from-top-7 duration-500 delay-350"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Car className="h-5 w-5 text-gray-400" />
                      <span>Manage Cars</span>
                    </Link>
                    <Link
                      href="/my-cars/bookings"
                      className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#00D09C] rounded-lg transition-all active:scale-95 animate-in fade-in slide-in-from-top-8 duration-500 delay-400"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span>Car Bookings</span>
                    </Link>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="animate-in fade-in slide-in-from-top-9 duration-500 delay-450">
                  <Button
                    variant="outline"
                    className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 active:scale-95 transition-all"
                    onClick={handleSignOutRequest}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <Button asChild variant="outline" className="w-full active:scale-95 transition-all">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-[#00D09C] to-[#00B386] hover:from-[#00B386] hover:to-[#009876] text-white shadow-md active:scale-95 transition-all"
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
    </nav>

    <Dialog open={confirmSignOutOpen} onOpenChange={setConfirmSignOutOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Sign out?</DialogTitle>
          <DialogDescription>
            You&apos;ll need to log in again to access your bookings and host tools.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={handleSignOutCancel}>
            Stay Logged In
          </Button>
          <Button onClick={handleSignOutConfirm} className="bg-red-600 hover:bg-red-700">
            Sign Out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}