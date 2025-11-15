'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Car, Calendar, User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Don't show on auth pages or checkout
  const hideOnPaths = ['/auth', '/checkout', '/bookings/confirmation'];
  const shouldHide = hideOnPaths.some(path => pathname?.startsWith(path));

  if (shouldHide) {
    return null;
  }

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
    },
    {
      href: '/cars',
      label: 'Browse',
      icon: Car,
    },
    {
      href: '/my-bookings',
      label: 'Bookings',
      icon: Calendar,
    },
    {
      href: '/favorites',
      label: 'Favorites',
      icon: Heart,
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E5E5EA] md:hidden shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors relative',
                isActive
                  ? 'text-[#00D09C]'
                  : 'text-[#6C6C80] hover:text-[#00D09C]'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 transition-all',
                isActive && 'scale-110'
              )} />
              <span className={cn(
                'text-xs font-medium',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[#00D09C] rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
