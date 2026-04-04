'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

export default function Service() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services?limit=20');
      const data = await res.json();
      if (data?.success) {
        setServices(data.services || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const displayServices = loading
    ? Array.from({ length: 6 }).map((_, i) => ({
        id: `skeleton-${i}`,
        title: '',
        slug: '',
        description: '',
        imageUrl: '',
      }))
    : services;

  return (
    <section className="service-section p_relative" id="services">
      <div
        className="pattern-layer"
        style={{ backgroundImage: 'url(/assets/images/shape/shape-13.png)' }}
      ></div>

      <span className="big-text">AGILLE NEXUS SOLUTIONS</span>

      <div className="auto-container">
        <div className="sec-title mb_60">
          <span className="sub-title mb_5">What we do</span>
          <h2>Our Revenue Cycle Management Services</h2>
          <p>
            We help healthcare providers optimize their revenue cycle with
            accurate billing, compliance, and faster reimbursements.
          </p>
        </div>

        {displayServices.length > 0 && (
          <Swiper
            modules={[Autoplay, Navigation]}
            loop={displayServices.length > 3}
            spaceBetween={30}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              320: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1200: { slidesPerView: 3 },
            }}
            navigation={{
              nextEl: '#services .swiper-next',
              prevEl: '#services .swiper-prev',
            }}
            className="service-swiper"
          >
            {displayServices.map((service, index) => (
              <SwiperSlide key={service.id || index}>
                <div className="service-block-one">
                  <div className="inner-box">
                    <figure className="image-box">
                      {loading ? (
                        <div className="skeleton-img" />
                      ) : (
                        <Image
                          src={
                            service.imageUrl
                              ? getCloudinaryImageUrl(service.imageUrl)
                              : '/assets/images/service/service-1.jpg'
                          }
                          alt={service.title}
                          width={416}
                          height={358}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </figure>

                    <div className="lower-content">
                      <div className="inner">
                        <h3>
                          {loading ? (
                            <div className="skeleton-text title" />
                          ) : (
                            <Link href={`/services/${service.slug}`}>
                              {service.title}
                            </Link>
                          )}
                        </h3>

                        {loading ? (
                          <div className="skeleton-text desc" />
                        ) : (
                          
                           <div
                              className='homepage-service-text'
                              dangerouslySetInnerHTML={{ __html: (service?.description || 'test').slice(0, 100) + '...' }}
                            />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Navigation */}
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
      </div>
    </section>
      
  );
}

