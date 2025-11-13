# Carido - Car Rental Platform

A modern, full-featured car rental platform built with Next.js 14, MongoDB, and Cloudinary.

## Features

- 🔐 **User Authentication** - Secure login/registration with NextAuth
- 🚗 **Car Listings** - Owners can list their cars with images
- 🔍 **Search & Filter** - Advanced filtering by type, transmission, fuel, price, location
- 📅 **Booking System** - Easy booking with date selection
- ⭐ **Reviews & Ratings** - Users can review cars after booking
- 💳 **Payment Integration** - Stripe placeholder for payments
- 📱 **Fully Responsive** - Works seamlessly from 320px to desktop
- 🎨 **Modern UI** - Built with Tailwind CSS and Shadcn UI

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js (Credentials)
- **Image Upload:** Cloudinary
- **Styling:** Tailwind CSS + Shadcn UI
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas)
- Cloudinary account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd carido
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local` (or create it)
   - See `ENV_SETUP.md` for detailed instructions

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

See `ENV_SETUP.md` for complete environment variable setup instructions.

Required variables:
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth (min 32 chars)
- `NEXTAUTH_URL` - Application URL
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## Project Structure

```
carido/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Authentication pages
│   ├── cars/             # Car listing and detail pages
│   ├── dashboard/        # User dashboard
│   └── page.tsx          # Home page
├── components/
│   ├── ui/               # Shadcn UI components
│   ├── Navbar.tsx        # Navigation component
│   ├── CarCard.tsx       # Car card component
│   └── BookingCard.tsx   # Booking card component
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # MongoDB connection
│   └── utils.ts          # Utility functions
├── models/               # Mongoose models
└── public/               # Static assets
```

## Features in Detail

### User Roles
- **Renter:** Can browse, book, and review cars
- **Owner:** Can list cars, manage bookings, and view analytics

### Car Management
- Add cars with multiple images
- Edit and delete listings
- Set availability status
- View booking requests

### Booking System
- Date range selection
- Automatic price calculation
- Booking status management
- Payment integration (placeholder)

### Reviews
- Star ratings (1-5)
- Written comments
- Only after completed bookings
- One review per car per user

## Responsive Design

The platform is fully responsive and optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)

Key responsive features:
- Collapsible navigation menu
- Stacked card layouts on mobile
- Full-width buttons on small screens
- Adaptive text sizes

## API Routes

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `GET /api/cars` - List cars (with filters)
- `POST /api/cars` - Create car listing
- `GET /api/cars/[id]` - Get car details
- `PUT /api/cars/[id]` - Update car
- `DELETE /api/cars/[id]` - Delete car
- `GET /api/bookings` - Get bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/[id]` - Update booking status
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Create review
- `POST /api/upload` - Upload image to Cloudinary

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Deployment

1. Set up environment variables on your hosting platform
2. Build the project: `npm run build`
3. Deploy to Vercel, Netlify, or your preferred platform

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
