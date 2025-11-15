import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Car from '@/models/Car';
import { auth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const car = await Car.findById(id).populate('hostId', 'firstName lastName profileImage email phone');

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json({ car }, { status: 200 });
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
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const car = await Car.findById(id);

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    if (!session.user || car.hostId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Map frontend field names to database field names
    const updateData: Record<string, unknown> = { ...body };

    // Map seats to seatingCapacity
    if (body.seats !== undefined) {
      updateData.seatingCapacity = typeof body.seats === 'string' ? parseInt(body.seats) : body.seats;
      delete updateData.seats;
    }

    // Map pricePerDay to dailyPrice
    if (body.pricePerDay !== undefined) {
      updateData.dailyPrice = typeof body.pricePerDay === 'string' ? parseFloat(body.pricePerDay) : body.pricePerDay;
      delete updateData.pricePerDay;
    }

    // Map location to locationCity if locationCity is not provided
    if (body.location && !body.locationCity) {
      updateData.locationCity = body.location;
      delete updateData.location;
    }

    // Handle images - convert string[] to ICarImage[] format if needed
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      if (typeof body.images[0] === 'string') {
        updateData.images = body.images.map((url: string, index: number) => ({
          url,
          isPrimary: index === 0,
          orderIndex: index,
        }));
      }
    }

    const updatedCar = await Car.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json({ car: updatedCar }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const car = await Car.findById(id);

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    if (!session.user || car.hostId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Car.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Car deleted successfully' }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

