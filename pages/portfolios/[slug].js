import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/designndev/Navbar';
import Footer from '../../components/designndev/Footer';
import styles from '../../styles/Portfolio.module.css';

// Disable static generation for this dynamic route
export async function getServerSideProps(context) {
  // Return empty props to let the page handle client-side rendering
  // This prevents build-time prerendering errors
  return {
    props: {},
  };
}

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

  // Generate structured data for SEO
  const structuredData = portfolio ? {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: portfolio.title,
    description: portfolio.metaDescription || portfolio.description,
    image: portfolio.featuredImage || portfolio.ogImage,
    dateCreated: portfolio.projectDate,
    dateModified: portfolio.updatedAt || portfolio.projectDate,
    author: {
      '@type': 'Organization',
      name: 'Design n Dev',
      url: 'https://designndev.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Design n Dev',
      url: 'https://designndev.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://designndev.com/portfolios/${portfolio.slug}`,
    },
    genre: portfolio.category,
    keywords: portfolio.metaKeywords?.join(', ') || portfolio.category,
    ...(portfolio.projectUrl && { url: portfolio.projectUrl }),
  } : null;

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading... | Design n Dev</title>
        </Head>
        <div className={styles.portfolioDetailPage}>
          <Navbar />
          <main className="pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={styles.portfolioLoading}>
                <p>Loading portfolio...</p>
              </div>
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
          <meta name="robots" content="noindex" />
        </Head>
        <div className={styles.portfolioDetailPage}>
          <Navbar />
          <main className="pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={styles.portfolioError}>
                <h1 className="text-3xl font-bold mb-4">Portfolio Not Found</h1>
                <p className="mb-8">{error || 'The portfolio you are looking for does not exist.'}</p>
                <Link href="/portfolios" className={styles.portfolioDetailBackLink}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Portfolio
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
        <title>{`${String(portfolio.metaTitle || portfolio.title || 'Portfolio')} | Design n Dev`}</title>
        <meta name="description" content={portfolio.metaDescription || portfolio.description} />
        {portfolio.metaKeywords && portfolio.metaKeywords.length > 0 && (
          <meta name="keywords" content={portfolio.metaKeywords.join(', ')} />
        )}
        <meta property="og:title" content={portfolio.metaTitle || portfolio.title} />
        <meta property="og:description" content={portfolio.metaDescription || portfolio.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://designndev.com/portfolios/${portfolio.slug}`} />
        {portfolio.ogImage && <meta property="og:image" content={portfolio.ogImage} />}
        {portfolio.featuredImage && !portfolio.ogImage && <meta property="og:image" content={portfolio.featuredImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={portfolio.metaTitle || portfolio.title} />
        <meta name="twitter:description" content={portfolio.metaDescription || portfolio.description} />
        {portfolio.ogImage && <meta name="twitter:image" content={portfolio.ogImage} />}
        {portfolio.featuredImage && !portfolio.ogImage && <meta name="twitter:image" content={portfolio.featuredImage} />}
        <link rel="canonical" href={`https://designndev.com/portfolios/${portfolio.slug}`} />
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      </Head>
      <div className={styles.portfolioDetailPage}>
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className={styles.portfolioDetailBreadcrumb} aria-label="Breadcrumb">
              <Link href="/portfolios" className={styles.portfolioDetailBreadcrumbLink}>
                Portfolio
              </Link>
              <span className="mx-2">/</span>
              <span>{portfolio.title}</span>
            </nav>

            <article className={styles.portfolioDetailArticle} itemScope itemType="https://schema.org/CreativeWork">
              {portfolio.featuredImage && (
                <div className={styles.portfolioDetailImageWrapper}>
                  <img
                    src={portfolio.featuredImage}
                    alt={portfolio.title}
                    className={styles.portfolioDetailImage}
                    itemProp="image"
                    loading="eager"
                  />
                </div>
              )}
              <div className={styles.portfolioDetailHeader}>
                <span className={styles.portfolioDetailCategory} itemProp="genre">
                  {portfolio.category}
                </span>
                <div className={styles.portfolioDetailMeta}>
                  {portfolio.projectDate && (
                    <time dateTime={portfolio.projectDate} itemProp="dateCreated">
                      {formatDate(portfolio.projectDate)}
                    </time>
                  )}
                  {portfolio.clientName && (
                    <span>Client: {portfolio.clientName}</span>
                  )}
                </div>
                <h1 className={styles.portfolioDetailTitle} itemProp="name">
                  {portfolio.title}
                </h1>
                <p className={styles.portfolioDetailDescription} itemProp="description">
                  {portfolio.description}
                </p>
                <div className={styles.portfolioDetailMeta}>
                  <span>By {portfolio.authorName}</span>
                  {portfolio.views > 0 && <span>{portfolio.views} views</span>}
                </div>
              </div>

              {/* Project Links */}
              {(portfolio.projectUrl || portfolio.githubUrl) && (
                <div className={styles.portfolioDetailLinks}>
                  {portfolio.projectUrl && (
                    <a
                      href={portfolio.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.portfolioDetailLink} ${styles.portfolioDetailLinkPrimary}`}
                      itemProp="url"
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
                      className={`${styles.portfolioDetailLink} ${styles.portfolioDetailLinkSecondary}`}
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
                <div className={styles.portfolioDetailTechnologies}>
                  <h2 className={styles.portfolioDetailTechnologiesTitle}>Technologies Used</h2>
                  <div className={styles.portfolioDetailTechnologiesList}>
                    {portfolio.technologies.map((tech, idx) => (
                      <span key={idx} className={styles.portfolioDetailTech} itemProp="keywords">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Description */}
              {portfolio.content && (
                <div className={styles.portfolioDetailContent}>
                  <div
                    className={styles.portfolioDetailContentBody}
                    itemProp="description"
                    dangerouslySetInnerHTML={{ __html: (portfolio.content || '').replace(/\n/g, '<br />') }}
                  />
                </div>
              )}

              {/* Additional Images */}
              {portfolio.galleryImages && portfolio.galleryImages.length > 0 && (
                <div className={styles.portfolioDetailGallery}>
                  <h2 className={styles.portfolioDetailGalleryTitle}>Project Screenshots</h2>
                  <div className={styles.portfolioDetailGalleryGrid}>
                    {portfolio.galleryImages.map((image, idx) => (
                      <div key={idx} className={styles.portfolioDetailGalleryImage}>
                        <img
                          src={image}
                          alt={`${portfolio.title} - Screenshot ${idx + 1}`}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {portfolio.tags && portfolio.tags.length > 0 && (
                <div className={styles.portfolioDetailTags}>
                  <div className={styles.portfolioDetailTagsTitle}>Tags</div>
                  <div className={styles.portfolioDetailTagsList}>
                    {portfolio.tags.map((tag, idx) => (
                      <span key={idx} className={styles.portfolioDetailTag} itemProp="keywords">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <footer className={styles.portfolioDetailFooter}>
                <Link href="/portfolios" className={styles.portfolioDetailBackLink}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Portfolio
                </Link>
              </footer>
            </article>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

