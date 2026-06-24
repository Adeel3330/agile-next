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
  const [resourceMedia, setResourceMedia] = useState<MediaItem[]>([]);
  const [galleryHeading, setGalleryHeading] = useState<MediaItem | null>(null);
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
      const fetchMediaByPosition = async (position: string) => {
        const response = await fetch(`/api/media?position=${encodeURIComponent(position)}`);
        const data = await response.json();
        return data.success && Array.isArray(data.media) ? data.media : [];
      };

      const [heroItems, contentItems, galleryItems, galleryHeadingItems] = await Promise.all([
        fetchMediaByPosition('compliance-hero'),
        fetchMediaByPosition('compliance-content'),
        fetchMediaByPosition('compliance'),
        fetchMediaByPosition('compliance-gallery-heading'),
      ]);

      setHeroImage(heroItems[0] ?? null);
      setContentImage(contentItems[0] ?? null);
      setResourceMedia(galleryItems);
      setGalleryHeading(galleryHeadingItems[0] ?? null);
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

  const sections = Array.isArray(pageData?.sections) ? pageData.sections : [];
  const heroSection = sections.find((s: any) => s.type === 'hero');
  const contentSection = sections.find(
    (s: any) => s.type === 'content' && (s.subTitle || (s as any).sub_title)
  );
  const formSection = sections.find((s: any) => s.type === 'form');

  const gallerySubTitle = galleryHeading?.altText || '';
  const galleryTitle = galleryHeading?.title || 'Compliance Documentation & Resources';
  const galleryIntro = galleryHeading?.description || '';

  const heroSubTitle =
    heroSection?.subTitle ||
    (heroSection as any)?.sub_title ||
    heroSection?.title ||
    heroImage?.altText ||
    'Compliance & Standards';
  const heroHeading =
    heroSection?.subtitle ||
    (heroSection as any)?.heading ||
    heroImage?.title ||
    pageData?.title ||
    'Compliance';
  const heroText =
    heroSection?.description || heroImage?.description || pageData?.seoDescription || '';

  const contentSubTitle =
    contentSection?.subTitle || (contentSection as any)?.sub_title || contentImage?.altText || '';
  const contentHeading = contentSection?.title || contentImage?.title || '';
  const contentIntro = contentSection?.description || contentImage?.description || '';
  const contentHtml = contentSection?.content || pageData?.content || '';

  return (
    <div className="boxed_wrapper compliance-page">
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
                        {heroSubTitle && (
                          <span className="sub-title mb_5" style={{ color: 'var(--theme-color)', fontSize: '16px', fontWeight: '600' }}>
                            {heroSubTitle}
                          </span>
                        )}
                        <h1 style={{ fontSize: '48px', lineHeight: '58px', fontWeight: '700', marginBottom: '20px' }}>
                          {heroHeading}
                        </h1>
                        {heroText && (
                          <p style={{ fontSize: '16px', lineHeight: '28px', color: 'var(--title-color)' }}>{heroText}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                {mediaLoading ? (
                  <div className="skeleton-image" style={{ width: '100%', height: '400px', background: '#e0e0e0', borderRadius: '10px' }}></div>
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
                    ) : null}
              </div>
            </div>
          </div>
        </section>

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
                        {(contentSubTitle || contentHeading || contentIntro) && (
                          <div className="sec-title mb_30">
                            {contentSubTitle && (
                              <span className="sub-title mb_5" style={{ color: 'var(--theme-color)', fontSize: '16px', fontWeight: '600' }}>
                                {contentSubTitle}
                              </span>
                            )}
                            {contentHeading && (
                              <h2 style={{ fontSize: '36px', lineHeight: '46px', fontWeight: '700', marginBottom: '16px' }}>
                                {contentHeading}
                              </h2>
                            )}
                            {contentIntro && (
                              <p style={{ fontSize: '16px', lineHeight: '28px', color: 'var(--title-color)', marginBottom: '20px' }}>
                                {contentIntro}
                              </p>
                            )}
                          </div>
                        )}
                        
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                <div className="image-block-one" style={{ height: '100%' }}>
                    <div className="image-box" style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden',paddingLeft: '0px',height:'100%', boxShadow: '0 10px 10px rgba(0,0,0,0.1)', }}>
                    {mediaLoading ? (
                      <div className="skeleton-image" style={{ width: '100%', height: '500px', background: '#e0e0e0', borderRadius: '10px' }}></div>
                    ) : contentImage ? (
                      <figure className="image" style={{ height: '100%' }}>
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
        {(resourceMedia.length > 0 || galleryHeading) && (
          <section className="gallery-section p_relative pt_90 pb_90" style={{ background: '#fff' }}>
            <div className="auto-container">
              <div className="sec-title mb_60 centred">
                {gallerySubTitle && <span className="sub-title mb_5">{gallerySubTitle}</span>}
                <h2>{galleryTitle}</h2>
                {galleryIntro && <p>{galleryIntro}</p>}
              </div>
              <div className="row clearfix">
                {resourceMedia.map((media: MediaItem, index: number) => (
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
                        <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px', color: 'var(--title-color)' }}>
                          {media.title || `Resource ${index + 1}`}
                        </h4>
                        {media.description && (
                          <p style={{ fontSize: '14px', color: 'var(--title-color)', lineHeight: '22px', margin: 0 }}>
                            {media.description}
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
                    {(formSection?.subTitle || (formSection as any)?.sub_title) && (
                      <span className="sub-title mb_5" style={{ color: 'var(--theme-color)', fontSize: '16px', fontWeight: '600' }}>
                        {formSection.subTitle || (formSection as any).sub_title}
                      </span>
                    )}
                    <h2 style={{ fontSize: '36px', marginBottom: '15px' }}>
                      {formSection?.title || 'Contact Us for Compliance Information'}
                    </h2>
                    {formSection?.description && (
                      <p style={{ fontSize: '16px', color: 'var(--title-color)', maxWidth: '700px', margin: '0 auto' }}>
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
        .compliance-page p,
        .compliance-page li,
        .compliance-page .text-box {
          color: var(--title-color);
        }
      `}} />
    </div>
  );
}
