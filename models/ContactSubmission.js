import mongoose from 'mongoose';

const ContactSubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
    },
    projectDetails: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ContactSubmissionSchema.index({ createdAt: -1 });

const ContactSubmission =
  mongoose.models.ContactSubmission ||
  mongoose.model('ContactSubmission', ContactSubmissionSchema);

export default ContactSubmission;
