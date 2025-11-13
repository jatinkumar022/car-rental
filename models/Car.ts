import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICar extends Omit<Document, 'model'> {
  owner: mongoose.Types.ObjectId;
  make: string;
  model: string; // Car model name (e.g., "Camry")
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

const CarSchema: Schema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    make: {
      type: String,
      required: [true, 'Please provide car make'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Please provide car model'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Please provide car year'],
      min: [1900, 'Year must be valid'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
    type: {
      type: String,
      required: [true, 'Please provide car type'],
      trim: true,
    },
    transmission: {
      type: String,
      enum: ['automatic', 'manual'],
      required: true,
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid'],
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: [2, 'Car must have at least 2 seats'],
      max: [20, 'Car cannot have more than 20 seats'],
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Please provide price per day'],
      min: [0, 'Price cannot be negative'],
    },
    location: {
      type: String,
      required: [true, 'Please provide location'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
      trim: true,
    },
    features: {
      type: [String],
      default: [],
    },
    available: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Car: Model<ICar> = mongoose.models.Car || mongoose.model<ICar>('Car', CarSchema);

export default Car;

