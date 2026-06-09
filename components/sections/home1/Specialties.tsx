'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface MediaItem {
  id: string;
  fileUrl: string;
  title?: string;
  altText?: string;
  description?: string;
  linkUrl?: string;
  displayOrder?: number;
}

export default function Specialties() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/media?position=specialties');
      const data = await response.json();
      if (data.success && data.media?.length > 0) {
        setItems(data.media);
      }
    } catch (err) {
      console.error('Failed to fetch specialties media:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  if (!loading && items.length === 0) return null;

  return (
    <section className="chooseus-section p_relative pt_120 pb_90" id="specialties">
      <div
        className="pattern-layer"
        style={{ backgroundImage: 'url(/assets/images/shape/shape-13.png)' }}
      />
      <div className="auto-container">
        <div className="sec-title mb_60 centred">
          <span className="sub-title mb_5">Specialties We Serve</span>
          <h2>Medical Specialties We Support</h2>
          <p style={{ maxWidth: '720px', margin: '15px auto 0', color: '#000' }}>
            From urgent care to specialty practices, we provide end-to-end medical billing and revenue cycle management
            tailored to each specialty.
          </p>
        </div>

        {loading ? (
          <div className="row clearfix justify-content-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-lg-3 col-md-4 col-sm-6">
                <div
                  className="skeleton"
                  style={{
                    height: '140px',
                    margin: '0 10px 20px',
                    borderRadius: '12px',
                    background: '#e0e0e0',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <Swiper
              modules={[Autoplay, Navigation]}

              spaceBetween={20}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={items.length > 4}
              navigation={{
                nextEl: '#specialties .swiper-next',
                prevEl: '#specialties .swiper-prev',
              }}
              breakpoints={{
                320: { slidesPerView: 2 },
                575: { slidesPerView: 3 },
                991: { slidesPerView: 4 },
                1200: { slidesPerView:5 },
              }}
              className="specialties-carousel"
            >
              {items.map((item) => {
                const inner = (
                  <SwiperSlide key={item.id}>
                  <div
                    className="specialty-simple-card"
                    style={{
                       textAlign: 'center',
                      padding: '24px 16px',
                      marginBottom: '20px',
                      background: '#fff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '120px',
                        height: '80px',
                        position: 'relative',
                        margin: '0 auto 12px',
                      }}
                    >
                      <Image
                        src={getCloudinaryImageUrl(item.fileUrl)}
                        alt={item.altText || item.title || 'Specialty'}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    {item.title && (
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#000' }}>{item.title}</span>
                    )}
                  </div>
                  </SwiperSlide>
                );

                return (
                  <SwiperSlide key={item.id}>
                    {item.linkUrl ? (
                      <Link
                        href={item.linkUrl}
                        style={{
                          textDecoration: 'none',
                          color: 'inherit',
                          display: 'block',
                          height: '100%',
                        }}
                      >
                        {inner}
                      </Link>
                    ) : (
                      inner
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
            <div className="nav-style-one" style={{ marginTop: '20px' }}>
              <div className="swiper-nav">
                <button type="button" className="swiper-prev">
                  <span className="icon-21" />
                </button>
                <button type="button" className="swiper-next">
                  <span className="icon-22" />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .specialties-carousel .specialty-simple-card:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.1); }

          
      `}} />
    </section>
  );
}
