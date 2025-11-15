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

    const reviews = await Review.find({ carId: carId })
      .populate('reviewerId', 'firstName lastName profileImage')
      .populate('reviewedId', 'firstName lastName profileImage')
      .sort({ createdAt: -1 });

    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
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

    if (booking.renterId.toString() !== session.user!.id) {
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

    const car = await Car.findById(carId);
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const existingReview = await Review.findOne({ 
      carId: carId, 
      reviewerId: session.user!.id,
      bookingId: bookingId,
    });
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this booking' },
        { status: 400 }
      );
    }

    const review = await Review.create({
      reviewerId: session.user!.id,
      reviewedId: car.hostId,
      carId: carId,
      bookingId: bookingId,
      rating,
      reviewText: comment,
    });

    const reviews = await Review.find({ carId: carId });
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    await Car.findByIdAndUpdate(carId, {
      rating: avgRating,
      totalTrips: reviews.length,
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewerId', 'firstName lastName profileImage')
      .populate('reviewedId', 'firstName lastName profileImage');

    return NextResponse.json({ review: populatedReview }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

