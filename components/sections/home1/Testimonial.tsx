'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface MediaItem {
  id: string;
  fileUrl?: string;
  title?: string;
  altText?: string;
  description?: string;
  displayOrder?: number;
}

export default function Testimonial() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/media?position=testimonials');
      const data = await response.json();
      if (data.success && data.media?.length > 0) {
        setItems(data.media);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  if (!loading && items.length === 0) return null;

  return (
    <section className="testimonial-section sec-pad p_relative" id="testimonials">
      <div
        className="pattern-layer"
        style={{ backgroundImage: 'url(/assets/images/shape/shape-36.png)' }}
      />
      <div className="auto-container">
        <div className="sec-title centred mb_60">
          <span className="sub-title mb_5">Testimonials</span>
          <h2>
            What Our Clients Say About <br />
            Agile Nexus Solutions
          </h2>
          <p>
            Healthcare providers and billing companies across the USA trust Agile Nexus Solutions to keep their revenue cycle running smoothly. Here’s what some of them have to say about working with us.
          </p>
          <Link href="/testimonials/submit" className="theme-btn btn-one mt-3" style={{ marginTop: '12px' }}>
            <span>Share your experience</span>
          </Link>
        </div>

        {loading ? (
          <div className="row clearfix">
            <div className="col-12">
              <div className="testimonial-block-one">
                <div className="inner-box">
                  <div className="skeleton" style={{ height: '24px', width: '60%', marginBottom: '16px', borderRadius: '4px', background: '#e0e0e0' }} />
                  <div className="skeleton" style={{ height: '80px', width: '100%', borderRadius: '4px', background: '#e0e0e0' }} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={2}
            navigation={{
              nextEl: '.testimonial-section .swiper-next',
              prevEl: '.testimonial-section .swiper-prev',
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={items.length >= 2}
            speed={500}
            breakpoints={{
              320: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
            }}
            className="testimonial-swiper"
          >
            {items.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="testimonial-block-one">
                  <div className="inner-box">
                    <div className="icon-box">
                      <i className="icon-41" />
                    </div>
                    <div className={`author-box ${!item.fileUrl ? 'author-box-no-thumb' : ''}`}>
                      {item.fileUrl ? (
                        <figure className="author-thumb">
                          <Image
                            src={getCloudinaryImageUrl(item.fileUrl)}
                            alt={item.altText || item.title || 'Testimonial author'}
                            width={140}
                            height={140}
                            style={{ objectFit: 'cover', borderRadius: '50%', width: '100%', height: '100%' }}
                          />
                        </figure>
                      ) : null}
                      <h3>{item.title || 'Client'}</h3>
                      <ul className="rating clearfix">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <li key={i}>
                            <i className="icon-42" />
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-box">
                      <p>{item.description || ''}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {!loading && items.length > 0 && (
          <div className="nav-style-one">
            <div className="swiper-nav">
              <button type="button" className="swiper-prev" aria-label="Previous">
                <span className="icon-21" />
              </button>
              <button type="button" className="swiper-next" aria-label="Next">
                <span className="icon-22" />
              </button>
            </div>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .testimonial-section .author-box .designation { display: none; }
        .testimonial-section .author-box.author-box-no-thumb { padding-left: 0; }
      `}} />
    </section>
  );
}
