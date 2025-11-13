import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import Booking from '@/models/Booking';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Please provide bookingId' },
        { status: 400 }
      );
    }

    await dbConnect();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.renter.toString() !== session.user!.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // This is a placeholder for Stripe integration
    // In production, you would integrate with Stripe here
    const payment = await Payment.create({
      booking: bookingId,
      amount: booking.totalPrice,
      status: 'completed', // In production, this would be set after Stripe confirmation
      transactionId: `stripe_${Date.now()}`, // Placeholder
    });

    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      status: 'confirmed',
    });

    return NextResponse.json(
      {
        message: 'Payment processed successfully',
        payment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

