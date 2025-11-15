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
      query.renterId = session.user.id;
    } else {
      const userCars = await Car.find({ hostId: session.user.id }).select('_id');
      query.carId = { $in: userCars.map((c) => c._id) };
    }

    const bookings = await Booking.find(query)
      .populate('carId', 'make model images dailyPrice')
      .populate('renterId', 'firstName lastName email profileImage')
      .populate('hostId', 'firstName lastName email profileImage')
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
    const { carId, startDate, endDate, pickupTime, returnTime, totalDays: providedTotalDays, dailyRate: providedDailyRate, subtotal: providedSubtotal, serviceFee: providedServiceFee, insuranceFee: providedInsuranceFee, gst: providedGst, totalAmount: providedTotalAmount } = body;

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

    if (car.hostId.toString() === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot book your own car' },
        { status: 400 }
      );
    }

    if (car.status !== 'active') {
      return NextResponse.json(
        { error: 'This car is currently unavailable for booking' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const calculatedTotalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalDays = providedTotalDays || calculatedTotalDays;

    if (totalDays <= 0) {
      return NextResponse.json(
        { error: 'Invalid date range' },
        { status: 400 }
      );
    }

    const existingBooking = await Booking.findOne({
      carId: carId,
      status: { $in: ['pending', 'confirmed', 'ongoing'] },
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

    // Use provided pricing or calculate
    const dailyRate = providedDailyRate || car.dailyPrice;
    const subtotal = providedSubtotal || (dailyRate * totalDays);
    const serviceFee = providedServiceFee || (subtotal * 0.10); // 10% service fee
    const insuranceFee = providedInsuranceFee || (150 * totalDays); // ₹150 per day
    const gst = providedGst || ((subtotal + serviceFee + insuranceFee) * 0.18); // 18% GST
    const totalAmount = providedTotalAmount || (subtotal + serviceFee + insuranceFee + gst);

    const booking = await Booking.create({
      renterId: session.user!.id,
      hostId: car.hostId,
      carId: carId,
      startDate: start,
      endDate: end,
      pickupTime: pickupTime || '10:00',
      returnTime: returnTime || '10:00',
      totalDays,
      dailyRate,
      subtotal,
      serviceFee,
      insuranceFee,
      gst,
      discount: 0, // Can be added later for coupons
      totalAmount,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('carId', 'make model images dailyPrice')
      .populate('renterId', 'firstName lastName email profileImage')
      .populate('hostId', 'firstName lastName email profileImage');

    return NextResponse.json({ booking: populatedBooking }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

