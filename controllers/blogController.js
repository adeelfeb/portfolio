import connectDB from '../lib/db';
import Blog from '../models/Blog';
import User from '../models/User';
import { jsonError, jsonSuccess } from '../lib/response';

// Helper to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper to calculate reading time
function calculateReadingTime(content) {
  if (!content) return 0;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / 200); // Average 200 words per minute
}

// Helper to sanitize blog data
function sanitizeBlog(blog) {
  if (!blog) return null;
  return {
    id: blog._id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    featuredImage: blog.featuredImage,
    featuredImageType: blog.featuredImageType,
    metaTitle: blog.metaTitle,
    metaDescription: blog.metaDescription,
    metaKeywords: blog.metaKeywords || [],
    ogImage: blog.ogImage,
    status: blog.status,
    publishedAt: blog.publishedAt,
    category: blog.category,
    tags: blog.tags || [],
    author: blog.author?._id || blog.author,
    authorName: blog.authorName,
    views: blog.views || 0,
    readingTime: blog.readingTime,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
}

// Get all blogs with filters
export async function getAllBlogs(req, res) {
  try {
    await connectDB();
    
    const {
      page = 1,
      limit = 20,
      status,
      category,
      author,
      search,
      publishedOnly = false,
    } = req.query;

    const query = {};
    
    // If publishedOnly is true, only show published blogs
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
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const blogs = await Blog.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Blog.countDocuments(query);

    return jsonSuccess(res, 200, 'Blogs retrieved', {
      blogs: blogs.map(sanitizeBlog),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return jsonError(res, 500, 'Failed to fetch blogs', error.message);
  }
}

// Get single blog by ID or slug
export async function getBlogById(req, res) {
  try {
    await connectDB();
    
    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'Blog ID or slug is required');
    }

    const blog = await Blog.findOne({
      $or: [{ _id: id }, { slug: id }],
    })
      .populate('author', 'name email')
      .lean();

    if (!blog) {
      return jsonError(res, 404, 'Blog not found');
    }

    // Increment views if published
    if (blog.status === 'published') {
      await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });
      blog.views = (blog.views || 0) + 1;
    }

    return jsonSuccess(res, 200, 'Blog retrieved', {
      blog: sanitizeBlog(blog),
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return jsonError(res, 500, 'Failed to fetch blog', error.message);
  }
}

// Create new blog
export async function createBlog(req, res) {
  try {
    await connectDB();
    
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }

    const {
      title,
      excerpt,
      content,
      featuredImage,
      featuredImageType = 'url',
      metaTitle,
      metaDescription,
      metaKeywords = [],
      ogImage,
      category,
      tags = [],
      status = 'draft',
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return jsonError(res, 400, 'Title is required');
    }
    if (!excerpt || !excerpt.trim()) {
      return jsonError(res, 400, 'Excerpt is required');
    }
    if (!content || !content.trim()) {
      return jsonError(res, 400, 'Content is required');
    }
    if (!category || !category.trim()) {
      return jsonError(res, 400, 'Category is required');
    }

    // Check if user is admin - admins can publish directly
    const isAdmin = ['superadmin', 'admin', 'hr_admin'].includes(req.user.role?.toLowerCase());
    
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
    let slugExists = await Blog.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await Blog.findOne({ slug });
      counter++;
    }

    // Calculate reading time
    const readingTime = calculateReadingTime(content);

    const blogData = {
      title: title.trim(),
      slug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      featuredImage: featuredImage || null,
      featuredImageType: featuredImageType === 'upload' ? 'upload' : 'url',
      metaTitle: metaTitle?.trim() || title.trim().substring(0, 60),
      metaDescription: metaDescription?.trim() || excerpt.trim().substring(0, 160),
      metaKeywords: Array.isArray(metaKeywords) ? metaKeywords : [],
      ogImage: ogImage || featuredImage || null,
      category: category.trim(),
      tags: Array.isArray(tags) ? tags : [],
      status: finalStatus,
      author: req.user._id,
      authorName: req.user.name,
      readingTime,
      publishedAt: finalStatus === 'published' ? new Date() : null,
    };

    const blog = await Blog.create(blogData);
    await blog.populate('author', 'name email');

    return jsonSuccess(res, 201, 'Blog created successfully', {
      blog: sanitizeBlog(blog),
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    if (error.code === 11000) {
      return jsonError(res, 400, 'Blog with this slug already exists');
    }
    return jsonError(res, 500, 'Failed to create blog', error.message);
  }
}

// Update blog
export async function updateBlog(req, res) {
  try {
    await connectDB();
    
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }

    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'Blog ID is required');
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return jsonError(res, 404, 'Blog not found');
    }

    // Check permissions - only author or admin can update
    const isAdmin = ['superadmin', 'admin', 'hr_admin'].includes(req.user.role?.toLowerCase());
    const isAuthor = blog.author.toString() === req.user._id.toString();

    if (!isAdmin && !isAuthor) {
      return jsonError(res, 403, 'You do not have permission to update this blog');
    }

    const {
      title,
      excerpt,
      content,
      featuredImage,
      featuredImageType,
      metaTitle,
      metaDescription,
      metaKeywords,
      ogImage,
      category,
      tags,
      status,
    } = req.body;

    // Update fields
    if (title && title.trim()) {
      blog.title = title.trim();
      // Regenerate slug if title changed
      const newSlug = generateSlug(title);
      const slugExists = await Blog.findOne({ slug: newSlug, _id: { $ne: id } });
      if (!slugExists) {
        blog.slug = newSlug;
      }
    }
    
    if (excerpt && excerpt.trim()) blog.excerpt = excerpt.trim();
    if (content && content.trim()) {
      blog.content = content.trim();
      blog.readingTime = calculateReadingTime(content);
    }
    if (featuredImage !== undefined) blog.featuredImage = featuredImage;
    if (featuredImageType) blog.featuredImageType = featuredImageType;
    if (metaTitle !== undefined) blog.metaTitle = metaTitle?.trim() || null;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription?.trim() || null;
    if (metaKeywords !== undefined) blog.metaKeywords = Array.isArray(metaKeywords) ? metaKeywords : [];
    if (ogImage !== undefined) blog.ogImage = ogImage;
    if (category && category.trim()) blog.category = category.trim();
    if (tags !== undefined) blog.tags = Array.isArray(tags) ? tags : [];

    // Handle status changes
    if (status !== undefined) {
      const isAdmin = ['superadmin', 'admin', 'hr_admin'].includes(req.user.role?.toLowerCase());
      
      // Only admins can publish directly or change status
      if (isAdmin) {
        blog.status = status;
        if (status === 'published' && !blog.publishedAt) {
          blog.publishedAt = new Date();
        }
      } else if (status === 'published') {
        // Base users can't publish directly, change to pending
        blog.status = 'pending';
      } else if (['draft', 'pending'].includes(status)) {
        blog.status = status;
      }
    }

    await blog.save();
    await blog.populate('author', 'name email');

    return jsonSuccess(res, 200, 'Blog updated successfully', {
      blog: sanitizeBlog(blog),
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    return jsonError(res, 500, 'Failed to update blog', error.message);
  }
}

