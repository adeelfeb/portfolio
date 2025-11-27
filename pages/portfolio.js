import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/designndev/Navbar';
import Footer from '../components/designndev/Footer';

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
          content="web development portfolio, Next.js projects, MERN stack projects, custom web solutions, startup development" 
        />
        <meta property="og:title" content="Portfolio | Design n Dev" />
        <meta 
          property="og:description" 
          content="Explore our portfolio of successful web development projects." 
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://designndev.com/portfolio" />
      </Head>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Our Portfolio
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Discover our latest projects and successful web development solutions
              </p>
            </header>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <input
                type="text"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              />
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Portfolio Grid */}
            {isLoading ? (
              <div className="text-center py-16 text-gray-600">Loading portfolios...</div>
            ) : error ? (
              <div className="text-center py-16 text-red-600">{error}</div>
            ) : portfolios.length === 0 ? (
              <div className="text-center py-16 text-gray-600">No portfolios found</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                  {portfolios.map((portfolio) => (
                    <article 
                      key={portfolio.id} 
                      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      <Link href={`/portfolio/${portfolio.slug}`}>
                        <div className="relative h-64 overflow-hidden bg-gray-100">
                          <img
                            src={portfolio.featuredImage}
                            alt={portfolio.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          {portfolio.featured && (
                            <span className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              Featured
                            </span>
                          )}
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-blue-600 text-sm font-semibold uppercase tracking-wide">
                              {portfolio.category}
                            </span>
                            {portfolio.projectDate && (
                              <span className="text-gray-500 text-sm">
                                {formatDate(portfolio.projectDate)}
                              </span>
                            )}
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                            {portfolio.title}
                          </h2>
                          <p className="text-gray-600 line-clamp-3 mb-4">
                            {portfolio.description}
                          </p>
                          {portfolio.technologies && portfolio.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {portfolio.technologies.slice(0, 3).map((tech, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                >
                                  {tech}
                                </span>
                              ))}
                              {portfolio.technologies.length > 3 && (
                                <span className="px-2 py-1 text-gray-500 text-xs">
                                  +{portfolio.technologies.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-4">
                    <button
                      disabled={pagination.page === 1}
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      className="px-6 py-2 border-2 border-gray-200 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-600 hover:text-blue-600"
                    >
                      Previous
                    </button>
                    <span className="text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      disabled={pagination.page === pagination.pages}
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className="px-6 py-2 border-2 border-gray-200 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-600 hover:text-blue-600"
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
    </>
  );
}

