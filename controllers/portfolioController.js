import connectDB from '../lib/db';
import Portfolio from '../models/Portfolio';
import { jsonError, jsonSuccess } from '../lib/response';
import mongoose from 'mongoose';

// Helper to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper to sanitize portfolio data
function sanitizePortfolio(portfolio) {
  if (!portfolio) return null;
  return {
    id: portfolio._id,
    title: portfolio.title,
    slug: portfolio.slug,
    description: portfolio.description,
    content: portfolio.content,
    featuredImage: portfolio.featuredImage,
    featuredImageType: portfolio.featuredImageType,
    galleryImages: portfolio.galleryImages || [],
    metaTitle: portfolio.metaTitle,
    metaDescription: portfolio.metaDescription,
    metaKeywords: portfolio.metaKeywords || [],
    ogImage: portfolio.ogImage,
    status: portfolio.status,
    publishedAt: portfolio.publishedAt,
    category: portfolio.category,
    tags: portfolio.tags || [],
    projectUrl: portfolio.projectUrl,
    githubUrl: portfolio.githubUrl,
    technologies: portfolio.technologies || [],
    clientName: portfolio.clientName,
    projectDate: portfolio.projectDate,
    author: portfolio.author?._id || portfolio.author,
    authorName: portfolio.authorName,
    views: portfolio.views || 0,
    createdAt: portfolio.createdAt,
    updatedAt: portfolio.updatedAt,
  };
}

