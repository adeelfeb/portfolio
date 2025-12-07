import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';
import styles from '../styles/Blogs.module.css';

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

  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Design n Dev Blog',
    description: 'Latest articles and insights about web development, Next.js, MERN Stack, and custom web solutions',
    url: 'https://designndev.com/blogs',
    publisher: {
      '@type': 'Organization',
      name: 'Design n Dev',
      url: 'https://designndev.com',
    },
    blogPost: blogs.map((blog) => ({
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.excerpt,
      image: blog.featuredImage,
      datePublished: blog.publishedAt,
      author: {
        '@type': 'Person',
        name: blog.authorName,
      },
      url: `https://designndev.com/blogs/${blog.slug}`,
    })),
  };

  return (
    <>
      <Head>
        <title>Blog | Design n Dev - Latest Articles & Insights</title>
        <meta 
          name="description" 
          content="Read our latest blog posts and articles about web development, Next.js, MERN Stack, and custom web solutions. Stay updated with industry insights and best practices." 
        />
        <meta 
          name="keywords" 
          content="web development blog, Next.js articles, MERN stack blog, web development tips, startup development, custom web solutions" 
        />
        <meta property="og:title" content="Blog | Design n Dev - Latest Articles & Insights" />
        <meta 
          property="og:description" 
          content="Read our latest blog posts and articles about web development, Next.js, MERN Stack, and custom web solutions." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://designndev.com/blogs" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog | Design n Dev" />
        <meta name="twitter:description" content="Latest articles and insights about web development and technology" />
        <link rel="canonical" href="https://designndev.com/blogs" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <div className={styles.blogsPage}>
        <Navbar />
        <main>
          {/* Hero Section */}
          <section className={styles.blogsHero}>
            <div className={styles.blogsHeroContent}>
              <h1 className={styles.blogsHeroTitle}>Our Blog</h1>
              <p className={styles.blogsHeroSubtitle}>
                Discover our latest articles and insights about web development, technology trends, and best practices
              </p>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div className={styles.blogsFilters}>
              <div className={styles.blogsFiltersRow}>
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={styles.blogsSearchInput}
                  aria-label="Search blogs"
                />
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className={styles.blogsCategorySelect}
                  aria-label="Filter by category"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Blog Grid */}
            {isLoading ? (
              <div className={styles.blogsLoading}>
                <p>Loading blogs...</p>
              </div>
            ) : error ? (
              <div className={styles.blogsError}>
                <p>{error}</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className={styles.blogsEmpty}>
                <h2 className={styles.blogsEmptyTitle}>No blogs found</h2>
                <p className={styles.blogsEmptyText}>
                  {filters.search || filters.category
                    ? 'Try adjusting your filters to see more results.'
                    : 'Check back soon for new articles!'}
                </p>
              </div>
            ) : (
              <>
                <div className={styles.blogsGrid}>
                  {blogs.map((blog) => (
                    <article key={blog.id} className={styles.blogCard} itemScope itemType="https://schema.org/BlogPosting">
                      <Link href={`/blogs/${blog.slug}`} aria-label={`Read ${blog.title}`}>
                        {blog.featuredImage && (
                          <div className={styles.blogCardImageWrapper}>
                            <img
                              src={blog.featuredImage}
                              alt={blog.title}
                              className={styles.blogCardImage}
                              loading="lazy"
                              itemProp="image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <span className={styles.blogCardCategory} itemProp="articleSection">
                              {blog.category}
                            </span>
                          </div>
                        )}
                        <div className={styles.blogCardContent}>
                          <div className={styles.blogCardMeta}>
                            {blog.publishedAt && (
                              <time className={styles.blogCardDate} dateTime={blog.publishedAt} itemProp="datePublished">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(blog.publishedAt)}
                              </time>
                            )}
                          </div>
                          <h2 className={styles.blogCardTitle} itemProp="headline">
                            {blog.title}
                          </h2>
                          <p className={styles.blogCardExcerpt} itemProp="description">
                            {blog.excerpt}
                          </p>
                          <div className={styles.blogCardFooter}>
                            <span className={styles.blogCardAuthor} itemProp="author" itemScope itemType="https://schema.org/Person">
                              <span itemProp="name">By {blog.authorName}</span>
                            </span>
                            {blog.readingTime && (
                              <span className={styles.blogCardReadingTime}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {blog.readingTime} min read
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <nav className={styles.blogsPagination} aria-label="Blog pagination">
                    <button
                      disabled={pagination.page === 1}
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      className={styles.blogsPaginationButton}
                      aria-label="Previous page"
                    >
                      Previous
                    </button>
                    <span className={styles.blogsPaginationInfo}>
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      disabled={pagination.page === pagination.pages}
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className={styles.blogsPaginationButton}
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}



