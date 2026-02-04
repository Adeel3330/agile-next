'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Slider = {
  id: string;
  title: string;
  description?: string;
  file: string;
  fileType: 'image' | 'video';
  seoTitle?: string;
  seoContent?: string;
};

const swiperOptions = {
  modules: [Autoplay, Pagination, Navigation],
  slidesPerView: 1,
  spaceBetween: 30,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
  loop: true,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  breakpoints: {
    320: { slidesPerView: 1 },
    575: { slidesPerView: 1 },
    767: { slidesPerView: 1 },
    991: { slidesPerView: 1 },
    1199: { slidesPerView: 1 },
    1350: { slidesPerView: 1 },
  },
};

export default function Banner() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSliders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/sliders?limit=5');
        const data = await res.json();
        if (!data.success) {
          setError(data.message || 'Failed to load sliders');
          setLoading(false);
          return;
        }
        setSliders(data.sliders || []);
      } catch (err) {
        console.error('Public sliders fetch error:', err);
        setError('Failed to load sliders');
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  const hasSliders = sliders && sliders.length > 0;

  return (
    <section className="banner-section p_relative">
      <div
        className="pattern-layer"
        style={{ backgroundImage: 'url(/assets/images/shape/shape-3.png)' }}
      ></div>

      {loading && !hasSliders ? (
        <div className="auto-container py-5">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
            <div className="content-box p_relative d_block z_5 mb-4 mb-md-0" style={{ maxWidth: 600 }}>
              <div
                style={{
                  width: '160px',
                  height: '18px',
                  background: '#e0e0e0',
                  borderRadius: '4px',
                  marginBottom: '12px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: '100%',
                  height: '40px',
                  background: '#e0e0e0',
                  borderRadius: '4px',
                  marginBottom: '12px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: '90%',
                  height: '16px',
                  background: '#e0e0e0',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: '80%',
                  height: '16px',
                  background: '#e0e0e0',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <div
                style={{
                  width: '140px',
                  height: '40px',
                  background: '#e0e0e0',
                  borderRadius: '20px',
                  marginTop: '16px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            </div>
            <div className="image-box">
              <div
                style={{
                  width: '320px',
                  height: '320px',
                  background: '#e0e0e0',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <Swiper {...swiperOptions} className="swiper-container banner-carousel">
          {(hasSliders ? sliders : []).map((slider) => (
            <SwiperSlide key={slider.id}>
              <div className="slide-item p_relative">
                {/* Pattern Layer */}
                <div className="pattern-layer">
                  <div
                    className="pattern-1"
                    style={{ backgroundImage: 'url(/assets/images/shape/shape-1.png)' }}
                  />
                  <div
                    className="pattern-2"
                    style={{ backgroundImage: 'url(/assets/images/shape/shape-2.png)' }}
                  />
                </div>

                {/* Shape Layer */}
                <div className="shape-layer">
                  <div
                    className="shape-1 float-bob-y"
                    style={{ backgroundImage: 'url(/assets/images/shape/shape-3.png)' }}
                  />
                  <div
                    className="shape-2"
                    style={{ backgroundImage: 'url(/assets/images/shape/shape-4.png)' }}
                  />
                  <div
                    className="shape-3"
                    style={{ backgroundImage: 'url(/assets/images/shape/shape-5.png)' }}
                  />
                  <div
                    className="shape-4"
                    style={{ backgroundImage: 'url(/assets/images/shape/shape-6.png)' }}
                  />
                </div>

                {/* Content Box */}
                <div className="auto-container">
                  <div className="content-box p_relative d_block z_5">
                    <span className="title-text p_relative d_block">
                      {slider.seoTitle || 'Medical Billing & Revenue Cycle Management'}
                    </span>
                    <h2 className="p_relative d_block">
                      {slider.title || 'Expert Medical Billing Services for Healthcare Providers'}
                    </h2>
                    {slider.seoContent ? (
                      <p
                        dangerouslySetInnerHTML={{
                          __html: slider.seoContent,
                        }}
                      />
                    ) : slider.description ? (
                      <p
                        dangerouslySetInnerHTML={{
                          __html: slider.description,
                        }}
                      />
                    ) : (
                      <p>
                        Agile Nexus Solutions provides comprehensive medical billing and revenue cycle
                        management services for healthcare providers and medical billing companies
                        across the USA.
                      </p>
                    )}
                    <div className="btn-box">
                      <Link href="/contact" className="theme-btn btn-two">
                        <span>Get Started</span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Image Box */}
                <div className="image-box">
                  <figure className="image">
                    {slider.fileType === 'video' ? (
                      <video
                        src={slider.file}
                        className="w-100 rounded-3 border"
                        controls
                        style={{ maxHeight: 700, objectFit: 'cover' }}
                      />
                    ) : (
                      <Image
                        src={slider.file}
                        alt={slider.seoTitle || slider.title || 'Medical Billing Banner'}
                        width={711}
                        height={700}
                        className="rounded-3"
                      />
                    )}
                  </figure>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}

