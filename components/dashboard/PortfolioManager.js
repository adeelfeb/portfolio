import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'published', label: 'Published' },
];

export default function PortfolioManager({ user }) {
  const [portfolios, setPortfolios] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingPortfolio, setEditingPortfolio] = useState(null);
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
    description: '',
    content: '',
    featuredImage: '',
    featuredImageType: 'url',
    galleryImages: [],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    ogImage: '',
    category: '',
    tags: [],
    projectUrl: '',
    githubUrl: '',
    technologies: [],
    clientName: '',
    projectDate: '',
    status: 'draft',
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [galleryImageInput, setGalleryImageInput] = useState('');

  // Fetch portfolios
  const fetchPortfolios = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/portfolios?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setPortfolios(response.data.data.portfolios || []);
        setPagination(response.data.data.pagination || pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch portfolios');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('/api/portfolios/categories');
      if (response.data.success) {
        setCategories(response.data.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchPortfolios();
    fetchCategories();
  }, [fetchPortfolios, fetchCategories]);

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

  // Handle gallery image upload
  const handleGalleryImageUpload = async (e) => {
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
          galleryImages: [...prev.galleryImages, base64String],
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

  // Add technology
  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput('');
    }
  };

  // Remove technology
  const removeTechnology = (tech) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }));
  };

  // Add gallery image URL
  const addGalleryImage = () => {
    if (galleryImageInput.trim() && !formData.galleryImages.includes(galleryImageInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        galleryImages: [...prev.galleryImages, galleryImageInput.trim()],
      }));
      setGalleryImageInput('');
    }
  };

  // Remove gallery image
  const removeGalleryImage = (image) => {
    setFormData((prev) => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((img) => img !== image),
    }));
  };

  // Open create modal
  const openCreateModal = () => {
    setEditingPortfolio(null);
    setFormData({
      title: '',
      description: '',
      content: '',
      featuredImage: '',
      featuredImageType: 'url',
      galleryImages: [],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
      ogImage: '',
      category: '',
      tags: [],
      projectUrl: '',
      githubUrl: '',
      technologies: [],
      clientName: '',
      projectDate: '',
      status: 'draft',
    });
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Open edit modal
  const openEditModal = (portfolio) => {
    setEditingPortfolio(portfolio);
    setFormData({
      title: portfolio.title || '',
      description: portfolio.description || '',
      content: portfolio.content || '',
      featuredImage: portfolio.featuredImage || '',
      featuredImageType: portfolio.featuredImageType || 'url',
      galleryImages: portfolio.galleryImages || [],
      metaTitle: portfolio.metaTitle || '',
      metaDescription: portfolio.metaDescription || '',
      metaKeywords: portfolio.metaKeywords || [],
      ogImage: portfolio.ogImage || '',
      category: portfolio.category || '',
      tags: portfolio.tags || [],
      projectUrl: portfolio.projectUrl || '',
      githubUrl: portfolio.githubUrl || '',
      technologies: portfolio.technologies || [],
      clientName: portfolio.clientName || '',
      projectDate: portfolio.projectDate ? portfolio.projectDate.split('T')[0] : '',
      status: portfolio.status || 'draft',
    });
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  // Save portfolio
  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
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

      const url = editingPortfolio ? `/api/portfolios/${editingPortfolio.id}` : '/api/portfolios';
      const method = editingPortfolio ? 'put' : 'post';

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
        setSuccess(editingPortfolio ? 'Portfolio updated successfully' : 'Portfolio created successfully');
        setIsModalOpen(false);
        fetchPortfolios();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save portfolio');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete portfolio
  const handleDelete = async (portfolioId) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) return;

    try {
      await axios.delete(`/api/portfolios/${portfolioId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setSuccess('Portfolio deleted successfully');
      fetchPortfolios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete portfolio');
    }
  };

  // Publish portfolio
  const handlePublish = async (portfolioId) => {
    try {
      const response = await axios.patch(
        `/api/portfolios/${portfolioId}`,
        { action: 'publish' },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (response.data.success) {
        setSuccess('Portfolio published successfully');
        fetchPortfolios();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish portfolio');
    }
  };

  // Filter change
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="portfolio-manager">
      <div className="portfolio-manager-header">
        <h2>Portfolio Management</h2>
        <button onClick={openCreateModal} className="btn-primary">
          Create New Portfolio
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Filters */}
      <div className="portfolio-filters">
        <input
          type="text"
          placeholder="Search portfolios..."
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

      {/* Portfolio List */}
      {isLoading ? (
        <div className="loading">Loading portfolios...</div>
      ) : portfolios.length === 0 ? (
        <div className="empty-state">No portfolios found</div>
      ) : (
        <div className="portfolio-list">
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="portfolio-card">
              <div className="portfolio-card-header">
                <h3>{portfolio.title}</h3>
                <span className={`status-badge status-${portfolio.status}`}>
                  {portfolio.status}
                </span>
              </div>
              <p className="portfolio-description">{portfolio.description}</p>
              <div className="portfolio-meta">
                <span>Category: {portfolio.category}</span>
                <span>Author: {portfolio.authorName}</span>
                <span>Views: {portfolio.views || 0}</span>
                {portfolio.technologies && portfolio.technologies.length > 0 && (
                  <span>Tech: {portfolio.technologies.join(', ')}</span>
                )}
              </div>
              <div className="portfolio-actions">
                <button onClick={() => openEditModal(portfolio)} className="btn-secondary">
                  Edit
                </button>
                {isAdmin && portfolio.status !== 'published' && (
                  <button onClick={() => handlePublish(portfolio.id)} className="btn-success">
                    Publish
                  </button>
                )}
                <button onClick={() => handleDelete(portfolio.id)} className="btn-danger">
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
              <h3>{editingPortfolio ? 'Edit Portfolio' : 'Create New Portfolio'}</h3>
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
                  placeholder="Portfolio title"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
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
                  placeholder="Portfolio content"
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
                  placeholder="e.g., Web Development, Mobile App"
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
                <label>Gallery Images</label>
                <div className="gallery-input">
                  <input
                    type="url"
                    value={galleryImageInput}
                    onChange={(e) => setGalleryImageInput(e.target.value)}
                    placeholder="Add image URL"
                  />
                  <button type="button" onClick={addGalleryImage}>Add URL</button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryImageUpload}
                    className="mt-2"
                  />
                </div>
                <div className="gallery-preview">
                  {formData.galleryImages.map((img, idx) => (
                    <div key={idx} className="gallery-item">
                      <img src={img} alt={`Gallery ${idx + 1}`} />
                      <button onClick={() => removeGalleryImage(img)}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Project URL</label>
                <input
                  type="url"
                  name="projectUrl"
                  value={formData.projectUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label>GitHub URL</label>
                <input
                  type="url"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  placeholder="https://github.com/user/repo"
                />
              </div>

              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Client or company name"
                />
              </div>

              <div className="form-group">
                <label>Project Date</label>
                <input
                  type="date"
                  name="projectDate"
                  value={formData.projectDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Technologies</label>
                <div className="tech-input">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    placeholder="Add technology and press Enter"
                  />
                  <button type="button" onClick={addTechnology}>Add</button>
                </div>
                <div className="tech-tags">
                  {formData.technologies.map((tech) => (
                    <span key={tech} className="tag">
                      {tech}
                      <button onClick={() => removeTechnology(tech)}>×</button>
                    </span>
                  ))}
                </div>
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
                {isSaving ? 'Saving...' : editingPortfolio ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .portfolio-manager {
          padding: 2rem;
        }

        .portfolio-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .portfolio-filters {
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

        .portfolio-list {
          display: grid;
          gap: 1.5rem;
        }

        .portfolio-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 1.5rem;
          background: white;
        }

        .portfolio-card-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
        }

        .portfolio-card-header h3 {
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

        .portfolio-description {
          color: #666;
          margin-bottom: 1rem;
        }

        .portfolio-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #888;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .portfolio-actions {
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
          max-width: 900px;
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
        .tag-input,
        .tech-input,
        .gallery-input {
          display: flex;
          gap: 0.5rem;
        }

        .keyword-input input,
        .tag-input input,
        .tech-input input,
        .gallery-input input {
          flex: 1;
        }

        .keyword-tags,
        .tag-list,
        .tech-tags {
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

        .gallery-preview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .gallery-item {
          position: relative;
        }

        .gallery-item img {
          width: 100%;
          height: 100px;
          object-fit: cover;
          border-radius: 4px;
        }

        .gallery-item button {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
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

