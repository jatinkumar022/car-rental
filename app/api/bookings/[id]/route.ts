import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Car from '@/models/Car';
import { auth } from '@/lib/auth';

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

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const car = booking.car as any;
    const isOwner = car.owner.toString() === session.user.id;
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

