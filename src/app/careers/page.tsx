'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import Layout from "../../../components/layout/Layout";
import Link from "next/link";
import Cta from "../../../components/sections/home2/Cta";
import { useSearchParams, useRouter } from 'next/navigation';

interface Career {
  id: string;
  title: string;
  slug: string;
  department?: string;
  location?: string;
  type?: string;
  description?: string;
  requirements?: string;
  created_at: string;
  updated_at: string;
}

function CareersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mounted, setMounted] = useState(false);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize mounted state and URL params on client side only
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const page = parseInt(searchParams.get('page') || '1', 10);
      const search = searchParams.get('search') || '';
      
      setCurrentPage(page);
      setSearchTerm(search);
      setDebouncedSearchTerm(search);
    }
  }, [searchParams]);

  // Debounce search term - wait 500ms after user stops typing
  useEffect(() => {
    if (!mounted) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, mounted]);

  const fetchCareers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      });

      const response = await fetch(`/api/careers?${params}`);
      const data = await response.json();

      if (data.success) {
        setCareers(data.careers || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch careers:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm]);

  // Fetch careers when page or debounced search changes (after mounted)
  useEffect(() => {
    if (!mounted) return;
    fetchCareers();
  }, [mounted, currentPage, debouncedSearchTerm, fetchCareers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    params.set('page', '1');
    router.push(`/careers?${params}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm);
    params.set('page', page.toString());
    router.push(`/careers?${params}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!mounted) {
    return (
      <div className="boxed_wrapper">
        <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Careers">
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
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Careers">
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
                  ) : careers.length === 0 ? (
                    <div className="text-center py-5">
                      <p>No career opportunities found.</p>
                    </div>
                  ) : (
                    <>
                      <div className="row clearfix" suppressHydrationWarning>
                        {careers.map((career) => (
                          <div key={career.id} className="col-lg-6 col-md-6 col-sm-12 news-block" suppressHydrationWarning>
                            <div className="news-block-one">
                              <div className="inner-box">
                                <div className="lower-content">
                                  <h3>
                                    <Link href={`/careers/${career.slug}`}>{career.title}</Link>
                                  </h3>
                                  <ul className="post-info clearfix">
                                    {career.department && (
                                      <li><i className="icon-59"></i>{career.department}</li>
                                    )}
                                    {career.location && (
                                      <li><i className="icon-60"></i>{career.location}</li>
                                    )}
                                    {career.type && (
                                      <li><i className="icon-61"></i>{career.type}</li>
                                    )}
                                  </ul>
                                  <p>{career.description?.substring(0, 150) || 'No description available'}...</p>
                                  <div className="link">
                                    <Link href={`/careers/${career.slug}`}>View Details</Link>
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
                              <img src="/assets/images/icons/icon-21.svg" alt="Icon" width={23} height={5} />
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
                          <img src="/assets/images/icons/icon-22.svg" alt="Icon" width={20} height={20} />
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="consulting-widget">
                    <div className="bg-layer" style={{ backgroundImage: "url(assets/images/resource/sidebar-1.jpg)" }}></div>
                    <h3>Join Our <br />Team Today!</h3>
                    <p>We're always looking for talented individuals to join our team. Explore our open positions and find your next career opportunity.</p>
                    <Link href="/contact" className="theme-btn btn-two"><span>Contact Us</span></Link>
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

export default function CareersPage() {
  return (
    <Suspense fallback={
      <div className="boxed_wrapper">
        <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Careers">
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
      <CareersPageContent />
    </Suspense>
  );
}
