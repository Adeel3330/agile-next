'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../../components/layout/Layout';
import Video from '../../../components/sections/home3/Video';
import Cta from '../../../components/sections/home2/Cta';
import ModalVideo from '../../../components/elements/VideoPopup';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  imageUrl?: string;
  icon?: string;
}

export default function ServicesPage() {
  const [mounted, setMounted] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(1);

  const tabs = [
    { id: 1, title: 'Modern Technology' },
    { id: 2, title: 'Success of Treatments' },
    { id: 3, title: 'Certified Doctors' },
  ];

  const tabContent = [
    {
      id: 1,
      videoImg: '/assets/images/resource/video-1.jpg',
      heading: 'Modern Technology',
      text: 'The phrase emphasizes the importance of healthcare providers, researchers, and innovators working together to create positive change in healthcare.',
      list: [
        'Your Health is Our Top Priority',
        'Compassionate Care, Innovative Treatments',
        'We Treat You Like Family',
        'Leading the Way in Medical Excellence',
      ],
    },
    {
      id: 2,
      videoImg: '/assets/images/resource/video-1.jpg',
      heading: 'Success of Treatments',
      text: 'The phrase emphasizes the importance of healthcare providers, researchers, and innovators working together to create positive change in healthcare.',
      list: [
        'Your Health is Our Top Priority',
        'Compassionate Care, Innovative Treatments',
        'We Treat You Like Family',
        'Leading the Way in Medical Excellence',
      ],
    },
    {
      id: 3,
      videoImg: '/assets/images/resource/video-1.jpg',
      heading: 'Certified Doctors',
      text: 'The phrase emphasizes the importance of healthcare providers, researchers, and innovators working together to create positive change in healthcare.',
      list: [
        'Your Health is Our Top Priority',
        'Compassionate Care, Innovative Treatments',
        'We Treat You Like Family',
        'Leading the Way in Medical Excellence',
      ],
    },
  ];

  useEffect(() => {
    setMounted(true);
    fetchServices();
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/services?limit=50');
      const data = await response.json();

      if (data.success && data.services) {
        setServices(data.services);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Our Services">
        <section className="service-page-section p_relative">
          <div className="auto-container">
            {loading ? (
              <div className="row clearfix">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="col-lg-4 col-md-6 col-sm-12 service-block">
                    <div className="service-block-one">
                      <div className="inner-box">
                        <figure className="image-box">
                          <div style={{ 
                            width: '100%', 
                            height: '358px', 
                            background: '#e0e0e0', 
                            borderRadius: '8px',
                            animation: 'pulse 1.5s ease-in-out infinite'
                          }}></div>
                        </figure>
                        <div className="lower-content">
                          <div className="inner">
                            <div className="icon-box skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '80%', height: '24px', marginBottom: '10px' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '100%', height: '16px' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No services available at the moment.</p>
              </div>
            ) : (
              <div className="row clearfix">
                {services.map((service) => (
                  <div key={service.id} className="col-lg-4 col-md-6 col-sm-12 service-block">
                    <div className="service-block-one">
                      <div className="inner-box">
                        <figure className="image-box">
                          <Link href={`/services/${service.slug}`}>
                            {service.imageUrl ? (
                              <Image 
                                src={getCloudinaryImageUrl(service.imageUrl)} 
                                alt={service.title} 
                                width={416} 
                                height={358} 
                                priority 
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <Image 
                                src="/assets/images/service/service-1.jpg" 
                                alt={service.title} 
                                width={416} 
                                height={358} 
                                priority 
                              />
                            )}
                          </Link>
                        </figure>
                        <div className="lower-content">
                          <div className="inner">
                            {service.icon && (
                              <div className="icon-box">
                                <i className={service.icon}></i>
                              </div>
                            )}
                            <h3>
                              <Link href={`/services/${service.slug}`}>{service.title}</Link>
                            </h3>
                            <p>{service.description ? (service.description.length > 100 ? service.description.substring(0, 100) + '...' : service.description) : 'Professional service for your needs.'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <Video />

        <section className="chooseus-section service-page sec-pad p_relative">
          <div className="auto-container">
            <div className="sec-title centred mb_55">
              <span className="sub-title mb_5">Why Choose Us</span>
              <h2>What&apos;s Our Speciality</h2>
              <p>
                Medical care is the practice of providing diagnosis, treatment, and
                preventive care for various <br /> illnesses, injuries, and diseases. It
              </p>
            </div>

            {/* Tabs Buttons */}
            <div className="tabs-box">
              <div className="tab-btns tab-buttons clearfix centred mb_40">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active-btn' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <h3>{tab.title}</h3>
                  </button>
                ))}
              </div>

              {/* Tabs Content */}
              <div className="tabs-content">
                {tabContent.map((content) => (
                  <div
                    key={content.id}
                    className={`tab ${activeTab === content.id ? 'active-tab' : ''}`}
                  >
                    <div className="inner-box">
                      <div
                        className="shape"
                        style={{ backgroundImage: 'url(/assets/images/shape/shape-14.png)' }}
                      ></div>
                      <div className="row clearfix">
                        <div className="col-lg-6 col-md-12 col-sm-12 video-column">
                          <div
                            className="video-inner"
                            style={{ backgroundImage: `url(${content.videoImg})` }}
                          >
                            <div className="video-btn">
                              <ModalVideo />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                          <div className="content-block-two">
                            <div className="content-box ml_40">
                              <div className="text-box">
                                <h3>{content.heading}</h3>
                                <p>{content.text}</p>
                              </div>
                              <ul className="list-style-one clearfix">
                                {content.list.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                              <div className="btn-box">
                                <Link href="/services" className="theme-btn btn-two">
                                  <span>See All Services</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="appointment-style-two p_relative">
          <div className="auto-container">
            <div className="inner-box">
              <h2>Make an Appointment</h2>
              <form method="post" action="service.html" className="default-form">
                <div className="row clearfix">
                  <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon"><i className="icon-45"></i></div>
                      <input type="text" name="name" placeholder="Name" required />
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon"><i className="icon-46"></i></div>
                      <input type="email" name="email" placeholder="Email" required />
                    </div>
                  </div>
                  <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon"><Image src="/assets/images/icons/icon-18.svg" alt="Image" width={14} height={15} priority /></div>
                      <input type="text" name="phone" placeholder="Phone" required />
                    </div>
                  </div>
                  <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon"><i className="icon-48"></i></div>
                      <textarea name="message" placeholder="Message"></textarea>
                    </div>
                  </div>
                  <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                    <div className="form-group message-btn">
                      <button type="submit" className="theme-btn btn-two"><span>Send your message</span></button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
        <Cta />
      </Layout>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skeleton {
          display: inline-block;
          background: #e0e0e0;
          border-radius: 4px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .skeleton-text { margin-bottom: 8px; }
      `}} />
    </div>
  );
}
