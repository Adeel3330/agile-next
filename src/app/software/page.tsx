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

export default function SoftwarePage() {
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
      fetchSoftwareMedia();
    }
  }, [mounted]);

  const fetchPageData = useCallback(async () => {
    setPageLoading(true);
    try {
      const response = await fetch('/api/pages?template=software');
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

  const fetchSoftwareMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      // Fetch media with position 'other' (software media from seeder)
      const response = await fetch('/api/media?position=other');
      const data = await response.json();

      if (data.success && data.media && data.media.length > 0) {
        // Filter for software-related media items
        const softwareMedia = data.media.filter((m: MediaItem) => 
          m.title?.toLowerCase().includes('software') || 
          m.title?.toLowerCase().includes('virtual manager') ||
          m.title?.toLowerCase().includes('ehr') ||
          m.title?.toLowerCase().includes('practice management')
        );

        // Use filtered software media if available, otherwise use all media
        const mediaToUse = softwareMedia.length >= 3 ? softwareMedia : data.media;
        
        // Store all media items (sorted by display order)
        const sortedMedia = [...mediaToUse].sort((a, b) => {
          // Sort by title to ensure consistent order
          return (a.title || '').localeCompare(b.title || '');
        });
        setAllMedia(sortedMedia);

        // First image for hero
        const hero = sortedMedia.find((m: MediaItem) => 
          m.title?.toLowerCase().includes('virtual manager') || 
          m.title?.toLowerCase().includes('hero') || 
          m.title?.toLowerCase().includes('banner')
        ) || sortedMedia[0];
        setHeroImage(hero);

        // Second image for content section
        const content = sortedMedia.find((m: MediaItem) => 
          m.title?.toLowerCase().includes('ehr') || 
          m.title?.toLowerCase().includes('content') || 
          m.title?.toLowerCase().includes('practice')
        ) || sortedMedia[sortedMedia.length > 1 ? 1 : 0];
        setContentImage(content);
      }
    } catch (err) {
      console.error('Failed to fetch software media:', err);
    } finally {
      setMediaLoading(false);
    }
  }, []);

  // Update SEO metadata
  useEffect(() => {
    if (pageData && typeof window !== 'undefined') {
      const title = pageData.seoTitle || pageData.title || 'Software - Agile Nexus Solution';
      const description = pageData.seoDescription || pageData.description || 'Discover our EHR and Practice Management Software solutions including Virtual Manager for streamlined revenue cycle management.';
      const keywords = pageData.seoKeywords || 'EHR software, practice management software, Virtual Manager, revenue cycle management, Agile Nexus Solutions';
      const image = pageData.seoImage || pageImage || heroImage?.fileUrl || '';

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
  }, [pageData, pageImage, heroImage]);

  if (!mounted) {
    return null;
  }

  // Parse sections for features/stats
  const featuresSection = pageData?.sections?.find((s: any) => s.type === 'features');
  const formSection = pageData?.sections?.find((s: any) => s.type === 'form');

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={pageData?.title || 'Software'}>
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
                        <span className="sub-title mb_5" style={{ color: 'var(--theme-color)', fontSize: '16px', fontWeight: '600' }}>Software Solutions</span>
                        <h1 style={{ fontSize: '48px', lineHeight: '58px', fontWeight: '700', marginBottom: '20px' }}>
                          {pageData?.title || 'Software'}
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
                      alt={pageData?.title || 'Software'} 
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
                      alt={heroImage.altText || heroImage.title || 'Software'} 
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
        {/* {featuresSection && featuresSection.items && Array.isArray(featuresSection.items) && featuresSection.items.length > 0 && (
          <section className="service-section p_relative pt_120 pb_90">
            <div className="pattern-layer" style={{ backgroundImage: 'url(assets/images/shape/shape-13.png)' }}></div>
            <div className="auto-container">
              <div className="sec-title mb_60 centred">
                <span className="sub-title mb_5">Our Software Solutions</span>
                <h2>{featuresSection.title || 'Software Capabilities'}</h2>
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
        )} */}

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
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                <div className="image-block-one">
                  <div className="image-box" style={{ position: 'relative', borderRadius: '10px', padding: '0', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                    {mediaLoading ? (
                      <div className="skeleton-image" style={{ width: '100%', height: '500px', background: '#e0e0e0', borderRadius: '10px' }}></div>
                    ) : pageImage ? (
                      <figure className="image">
                        <Image 
                          src={getCloudinaryImageUrl(pageImage)} 
                          alt={pageData?.title || 'Software'} 
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
                          alt={contentImage.altText || contentImage.title || 'Software'} 
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
                          alt="Software" 
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

        {/* Software Media Section - service-style-two design */}
        {allMedia.length > 0 && (
          <section className="service-section alternat-2 p_relative pt_120 pb_90">
            <div className="pattern-layer" style={{ backgroundImage: 'url(assets/images/shape/shape-13.png)' }}></div>
            <div className="auto-container">
              <div className="sec-title mb_60 centred">
                <span className="sub-title mb_5">Our Software Solutions</span>
                <h2>EHR / Practice Management Software</h2>
                <p>Comprehensive software solutions designed to streamline and optimize your revenue cycle management</p>
              </div>
              <div className="row clearfix">
                {allMedia.slice(0, 3).map((media: MediaItem, index: number) => (
                  <div key={media.id || index} className="col-lg-4 col-md-6 col-sm-12 service-block">
                    <div className="chooseus-block-one">
                      <div className="inner-box">
                        <figure className="image-box">
                          <Image 
                            src={getCloudinaryImageUrl(media.fileUrl)} 
                            alt={media.altText || media.title || 'Software'} 
                            width={416} 
                            height={358} 
                            priority={index === 0}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          />
                        </figure>
                        <div className="lower-content">
                          <div className="inner">
                            <div className="icon-box">
                              <i className={`icon-${18 + index}`}></i>
                            </div>
                            <h3>
                              <span>{media.title || `Software ${index + 1}`}</span>
                            </h3>
                            <p>{media.description || ''}</p>
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
                      {formSection?.title || 'Request a Demo'}
                    </h2>
                    {formSection?.description && (
                      <p style={{ fontSize: '16px', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
                        {formSection.description}
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
        .gallery-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
      `}} />
    </div>
  );
}
