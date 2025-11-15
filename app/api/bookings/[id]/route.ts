import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import { auth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // First, get booking to check renter
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is renter
    const isRenter = booking.renterId.toString() === session.user.id;
    
    // Check if user is host
    const isHost = booking.hostId.toString() === session.user.id;

    if (!isHost && !isRenter) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Now populate all data
    const populatedBooking = await Booking.findById(id)
      .populate('carId', 'make model year images dailyPrice locationCity locationAddress transmission fuelType seatingCapacity')
      .populate('renterId', 'firstName lastName email profileImage phone')
      .populate('hostId', 'firstName lastName email profileImage phone');

    if (!populatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking: populatedBooking }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

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
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isHost = booking.hostId.toString() === session.user.id;
    const isRenter = booking.renterId.toString() === session.user.id;

    if (!isHost && !isRenter) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).populate('carId', 'make model images dailyPrice').populate('renterId', 'firstName lastName email profileImage').populate('hostId', 'firstName lastName email profileImage');

    return NextResponse.json({ booking: updatedBooking }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

