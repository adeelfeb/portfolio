import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true },
    href: { type: String, trim: true },
    area: { type: String, trim: true },
  },
  { _id: false }
);

const ImageSchema = new mongoose.Schema(
  {
    src: { type: String, trim: true },
    alt: { type: String, trim: true },
  },
  { _id: false }
);

const ContentSectionSchema = new mongoose.Schema(
  {
    id: { type: String, trim: true },
    order: { type: Number },
    heading: { type: String, trim: true },
    subheading: { type: String, trim: true },
    summary: { type: String },
    paragraphs: [{ type: String }],
    listItems: [{ type: String }],
    links: [LinkSchema],
    images: [ImageSchema],
    hasCallToAction: { type: Boolean, default: false },
    tag: { type: String, trim: true },
    classes: [{ type: String, trim: true }],
    body: { type: String },
    tone: { type: String, trim: true },
    accentColor: { type: String, trim: true },
  },
  { _id: false }
);

const TextBlockSchema = new mongoose.Schema(
  {
    heading: { type: String, trim: true },
    subheading: { type: String, trim: true },
    summary: { type: String },
    body: { type: String },
    paragraphs: [{ type: String }],
    tag: { type: String, trim: true },
    tone: { type: String, trim: true },
    accentColor: { type: String, trim: true },
  },
  { _id: false }
);

const ScrapedDataSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true, index: true },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    domainInfo: {
      domain: { type: String, trim: true },
      protocol: { type: String, trim: true },
      host: { type: String, trim: true },
      path: { type: String, trim: true },
      origin: { type: String, trim: true },
    },
    stats: {
      totalHeadings: { type: Number },
      totalLinks: { type: Number },
      totalImages: { type: Number },
      totalKeywords: { type: Number },
      textLength: { type: Number },
      hasTitle: { type: Boolean },
      hasDescription: { type: Boolean },
      hasKeywords: { type: Boolean },
      hasOpenGraph: { type: Boolean },
      hasTwitterCard: { type: Boolean },
      hasStructuredData: { type: Boolean },
      hasCanonical: { type: Boolean },
      hasRobots: { type: Boolean },
      hasLanguage: { type: Boolean },
      hasCharset: { type: Boolean },
      hasViewport: { type: Boolean },
      sectionCount: { type: Number },
      paragraphCount: { type: Number },
      listCount: { type: Number },
      navLinkCount: { type: Number },
      wordCount: { type: Number },
      readingTimeMinutes: { type: Number },
      uniqueLinkHosts: { type: Number },
    },
    headings: {
      h1: [{ type: String, trim: true }],
      h2: [{ type: String, trim: true }],
      h3: [{ type: String, trim: true }],
    },
    mainHeadings: {
      h1: [{ type: String, trim: true }],
      h2: [{ type: String, trim: true }],
    },
    importantLinks: [
      {
        text: { type: String, trim: true },
        href: { type: String, trim: true },
      },
    ],
    imageCount: { type: Number, default: 0 },
    mainImages: [
      {
        alt: { type: String, trim: true },
        src: { type: String, trim: true },
      },
    ],
    navigationLinks: [LinkSchema],
    contentOutline: { type: [mongoose.Schema.Types.Mixed], default: [] },
    contentSections: { type: [ContentSectionSchema], default: [] },
    textPreview: { type: String },
    fullText: { type: String },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    textBlocks: { type: [TextBlockSchema], default: [] },
    structuredDataCount: { type: Number, default: 0 },
    structuredDataSamples: { type: [mongoose.Schema.Types.Mixed], default: [] },
    scrapedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scrapedAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for faster queries
ScrapedDataSchema.index({ url: 1, scrapedAt: -1 });
ScrapedDataSchema.index({ scrapedBy: 1, scrapedAt: -1 });

const ScrapedData = mongoose.models.ScrapedData || mongoose.model('ScrapedData', ScrapedDataSchema);

export default ScrapedData;

