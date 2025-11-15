import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Car from '@/models/Car';
import { auth } from '@/lib/auth';
import { PopulatedCar, getOwnerId } from '@/types/mongodb';

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
    const isRenter = booking.renter.toString() === session.user.id;
    
    // Get car to check if user is owner
    const car = await Car.findById(booking.car).populate('owner', 'name email avatar phone');
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Check if user is owner
    let carOwnerId: string;
    if (typeof car.owner === 'object' && car.owner !== null && '_id' in car.owner) {
      carOwnerId = car.owner._id.toString();
    } else {
      carOwnerId = String(car.owner);
    }
    const isOwner = carOwnerId === session.user.id;

    if (!isOwner && !isRenter) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Now populate all data
    const populatedBooking = await Booking.findById(id)
      .populate('car', 'make model year images pricePerDay location type transmission fuelType seats')
      .populate('renter', 'name email avatar phone');

    if (!populatedBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Convert to object and add owner
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookingObj: any = populatedBooking.toObject();
    if (car.owner && typeof car.owner === 'object' && car.owner !== null && '_id' in car.owner) {
      bookingObj.owner = car.owner;
    } else if (car.owner) {
      // Fetch owner if not populated
      const User = (await import('@/models/User')).default;
      const ownerUser = await User.findById(car.owner).select('name email avatar phone');
      if (ownerUser) {
        bookingObj.owner = ownerUser.toObject();
      }
    }

    return NextResponse.json({ booking: bookingObj }, { status: 200 });
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

