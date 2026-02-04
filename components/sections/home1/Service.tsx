'use client'

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
}

// Default icons array for fallback
const defaultIcons = ['icon-18', 'icon-19', 'icon-20', 'icon-21', 'icon-22', 'icon-23'];

// Function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  if (array.length === 0) return [];
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

export default function Service() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchServices();
  }, []);

  // Start autoplay when services are loaded
  useEffect(() => {
    if (!loading && services.length > 0 && swiperRef.current) {
      // Ensure autoplay is enabled
      if (swiperRef.current.autoplay) {
        swiperRef.current.autoplay.start();
      }
    }
  }, [loading, services]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      // Fetch more services to have enough for randomization
      const response = await fetch('/api/services?limit=20');
      const data = await response.json();

      if (data.success && data.services && data.services.length > 0) {
        // Get 3 random services
        const randomServices = getRandomItems<Service>(data.services as Service[], 3);
        setServices(randomServices);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  // Default services for skeleton/fallback
  const displayServices = loading 
    ? Array.from({ length: 3 }).map((_, i) => ({ 
        id: `skeleton-${i}`, 
        title: '', 
        slug: '', 
        description: '',
        imageUrl: '',
        icon: defaultIcons[i] || 'icon-18'
      }))
    : services.length > 0 
      ? services 
      : [];

  return (
    <section className="service-section p_relative">
      <div
        className="pattern-layer"
        style={{ backgroundImage: "url(/assets/images/shape/shape-13.png)" }}
      ></div>
      <span className="big-text">AGILLE NESUS SOLUTIONS</span>
      <div className="auto-container">
        <div className="sec-title mb_60">
          <span className="sub-title mb_5">What we do for our patients</span>
          <h2>Our Medical Departments Services</h2>
          <p>
            Medical care is the practice of providing diagnosis, treatment, and
            preventive care for various illnesses, injuries, and diseases. It
            involves a wide range of healthcare professionals such as doctors,
            nurses, pharmacists, therapists, and many more, who work together to
            provide the best possible care for patients.
          </p>
        </div>

        {/* ✅ Swiper wrapper */}
        {displayServices.length > 0 && (
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            slidesPerView={1}
            spaceBetween={30}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: false,
            }}
            loop={displayServices.length >= 3}
            navigation={{
              nextEl: '.swiper-prev',
              prevEl: '.swiper-next',
            }}
            breakpoints={{
              320: { slidesPerView: 1 },
              575: { slidesPerView: 1 },
              767: { slidesPerView: 2 },
              991: { slidesPerView: 2 },
              1199: { slidesPerView: 3 },
              1350: { slidesPerView: 3 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              // Start autoplay immediately
              if (swiper.autoplay) {
                swiper.autoplay.start();
              }
            }}
            className="three-item-carousel owl-theme nav-style-one"
          >
            {displayServices.map((service, index) => (
              <SwiperSlide key={service.id || `service-${index}`}>
                <div className="service-block-one">
                  <div className="inner-box">
                    <figure className="image-box">
                      {loading ? (
                        <div className="skeleton" style={{ 
                          width: '100%', 
                          height: '358px', 
                          background: '#e0e0e0', 
                          borderRadius: '10px',
                          animation: 'pulse 1.5s ease-in-out infinite'
                        }}></div>
                      ) : service.imageUrl ? (
                        <Image
                          src={getCloudinaryImageUrl(service.imageUrl)}
                          alt={service.title || 'Service'}
                          width={416}
                          height={358}
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      ) : (
                        <Image
                          src="/assets/images/service/service-1.jpg"
                          alt={service.title || 'Service'}
                          width={416}
                          height={358}
                        />
                      )}
                    </figure>
                    <div className="lower-content">
                      <div className="inner">
                        <div className="icon-box">
                          <i className={service.icon || defaultIcons[index] || 'icon-18'}></i>
                        </div>
                        <h3>
                          {loading ? (
                            <div className="skeleton" style={{ 
                              width: '80%', 
                              height: '24px', 
                              background: '#e0e0e0', 
                              borderRadius: '4px',
                              marginBottom: '10px'
                            }}></div>
                          ) : (
                            <Link href={`/services/${service.slug}`}>{service.title || 'Service'}</Link>
                          )}
                        </h3>
                        {loading ? (
                          <div className="skeleton" style={{ 
                            width: '100%', 
                            height: '16px', 
                            background: '#e0e0e0', 
                            borderRadius: '4px'
                          }}></div>
                        ) : (
                          <p>{service.description || 'Professional healthcare service.'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <div className="nav-style-one">
            <div className="swiper-nav">
                <button type="button" className="swiper-prev"><span className="icon-21"></span></button>
                <button type="button" className="swiper-next"><span className="icon-22"></span></button>
            </div>
        </div>
      </div>
    </section>
  );
}
