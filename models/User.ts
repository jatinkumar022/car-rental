import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
  dateOfBirth?: Date;
  licenseNumber?: string;
  licenseExpiry?: Date;
  userType: 'renter' | 'host' | 'both';
  verified: boolean;
  rating: number;
  totalTrips: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    licenseNumber: {
      type: String,
      trim: true,
    },
    licenseExpiry: {
      type: Date,
    },
    userType: {
      type: String,
      enum: ['renter', 'host', 'both'],
      default: 'renter',
    },
    verified: {
      type: Boolean,
      default: false,
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
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ userType: 1 });
UserSchema.index({ verified: 1 });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