// Get all portfolios with filters
export async function getAllPortfolios(req, res) {
  try {
    await connectDB();
    
    const {
      page = 1,
      limit = 20,
      status,
      category,
      author,
      technology,
      search,
      publishedOnly = false,
    } = req.query;

    const query = {};
    
    // If publishedOnly is true, only show published portfolios
    if (publishedOnly === 'true' || publishedOnly === true) {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (author) {
      query.author = author;
    }
    
    if (technology) {
      query.technologies = { $in: [technology] };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { technologies: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const portfolios = await Portfolio.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Portfolio.countDocuments(query);

    return jsonSuccess(res, 200, 'Portfolios retrieved', {
      portfolios: portfolios.map(sanitizePortfolio),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return jsonError(res, 500, 'Failed to fetch portfolios', error.message);
  }
}

// Get single portfolio by ID or slug
export async function getPortfolioById(req, res) {
  try {
    await connectDB();
    
    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'Portfolio ID or slug is required');
    }

    // Build query conditions for ID or slug
    const idOrSlugConditions = [];
    
    // Check if id is a valid ObjectId format (24 hex characters)
    // Only include _id search if it's a valid ObjectId to avoid casting errors
    if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
      idOrSlugConditions.push({ _id: id });
    }
    
    // Always search by slug
    idOrSlugConditions.push({ slug: id });

    // Check if user is authenticated
    const user = req.user;
    const isAdmin = user && ['superadmin', 'admin', 'hr_admin', 'developer'].includes(user.role?.toLowerCase());

    // Build the complete query
    let query;
    
    if (!user) {
      // Public access: only show published portfolios
      query = {
        $or: idOrSlugConditions,
        status: 'published',
      };
    } else if (isAdmin) {
      // Admins can see all portfolios regardless of status
      query = {
        $or: idOrSlugConditions,
      };
    } else {
      // Regular users can see published portfolios OR their own portfolios (any status)
      query = {
        $or: [
          ...idOrSlugConditions.map(condition => ({ ...condition, status: 'published' })),
          ...idOrSlugConditions.map(condition => ({ ...condition, author: user._id })),
        ],
      };
    }

    const portfolio = await Portfolio.findOne(query)
      .populate('author', 'name email')
      .lean();

    if (!portfolio) {
      return jsonError(res, 404, 'Portfolio not found');
    }

    // Double-check permissions for non-admin users accessing non-published portfolios
    if (user && !isAdmin && portfolio.status !== 'published') {
      const portfolioAuthorId = portfolio.author?._id?.toString() || portfolio.author?.toString();
      if (portfolioAuthorId !== user._id.toString()) {
        return jsonError(res, 404, 'Portfolio not found');
      }
    }

    // Increment views if published
    if (portfolio.status === 'published') {
      await Portfolio.findByIdAndUpdate(portfolio._id, { $inc: { views: 1 } });
      portfolio.views = (portfolio.views || 0) + 1;
    }

    return jsonSuccess(res, 200, 'Portfolio retrieved', {
      portfolio: sanitizePortfolio(portfolio),
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return jsonError(res, 500, 'Failed to fetch portfolio', error.message);
  }
}

// Create new portfolio
export async function createPortfolio(req, res) {
  try {
    await connectDB();
    
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }

    const {
      title,
      description,
      content,
      featuredImage,
      featuredImageType = 'url',
      galleryImages = [],
      metaTitle,
      metaDescription,
      metaKeywords = [],
      ogImage,
      category,
      tags = [],
      projectUrl,
      githubUrl,
      technologies = [],
      clientName,
      projectDate,
      status = 'draft',
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return jsonError(res, 400, 'Title is required');
    }
    if (!description || !description.trim()) {
      return jsonError(res, 400, 'Description is required');
    }
    if (!content || !content.trim()) {
      return jsonError(res, 400, 'Content is required');
    }
    if (!category || !category.trim()) {
      return jsonError(res, 400, 'Category is required');
    }

    // Check if user is admin - admins can publish directly
    const isAdmin = ['superadmin', 'admin', 'hr_admin', 'developer'].includes(req.user.role?.toLowerCase());
    
    // Base users can only create drafts or pending, not published
    let finalStatus = status;
    if (!isAdmin && status === 'published') {
      finalStatus = 'pending';
    }
    
    // Base users can only create drafts or pending
    if (!isAdmin && !['draft', 'pending'].includes(finalStatus)) {
      finalStatus = 'draft';
    }

    // Generate slug
    let slug = generateSlug(title);
    let slugExists = await Portfolio.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await Portfolio.findOne({ slug });
      counter++;
    }

    const portfolioData = {
      title: title.trim(),
      slug,
      description: description.trim(),
      content: content.trim(),
      featuredImage: featuredImage || null,
      featuredImageType: featuredImageType === 'upload' ? 'upload' : 'url',
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      metaTitle: metaTitle?.trim() || title.trim().substring(0, 60),
      metaDescription: metaDescription?.trim() || description.trim().substring(0, 160),
      metaKeywords: Array.isArray(metaKeywords) ? metaKeywords : [],
      ogImage: ogImage || featuredImage || null,
      category: category.trim(),
      tags: Array.isArray(tags) ? tags : [],
      projectUrl: projectUrl || null,
      githubUrl: githubUrl || null,
      technologies: Array.isArray(technologies) ? technologies : [],
      clientName: clientName || null,
      projectDate: projectDate ? new Date(projectDate) : null,
      status: finalStatus,
      author: req.user._id,
      authorName: req.user.name,
      publishedAt: finalStatus === 'published' ? new Date() : null,
    };

    const portfolio = await Portfolio.create(portfolioData);
    await portfolio.populate('author', 'name email');

    return jsonSuccess(res, 201, 'Portfolio created successfully', {
      portfolio: sanitizePortfolio(portfolio),
    });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    if (error.code === 11000) {
      return jsonError(res, 400, 'Portfolio with this slug already exists');
    }
    return jsonError(res, 500, 'Failed to create portfolio', error.message);
  }
}

// Update portfolio
export async function updatePortfolio(req, res) {
  try {
    await connectDB();
    
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }

    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'Portfolio ID is required');
    }

    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return jsonError(res, 404, 'Portfolio not found');
    }

    // Check permissions - only author or admin can update
    const isAdmin = ['superadmin', 'admin', 'hr_admin', 'developer'].includes(req.user.role?.toLowerCase());
    const isAuthor = portfolio.author.toString() === req.user._id.toString();

    if (!isAdmin && !isAuthor) {
      return jsonError(res, 403, 'You do not have permission to update this portfolio');
    }

    const {
      title,
      description,
      content,
      featuredImage,
      featuredImageType,
      galleryImages,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      category,
      tags,
      projectUrl,
      githubUrl,
      technologies,
      clientName,
      projectDate,
      status,
    } = req.body;

    // Update fields
    if (title && title.trim()) {
      portfolio.title = title.trim();
      // Regenerate slug if title changed
      const newSlug = generateSlug(title);
      const slugExists = await Portfolio.findOne({ slug: newSlug, _id: { $ne: id } });
      if (!slugExists) {
        portfolio.slug = newSlug;
      }
    }
    
    if (description && description.trim()) portfolio.description = description.trim();
    if (content && content.trim()) portfolio.content = content.trim();
    if (featuredImage !== undefined) portfolio.featuredImage = featuredImage;
    if (featuredImageType) portfolio.featuredImageType = featuredImageType;
    if (galleryImages !== undefined) portfolio.galleryImages = Array.isArray(galleryImages) ? galleryImages : [];
    if (metaTitle !== undefined) portfolio.metaTitle = metaTitle?.trim() || null;
    if (metaDescription !== undefined) portfolio.metaDescription = metaDescription?.trim() || null;
    if (metaKeywords !== undefined) portfolio.metaKeywords = Array.isArray(metaKeywords) ? metaKeywords : [];
    if (ogImage !== undefined) portfolio.ogImage = ogImage;
    if (category && category.trim()) portfolio.category = category.trim();
    if (tags !== undefined) portfolio.tags = Array.isArray(tags) ? tags : [];
    if (projectUrl !== undefined) portfolio.projectUrl = projectUrl || null;
    if (githubUrl !== undefined) portfolio.githubUrl = githubUrl || null;
    if (technologies !== undefined) portfolio.technologies = Array.isArray(technologies) ? technologies : [];
    if (clientName !== undefined) portfolio.clientName = clientName || null;
    if (projectDate !== undefined) portfolio.projectDate = projectDate ? new Date(projectDate) : null;

    // Handle status changes
    if (status !== undefined) {
      const isAdmin = ['superadmin', 'admin', 'hr_admin', 'developer'].includes(req.user.role?.toLowerCase());
      
      // Only admins can publish directly or change status
      if (isAdmin) {
        portfolio.status = status;
        if (status === 'published' && !portfolio.publishedAt) {
          portfolio.publishedAt = new Date();
        }
      } else if (status === 'published') {
        // Base users can't publish directly, change to pending
        portfolio.status = 'pending';
      } else if (['draft', 'pending'].includes(status)) {
        portfolio.status = status;
      }
    }

    await portfolio.save();
    await portfolio.populate('author', 'name email');

    return jsonSuccess(res, 200, 'Portfolio updated successfully', {
      portfolio: sanitizePortfolio(portfolio),
    });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return jsonError(res, 500, 'Failed to update portfolio', error.message);
  }
}

