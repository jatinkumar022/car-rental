import mongoose, { Schema, Model } from 'mongoose';

export interface IDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  carId?: mongoose.Types.ObjectId;
  documentType: 'license' | 'rc' | 'insurance' | 'puc';
  documentUrl: string;
  verified: boolean;
  expiryDate?: Date;
  createdAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    carId: {
      type: Schema.Types.ObjectId,
      ref: 'Car',
    },
    documentType: {
      type: String,
      enum: ['license', 'rc', 'insurance', 'puc'],
      required: true,
    },
    documentUrl: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Database indexes for better query performance
DocumentSchema.index({ userId: 1 });
DocumentSchema.index({ carId: 1 });
DocumentSchema.index({ documentType: 1 });
DocumentSchema.index({ verified: 1 });
DocumentSchema.index({ userId: 1, documentType: 1 });

const Document: Model<IDocument> = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);

export default Document;

