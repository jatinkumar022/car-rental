import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAvailability extends Document {
  carId: mongoose.Types.ObjectId;
  date: Date;
  isAvailable: boolean;
  priceOverride?: number;
  createdAt: Date;
}

const AvailabilitySchema: Schema = new Schema(
  {
    carId: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    priceOverride: {
      type: Number,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Database indexes for better query performance
AvailabilitySchema.index({ carId: 1, date: 1 }, { unique: true });
AvailabilitySchema.index({ carId: 1, isAvailable: 1 });
AvailabilitySchema.index({ date: 1 });

const Availability: Model<IAvailability> = mongoose.models.Availability || mongoose.model<IAvailability>('Availability', AvailabilitySchema);

export default Availability;

