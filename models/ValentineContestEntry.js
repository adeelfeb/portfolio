import mongoose from 'mongoose';

const ValentineContestEntrySchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    /** Set by admin when selecting the featured message for the page */
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    /** Ranking order (1, 2, 3...) set by developer. Lower number = higher rank. */
    rank: {
      type: Number,
      default: null,
      min: 1,
      index: true,
    },
  },
  { timestamps: true, versionKey: false }
);

ValentineContestEntrySchema.index({ rank: 1, createdAt: -1 });
ValentineContestEntrySchema.index({ createdAt: -1 });

const ValentineContestEntry =
  mongoose.models.ValentineContestEntry ||
  mongoose.model('ValentineContestEntry', ValentineContestEntrySchema);

export default ValentineContestEntry;
