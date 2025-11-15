import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Car from '@/models/Car';
import { auth } from '@/lib/auth';
import { CarQuery } from '@/types/mongodb';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const transmission = searchParams.get('transmission') || '';
    const fuelType = searchParams.get('fuelType') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const location = searchParams.get('location') || '';
    const ownerId = searchParams.get('ownerId') || '';

    const query: CarQuery = {};

    // Only filter by active status for public browsing (not when viewing host's own cars)
    if (!ownerId) {
      query.status = 'active';
    }

    if (ownerId) {
      query.hostId = ownerId;
    }

    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (type) query.type = type;
    if (transmission) query.transmission = transmission;
    if (fuelType) query.fuelType = fuelType;
    if (location) {
      query.$or = [
        { locationCity: { $regex: location, $options: 'i' } },
        { locationAddress: { $regex: location, $options: 'i' } },
      ];
    }
    
    // Handle price range
    if (minPrice || maxPrice) {
      const priceQuery: { $gte?: number; $lte?: number } = {};
      if (minPrice) priceQuery.$gte = parseFloat(minPrice);
      if (maxPrice) priceQuery.$lte = parseFloat(maxPrice);
      query.dailyPrice = priceQuery;
    }

    const skip = (page - 1) * limit;
    const cars = await Car.find(query)
      .populate('hostId', 'firstName lastName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Car.countDocuments(query);

    return NextResponse.json(
      {
        cars,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
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
    await dbConnect();

    // Map frontend field names to database field names
    const carData: Record<string, unknown> = {
      ...body,
      hostId: session.user.id,
    };

    // Map seats to seatingCapacity
    if (body.seats !== undefined && body.seats !== null) {
      const seatsValue = typeof body.seats === 'string' ? parseInt(body.seats) : body.seats;
      if (!isNaN(seatsValue) && seatsValue > 0) {
        carData.seatingCapacity = seatsValue;
      }
      delete carData.seats;
    }
    
    // Ensure seatingCapacity is set (required field)
    if (!carData.seatingCapacity) {
      return NextResponse.json(
        { error: 'seatingCapacity is required' },
        { status: 400 }
      );
    }

    // Map pricePerDay to dailyPrice
    if (body.pricePerDay !== undefined && body.pricePerDay !== null) {
      const priceValue = typeof body.pricePerDay === 'string' ? parseFloat(body.pricePerDay) : body.pricePerDay;
      if (!isNaN(priceValue) && priceValue >= 0) {
        carData.dailyPrice = priceValue;
      }
      delete carData.pricePerDay;
    }
    
    // Ensure dailyPrice is set (required field)
    if (carData.dailyPrice === undefined || carData.dailyPrice === null || 
        (typeof carData.dailyPrice === 'number' && isNaN(carData.dailyPrice))) {
      return NextResponse.json(
        { error: 'dailyPrice is required' },
        { status: 400 }
      );
    }

    // Map location to locationCity if locationCity is not provided
    if (body.location && !body.locationCity) {
      carData.locationCity = body.location;
      delete carData.location;
    }

    // Handle images - convert string[] to ICarImage[] format if needed
    if (body.images && Array.isArray(body.images) && body.images.length > 0) {
      if (typeof body.images[0] === 'string') {
        carData.images = body.images.map((url: string, index: number) => ({
          url,
          isPrimary: index === 0,
          orderIndex: index,
        }));
      }
    }

    const car = await Car.create(carData);

    return NextResponse.json({ car }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

