import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
    },
    featuredImage: {
      type: String,
      default: null,
    },
    featuredImageType: {
      type: String,
      enum: ['url', 'upload'],
      default: 'url',
    },
    // Additional images for portfolio gallery
    galleryImages: {
      type: [String],
      default: [],
    },
    // SEO Fields
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    metaKeywords: {
      type: [String],
      default: [],
    },
    ogImage: {
      type: String,
      default: null,
    },
    // Status and Publishing
    status: {
      type: String,
      enum: ['draft', 'pending', 'published'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    // Categories and Tags
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    // Portfolio specific fields
    projectUrl: {
      type: String,
      default: null,
    },
    githubUrl: {
      type: String,
      default: null,
    },
    technologies: {
      type: [String],
      default: [],
    },
    clientName: {
      type: String,
      default: null,
    },
    projectDate: {
      type: Date,
      default: null,
    },
    // Author
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    // Analytics
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Generate slug from title before save
PortfolioSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Auto-generate metaTitle if not provided
  if (!this.metaTitle && this.title) {
    this.metaTitle = this.title.substring(0, 60);
  }
  
  // Auto-generate metaDescription from description if not provided
  if (!this.metaDescription && this.description) {
    this.metaDescription = this.description.substring(0, 160);
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Index for better query performance
PortfolioSchema.index({ status: 1, publishedAt: -1 });
PortfolioSchema.index({ category: 1, status: 1 });
PortfolioSchema.index({ author: 1, status: 1 });
PortfolioSchema.index({ technologies: 1, status: 1 });

const Portfolio = mongoose.models.Portfolio || mongoose.model('Portfolio', PortfolioSchema);
export default Portfolio;
