import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import Car from '@/models/Car';
import Booking from '@/models/Booking';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId');

    if (!carId) {
      return NextResponse.json(
        { error: 'Please provide carId' },
        { status: 400 }
      );
    }

    await dbConnect();

    const reviews = await Review.find({ car: carId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { carId, bookingId, rating, comment } = body;

    if (!carId || !bookingId || !rating || !comment) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.renter.toString() !== session.user!.id) {
      return NextResponse.json(
        { error: 'You can only review your own bookings' },
        { status: 403 }
      );
    }

    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'You can only review completed bookings' },
        { status: 400 }
      );
    }

    const existingReview = await Review.findOne({ car: carId, user: session.user!.id });
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this car' },
        { status: 400 }
      );
    }

    const review = await Review.create({
      user: session.user!.id,
      car: carId,
      booking: bookingId,
      rating,
      comment,
    });

    const reviews = await Review.find({ car: carId });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Car.findByIdAndUpdate(carId, {
      rating: avgRating,
      totalReviews: reviews.length,
    });

    const populatedReview = await Review.findById(review._id).populate(
      'user',
      'name avatar'
    );

    return NextResponse.json({ review: populatedReview }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

