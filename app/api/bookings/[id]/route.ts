import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { auth } from '@/lib/auth';
import { PopulatedCar, getOwnerId } from '@/types/mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const booking = await Booking.findById(id).populate('car');

    if (!booking || !booking.car) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if car is populated or just an ObjectId
    const car = typeof booking.car === 'object' && '_id' in booking.car 
      ? (booking.car as unknown as PopulatedCar)
      : null;
    
    if (!car) {
      return NextResponse.json({ error: 'Car information not available' }, { status: 404 });
    }

    const carOwnerId = getOwnerId(car.owner);
    const isOwner = carOwnerId === session.user.id;
    const isRenter = booking.renter.toString() === session.user.id;

    if (!isOwner && !isRenter) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate('car', 'make model images pricePerDay').populate('renter', 'name email avatar');

    return NextResponse.json({ booking: updatedBooking }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

