import Link from 'next/link';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-6 w-6 text-[#6366f1] sm:h-8 sm:w-8" />
              <span className="text-xl font-bold text-[#6366f1]">Carido</span>
            </Link>
            <p className="text-sm text-gray-600">
              Your trusted car rental platform. Find the perfect vehicle for your journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cars" className="text-gray-600 transition-colors hover:text-[#6366f1]">
                  Browse Cars
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 transition-colors hover:text-[#6366f1]">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-600 transition-colors hover:text-[#6366f1]">
                  Become an Owner
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-600 transition-colors hover:text-[#6366f1]">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 transition-colors hover:text-[#6366f1]">
                  Safety
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 transition-colors hover:text-[#6366f1]">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@carido.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 1800-XXX-XXXX</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Carido. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

