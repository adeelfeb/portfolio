import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/designndev/Navbar';
import Footer from '../../components/designndev/Footer';

export default function PortfolioDetailPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchPortfolio();
    }
  }, [slug]);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/portfolios/${slug}`);
      
      if (response.data.success) {
        const portfolioData = response.data.data.portfolio;
        if (portfolioData.status !== 'published') {
          setError('Portfolio not found');
          return;
        }
        setPortfolio(portfolioData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load portfolio');
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading... | Design n Dev</title>
        </Head>
        <div className="min-h-screen bg-white">
          <Navbar />
          <main className="pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-16 text-gray-600">Loading portfolio...</div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (error || !portfolio) {
    return (
      <>
        <Head>
          <title>Portfolio Not Found | Design n Dev</title>
        </Head>
        <div className="min-h-screen bg-white">
          <Navbar />
          <main className="pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Portfolio Not Found</h1>
                <p className="text-gray-600 mb-8">{error || 'The portfolio you are looking for does not exist.'}</p>
                <Link href="/portfolio" className="text-blue-600 hover:text-blue-700 font-medium">
                  ← Back to Portfolio
                </Link>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{portfolio.metaTitle || portfolio.title} | Design n Dev</title>
        <meta name="description" content={portfolio.metaDescription || portfolio.description} />
        {portfolio.metaKeywords && portfolio.metaKeywords.length > 0 && (
          <meta name="keywords" content={portfolio.metaKeywords.join(', ')} />
        )}
        {portfolio.ogImage && (
          <>
            <meta property="og:image" content={portfolio.ogImage} />
            <meta property="og:title" content={portfolio.metaTitle || portfolio.title} />
            <meta property="og:description" content={portfolio.metaDescription || portfolio.description} />
          </>
        )}
        <link rel="canonical" href={`https://designndev.com/portfolio/${portfolio.slug}`} />
      </Head>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Featured Image */}
              {portfolio.featuredImage && (
                <div className="relative h-96 overflow-hidden bg-gray-100">
                  <img
                    src={portfolio.featuredImage}
                    alt={portfolio.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8 md:p-12">
                {/* Header */}
                <header className="mb-8">
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <span className="text-blue-600 text-sm font-semibold uppercase tracking-wide">
                      {portfolio.category}
                    </span>
                    {portfolio.projectDate && (
                      <span className="text-gray-500 text-sm">
                        {formatDate(portfolio.projectDate)}
                      </span>
                    )}
                    {portfolio.featured && (
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Featured
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {portfolio.title}
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {portfolio.description}
                  </p>
                </header>

                {/* Project Links */}
                {(portfolio.projectUrl || portfolio.githubUrl) && (
                  <div className="flex gap-4 mb-8 flex-wrap">
                    {portfolio.projectUrl && (
                      <a
                        href={portfolio.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Project
                      </a>
                    )}
                    {portfolio.githubUrl && (
                      <a
                        href={portfolio.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-gray-400 transition-all"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        View Code
                      </a>
                    )}
                  </div>
                )}

                {/* Technologies */}
                {portfolio.technologies && portfolio.technologies.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Technologies Used</h2>
                    <div className="flex flex-wrap gap-2">
                      {portfolio.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Full Description */}
                <div className="prose prose-lg max-w-none mb-8">
                  <div
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: portfolio.fullDescription.replace(/\n/g, '<br />') }}
                  />
                </div>

                {/* Additional Images */}
                {portfolio.images && portfolio.images.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Project Screenshots</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {portfolio.images.map((image, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${portfolio.title} - Screenshot ${idx + 1}`}
                            className="w-full h-auto"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {portfolio.tags && portfolio.tags.length > 0 && (
                  <div className="pt-8 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                      {portfolio.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <Link href="/portfolio" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Portfolio
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

