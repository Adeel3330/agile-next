'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from "../../../../components/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import Cta from "../../../../components/sections/home2/Cta";
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface Blog {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  file: string;
  seoTitle?: string;
  seoContent?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function BlogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [blog, setBlog] = useState<Blog | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBlog = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/blogs/${slug}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Blog not found');
        setLoading(false);
        return;
      }

      setBlog(data.blog);
    } catch (err) {
      console.error('Failed to fetch blog:', err);
      setError('Failed to load blog');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchCategories = useCallback(async () => {
    try {
      // Fetch only child categories of 'blog-categories' parent
      const response = await fetch('/api/categories/blog-categories');
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchLatestBlogs = useCallback(async () => {
    try {
      const response = await fetch('/api/blogs?limit=3');
      const data = await response.json();

      if (data.success) {
        setLatestBlogs(data.blogs || []);
      }
    } catch (err) {
      console.error('Failed to fetch latest blogs:', err);
    }
  }, []);

  useEffect(() => {
    if (slug) {
      fetchBlog();
      fetchCategories();
      fetchLatestBlogs();
    }
  }, [slug, fetchBlog, fetchCategories, fetchLatestBlogs]);

  // Update document metadata for SEO
  useEffect(() => {
    if (blog) {
      const title = blog.seoTitle || blog.title;
      const description = blog.seoContent || blog.description || blog.content?.substring(0, 160) || '';
      const image = blog.file || '';

      // Update document title
      document.title = title;

      // Update or create meta tags
      const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attribute, name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      // Update meta tags
      updateMetaTag('description', description);
      updateMetaTag('og:title', title, 'property');
      updateMetaTag('og:description', description, 'property');
      updateMetaTag('og:image', image, 'property');
      updateMetaTag('og:url', typeof window !== 'undefined' ? window.location.href : '', 'property');
      updateMetaTag('og:type', 'article', 'property');
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', title);
      updateMetaTag('twitter:description', description);
      updateMetaTag('twitter:image', image);
      
      if (blog.category) {
        updateMetaTag('keywords', blog.category.name);
      }
    }
  }, [blog]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getPlaceholderImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODU2IiBoZWlnaHQ9IjQyNSIgdmlld0JveD0iMCAwIDg1NiA0MjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4NTYiIGhlaWdodD0iNDI1IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MjggMjEyLjVINDI4LjVWNDI0LjVINDI4VjIxMi41WiIgZmlsbD0iI0NDQyIvPgo8cGF0aCBkPSJNMzg1LjUgMjM1TDQyOCAyMTIuNUw0NzAuNSAyMzVIMzg1LjVaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=';
  };

  if (loading) {
    return (
      <div className="boxed_wrapper">
        <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Blog Details">
          <section className="sidebar-page-container pt_120 pb_120">
            <div className="auto-container">
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </section>
        </Layout>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="boxed_wrapper">
        <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Blog Details">
          <section className="sidebar-page-container pt_120 pb_120">
            <div className="auto-container">
              <div className="text-center py-5">
                <h3>Blog Not Found</h3>
                <p>{error || 'The blog you are looking for does not exist.'}</p>
                <Link href="/blog" className="theme-btn btn-one">Back to Blog</Link>
              </div>
            </div>
          </section>
        </Layout>
      </div>
    );
  }

  return (
    <div className="boxed_wrapper">
        <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={blog.title}>
          <section className="sidebar-page-container pt_120 pb_120">
            <div className="auto-container">
              <div className="row clearfix">
                <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                  <div className="blog-details-content">
                    <div className="news-block-one">
                      <div className="inner-box">
                        <figure className="image-box">
                          <Image 
                            src={getCloudinaryImageUrl(blog.file, 856, 425) || getPlaceholderImage()} 
                            alt={blog.title} 
                            width={856} 
                            height={425} 
                            priority 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getPlaceholderImage();
                            }}
                          />
                        </figure>
                        <div className="lower-content">
                          {blog.category && (
                            <span className="comment-box">{blog.category.name}</span>
                          )}
                          <h3>{blog.title}</h3>
                          <ul className="post-info clearfix">
                            <li><i className="icon-59"></i>{formatDate(blog.created_at)}</li>
                            <li><i className="icon-60"></i><Link href="/blog">Admin</Link></li>
                          </ul>
                          {blog.description && (
                            <p>{blog.description}</p>
                          )}
                          {blog.content && (
                            <div 
                              dangerouslySetInnerHTML={{ __html: blog.content }} 
                              className="blog-content"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="post-share-option mb_60">
                      <ul className="post-tags clearfix">
                        <li><h4>Tags:</h4></li>
                        {blog.category && (
                          <li><Link href={`/blog?category=${blog.category.slug}`}>{blog.category.name}</Link></li>
                        )}
                      </ul>
                      <ul className="post-share clearfix">
                        <li><h4>Share:</h4></li>
                        <li>
                          <Link 
                            href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fab fa-facebook-f"></i>
                          </Link>
                        </li>
                        <li>
                          <Link 
                            href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}&text=${encodeURIComponent(blog.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fab fa-twitter"></i>
                          </Link>
                        </li>
                        <li>
                          <Link 
                            href={`https://www.linkedin.com/shareArticle?mini=true&url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}&title=${encodeURIComponent(blog.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fab fa-linkedin-in"></i>
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="author-box mb_60">
                      <figure className="author-thumb">
                        <Image src="/assets/images/news/author-1.jpg" alt="Author" width={172} height={172} priority />
                      </figure>
                      <h3>Admin</h3>
                      <p>Our expert team provides professional insights and updates on medical billing, healthcare management, and industry best practices.</p>
                      <ul className="social-links clearfix">
                        <li><Link href="#"><i className="fab fa-facebook-f"></i></Link></li>
                        <li><Link href="#"><i className="fab fa-twitter"></i></Link></li>
                        <li><Link href="#"><i className="fab fa-linkedin-in"></i></Link></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 col-md-12 col-sm-12 sidebar-side">
                  <div className="blog-sidebar">
                    <div className="search-widget mb_40">
                      <h3>Search Here</h3>
                      <form method="post" action="/blog">
                        <div className="form-group">
                          <input type="search" name="search-field" placeholder="keywords" required/>
                          <button type="submit">
                            <Image src="/assets/images/icons/icon-22.svg" alt="Icon" width={20} height={20} priority />
                          </button>
                        </div>
                      </form>
                    </div>
                    <div className="sidebar-widget category-widget mb_40">
                      <div className="widget-title">
                        <h3>Category</h3>
                      </div>
                      <div className="widget-content">
                        <ul className="category-list clearfix">
                          {categories.map((category) => (
                            <li key={category.id}>
                              <Link href={`/blog?category=${category.slug}`}>{category.name}</Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="sidebar-widget post-widget mb_40">
                      <div className="widget-title">
                        <h3>Latest News</h3>
                      </div>
                      <div className="post-inner">
                        {latestBlogs.map((latestBlog) => (
                          <div key={latestBlog.id} className="post">
                            <figure className="post-thumb">
                              <Link href={`/blog-details/${latestBlog.slug}`}>
                                <Image 
                                  src={getCloudinaryImageUrl(latestBlog.file, 100, 101) || getPlaceholderImage()} 
                                  alt={latestBlog.title} 
                                  width={100} 
                                  height={101} 
                                  priority 
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = getPlaceholderImage();
                                  }}
                                />
                              </Link>
                            </figure>
                            <h3>
                              <Link href={`/blog-details/${latestBlog.slug}`}>{latestBlog.title}</Link>
                            </h3>
                            <ul className="post-info clearfix">
                              <li><i className="icon-59"></i>{formatDate(latestBlog.created_at)}</li>
                              <li><i className="icon-60"></i><Link href={`/blog-details/${latestBlog.slug}`}>Admin</Link></li>
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="consulting-widget">
                      <div className="bg-layer" style={{ backgroundImage: "url(assets/images/resource/sidebar-1.jpg)" }}></div>
                      <h3>Get Free <br />Consultations Today!</h3>
                      <p>Speak with our expert team and receive professional advice on your next project. No obligation, no cost. Schedule your consultation now!</p>
                      <Link href="/contact" className="theme-btn btn-two"><span>get a quote</span></Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <Cta/>
        </Layout>
      </div>
  );
}
