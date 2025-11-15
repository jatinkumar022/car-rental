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

    if (booking.renterId.toString() !== session.user!.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // DUMMY PAYMENT - Always succeeds
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const payment = await Payment.create({
      bookingId: bookingId,
      userId: session.user!.id,
      amount: booking.totalAmount,
      paymentMethod: body.paymentMethod || 'card',
      status: 'success', // Always success for dummy payment
      transactionId: transactionId,
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