// Delete blog
export async function deleteBlog(req, res) {
  try {
    await connectDB();
    
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }

    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'Blog ID is required');
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return jsonError(res, 404, 'Blog not found');
    }

    // Check permissions - only author or admin can delete
    const isAdmin = ['superadmin', 'admin', 'hr_admin'].includes(req.user.role?.toLowerCase());
    const isAuthor = blog.author.toString() === req.user._id.toString();

    if (!isAdmin && !isAuthor) {
      return jsonError(res, 403, 'You do not have permission to delete this blog');
    }

    await Blog.findByIdAndDelete(id);

    return jsonSuccess(res, 200, 'Blog deleted successfully');
  } catch (error) {
    console.error('Error deleting blog:', error);
    return jsonError(res, 500, 'Failed to delete blog', error.message);
  }
}

// Publish blog (admin only)
export async function publishBlog(req, res) {
  try {
    await connectDB();
    
    if (!req.user) {
      return jsonError(res, 401, 'Authentication required');
    }

    const isAdmin = ['superadmin', 'admin', 'hr_admin'].includes(req.user.role?.toLowerCase());
    if (!isAdmin) {
      return jsonError(res, 403, 'Only admins can publish blogs');
    }

    const { id } = req.query;
    if (!id) {
      return jsonError(res, 400, 'Blog ID is required');
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return jsonError(res, 404, 'Blog not found');
    }

    blog.status = 'published';
    if (!blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();
    await blog.populate('author', 'name email');

    return jsonSuccess(res, 200, 'Blog published successfully', {
      blog: sanitizeBlog(blog),
    });
  } catch (error) {
    console.error('Error publishing blog:', error);
    return jsonError(res, 500, 'Failed to publish blog', error.message);
  }
}

// Get blog categories
export async function getCategories(req, res) {
  try {
    await connectDB();
    
    const categories = await Blog.distinct('category', { status: 'published' });
    
    return jsonSuccess(res, 200, 'Categories retrieved', {
      categories: categories.sort(),
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return jsonError(res, 500, 'Failed to fetch categories', error.message);
  }
}


