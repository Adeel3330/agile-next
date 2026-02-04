'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import Layout from "../../../components/layout/Layout";
import Image from "next/image";
import Link from "next/link";
import Cta from "../../../components/sections/home2/Cta";
import { useSearchParams, useRouter } from 'next/navigation';
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
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

function BlogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mounted, setMounted] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize mounted state and URL params on client side only
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const page = parseInt(searchParams.get('page') || '1', 10);
      const search = searchParams.get('search') || '';
      const category = searchParams.get('category') || '';
      
      setCurrentPage(page);
      setSearchTerm(search);
      setDebouncedSearchTerm(search);
      setSelectedCategory(category);
    }
  }, [searchParams]);

  // Debounce search term - wait 500ms after user stops typing
  useEffect(() => {
    if (!mounted) return;

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    // Cleanup on unmount or when searchTerm changes
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, mounted]);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await fetch(`/api/blogs?${params}`);
      const data = await response.json();

      if (data.success) {
        setBlogs(data.blogs || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, selectedCategory]);

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

  // Only fetch data after component is mounted
  useEffect(() => {
    if (!mounted) return;
    fetchCategories();
    fetchLatestBlogs();
  }, [mounted, fetchCategories, fetchLatestBlogs]);

  // Fetch blogs when page, debounced search, or category changes (after mounted)
  useEffect(() => {
    if (!mounted) return;
    fetchBlogs();
  }, [mounted, currentPage, debouncedSearchTerm, selectedCategory, fetchBlogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    params.set('category', categorySlug);
    params.set('page', '1');
    router.push(`/blog?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    params.set('page', page.toString());
    router.push(`/blog?${params.toString()}`);
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getPlaceholderImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDE2IiBoZWlnaHQ9IjI4NyIgdmlld0JveD0iMCAwIDQxNiAyODciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MTYiIGhlaWdodD0iMjg3IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMDggMTQzLjVIMjA4LjVWMjA4LjVIMjA4VjE0My41WiIgZmlsbD0iI0NDQyIvPgo8cGF0aCBkPSJNMTg1LjUgMTY2TDIwOCAxNDMuNUwyMzAuNSAxNjZIMTg1LjVaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo=';
  };

  if (!mounted) {
    return (
        <div className="boxed_wrapper">
            <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Blog Grid">
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

  return (
    <div className="boxed_wrapper" suppressHydrationWarning>
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Blog Grid">
        <section className="sidebar-page-container pt_120 pb_120">
          <div className="auto-container">
            <div className="row clearfix">
              <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                <div className="blog-grid-content" suppressHydrationWarning>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </div>
                  ) : blogs.length === 0 ? (
                    <div className="text-center py-5">
                      <p>No blogs found.</p>
                                                </div>
                  ) : (
                    <>
                      <div className="row clearfix" suppressHydrationWarning>
                        {blogs.map((blog) => (
                          <div key={blog.id} className="col-lg-6 col-md-6 col-sm-12 news-block" suppressHydrationWarning>
                                            <div className="news-block-one">
                                                <div className="inner-box">
                                <figure className="image-box">
                                  <Link href={`/blog-details/${blog.slug}`}>
                                    <Image 
                                      src={getCloudinaryImageUrl(blog.file, 416, 287) || getPlaceholderImage()} 
                                      alt={blog.title} 
                                      width={416} 
                                      height={287} 
                                      priority 
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = getPlaceholderImage();
                                      }}
                                    />
                                  </Link>
                                </figure>
                                                    <div className="lower-content">
                                  {blog.category && (
                                    <span className="comment-box">{blog.category.name}</span>
                                  )}
                                  <h3>
                                    <Link href={`/blog-details/${blog.slug}`}>{blog.title}</Link>
                                  </h3>
                                                        <ul className="post-info clearfix">
                                    <li suppressHydrationWarning><i className="icon-59"></i>{formatDate(blog.created_at)}</li>
                                    <li><i className="icon-60"></i><Link href={`/blog-details/${blog.slug}`}>Admin</Link></li>
                                                        </ul>
                                  <p>{blog.description || blog.content?.substring(0, 150) + '...'}</p>
                                                        <div className="link">
                                    <Link href={`/blog-details/${blog.slug}`}>Read More</Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                        ))}
                                                        </div>
                      {totalPages > 1 && (
                                    <div className="pagination-wrapper centred" suppressHydrationWarning>
                                        <ul className="pagination clearfix">
                            <li>
                              <Link 
                                href="#" 
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage > 1) handlePageChange(currentPage - 1);
                                }}
                                className={mounted && currentPage === 1 ? 'disabled' : ''}
                                suppressHydrationWarning
                              >
                                <i className="icon-21"></i>
                              </Link>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                              <li key={page}>
                                <Link
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handlePageChange(page);
                                  }}
                                  className={mounted && currentPage === page ? 'current' : ''}
                                  suppressHydrationWarning
                                >
                                  {String(page).padStart(2, '0')}
                                </Link>
                              </li>
                            ))}
                            <li className="dotted">
                              <Image src="/assets/images/icons/icon-21.svg" alt="Icon" width={23} height={5} priority />
                            </li>
                            <li>
                              <Link
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                }}
                                className={mounted && currentPage === totalPages ? 'disabled' : ''}
                                suppressHydrationWarning
                              >
                                <i className="icon-22"></i>
                              </Link>
                            </li>
                                        </ul>
                                    </div>
                      )}
                    </>
                  )}
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-12 col-sm-12 sidebar-side">
                                <div className="blog-sidebar" suppressHydrationWarning>
                                    <div className="search-widget mb_40">
                                        <h3>Search Here</h3>
                    <form method="post" onSubmit={handleSearch}>
                                            <div className="form-group">
                        <input 
                          type="search" 
                          name="search-field" 
                          placeholder="keywords" 
                          value={mounted ? searchTerm : ''}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          required
                          suppressHydrationWarning
                        />
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
                                            <ul className="category-list clearfix" suppressHydrationWarning>
                        <li>
                          <Link 
                            href="/blog?page=1"
                            className={mounted && !selectedCategory ? 'active' : ''}
                            suppressHydrationWarning
                          >
                            All Categories
                          </Link>
                        </li>
                        {categories.map((category) => (
                          <li key={category.id}>
                            <Link 
                              href={`/blog?category=${category.slug}`}
                              className={mounted && selectedCategory === category.slug ? 'active' : ''}
                              suppressHydrationWarning
                            >
                              {category.name}
                            </Link>
                          </li>
                        ))}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="sidebar-widget post-widget mb_40">
                                        <div className="widget-title">
                                            <h3>Latest News</h3>
                                        </div>
                                        <div className="post-inner" suppressHydrationWarning>
                      {latestBlogs.map((blog) => (
                        <div key={blog.id} className="post">
                          <figure className="post-thumb">
                            <Link href={`/blog-details/${blog.slug}`}>
                              <Image 
                                src={getCloudinaryImageUrl(blog.file, 100, 101) || getPlaceholderImage()} 
                                alt={blog.title} 
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
                            <Link href={`/blog-details/${blog.slug}`}>{blog.title}</Link>
                          </h3>
                                                <ul className="post-info clearfix">
                            <li suppressHydrationWarning><i className="icon-59"></i>{formatDate(blog.created_at)}</li>
                            <li><i className="icon-60"></i><Link href={`/blog-details/${blog.slug}`}>Admin</Link></li>
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

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="boxed_wrapper">
        <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Blog Grid">
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
    }>
      <BlogPageContent />
    </Suspense>
  );
}
