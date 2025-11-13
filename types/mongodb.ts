import mongoose from 'mongoose';

export interface PopulatedCarOwner {
  _id: mongoose.Types.ObjectId;
  name: string;
  avatar?: string;
  email?: string;
  phone?: string;
}

export interface PopulatedCar {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId | PopulatedCarOwner;
  make: string;
  model: string;
  year: number;
  type: string;
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  seats: number;
  pricePerDay: number;
  location: string;
  images: string[];
  description: string;
  features: string[];
  available: boolean;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export function getOwnerId(owner: mongoose.Types.ObjectId | PopulatedCarOwner): string {
  if (owner instanceof mongoose.Types.ObjectId) {
    return owner.toString();
  }
  return owner._id.toString();
}

export type CarQuery = {
  available?: boolean;
  owner?: string | mongoose.Types.ObjectId;
  type?: string;
  transmission?: string;
  fuelType?: string;
  location?: string | { $regex: string; $options: string };
  pricePerDay?: number | { $gte?: number; $lte?: number };
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
  car?: { $in: mongoose.Types.ObjectId[] };
};

