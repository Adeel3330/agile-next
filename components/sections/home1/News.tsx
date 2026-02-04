'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface Blog {
  id: string;
  title: string;
  slug: string;
  description?: string;
  file: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  created_at: string;
}

export default function News() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blogs?limit=6');
      const data = await response.json();

      if (data.success && data.blogs) {
        setBlogs(data.blogs);
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Default blogs for skeleton/fallback
  const displayBlogs: Blog[] = loading 
    ? Array.from({ length: 3 }).map((_, i) => ({ 
        id: `skeleton-${i}`, 
        title: '', 
        slug: '', 
        file: '', 
        created_at: '',
        category: null
      }))
    : blogs.length > 0 
      ? blogs 
      : [];

  if (!mounted) {
    return null;
  }

  return (
    <section className="news-section sec-pad">
      <div className="auto-container">
        <div className="sec-title centred mb_60">
          <span className="sub-title mb_5">Latest News</span>
          <h2>Resources to Keep You Informed <br />with Our Blog</h2>
          <p>
            Medical care is the practice of providing diagnosis, treatment, and preventive care for various <br />
            illnesses, injuries, and diseases. It
          </p>
        </div>

        {loading ? (
          <div className="row clearfix">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="col-lg-4 col-md-6 col-sm-12 news-block">
                <div className="news-block-one">
                  <div className="inner-box">
                    <figure className="image-box">
                      <div style={{ 
                        width: '100%', 
                        height: '300px', 
                        background: '#e0e0e0', 
                        borderRadius: '8px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                    </figure>
                    <div className="lower-content">
                      <div style={{ 
                        width: '100px', 
                        height: '20px', 
                        background: '#e0e0e0', 
                        borderRadius: '4px',
                        marginBottom: '15px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                      <div style={{ 
                        width: '80%', 
                        height: '24px', 
                        background: '#e0e0e0', 
                        borderRadius: '4px',
                        marginBottom: '10px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                      <div style={{ 
                        width: '60%', 
                        height: '16px', 
                        background: '#e0e0e0', 
                        borderRadius: '4px',
                        marginBottom: '15px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                      <div style={{ 
                        width: '100%', 
                        height: '60px', 
                        background: '#e0e0e0', 
                        borderRadius: '4px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayBlogs.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No blogs available at the moment.</p>
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            slidesPerView={1}
            spaceBetween={30}
            loop={displayBlogs.length > 3}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation={{ nextEl: '.swiper-next', prevEl: '.swiper-prev' }}
            breakpoints={{
              320: { slidesPerView: 1 },
              575: { slidesPerView: 1 },
              767: { slidesPerView: 2 },
              991: { slidesPerView: 2 },
              1199: { slidesPerView: 3 },
            }}
          >
            {displayBlogs.map((blog) => (
              <SwiperSlide key={blog.id}>
                <div className="news-block-one">
                  <div className="inner-box">
                    <figure className="image-box">
                      <Link href={`/blog-details/${blog.slug}`}>
                        {blog.file ? (
                          <Image 
                            src={getCloudinaryImageUrl(blog.file)} 
                            alt={blog.title} 
                            width={400} 
                            height={300}
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <Image 
                            src="/assets/images/news/news-1.jpg" 
                            alt={blog.title} 
                            width={400} 
                            height={300}
                          />
                        )}
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
                        <li><i className="icon-59"></i>{formatDate(blog.created_at)}</li>
                        {blog.category && (
                          <li><i className="icon-60"></i><Link href={`/blog?category=${blog.category.slug}`}>{blog.category.name}</Link></li>
                        )}
                      </ul>
                      {blog.description && (
                        <p>{blog.description.length > 100 ? blog.description.substring(0, 100) + '...' : blog.description}</p>
                      )}
                      <div className="link">
                        <Link href={`/blog-details/${blog.slug}`}>Read More</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}

            {/* Navigation buttons */}
            <div className="nav-style-one">
              <div className="swiper-nav">
                <button type="button" className="swiper-prev"><span className="icon-21"></span></button>
                <button type="button" className="swiper-next"><span className="icon-22"></span></button>
              </div>
            </div>
          </Swiper>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}} />
    </section>
  );
}
