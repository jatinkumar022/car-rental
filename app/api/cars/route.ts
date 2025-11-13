import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Car from '@/models/Car';
import { auth } from '@/lib/auth';

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

    const query: any = { available: true };

    if (ownerId) {
      query.owner = ownerId;
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
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minPrice) query.pricePerDay = { ...query.pricePerDay, $gte: parseFloat(minPrice) };
    if (maxPrice) {
      query.pricePerDay = {
        ...query.pricePerDay,
        $lte: parseFloat(maxPrice),
      };
    }

    const skip = (page - 1) * limit;
    const cars = await Car.find(query)
      .populate('owner', 'name avatar')
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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
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

    const car = await Car.create({
      ...body,
      owner: session.user.id,
    });

    return NextResponse.json({ car }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

