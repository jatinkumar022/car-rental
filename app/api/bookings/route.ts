import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Car from '@/models/Car';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'renter';

    const query: Record<string, unknown> = {};
    if (role === 'renter') {
      query.renter = session.user.id;
    } else {
      const userCars = await Car.find({ owner: session.user.id }).select('_id');
      query.car = { $in: userCars.map((c) => c._id) };
    }

    const bookings = await Booking.find(query)
      .populate('car', 'make model images pricePerDay')
      .populate('renter', 'name email avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({ bookings }, { status: 200 });
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
    const { carId, startDate, endDate } = body;

    if (!carId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    await dbConnect();

    const car = await Car.findById(carId);
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    if (car.owner.toString() === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot book your own car' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
      return NextResponse.json(
        { error: 'Invalid date range' },
        { status: 400 }
      );
    }

    const existingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start },
        },
      ],
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Car is already booked for these dates' },
        { status: 400 }
      );
    }

    const totalPrice = car.pricePerDay * totalDays;

    const booking = await Booking.create({
      renter: session.user!.id,
      car: carId,
      startDate: start,
      endDate: end,
      totalDays,
      totalPrice,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('car', 'make model images pricePerDay')
      .populate('renter', 'name email avatar');

    return NextResponse.json({ booking: populatedBooking }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

