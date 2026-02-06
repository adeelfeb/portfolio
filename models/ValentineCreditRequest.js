import mongoose from 'mongoose';

const ValentineCreditRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userEmail: { type: String, trim: true, lowercase: true },
    userName: { type: String, trim: true },
    requestedCredits: {
      type: Number,
      required: true,
      min: 1,
      default: 5,
    },
    amountUsd: { type: Number, default: 2 },
    amountPkr: { type: Number, default: 500 },
    message: { type: String, trim: true, maxlength: 500, default: '' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'rejected'],
      default: 'pending',
      index: true,
    },
    processedAt: { type: Date, default: null },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ValentineCreditRequestSchema.index({ status: 1, createdAt: -1 });

const ValentineCreditRequest =
  mongoose.models.ValentineCreditRequest ||
  mongoose.model('ValentineCreditRequest', ValentineCreditRequestSchema);
export default ValentineCreditRequest;
