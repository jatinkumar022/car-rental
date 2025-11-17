import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  booking: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'card' | 'upi' | 'wallet' | 'netbanking';
  transactionId?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  createdAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'wallet', 'netbanking'],
      default: 'card',
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Keep booking and bookingId in sync (supports legacy indexes)
PaymentSchema.pre('save', function (next) {
  if (!this.booking && this.bookingId) {
    this.booking = this.bookingId as mongoose.Types.ObjectId;
  }
  if (!this.bookingId && this.booking) {
    this.bookingId = this.booking as mongoose.Types.ObjectId;
  }
  next();
});

// Database indexes for better performance (allow multiple payments per booking in demo)
PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ userId: 1, createdAt: -1 });

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;

