import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  bookingId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  reviewedId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  rating: number;
  reviewText?: string;
  cleanlinessRating?: number;
  communicationRating?: number;
  accuracyRating?: number;
  response?: string;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    carId: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewText: {
      type: String,
      trim: true,
    },
    cleanlinessRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    communicationRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    accuracyRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    response: {
      type: String,
      trim: true,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Database indexes for better query performance
ReviewSchema.index({ carId: 1 });
ReviewSchema.index({ reviewerId: 1 });
ReviewSchema.index({ reviewedId: 1 });
ReviewSchema.index({ bookingId: 1 });
ReviewSchema.index({ carId: 1, createdAt: -1 });

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;

