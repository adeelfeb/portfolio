import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Head from 'next/head';
import Navbar from '../../components/designndev/Navbar';
import Footer from '../../components/designndev/Footer';

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
          <title>Loading... | Design n Dev</title>
        </Head>
        <div className="min-h-screen bg-white">
          <Navbar />
          <main className="pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-16 text-gray-600">Loading blog post...</div>
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
        </Head>
        <div className="min-h-screen bg-white">
          <Navbar />
          <main className="pt-24 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-16">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Not Found</h1>
                <p className="text-gray-600 mb-8">{error || 'The blog post you are looking for does not exist.'}</p>
                <a href="/blogs" className="text-blue-600 hover:text-blue-700 font-medium">← Back to Blogs</a>
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
        {blog.ogImage && (
          <>
            <meta property="og:image" content={blog.ogImage} />
            <meta property="og:title" content={blog.metaTitle || blog.title} />
            <meta property="og:description" content={blog.metaDescription || blog.excerpt} />
          </>
        )}
        <link rel="canonical" href={`https://designndev.com/blogs/${blog.slug}`} />
      </Head>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article className="bg-white rounded-xl shadow-lg overflow-hidden p-8 md:p-12">
              <header className="mb-8">
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <span className="text-blue-600 text-sm font-semibold uppercase tracking-wide">
                    {blog.category}
                  </span>
                  {blog.publishedAt && (
                    <span className="text-gray-500 text-sm">{formatDate(blog.publishedAt)}</span>
                  )}
                  {blog.readingTime && (
                    <span className="text-gray-500 text-sm">{blog.readingTime} min read</span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{blog.title}</h1>
                <p className="text-xl text-gray-600 leading-relaxed mb-4">{blog.excerpt}</p>
                <div className="text-gray-500 text-sm">
                  <span>By {blog.authorName}</span>
                </div>
              </header>

              {blog.featuredImage && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <img src={blog.featuredImage} alt={blog.title} className="w-full h-auto" />
                </div>
              )}

              <div
                className="prose prose-lg max-w-none mb-8 text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }}
              />

              {blog.tags && blog.tags.length > 0 && (
                <div className="pt-8 border-t border-gray-200 mb-8">
                  <div className="flex flex-wrap gap-2">
                    <strong className="text-gray-900">Tags: </strong>
                    {blog.tags.map((tag, index) => (
                      <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-gray-200">
                <a href="/blogs" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Blogs
                </a>
              </div>
            </article>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}



