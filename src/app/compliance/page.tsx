'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../../components/layout/Layout';
import ContactForm from '../../../components/elements/ContactForm';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface MediaItem {
  id: string;
  fileUrl: string;
  title?: string;
  altText?: string;
  description?: string;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  content?: string;
  description?: string;
  fileUrl?: string;
  sections?: any[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoImage?: string;
}

export default function CompliancePage() {
  const [mounted, setMounted] = useState(false);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [heroImage, setHeroImage] = useState<MediaItem | null>(null);
  const [contentImage, setContentImage] = useState<MediaItem | null>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPageData();
      fetchComplianceMedia();
    }
  }, [mounted]);

  const fetchPageData = useCallback(async () => {
    setPageLoading(true);
    try {
      const response = await fetch('/api/pages?template=compliance');
      const data = await response.json();

      if (data.success && data.page) {
        setPageData(data.page);
        // Use fileUrl from page data if available
        if (data.page.fileUrl) {
          setPageImage(data.page.fileUrl);
        }
      }
    } catch (err) {
      console.error('Failed to fetch page data:', err);
    } finally {
      setPageLoading(false);
      setLoading(false);
    }
  }, []);

  const fetchComplianceMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      const response = await fetch('/api/media?position=compliance');
      const data = await response.json();

      if (data.success && data.media && data.media.length > 0) {
        // Store all media items
        setAllMedia(data.media);

        // First image for hero
        const hero = data.media.find((m: MediaItem) => 
          m.title?.toLowerCase().includes('hero') || m.title?.toLowerCase().includes('banner')
        ) || data.media[0];
        setHeroImage(hero);

        // Second image for content section
        const content = data.media.find((m: MediaItem) => 
          m.title?.toLowerCase().includes('content') || m.title?.toLowerCase().includes('about')
        ) || data.media[data.media.length > 1 ? 1 : 0];
        setContentImage(content);
      }
    } catch (err) {
      console.error('Failed to fetch compliance media:', err);
    } finally {
      setMediaLoading(false);
    }
  }, []);

  // Update SEO metadata
  useEffect(() => {
    if (pageData && typeof window !== 'undefined') {
      const title = pageData.seoTitle || pageData.title || 'Compliance - Agile Nexus Solution';
      const description = pageData.seoDescription || pageData.description || 'Learn about our compliance standards and regulatory requirements for medical billing services.';
      const keywords = pageData.seoDescription || 'compliance, medical billing compliance, HIPAA, healthcare regulations, Agile Nexus Solutions';
      const image = pageData.seoImage || heroImage?.fileUrl || '';

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
  }, [pageData, heroImage]);

  if (!mounted) {
    return null;
  }

  // Parse sections for features/stats
  const featuresSection = pageData?.sections?.find((s: any) => s.type === 'features');
  const statsSection = pageData?.sections?.find((s: any) => s.type === 'stats');

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={pageData?.title || 'Compliance'}>
        {/* Hero Banner Section */}
        <section className="page-banner p_relative" style={{ background: '#f5f8fa', padding: '120px 0 80px' }}>
          <div className="pattern-layer" style={{ backgroundImage: 'url(assets/images/shape/shape-13.png)' }}></div>
          <div className="auto-container">
            <div className="row clearfix">
              <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                <div className="content-box">
                  {pageLoading ? (
                    <div className="skeleton-content">
                      <div className="skeleton skeleton-text" style={{ width: '60%', height: '40px', marginBottom: '20px' }}></div>
                      <div className="skeleton skeleton-text" style={{ width: '80%', height: '20px' }}></div>
                    </div>
                  ) : (
                    <>
                      <div className="sec-title mb_30">
                        <span className="sub-title mb_5" style={{ color: 'var(--theme-color)', fontSize: '16px', fontWeight: '600' }}>Compliance & Standards</span>
                        <h1 style={{ fontSize: '48px', lineHeight: '58px', fontWeight: '700', marginBottom: '20px' }}>
                          {pageData?.title || 'Compliance'}
                        </h1>
                        {pageData?.description && (
                          <p style={{ fontSize: '18px', lineHeight: '28px', color: '#666' }}>{pageData.description}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                {mediaLoading ? (
                  <div className="skeleton-image" style={{ width: '100%', height: '400px', background: '#e0e0e0', borderRadius: '10px' }}></div>
                    ) : pageImage ? (
                      <div className="image-box" style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                        <Image 
                          src={getCloudinaryImageUrl(pageImage)} 
                          alt={pageData?.title || 'Compliance'} 
                          width={600} 
                          height={400} 
                          priority 
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </div>
                    ) : heroImage ? (
                      <div className="image-box" style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                        <Image 
                          src={getCloudinaryImageUrl(heroImage.fileUrl)} 
                          alt={heroImage.altText || heroImage.title || 'Compliance'} 
                          width={600} 
                          height={400} 
                          priority 
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </div>
                    ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        {featuresSection && featuresSection.items && Array.isArray(featuresSection.items) && featuresSection.items.length > 0 && (
          <section className="service-section p_relative pt_120 pb_90">
            <div className="pattern-layer" style={{ backgroundImage: 'url(assets/images/shape/shape-13.png)' }}></div>
            <div className="auto-container">
              <div className="sec-title mb_60 centred">
                <span className="sub-title mb_5">Our Compliance Standards</span>
                <h2>{featuresSection.title || 'Key Compliance Areas'}</h2>
              </div>
              <div className="row clearfix">
                {featuresSection.items.slice(0, 6).map((item: any, index: number) => (
                  <div key={index} className="col-lg-4 col-md-6 col-sm-12 service-block">
                    <div className="service-block-one">
                      <div className="inner-box" style={{ background: '#fff', padding: '40px 30px', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', height: '100%' }}>
                        <div className="lower-content">
                          <div className="inner">
                            {item.icon && (
                              <div className="icon-box" style={{ marginBottom: '20px' }}>
                                <i className={item.icon} style={{ fontSize: '50px', color: 'var(--theme-color)' }}></i>
                              </div>
                            )}
                            <h3 style={{ marginBottom: '15px', fontSize: '22px', fontWeight: '700' }}>
                              {item.title || `Feature ${index + 1}`}
                            </h3>
                            <p style={{ color: '#666', lineHeight: '26px' }}>
                              {item.description || item.text || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Content Section */}
        <section className="about-section about-page p_relative pb_120 pt_90">
          <div className="auto-container">
            <div className="row clearfix">
              <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                <div className="content-block-one">
                  <div className="content-box">
                    {pageLoading ? (
                      <div className="skeleton-content">
                        <div className="skeleton skeleton-text" style={{ width: '100%', height: '16px', marginBottom: '10px' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '90%', height: '16px', marginBottom: '10px' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '100%', height: '16px' }}></div>
                      </div>
                    ) : (
                      <>
                        {pageData?.content && (
                          <div className="text-box mb_30 pb_30">
                            <div dangerouslySetInnerHTML={{ __html: pageData.content }}></div>
                          </div>
                        )}
                        {pageData?.sections && Array.isArray(pageData.sections) && pageData.sections.length > 0 && (
                          <div className="sections-content">
                            {pageData.sections.map((section: any, index: number) => {
                              if (section.type === 'content' || section.type === 'text') {
                                return (
                                  <div key={index} className="section-item mb_30">
                                    {section.title && <h3 style={{ fontSize: '28px', marginBottom: '20px', fontWeight: '700' }}>{section.title}</h3>}
                                    {section.content && (
                                      <div dangerouslySetInnerHTML={{ __html: section.content }}></div>
                                    )}
                                    {section.text && <p style={{ lineHeight: '28px', color: '#666' }}>{section.text}</p>}
                                  </div>
                                );
                              }
                              if (section.type === 'list' && section.type !== 'features') {
                                return (
                                  <div key={index} className="section-item mb_30">
                                    {section.title && <h3 style={{ fontSize: '28px', marginBottom: '20px', fontWeight: '700' }}>{section.title}</h3>}
                                    {section.items && Array.isArray(section.items) && (
                                      <ul className="list-style-one clearfix">
                                        {section.items.map((item: any, itemIndex: number) => (
                                          <li key={itemIndex} style={{ marginBottom: '10px', fontSize: '16px', lineHeight: '28px' }}>
                                            {typeof item === 'string' ? item : (item.title || item.text || item)}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                <div className="image-block-one">
                  <div className="image-box" style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                    {mediaLoading ? (
                      <div className="skeleton-image" style={{ width: '100%', height: '500px', background: '#e0e0e0', borderRadius: '10px' }}></div>
                    ) : pageImage ? (
                      <figure className="image">
                        <Image 
                          src={getCloudinaryImageUrl(pageImage)} 
                          alt={pageData?.title || 'Compliance'} 
                          width={523} 
                          height={500} 
                          priority 
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </figure>
                    ) : contentImage ? (
                      <figure className="image">
                        <Image 
                          src={getCloudinaryImageUrl(contentImage.fileUrl)} 
                          alt={contentImage.altText || contentImage.title || 'Compliance'} 
                          width={523} 
                          height={500} 
                          priority 
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </figure>
                    ) : (
                      <figure className="image">
                        <Image 
                          src="/assets/images/resource/about-1.jpg" 
                          alt="Compliance" 
                          width={523} 
                          height={500} 
                          priority 
                        />
                      </figure>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Media Gallery Section - Display All Media Items */}
        {allMedia.length > 0 && (
          <section className="gallery-section p_relative pt_90 pb_90" style={{ background: '#fff' }}>
            <div className="auto-container">
              <div className="sec-title mb_60 centred">
                <span className="sub-title mb_5">Our Compliance Resources</span>
                <h2>Compliance Documentation & Resources</h2>
                <p>Access our compliance-related documents and visual resources</p>
              </div>
              <div className="row clearfix">
                {allMedia.map((media: MediaItem, index: number) => (
                  <div key={media.id || index} className="col-lg-4 col-md-6 col-sm-12 gallery-block">
                    <div className="gallery-item" style={{ 
                      background: '#fff', 
                      borderRadius: '10px', 
                      overflow: 'hidden',
                      boxShadow: '0 5px 20px rgba(0,0,0,0.08)',
                      transition: 'all 0.3s ease',
                      marginBottom: '30px'
                    }}>
                      <div className="image-box" style={{ position: 'relative', width: '100%', height: '250px', overflow: 'hidden' }}>
                        <Image 
                          src={getCloudinaryImageUrl(media.fileUrl)} 
                          alt={media.altText || media.title || 'Compliance Resource'} 
                          width={400} 
                          height={250} 
                          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                      </div>
                      <div className="content-box" style={{ padding: '20px' }}>
                        <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: '#333' }}>
                          {media.title || `Resource ${index + 1}`}
                        </h4>
                        {media.description && (
                          <p style={{ fontSize: '14px', color: '#666', lineHeight: '22px', margin: 0 }}>
                            {media.description.length > 100 ? media.description.substring(0, 100) + '...' : media.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Stats Section */}
        {statsSection && statsSection.items && Array.isArray(statsSection.items) && statsSection.items.length > 0 && (
          <section className="funfact-section p_relative pt_90 pb_90" style={{ background: '#f5f8fa' }}>
            <div className="auto-container">
              <div className="inner-container">
                <div className="row clearfix">
                  {statsSection.items.map((stat: any, index: number) => (
                    <div key={index} className="col-lg-3 col-md-6 col-sm-12 funfact-block">
                      <div className="funfact-block-two">
                        <div className="inner-box" style={{ textAlign: 'center', padding: '30px 20px' }}>
                          {stat.icon && (
                            <div className="icon-box" style={{ marginBottom: '20px' }}>
                              <i className={stat.icon} style={{ fontSize: '50px', color: 'var(--theme-color)' }}></i>
                            </div>
                          )}
                          <div className="count-outer count-box">
                            <span style={{ fontSize: '48px', fontWeight: '700', color: 'var(--theme-color)' }}>
                              {stat.value}
                            </span>
                            {stat.suffix && <span style={{ fontSize: '48px', fontWeight: '700', color: 'var(--theme-color)' }}>{stat.suffix}</span>}
                          </div>
                          <p style={{ fontSize: '18px', fontWeight: '600', marginTop: '15px', color: '#333' }}>
                            {stat.label || stat.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Contact Form Section */}
        <section className="contact-section sec-pad p_relative pt_120 pb_120">
          <div className="pattern-layer" style={{ backgroundImage: 'url(assets/images/shape/shape-42.png)' }}></div>
          <div className="auto-container">
            <div className="inner-box" style={{ background: '#fff', padding: '60px 40px', borderRadius: '10px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
              {pageLoading ? (
                <div>
                  <div className="skeleton skeleton-title" style={{ width: '60%', height: '32px', marginBottom: '20px' }}></div>
                  <div className="skeleton skeleton-text" style={{ width: '80%', height: '16px' }}></div>
                </div>
              ) : (
                <>
                  <div className="sec-title mb_40 centred">
                    <span className="sub-title mb_5" style={{ color: 'var(--theme-color)', fontSize: '16px', fontWeight: '600' }}>Get in Touch</span>
                    <h2 style={{ fontSize: '36px', marginBottom: '15px' }}>
                      {pageData?.sections?.find((s: any) => s.type === 'form')?.title || 'Contact Us for Compliance Information'}
                    </h2>
                    {pageData?.sections?.find((s: any) => s.type === 'form')?.description && (
                      <p style={{ fontSize: '16px', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
                        {pageData.sections.find((s: any) => s.type === 'form')?.description}
                      </p>
                    )}
                  </div>
                </>
              )}
              <ContactForm />
            </div>
          </div>
        </section>
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
        .skeleton-title { margin-bottom: 15px; }
        .service-block-one .inner-box:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
      `}} />
    </div>
  );
}
