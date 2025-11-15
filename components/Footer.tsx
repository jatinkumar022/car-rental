import Link from 'next/link';
import { Car } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A2E] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-[#00D09C]" />
              <span className="text-xl font-bold text-white">Carido</span>
            </Link>
            <p className="text-gray-400">Your trusted platform for car rentals and listings.</p>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-[#00D09C] transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/my-cars" className="text-gray-400 hover:text-[#00D09C] transition">
                  List Your Car
                </Link>
              </li>
              <li>
                <Link href="/my-cars" className="text-gray-400 hover:text-[#00D09C] transition">
                  Become a Host
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-[#00D09C] transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-[#00D09C] transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-[#00D09C] transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 hover:text-[#00D09C] transition">
                  Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/cars" className="text-gray-400 hover:text-[#00D09C] transition">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link href="/cars" className="text-gray-400 hover:text-[#00D09C] transition">
                  Popular Cities
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Carido. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
