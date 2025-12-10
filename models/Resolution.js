import mongoose from 'mongoose';

const ResolutionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please provide a title for your resolution'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  category: {
    type: String,
    enum: ['Health', 'Career', 'Finance', 'Education', 'Personal', 'Other'],
    default: 'Other',
  },
  targetDate: {
    type: Date,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  reminderFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'none'],
    default: 'weekly',
  },
  notificationEnabled: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Resolution || mongoose.model('Resolution', ResolutionSchema);

