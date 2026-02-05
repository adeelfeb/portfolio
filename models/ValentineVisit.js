import mongoose from 'mongoose';

const ValentineVisitSchema = new mongoose.Schema(
  {
    valentineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ValentineUrl',
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    visitedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    referrer: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2048,
    },
    userAgent: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1024,
    },
    deviceType: {
      type: String,
      default: '',
      trim: true,
      maxlength: 32,
    },
    browser: {
      type: String,
      default: '',
      trim: true,
      maxlength: 64,
    },
    accessPayload: {
      type: String,
      default: '',
      trim: true,
      maxlength: 4096,
    },
    buttonClicks: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: false, versionKey: false }
);

ValentineVisitSchema.index({ valentineId: 1, sessionId: 1 }, { unique: true });
ValentineVisitSchema.index({ valentineId: 1, visitedAt: -1 });

const ValentineVisit =
  mongoose.models.ValentineVisit || mongoose.model('ValentineVisit', ValentineVisitSchema);
export default ValentineVisit;
