import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Favorite from '@/models/Favorite';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const favorites = await Favorite.find({ userId: session.user.id })
      .populate('carId', 'make model year images dailyPrice locationCity status')
      .sort({ createdAt: -1 });

    return NextResponse.json({ favorites }, { status: 200 });
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
    const { carId } = body;

    if (!carId) {
      return NextResponse.json(
        { error: 'Please provide carId' },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingFavorite = await Favorite.findOne({
      userId: session.user.id,
      carId: carId,
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Car is already in favorites' },
        { status: 400 }
      );
    }

    const favorite = await Favorite.create({
      userId: session.user.id,
      carId: carId,
    });

    const populatedFavorite = await Favorite.findById(favorite._id)
      .populate('carId', 'make model year images dailyPrice locationCity status');

    return NextResponse.json({ favorite: populatedFavorite }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId');

    if (!carId) {
      return NextResponse.json(
        { error: 'Please provide carId' },
        { status: 400 }
      );
    }

    await dbConnect();

    const favorite = await Favorite.findOneAndDelete({
      userId: session.user.id,
      carId: carId,
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'Favorite not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Favorite removed successfully' },
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

