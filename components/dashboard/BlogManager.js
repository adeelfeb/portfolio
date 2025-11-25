import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'published', label: 'Published' },
];

export default function BlogManager({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingBlog, setEditingBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const isAdmin = ['superadmin', 'admin', 'hr_admin'].includes(user?.role?.toLowerCase());

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    featuredImageType: 'url',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    ogImage: '',
    category: '',
    tags: [],
    status: 'draft',
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Fetch blogs
  const fetchBlogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/blogs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setBlogs(response.data.data.blogs || []);
        setPagination(response.data.data.pagination || pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch blogs');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('/api/blogs/categories');
      if (response.data.success) {
        setCategories(response.data.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [fetchBlogs, fetchCategories]);

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({
          ...prev,
          featuredImage: base64String,
          featuredImageType: 'upload',
        }));
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process image');
    }
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add keyword
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.metaKeywords.includes(keywordInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        metaKeywords: [...prev.metaKeywords, keywordInput.trim()],
      }));
      setKeywordInput('');
    }
  };

  // Remove keyword
  const removeKeyword = (keyword) => {
    setFormData((prev) => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter((k) => k !== keyword),
    }));
  };

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      featuredImageType: 'url',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      ogImage: '',
      category: '',
      tags: [],
      status: 'draft',
    });
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Open edit modal
  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      featuredImage: blog.featuredImage || '',
      featuredImageType: blog.featuredImageType || 'url',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      metaKeywords: blog.metaKeywords || [],
      ogImage: blog.ogImage || '',
      category: blog.category || '',
      tags: blog.tags || [],
      status: blog.status || 'draft',
    });
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Save blog
  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.excerpt.trim()) {
      setError('Excerpt is required');
      return;
    }
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    if (!formData.category.trim()) {
      setError('Category is required');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const url = editingBlog ? `/api/blogs/${editingBlog.id}` : '/api/blogs';
      const method = editingBlog ? 'put' : 'post';

      const response = await axios[method](
        url,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setSuccess(editingBlog ? 'Blog updated successfully' : 'Blog created successfully');
        setIsModalOpen(false);
        fetchBlogs();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save blog');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete blog
  const handleDelete = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await axios.delete(`/api/blogs/${blogId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccess('Blog deleted successfully');
      fetchBlogs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete blog');
    }
  };

  // Publish blog
  const handlePublish = async (blogId) => {
    try {
      const response = await axios.patch(
        `/api/blogs/${blogId}`,
        { action: 'publish' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.data.success) {
        setSuccess('Blog published successfully');
        fetchBlogs();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish blog');
    }
  };

  // Filter change
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="blog-manager">
      <div className="blog-manager-header">
        <h2>Blog Management</h2>
        <button onClick={openCreateModal} className="btn-primary">
          Create New Blog
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filters */}
      <div className="blog-filters">
        <input
          type="text"
          placeholder="Search blogs..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="filter-input"
        />
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Blog List */}
      {isLoading ? (
        <div className="loading">Loading blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="empty-state">No blogs found</div>
      ) : (
        <div className="blog-list">
          {blogs.map((blog) => (
            <div key={blog.id} className="blog-card">
              <div className="blog-card-header">
                <h3>{blog.title}</h3>
                <span className={`status-badge status-${blog.status}`}>
                  {blog.status}
                </span>
              </div>
              <p className="blog-excerpt">{blog.excerpt}</p>
              <div className="blog-meta">
                <span>Category: {blog.category}</span>
                <span>Author: {blog.authorName}</span>
                <span>Views: {blog.views || 0}</span>
                {blog.readingTime && <span>{blog.readingTime} min read</span>}
              </div>
              <div className="blog-actions">
                <button onClick={() => openEditModal(blog)} className="btn-secondary">
                  Edit
                </button>
                {isAdmin && blog.status !== 'published' && (
                  <button onClick={() => handlePublish(blog.id)} className="btn-success">
                    Publish
                  </button>
                )}
                <button onClick={() => handleDelete(blog.id)} className="btn-danger">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBlog ? 'Edit Blog' : 'Create New Blog'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="close-btn">
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Blog title"
                />
              </div>

              <div className="form-group">
                <label>Excerpt *</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Short description"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Blog content"
                  rows="10"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Technology, Business"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label>Featured Image</label>
                <select
                  name="featuredImageType"
                  value={formData.featuredImageType}
                  onChange={handleInputChange}
                >
                  <option value="url">Image URL</option>
                  <option value="upload">Upload Image</option>
                </select>
                {formData.featuredImageType === 'url' ? (
                  <input
                    type="url"
                    name="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                )}
                {formData.featuredImage && (
                  <img
                    src={formData.featuredImage}
                    alt="Preview"
                    className="image-preview"
                  />
                )}
              </div>

              <div className="form-group">
                <label>Meta Title (SEO)</label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="SEO title (max 60 chars)"
                  maxLength={60}
                />
                <small>{formData.metaTitle.length}/60</small>
              </div>

              <div className="form-group">
                <label>Meta Description (SEO)</label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleInputChange}
                  placeholder="SEO description (max 160 chars)"
                  rows="3"
                  maxLength={160}
                />
                <small>{formData.metaDescription.length}/160</small>
              </div>

              <div className="form-group">
                <label>Meta Keywords</label>
                <div className="keyword-input">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    placeholder="Add keyword and press Enter"
                  />
                  <button type="button" onClick={addKeyword}>Add</button>
                </div>
                <div className="keyword-tags">
                  {formData.metaKeywords.map((keyword) => (
                    <span key={keyword} className="tag">
                      {keyword}
                      <button onClick={() => removeKeyword(keyword)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <div className="tag-input">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag and press Enter"
                  />
                  <button type="button" onClick={addTag}>Add</button>
                </div>
                <div className="tag-list">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                      <button onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {!isAdmin && formData.status === 'published' && (
                  <small className="warning">
                    You don't have permission to publish. Status will be set to "Pending Review".
                  </small>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setIsModalOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving} className="btn-primary">
                {isSaving ? 'Saving...' : editingBlog ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .blog-manager {
          padding: 2rem;
        }

        .blog-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .blog-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .filter-input,
        .filter-select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .blog-list {
          display: grid;
          gap: 1.5rem;
        }

        .blog-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          background: white;
        }

        .blog-card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
        }

        .blog-card-header h3 {
          margin: 0;
          flex: 1;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .status-draft {
          background: #f3f4f6;
          color: #6b7280;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-published {
          background: #d1fae5;
          color: #065f46;
        }

        .blog-excerpt {
          color: #666;
          margin-bottom: 1rem;
        }

        .blog-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #888;
          margin-bottom: 1rem;
        }

        .blog-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-primary,
        .btn-secondary,
        .btn-success,
        .btn-danger {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .alert {
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .alert-error {
          background: #fee2e2;
          color: #991b1b;
        }

        .alert-success {
          background: #d1fae5;
          color: #065f46;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #ddd;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #666;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: #666;
        }

        .keyword-input,
        .tag-input {
          display: flex;
          gap: 0.5rem;
        }

        .keyword-input input,
        .tag-input input {
          flex: 1;
        }

        .keyword-tags,
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: #e5e7eb;
          border-radius: 12px;
          font-size: 0.875rem;
        }

        .tag button {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
        }

        .image-preview {
          max-width: 200px;
          max-height: 200px;
          margin-top: 0.5rem;
          border-radius: 4px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #ddd;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .loading,
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
      `}</style>
    </div>
  );
}

