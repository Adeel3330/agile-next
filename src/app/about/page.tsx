'use client';

import { useState, useEffect, useCallback } from 'react';
import CountUp from 'react-countup';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../../components/layout/Layout';
import ContactForm from '../../../components/elements/ContactForm';
import Clients from '../../../components/sections/home3/Clients';
import Team from '../../../components/sections/home1/Team';
import Cta from '../../../components/sections/home2/Cta';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface MediaItem {
  id: string;
  fileUrl: string;
  title?: string;
  altText?: string;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  content?: string;
  description?: string;
  sections?: any[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoImage?: string;
}

interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
}

interface Settings {
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  mapLocation?: string;
  mapEmbedUrl?: string;
}

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [aboutImage, setAboutImage] = useState<MediaItem | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPageData();
      fetchAboutMedia();
      fetchServices();
      fetchSettings();
    }
  }, [mounted]);

  const fetchPageData = useCallback(async () => {
    setPageLoading(true);
    try {
      const response = await fetch('/api/pages?template=about-us');
      const data = await response.json();

      console.log('About page - API response:', data);

      if (data.success && data.page) {
        setPageData(data.page);
        console.log('About page - Page data set:', data.page);
      } else {
        console.warn('About page - No page data received:', data.message || 'Unknown error');
        // Try alternative template formats
        const altResponse = await fetch('/api/pages?template=about us');
        const altData = await altResponse.json();
        if (altData.success && altData.page) {
          console.log('About page - Found page with alternative template format');
          setPageData(altData.page);
        }
      }
    } catch (err) {
      console.error('Failed to fetch page data:', err);
    } finally {
      setPageLoading(false);
      setLoading(false);
    }
  }, []);

  const fetchAboutMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      const response = await fetch('/api/media?position=about');
      const data = await response.json();

      if (data.success && data.media && data.media.length > 0) {
        setAboutImage(data.media[0]);
      }
    } catch (err) {
      console.error('Failed to fetch about media:', err);
    } finally {
      setMediaLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const response = await fetch('/api/services?limit=3');
      const data = await response.json();

      if (data.success && data.services) {
        setServices(data.services.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // Update SEO metadata
  useEffect(() => {
    if (pageData && typeof window !== 'undefined') {
      const title = pageData.seoTitle || pageData.title || 'About Us - Agile Nexus Solution';
      const description = pageData.seoDescription || pageData.description || 'Learn about Agile Nexus Solutions, a trusted medical billing and coding services provider in the United States.';
      const keywords = pageData.seoKeywords || 'about us, medical billing, revenue cycle management, Agile Nexus Solutions';
      const image = pageData.seoImage || aboutImage?.fileUrl || '';

      document.title = title;

      const updateMetaTag = (name: string, content: string, attribute: string = 'name') => {
        if (!content) return;
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attribute, name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateMetaTag('description', description);
      updateMetaTag('keywords', keywords);
      updateMetaTag('og:title', title, 'property');
      updateMetaTag('og:description', description, 'property');
      if (image) updateMetaTag('og:image', image, 'property');
      updateMetaTag('og:url', window.location.href, 'property');
      updateMetaTag('og:type', 'website', 'property');
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', title);
      updateMetaTag('twitter:description', description);
      if (image) updateMetaTag('twitter:image', image);
    }
  }, [pageData, aboutImage]);

  if (!mounted) {
    return null;
  }

    return (
        <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={pageData?.title || 'About Us'}>
        {/* First Section - About Content */}
                <section className="about-section about-page p_relative pb_50">
                    <div className="auto-container">
                        <div className="upper-content mb_80">
                            <div className="row clearfix">
                                <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                                    <div className="content-block-one">
                                        <div className="content-box">
                      {pageLoading ? (
                        <div className="skeleton-content">
                          <div className="skeleton skeleton-text" style={{ width: '60%', height: '24px', marginBottom: '15px' }}></div>
                          <div className="skeleton skeleton-text" style={{ width: '100%', height: '16px', marginBottom: '10px' }}></div>
                          <div className="skeleton skeleton-text" style={{ width: '90%', height: '16px' }}></div>
                        </div>
                      ) : (
                        <>
                                            <div className="sec-title mb_15">
                                                <span className="sub-title mb_5">About the company</span>
                            <h2>{pageData?.title || 'About Agile Nexus Solutions'}</h2>
                                            </div>
                                            <div className="text-box mb_30 pb_30">
                            {pageData?.content ? (
                              <div dangerouslySetInnerHTML={{ __html: pageData.content }}></div>
                            ) : pageData?.description ? (
                              <p>{pageData.description}</p>
                            ) : (
                              <p>Agile Nexus Solutions provides medical billing and coding services to healthcare providers in the United States. Agile Nexus Solutions's mission is to be a trusted and valued healthcare partner offering advanced revenue cycle management services with dedication and integrity.</p>
                            )}
                                            </div>
                        </>
                      )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                                    <div className="image-block-one">
                                        <div className="image-box">
                                            <div className="shape">
                        <div className="shape-2" style={{ backgroundImage: 'url(assets/images/shape/shape-10.png)' }}></div>
                                            </div>
                      {mediaLoading ? (
                        <div className="skeleton-image" style={{ width: '523px', height: '399px', background: '#e0e0e0', borderRadius: '8px' }}></div>
                      ) : (
                        <figure className="image">
                          <Image 
                            src={aboutImage?.fileUrl ? getCloudinaryImageUrl(aboutImage.fileUrl) : '/assets/images/resource/about-1.jpg'} 
                            alt={aboutImage?.altText || aboutImage?.title || 'About Us'} 
                            width={523} 
                            height={399} 
                            priority 
                          />
                        </figure>
                      )}
                                            <div className="text-box">
                        <div className="image-shape" style={{ backgroundImage: 'url(assets/images/shape/shape-7.png)' }}></div>
                                                <h2>30</h2>
                                                <span>Years of Experience in This Field</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

        {/* Second Section - Three Services */}
                <section className="service-section about-page p_relative">
          <div className="pattern-layer" style={{ backgroundImage: 'url(assets/images/shape/shape-13.png)' }}></div>
                    <div className="auto-container">
                        <div className="sec-title mb_60 centred">
                            <span className="sub-title mb_5">What we do for our patients</span>
              <h2>Our Services</h2>
              <p>Agile Nexus Solutions proudly supports Healthcare providers, Physicians, Medical Groups, and Medical Billing Companies.</p>
                        </div>
            {servicesLoading ? (
                        <div className="row clearfix">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="col-lg-4 col-md-6 col-sm-12 service-block">
                                <div className="service-block-one">
                                    <div className="inner-box">
                        <figure className="image-box">
                          <div style={{ width: '100%', height: '358px', background: '#e0e0e0', borderRadius: '8px' }}></div>
                        </figure>
                                        <div className="lower-content">
                                            <div className="inner">
                            <div className="skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '80%', height: '24px', marginTop: '15px' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '100%', height: '16px', marginTop: '10px' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                ))}
              </div>
            ) : services.length > 0 ? (
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
            ) : null}
                                            </div>
        </section>

        {/* Contact Section - Replacing Appointment */}
        <section className="contact-section about-page p_relative pt_120 pb_120">
          <div className="pattern-layer" style={{ backgroundImage: 'url(assets/images/shape/shape-17.png)' }}></div>
          <div className="auto-container">
            <div className="row clearfix">
              <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                <div className="content-box">
                  <div className="sec-title mb_30">
                    <span className="sub-title mb_5">Get in Touch</span>
                    <h2>Contact Us</h2>
                    <p>Have questions or need assistance? We're here to help you with all your medical billing needs.</p>
                                        </div>
                  {settingsLoading ? (
                    <div className="skeleton-content">
                      <div className="skeleton skeleton-text" style={{ width: '80%', height: '20px', marginBottom: '15px' }}></div>
                      <div className="skeleton skeleton-text" style={{ width: '60%', height: '20px' }}></div>
                                    </div>
                  ) : (
                    <div className="contact-info">
                      {settings?.contactPhone && (
                        <div className="info-item mb_20" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                          <div className="icon-box" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--theme-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}>
                            <i className="icon-2"></i>
                          </div>
                          <div>
                            <h4 style={{ marginBottom: '5px', fontSize: '18px', fontWeight: '600' }}>Phone</h4>
                            <span>
                              <Link href={`tel:${settings.contactPhone.replace(/\s/g, '')}`} style={{ color: 'var(--text-color)', fontSize: '16px' }}>
                                {settings.contactPhone}
                              </Link>
                            </span>
                          </div>
                        </div>
                      )}
                      {settings?.contactEmail && (
                        <div className="info-item mb_20" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                          <div className="icon-box" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--theme-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}>
                            <i className="icon-46"></i>
                          </div>
                          <div>
                            <h4 style={{ marginBottom: '5px', fontSize: '18px', fontWeight: '600' }}>Email</h4>
                            <span>
                              <Link href={`mailto:${settings.contactEmail}`} style={{ color: 'var(--text-color)', fontSize: '16px' }}>
                                {settings.contactEmail}
                              </Link>
                            </span>
                          </div>
                        </div>
                      )}
                      {settings?.contactAddress && (
                        <div className="info-item mb_20" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                          <div className="icon-box" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--theme-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}>
                            <i className="icon-10"></i>
                          </div>
                          <div>
                            <h4 style={{ marginBottom: '5px', fontSize: '18px', fontWeight: '600' }}>Address</h4>
                            <span style={{ color: 'var(--text-color)', fontSize: '16px' }}>{settings.contactAddress}</span>
                          </div>
                        </div>
                      )}
                                    </div>
                  )}
                                    </div>
                                    </div>
              <div className="col-lg-6 col-md-12 col-sm-12 form-column">
                <div className="form-inner" style={{ background: '#fff', padding: '40px', borderRadius: '10px', boxShadow: '0px 4px 30px rgba(205, 192, 192, 0.25)' }}>
                  <div className="shape" style={{ backgroundImage: 'url(assets/images/shape/shape-16.png)' }}></div>
                  <h3 style={{ marginBottom: '30px', fontSize: '24px', fontWeight: '700' }}>Send us a Message</h3>
                  <ContactForm />
                                    </div>
                            </div>
                        </div>
                    </div>
                </section>

        {/* Funfact Section */}
                <section className="funfact-section">
                <div className="pattern-layer">
                    <div className="pattern-1">
                    <svg
                        width="318"
                        height="131"
                        viewBox="0 0 318 131"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                        d="M0 69.0468L74.0685 69.0468L98.2276 40.7213L125.459 121L164.762 10L191.919 105.268L208.417 57.4162L233.167 87.0291L249.076 69.0468L308 69.0468"
                        stroke="#BDBDBD"
                        strokeOpacity="0.15"
                        strokeWidth="20"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        />
                    </svg>
                    </div>
                </div>

                <div className="auto-container">
                    <div className="inner-container">
                    <div
                        className="shape"
                style={{ backgroundImage: 'url(/assets/images/shape/shape-34.png)' }}
                    ></div>

                    <div className="row clearfix">
                        <div className="col-lg-3 col-md-6 col-sm-12 funfact-block">
                        <div className="funfact-block-two">
                            <div className="inner-box">
                            <div className="icon-box">
                                <i className="icon-37"></i>
                            </div>
                            <div className="count-outer count-box">
                                <CountUp end={180} duration={1.5} />
                                <span>+</span>
                            </div>
                            <p>Expert Doctors</p>
                            </div>
                        </div>
                        </div>

                        <div className="col-lg-3 col-md-6 col-sm-12 funfact-block">
                        <div className="funfact-block-two">
                            <div className="inner-box">
                            <div className="icon-box">
                                <i className="icon-38"></i>
                            </div>
                            <div className="count-outer count-box">
                                <CountUp end={12.2} duration={1.5} decimals={1} />
                                <span>+</span>
                            </div>
                            <p>Different Services</p>
                            </div>
                        </div>
                        </div>

                        <div className="col-lg-3 col-md-6 col-sm-12 funfact-block">
                        <div className="funfact-block-two">
                            <div className="inner-box">
                            <div className="icon-box">
                                <i className="icon-39"></i>
                            </div>
                            <div className="count-outer count-box">
                                <CountUp end={200} duration={1.5} />
                                <span>+</span>
                            </div>
                            <p>Multi Services</p>
                            </div>
                        </div>
                        </div>

                        <div className="col-lg-3 col-md-6 col-sm-12 funfact-block">
                        <div className="funfact-block-two">
                            <div className="inner-box">
                            <div className="icon-box">
                                <i className="icon-40"></i>
                            </div>
                            <div className="count-outer count-box">
                                <CountUp end={8} duration={1.5} />
                            </div>
                            <p>Awards Win</p>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </section>

        {/* <Clients /> */}
        <Team />
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
        .skeleton-content { padding: 20px 0; }
        .skeleton-image { animation: pulse 1.5s ease-in-out infinite; }
      `}} />
        </div>
  );
}
