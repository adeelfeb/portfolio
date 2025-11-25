import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [pagination.page, filters]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        publishedOnly: 'true',
      });

      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/blogs?${params.toString()}`);

      if (response.data.success) {
        setBlogs(response.data.data.blogs || []);
        setPagination(response.data.data.pagination || pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/blogs/categories');
      if (response.data.success) {
        setCategories(response.data.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch {
      return '';
    }
  };

  return (
    <>
      <Head>
        <title>Blogs | Our Blog</title>
        <meta name="description" content="Read our latest blog posts and articles" />
      </Head>
      <div className="blogs-page">
        <Header />
        <main className="blogs-main">
          <div className="container">
            <header className="blogs-header">
              <h1>Our Blog</h1>
              <p>Discover our latest articles and insights</p>
            </header>

            {/* Filters */}
            <div className="blogs-filters">
              <input
                type="text"
                placeholder="Search blogs..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="search-input"
              />
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="category-select"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Blog Grid */}
            {isLoading ? (
              <div className="loading">Loading blogs...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : blogs.length === 0 ? (
              <div className="empty-state">No blogs found</div>
            ) : (
              <>
                <div className="blogs-grid">
                  {blogs.map((blog) => (
                    <article key={blog.id} className="blog-card">
                      {blog.featuredImage && (
                        <div className="blog-image">
                          <img
                            src={blog.featuredImage}
                            alt={blog.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="blog-content">
                        <div className="blog-meta">
                          <span className="blog-category">{blog.category}</span>
                          {blog.publishedAt && (
                            <span className="blog-date">
                              {formatDate(blog.publishedAt)}
                            </span>
                          )}
                        </div>
                        <h2 className="blog-title">
                          <a href={`/blogs/${blog.slug}`}>{blog.title}</a>
                        </h2>
                        <p className="blog-excerpt">{blog.excerpt}</p>
                        <div className="blog-footer">
                          <span className="blog-author">By {blog.authorName}</span>
                          {blog.readingTime && (
                            <span className="blog-reading-time">
                              {blog.readingTime} min read
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

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
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>

      <style jsx>{`
        .blogs-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .blogs-main {
          flex: 1;
          padding: 3rem 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .blogs-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .blogs-header h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #1a1a1a;
        }

        .blogs-header p {
          font-size: 1.25rem;
          color: #666;
        }

        .blogs-filters {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .search-input,
        .category-select {
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .search-input {
          flex: 1;
          min-width: 250px;
        }

        .search-input:focus,
        .category-select:focus {
          outline: none;
          border-color: #2563eb;
        }

        .blogs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .blog-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
        }

        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .blog-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #f3f4f6;
        }

        .blog-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .blog-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .blog-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .blog-category {
          color: #2563eb;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .blog-date {
          color: #6b7280;
        }

        .blog-title {
          margin: 0 0 1rem 0;
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.3;
        }

        .blog-title a {
          color: #1a1a1a;
          text-decoration: none;
          transition: color 0.2s;
        }

        .blog-title a:hover {
          color: #2563eb;
        }

        .blog-excerpt {
          color: #666;
          line-height: 1.6;
          margin-bottom: 1rem;
          flex: 1;
        }

        .blog-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: #888;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 3rem;
        }

        .pagination button {
          padding: 0.5rem 1.5rem;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .pagination button:hover:not(:disabled) {
          border-color: #2563eb;
          color: #2563eb;
        }

        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading,
        .error,
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          font-size: 1.25rem;
          color: #666;
        }

        .error {
          color: #ef4444;
        }

        @media (max-width: 768px) {
          .blogs-header h1 {
            font-size: 2rem;
          }

          .blogs-grid {
            grid-template-columns: 1fr;
          }

          .blogs-filters {
            flex-direction: column;
          }

          .search-input {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}


