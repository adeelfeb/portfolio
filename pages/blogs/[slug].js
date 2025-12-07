import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/designndev/Navbar';
import Footer from '../../components/designndev/Footer';
import styles from '../../styles/Blogs.module.css';

// Disable static generation for this dynamic route
export async function getServerSideProps(context) {
  // Return empty props to let the page handle client-side rendering
  // This prevents build-time prerendering errors
  return {
    props: {},
  };
}

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/blogs/${slug}`);
      
      if (response.data.success) {
        const blogData = response.data.data.blog;
        if (blogData.status !== 'published') {
          setError('Blog not found');
          return;
        }
        setBlog(blogData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blog');
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
  const structuredData = blog ? {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.metaDescription || blog.excerpt,
    image: blog.featuredImage || blog.ogImage,
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt || blog.publishedAt,
    author: {
      '@type': 'Person',
      name: blog.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Design n Dev',
      url: 'https://designndev.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://designndev.com/blogs/${blog.slug}`,
    },
    articleSection: blog.category,
    keywords: blog.metaKeywords?.join(', ') || blog.category,
  } : null;

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading... | Design n Dev</title>
        </Head>
        <div className={styles.blogDetailPage}>
          <Navbar />
          <main className="pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={styles.blogsLoading}>
                <p>Loading blog post...</p>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (error || !blog) {
    return (
      <>
        <Head>
          <title>Blog Not Found | Design n Dev</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className={styles.blogDetailPage}>
          <Navbar />
          <main className="pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={styles.blogsError}>
                <h1 className="text-3xl font-bold mb-4">Blog Not Found</h1>
                <p className="mb-8">{error || 'The blog post you are looking for does not exist.'}</p>
                <Link href="/blogs" className={styles.blogDetailBackLink}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Blogs
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
        <title>{blog.metaTitle || blog.title} | Design n Dev</title>
        <meta name="description" content={blog.metaDescription || blog.excerpt} />
        {blog.metaKeywords && blog.metaKeywords.length > 0 && (
          <meta name="keywords" content={blog.metaKeywords.join(', ')} />
        )}
        <meta property="og:title" content={blog.metaTitle || blog.title} />
        <meta property="og:description" content={blog.metaDescription || blog.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://designndev.com/blogs/${blog.slug}`} />
        {blog.ogImage && <meta property="og:image" content={blog.ogImage} />}
        {blog.featuredImage && !blog.ogImage && <meta property="og:image" content={blog.featuredImage} />}
        <meta property="article:published_time" content={blog.publishedAt} />
        {blog.updatedAt && <meta property="article:modified_time" content={blog.updatedAt} />}
        <meta property="article:author" content={blog.authorName} />
        <meta property="article:section" content={blog.category} />
        {blog.tags && blog.tags.length > 0 && (
          blog.tags.map((tag) => (
            <meta key={tag} property="article:tag" content={tag} />
          ))
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.metaTitle || blog.title} />
        <meta name="twitter:description" content={blog.metaDescription || blog.excerpt} />
        {blog.ogImage && <meta name="twitter:image" content={blog.ogImage} />}
        {blog.featuredImage && !blog.ogImage && <meta name="twitter:image" content={blog.featuredImage} />}
        <link rel="canonical" href={`https://designndev.com/blogs/${blog.slug}`} />
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
      </Head>
      <div className={styles.blogDetailPage}>
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className={styles.blogDetailBreadcrumb} aria-label="Breadcrumb">
              <Link href="/blogs" className={styles.blogDetailBreadcrumbLink}>
                Blog
              </Link>
              <span className="mx-2">/</span>
              <span>{blog.title}</span>
            </nav>

            <article className={styles.blogDetailArticle} itemScope itemType="https://schema.org/BlogPosting">
              <header className={styles.blogDetailHeader}>
                <span className={styles.blogDetailCategory} itemProp="articleSection">
                  {blog.category}
                </span>
                <div className={styles.blogDetailMeta}>
                  {blog.publishedAt && (
                    <time dateTime={blog.publishedAt} itemProp="datePublished">
                      {formatDate(blog.publishedAt)}
                    </time>
                  )}
                  {blog.readingTime && (
                    <span>
                      <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {blog.readingTime} min read
                    </span>
                  )}
                </div>
                <h1 className={styles.blogDetailTitle} itemProp="headline">
                  {blog.title}
                </h1>
                <p className={styles.blogDetailExcerpt} itemProp="description">
                  {blog.excerpt}
                </p>
                <div className={styles.blogDetailAuthor} itemProp="author" itemScope itemType="https://schema.org/Person">
                  <span itemProp="name">By {blog.authorName}</span>
                </div>
              </header>

              {blog.featuredImage && (
                <div className={styles.blogDetailImageWrapper}>
                  <img 
                    src={blog.featuredImage} 
                    alt={blog.title} 
                    className={styles.blogDetailImage}
                    itemProp="image"
                    loading="eager"
                  />
                </div>
              )}

              {blog.content && (
                <div className={styles.blogDetailContent}>
                  <div
                    className={styles.blogDetailContentBody}
                    itemProp="articleBody"
                    dangerouslySetInnerHTML={{ __html: (blog.content || '').replace(/\n/g, '<br />') }}
                  />
                </div>
              )}

              {blog.tags && blog.tags.length > 0 && (
                <div className={styles.blogDetailTags}>
                  <div className={styles.blogDetailTagsTitle}>Tags</div>
                  <div className={styles.blogDetailTagsList}>
                    {blog.tags.map((tag) => (
                      <span key={tag} className={styles.blogDetailTag} itemProp="keywords">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <footer className={styles.blogDetailFooter}>
                <Link href="/blogs" className={styles.blogDetailBackLink}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Blogs
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



