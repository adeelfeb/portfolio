import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/designndev/Navbar';
import Footer from '../../components/designndev/Footer';

export default function PortfolioPostPage() {
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
                <a href="/portfolios" className="text-blue-600 hover:text-blue-700 font-medium">← Back to Portfolio</a>
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
        <link rel="canonical" href={`https://designndev.com/portfolios/${portfolio.slug}`} />
      </Head>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="bg-white rounded-xl shadow-lg overflow-hidden">
              {portfolio.featuredImage && (
                <div className="w-full h-96 overflow-hidden bg-gray-100">
                  <img
                    src={portfolio.featuredImage}
                    alt={portfolio.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-8 md:p-12">
                <header className="mb-8">
                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <span className="text-blue-600 text-sm font-semibold uppercase tracking-wide">
                      {portfolio.category}
                    </span>
                    {portfolio.projectDate && (
                      <span className="text-gray-500 text-sm">{formatDate(portfolio.projectDate)}</span>
                    )}
                    {portfolio.clientName && (
                      <span className="text-gray-500 text-sm">Client: {portfolio.clientName}</span>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{portfolio.title}</h1>
                  <p className="text-xl text-gray-600 leading-relaxed mb-4">{portfolio.description}</p>
                  <div className="flex items-center gap-4 text-gray-500 text-sm">
                    <span>By {portfolio.authorName}</span>
                    {portfolio.views > 0 && <span>{portfolio.views} views</span>}
                  </div>
                </header>

                {/* Project Links */}
                {(portfolio.projectUrl || portfolio.githubUrl) && (
                  <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-gray-200">
                    {portfolio.projectUrl && (
                      <a
                        href={portfolio.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
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
                        className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-colors inline-flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        View Code
                      </a>
                    )}
                  </div>
                )}

                {/* Technologies */}
                {portfolio.technologies && portfolio.technologies.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Technologies Used</h3>
                    <div className="flex flex-wrap gap-2">
                      {portfolio.technologies.map((tech) => (
                        <span key={tech} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content */}
                <div
                  className="prose prose-lg max-w-none mb-8 text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: portfolio.content.replace(/\n/g, '<br />') }}
                />

                {/* Gallery Images */}
                {portfolio.galleryImages && portfolio.galleryImages.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Gallery</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {portfolio.galleryImages.map((img, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden">
                          <img
                            src={img}
                            alt={`${portfolio.title} - Image ${idx + 1}`}
                            className="w-full h-auto"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {portfolio.tags && portfolio.tags.length > 0 && (
                  <div className="pt-8 border-t border-gray-200 mb-8">
                    <div className="flex flex-wrap gap-2">
                      <strong className="text-gray-900">Tags: </strong>
                      {portfolio.tags.map((tag) => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-8 border-t border-gray-200">
                  <Link href="/portfolios" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2">
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

