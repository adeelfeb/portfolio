import mongoose from 'mongoose';

const VALENTINE_THEMES = ['classic', 'romantic', 'minimal', 'vintage', 'blush'];
const THEME_COLORS = ['rose', 'crimson', 'blush', 'gold', 'lavender', 'coral'];

const ValentineUrlSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    secretToken: {
      type: String,
      default: null,
      select: false,
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    recipientEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    emailSubject: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },
    emailBody: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },
    emailTheme: {
      type: String,
      default: null,
      trim: true,
      maxlength: 32,
    },
    welcomeText: {
      type: String,
      default: "You've got something special",
      trim: true,
      maxlength: 200,
    },
    mainMessage: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    buttonText: {
      type: String,
      default: 'Open',
      trim: true,
      maxlength: 50,
    },
    theme: {
      type: String,
      enum: VALENTINE_THEMES,
      default: 'classic',
    },
    themeColor: {
      type: String,
      enum: THEME_COLORS,
      default: 'rose',
    },
    decorations: {
      type: [String],
      enum: ['flowers', 'teddy', 'chocolate', 'hearts'],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    createdByName: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ValentineUrlSchema.index({ createdBy: 1, createdAt: -1 });

const ValentineUrl = mongoose.models.ValentineUrl || mongoose.model('ValentineUrl', ValentineUrlSchema);
export default ValentineUrl;
export { VALENTINE_THEMES, THEME_COLORS };
