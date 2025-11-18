import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICarImage {
  url: string;
  isPrimary: boolean;
  orderIndex: number;
}

export interface ICar extends Omit<Document, 'model'> {
  hostId: mongoose.Types.ObjectId;
  make: string;
  model: string; // Car model name (e.g., "Camry")
  year: number;
  type?: string; // Car type (e.g., "Sedan", "SUV", "Hatchback")
  registrationNumber?: string;
  color?: string;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'cng';
  transmission: 'automatic' | 'manual';
  seatingCapacity: number;
  mileage?: string;
  description: string;
  dailyPrice: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  locationAddress?: string;
  locationCity?: string;
  locationState?: string;
  locationLat?: number;
  locationLng?: number;
  status: 'pending' | 'active' | 'inactive' | 'suspended';
  images: ICarImage[];
  features: string[];
  rating: number;
  totalTrips: number;
  createdAt: Date;
  updatedAt: Date;
}

const CarSchema: Schema = new Schema(
  {
    hostId: {
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
      trim: true,
    },
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'cng'],
      required: true,
    },
    transmission: {
      type: String,
      enum: ['automatic', 'manual'],
      required: true,
    },
    seatingCapacity: {
      type: Number,
      required: true,
      min: [2, 'Car must have at least 2 seats'],
      max: [20, 'Car cannot have more than 20 seats'],
    },
    mileage: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
      trim: true,
    },
    dailyPrice: {
      type: Number,
      required: [true, 'Please provide price per day'],
      min: [0, 'Price cannot be negative'],
    },
    weeklyDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    monthlyDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    locationAddress: {
      type: String,
      trim: true,
    },
    locationCity: {
      type: String,
      trim: true,
    },
    locationState: {
      type: String,
      trim: true,
    },
    locationLat: {
      type: Number,
    },
    locationLng: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'inactive', 'suspended'],
      default: 'pending',
    },
    images: [{
      url: {
        type: String,
        required: true,
      },
      isPrimary: {
        type: Boolean,
        default: false,
      },
      orderIndex: {
        type: Number,
        default: 0,
      },
    }],
    features: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalTrips: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Database indexes for better query performance
CarSchema.index({ hostId: 1 });
CarSchema.index({ status: 1 });
CarSchema.index({ locationCity: 1 });
CarSchema.index({ locationState: 1 });
CarSchema.index({ dailyPrice: 1 });
CarSchema.index({ make: 1, model: 1 });
CarSchema.index({ fuelType: 1, transmission: 1 });
CarSchema.index({ 'locationLat': 1, 'locationLng': 1 }); // For geospatial queries

const Car: Model<ICar> = mongoose.models.Car || mongoose.model<ICar>('Car', CarSchema);

export default Car;

