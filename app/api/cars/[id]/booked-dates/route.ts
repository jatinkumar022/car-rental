import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const bookings = await Booking.find({
      carId: id,
      status: { $in: ['pending', 'confirmed', 'ongoing'] },
    }).select('startDate endDate');

    const bookedDates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const formatLocalDate = (date: Date) => {
      const offsetMs = date.getTimezoneOffset() * 60 * 1000;
      const local = new Date(date.getTime() - offsetMs);
      return local.toISOString().split('T')[0];
    };
    
    bookings.forEach((booking) => {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      if (end < today) {
        return;
      }

      let currentDate = new Date(start);
      while (currentDate <= end) {
        bookedDates.push(formatLocalDate(currentDate));
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }
    });

    const uniqueBookedDates = [...new Set(bookedDates)].sort();

    return NextResponse.json({ bookedDates: uniqueBookedDates }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

