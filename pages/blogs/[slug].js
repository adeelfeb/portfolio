import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

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

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading...</title>
        </Head>
        <div className="blog-page">
          <Header />
          <main className="blog-main">
            <div className="container">
              <div className="loading">Loading blog post...</div>
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
          <title>Blog Not Found</title>
        </Head>
        <div className="blog-page">
          <Header />
          <main className="blog-main">
            <div className="container">
              <div className="error">
                <h1>Blog Not Found</h1>
                <p>{error || 'The blog post you are looking for does not exist.'}</p>
                <a href="/blogs" className="back-link">← Back to Blogs</a>
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
        <title>{blog.metaTitle || blog.title}</title>
        <meta name="description" content={blog.metaDescription || blog.excerpt} />
        {blog.metaKeywords && blog.metaKeywords.length > 0 && (
          <meta name="keywords" content={blog.metaKeywords.join(', ')} />
        )}
        {blog.ogImage && (
          <>
            <meta property="og:image" content={blog.ogImage} />
            <meta property="og:title" content={blog.metaTitle || blog.title} />
            <meta property="og:description" content={blog.metaDescription || blog.excerpt} />
          </>
        )}
      </Head>
      <div className="blog-page">
        <Header />
        <main className="blog-main">
          <div className="container">
            <article className="blog-post">
              <header className="blog-post-header">
                <div className="blog-post-meta">
                  <span className="blog-category">{blog.category}</span>
                  {blog.publishedAt && (
                    <span className="blog-date">{formatDate(blog.publishedAt)}</span>
                  )}
                  {blog.readingTime && (
                    <span className="blog-reading-time">{blog.readingTime} min read</span>
                  )}
                </div>
                <h1 className="blog-post-title">{blog.title}</h1>
                <p className="blog-post-excerpt">{blog.excerpt}</p>
                <div className="blog-post-author">
                  <span>By {blog.authorName}</span>
                </div>
              </header>

              {blog.featuredImage && (
                <div className="blog-post-image">
                  <img src={blog.featuredImage} alt={blog.title} />
                </div>
              )}

              <div
                className="blog-post-content"
                dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }}
              />

              {blog.tags && blog.tags.length > 0 && (
                <div className="blog-post-tags">
                  <strong>Tags: </strong>
                  {blog.tags.map((tag, index) => (
                    <span key={tag} className="tag">
                      {tag}
                      {index < blog.tags.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}

              <div className="blog-post-footer">
                <a href="/blogs" className="back-link">← Back to Blogs</a>
              </div>
            </article>
          </div>
        </main>
        <Footer />
      </div>

      <style jsx>{`
        .blog-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .blog-main {
          flex: 1;
          padding: 3rem 0;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .blog-post {
          background: white;
          border-radius: 12px;
          padding: 3rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .blog-post-header {
          margin-bottom: 2rem;
        }

        .blog-post-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          flex-wrap: wrap;
        }

        .blog-category {
          color: #2563eb;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .blog-date,
        .blog-reading-time {
          color: #6b7280;
        }

        .blog-post-title {
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 1rem;
          color: #1a1a1a;
        }

        .blog-post-excerpt {
          font-size: 1.25rem;
          color: #666;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .blog-post-author {
          color: #888;
          font-size: 0.875rem;
        }

        .blog-post-image {
          width: 100%;
          margin: 2rem 0;
          border-radius: 8px;
          overflow: hidden;
        }

        .blog-post-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .blog-post-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #333;
          margin-bottom: 2rem;
        }

        .blog-post-tags {
          padding: 1.5rem 0;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 2rem;
          color: #666;
        }

        .blog-post-tags .tag {
          color: #2563eb;
        }

        .blog-post-footer {
          margin-top: 2rem;
        }

        .back-link {
          color: #2563eb;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: #1d4ed8;
        }

        .loading,
        .error {
          text-align: center;
          padding: 4rem 2rem;
        }

        .error h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #1a1a1a;
        }

        .error p {
          color: #666;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .blog-post {
            padding: 2rem 1.5rem;
          }

          .blog-post-title {
            font-size: 2rem;
          }

          .blog-post-excerpt {
            font-size: 1.125rem;
          }

          .blog-post-content {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}



