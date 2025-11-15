import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBookingExtra {
  name: string;
  price: number;
}

export interface IBooking extends Document {
  carId: mongoose.Types.ObjectId;
  renterId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  pickupTime?: string;
  returnTime?: string;
  totalDays: number;
  dailyRate: number;
  subtotal: number;
  serviceFee: number;
  insuranceFee: number;
  gst: number;
  discount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  cancellationReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  cancelledAt?: Date;
  extras: IBookingExtra[];
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    carId: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    renterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    pickupTime: {
      type: String,
    },
    returnTime: {
      type: String,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    dailyRate: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    serviceFee: {
      type: Number,
      default: 0,
    },
    insuranceFee: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'ongoing', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    cancellationReason: {
      type: String,
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    cancelledAt: {
      type: Date,
    },
    extras: [{
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Database indexes for better query performance
BookingSchema.index({ carId: 1 });
BookingSchema.index({ renterId: 1 });
BookingSchema.index({ hostId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ paymentStatus: 1 });
BookingSchema.index({ startDate: 1, endDate: 1 });
BookingSchema.index({ renterId: 1, status: 1 });
BookingSchema.index({ hostId: 1, status: 1 });

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;