// Delete portfolio
export async function deletePortfolio(req, res) {
  try {
    await connectDB();
    
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }

    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'Portfolio ID is required');
    }

    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return jsonError(res, 404, 'Portfolio not found');
    }

    // Check permissions - only author or admin can delete
    const isAdmin = ['superadmin', 'admin', 'hr_admin', 'developer'].includes(req.user.role?.toLowerCase());
    const isAuthor = portfolio.author.toString() === req.user._id.toString();

    if (!isAdmin && !isAuthor) {
      return jsonError(res, 403, 'You do not have permission to delete this portfolio');
    }

    await Portfolio.findByIdAndDelete(id);

    return jsonSuccess(res, 200, 'Portfolio deleted successfully');
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return jsonError(res, 500, 'Failed to delete portfolio', error.message);
  }
}

// Publish portfolio (admin only)
export async function publishPortfolio(req, res) {
  try {
    await connectDB();
    
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }

    const isAdmin = ['superadmin', 'admin', 'hr_admin', 'developer'].includes(req.user.role?.toLowerCase());
    if (!isAdmin) {
      return jsonError(res, 403, 'Only admins can publish portfolios');
    }

    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'Portfolio ID is required');
    }

    const portfolio = await Portfolio.findById(id);
    if (!portfolio) {
      return jsonError(res, 404, 'Portfolio not found');
    }

    portfolio.status = 'published';
    if (!portfolio.publishedAt) {
      portfolio.publishedAt = new Date();
    }

    await portfolio.save();
    await portfolio.populate('author', 'name email');

    return jsonSuccess(res, 200, 'Portfolio published successfully', {
      portfolio: sanitizePortfolio(portfolio),
    });
  } catch (error) {
    console.error('Error publishing portfolio:', error);
    return jsonError(res, 500, 'Failed to publish portfolio', error.message);
  }
}

// Get portfolio categories
export async function getCategories(req, res) {
  try {
    await connectDB();
    
    const categories = await Portfolio.distinct('category', { status: 'published' });
    
    return jsonSuccess(res, 200, 'Categories retrieved', {
      categories: categories.sort(),
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return jsonError(res, 500, 'Failed to fetch categories', error.message);
  }
}

// Get technologies list
export async function getTechnologies(req, res) {
  try {
    await connectDB();
    
    const portfolios = await Portfolio.find({ status: 'published' }).select('technologies').lean();
    const allTechnologies = new Set();
    
    portfolios.forEach((portfolio) => {
      if (portfolio.technologies && Array.isArray(portfolio.technologies)) {
        portfolio.technologies.forEach((tech) => allTechnologies.add(tech));
      }
    });
    
    return jsonSuccess(res, 200, 'Technologies retrieved', {
      technologies: Array.from(allTechnologies).sort(),
    });
  } catch (error) {
    console.error('Error fetching technologies:', error);
    return jsonError(res, 500, 'Failed to fetch technologies', error.message);
  }
}
