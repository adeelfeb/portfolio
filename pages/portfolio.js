import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';
import styles from '../styles/Portfolio.module.css';

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState([]);
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
    fetchPortfolios();
    fetchCategories();
  }, [pagination.page, filters]);

  const fetchPortfolios = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        publishedOnly: 'true',
      });

      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/portfolios?${params.toString()}`);

      if (response.data.success) {
        setPortfolios(response.data.data.portfolios || []);
        setPagination(response.data.data.pagination || pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load portfolios');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/portfolios/categories');
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
      }).format(date);
    } catch {
      return '';
    }
  };

  // Generate structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Design n Dev Portfolio',
    description: 'Explore our portfolio of successful web development projects, Next.js applications, and custom web solutions',
    url: 'https://designndev.com/portfolio',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: portfolios.map((portfolio, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: portfolio.title,
          description: portfolio.description,
          image: portfolio.featuredImage,
          url: `https://designndev.com/portfolio/${portfolio.slug}`,
        },
      })),
    },
  };

  return (
    <>
      <Head>
        <title>Portfolio | Design n Dev - Our Work & Projects</title>
        <meta 
          name="description" 
          content="Explore our portfolio of successful web development projects. We specialize in Next.js, MERN Stack, and custom web solutions for startups and enterprises." 
        />
        <meta 
          name="keywords" 
          content="web development portfolio, Next.js projects, MERN stack projects, custom web solutions, startup development, web design portfolio" 
        />
        <meta property="og:title" content="Portfolio | Design n Dev - Our Work & Projects" />
        <meta 
          property="og:description" 
          content="Explore our portfolio of successful web development projects. We specialize in Next.js, MERN Stack, and custom web solutions." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://designndev.com/portfolio" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Portfolio | Design n Dev" />
        <meta name="twitter:description" content="Explore our portfolio of successful web development projects" />
        <link rel="canonical" href="https://designndev.com/portfolio" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <div className={styles.portfolioPage}>
        <Navbar />
        <main>
          {/* Hero Section */}
          <section className={styles.portfolioHero}>
            <div className={styles.portfolioHeroContent}>
              <h1 className={styles.portfolioHeroTitle}>Our Portfolio</h1>
              <p className={styles.portfolioHeroSubtitle}>
                Discover our latest projects and successful web development solutions built with modern technologies
              </p>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div className={styles.portfolioFilters}>
              <div className={styles.portfolioFiltersRow}>
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className={styles.portfolioSearchInput}
                  aria-label="Search projects"
                />
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className={styles.portfolioSelect}
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

            {/* Portfolio Grid */}
            {isLoading ? (
              <div className={styles.portfolioLoading}>
                <p>Loading portfolios...</p>
              </div>
            ) : error ? (
              <div className={styles.portfolioError}>
                <p>{error}</p>
              </div>
            ) : portfolios.length === 0 ? (
              <div className={styles.portfolioEmpty}>
                <h2 className={styles.portfolioEmptyTitle}>No portfolios found</h2>
                <p className={styles.portfolioEmptyText}>
                  {filters.search || filters.category
                    ? 'Try adjusting your filters to see more results.'
                    : 'Check back soon for new projects!'}
                </p>
              </div>
            ) : (
              <>
                <div className={styles.portfolioGrid}>
                  {portfolios.map((portfolio) => (
                    <article 
                      key={portfolio.id} 
                      className={styles.portfolioCard}
                      itemScope
                      itemType="https://schema.org/CreativeWork"
                    >
                      <Link href={`/portfolio/${portfolio.slug}`} aria-label={`View ${portfolio.title} project`}>
                        <div className={styles.portfolioCardImageWrapper}>
                          <img
                            src={portfolio.featuredImage}
                            alt={portfolio.title}
                            className={styles.portfolioCardImage}
                            loading="lazy"
                            itemProp="image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          {portfolio.featured && (
                            <span className={styles.portfolioCardFeatured}>
                              Featured
                            </span>
                          )}
                          <span className={styles.portfolioCardCategory} itemProp="genre">
                            {portfolio.category}
                          </span>
                        </div>
                        <div className={styles.portfolioCardContent}>
                          <div className={styles.portfolioCardMeta}>
                            {portfolio.projectDate && (
                              <time className={styles.portfolioCardDate} dateTime={portfolio.projectDate}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(portfolio.projectDate)}
                              </time>
                            )}
                          </div>
                          <h2 className={styles.portfolioCardTitle} itemProp="name">
                            {portfolio.title}
                          </h2>
                          <p className={styles.portfolioCardDescription} itemProp="description">
                            {portfolio.description}
                          </p>
                          {portfolio.technologies && portfolio.technologies.length > 0 && (
                            <div className={styles.portfolioCardTechnologies}>
                              {portfolio.technologies.slice(0, 3).map((tech, idx) => (
                                <span key={idx} className={styles.portfolioCardTech}>
                                  {tech}
                                </span>
                              ))}
                              {portfolio.technologies.length > 3 && (
                                <span className={styles.portfolioCardTech}>
                                  +{portfolio.technologies.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          <div className={styles.portfolioCardFooter}>
                            {portfolio.views > 0 && (
                              <span className={styles.portfolioCardViews}>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                {portfolio.views} views
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
                  <nav className={styles.portfolioPagination} aria-label="Portfolio pagination">
                    <button
                      disabled={pagination.page === 1}
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      className={styles.portfolioPaginationButton}
                      aria-label="Previous page"
                    >
                      Previous
                    </button>
                    <span className={styles.portfolioPaginationInfo}>
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      disabled={pagination.page === pagination.pages}
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className={styles.portfolioPaginationButton}
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






