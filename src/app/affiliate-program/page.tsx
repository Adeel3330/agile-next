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

export default function AffiliateProgramPage() {
  const [mounted, setMounted] = useState(false);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [heroImage, setHeroImage] = useState<MediaItem | null>(null);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [apiFaqs, setApiFaqs] = useState<{ id: string; question: string; answer: string }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPageData();
      fetchAffiliateMedia();
      fetchAffiliateFaqs();
    }
  }, [mounted]);

  const fetchAffiliateFaqs = useCallback(async () => {
    try {
      const response = await fetch('/api/faqs?position=affiliate');
      const data = await response.json();
      if (data.success && data.faqs?.length > 0) {
        setApiFaqs(data.faqs);
      }
    } catch (err) {
      console.error('Failed to fetch affiliate FAQs:', err);
    }
  }, []);

  const fetchPageData = useCallback(async () => {
    setPageLoading(true);
    try {
      const response = await fetch('/api/pages?template=affiliate-program');
      const data = await response.json();
      if (data.success && data.page) {
        setPageData(data.page);
        if (data.page.fileUrl) setPageImage(data.page.fileUrl);
      }
    } catch (err) {
      console.error('Failed to fetch affiliate page:', err);
    } finally {
      setPageLoading(false);
      setLoading(false);
    }
  }, []);

  const fetchAffiliateMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      const response = await fetch('/api/media?position=affiliate');
      const data = await response.json();
      if (data.success && data.media?.length > 0) {
        setAllMedia(data.media);
        const hero = data.media.find((m: MediaItem) =>
          m.title?.toLowerCase().includes('hero') || m.title?.toLowerCase().includes('banner')
        ) || data.media[0];
        setHeroImage(hero);
      }
    } catch (err) {
      console.error('Failed to fetch affiliate media:', err);
    } finally {
      setMediaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!pageData || typeof window === 'undefined') return;
    const title = pageData.seoTitle || pageData.title || '';
    const description = pageData.seoDescription || pageData.description || '';
    const keywords = pageData.seoKeywords || '';
    const image = pageData.seoImage || heroImage?.fileUrl || '';
    if (title) document.title = title;
    const updateMeta = (name: string, content: string, attr = 'name') => {
      if (!content) return;
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    if (image) updateMeta('og:image', image, 'property');
    updateMeta('og:url', window.location.href, 'property');
    updateMeta('og:type', 'website', 'property');
  }, [pageData, heroImage]);

  if (!mounted) return null;

  const sections = Array.isArray(pageData?.sections) ? pageData.sections : [];
  const heroSection = sections.find((s: any) => s.type === 'hero');
  const featuresSection = sections.find((s: any) => s.type === 'features');
  const programCardsSection = sections.find((s: any) => s.type === 'program_cards');
  const stepsSection = sections.find((s: any) => s.type === 'steps');
  const whySection = sections.find((s: any) => s.type === 'list');
  const commissionSection = sections.find((s: any) => s.type === 'commission');
  const faqSection = sections.find((s: any) => s.type === 'faq');
  const formSection = sections.find((s: any) => s.type === 'form');

  const heroTitle = heroSection?.title ?? pageData?.title ?? '';
  const heroSubtitle = heroSection?.subtitle ?? '';
  const heroDescription = heroSection?.description ?? pageData?.description ?? '';
  const showHero = heroTitle || heroSubtitle || heroDescription;

  return (
    <div className="boxed_wrapper affiliate-program-page">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={pageData?.title || 'Affiliate Program'}>
        {/* Hero - from admin */}
        {showHero && (
          <section className="page-banner p_relative" style={{ background: 'linear-gradient(135deg, #0d3b5c 0%, #1a5f7a 100%)', padding: '120px 0 80px', color: '#fff' }}>
            <div className="auto-container">
              <div className="row clearfix align-items-center">
                <div className="col-lg-7 col-md-12 col-sm-12 content-column">
                  <div className="content-box">
                    {pageLoading ? (
                      <div className="skeleton-content">
                        <div className="skeleton skeleton-text" style={{ width: '40%', height: '28px', marginBottom: '16px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
                        <div className="skeleton skeleton-text" style={{ width: '90%', height: '48px', marginBottom: '16px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
                        <div className="skeleton skeleton-text" style={{ width: '80%', height: '20px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
                      </div>
                    ) : (
                      <>
                        {heroTitle && (
                          <span className="sub-title mb_5" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: '600', display: 'block' }}>
                            {heroTitle}
                          </span>
                        )}
                        {heroSubtitle && (
                          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: '1.2', fontWeight: '700', marginBottom: '20px' }}>
                            {heroSubtitle}
                          </h1>
                        )}
                        {heroDescription && (
                          <p style={{ fontSize: '18px', lineHeight: '28px', opacity: 0.95, marginBottom: '28px',color:'#fff' }}>
                            {heroDescription}
                          </p>
                        )}
                        <div className="btn-box" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          <Link href="#programs" className="theme-btn btn-one" style={{ marginRight: '10px' }}>
                            <span>{heroSection?.primaryCtaText || 'Partner With Us'}</span>
                          </Link>
                          <Link href="#contact-form" className="theme-btn btn-two">
                            <span>{heroSection?.secondaryCtaText || 'Get Started'}</span>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="col-lg-5 col-md-12 col-sm-12 image-column d-none d-lg-block">
                  {!mediaLoading && (pageImage || heroImage?.fileUrl) && (
                    <div className="image-box" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
                      <Image
                        src={getCloudinaryImageUrl(pageImage || heroImage!.fileUrl)}
                        alt={heroTitle || pageData?.title || 'Affiliate Program'}
                        width={500}
                        height={380}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

       

        {/* Program cards - from admin */}
        {programCardsSection?.items?.length > 0 && (
          <section className="about-section p_relative pt_90 pb_120" id="programs" style={{ background: '#f5f8fa' }}>
            <div className="auto-container">
              <div className="sec-title mb_60 centred">
                {(programCardsSection.subTitle || (programCardsSection as any).sub_title) && <span className="sub-title mb_5">{programCardsSection.subTitle || (programCardsSection as any).sub_title}</span>}
                <h2>{programCardsSection.title}</h2>
                {programCardsSection.subtitle && <p style={{ maxWidth: '700px', margin: '15px auto 0', color: 'var(--title-color)' }}>{programCardsSection.subtitle}</p>}
              </div>
              <div className="row clearfix">
                {programCardsSection.items.map((item: any, index: number) => (
                  <div key={index} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                    <div className="inner-box" style={{ background: '#fff', padding: '36px 28px', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.06)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {item.badge && (
                        <span className="sub-title mb_3" style={{ color: 'var(--theme-color)', fontSize: '14px', fontWeight: '600' }}>{item.badge}</span>
                      )}
                      <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>{item.title}</h3>
                      {item.subtitle && <p style={{ color: 'var(--title-color)', marginBottom: '16px', lineHeight: '26px' }}>{item.subtitle}</p>}
                      {item.bullets && Array.isArray(item.bullets) && (
                        <ul className="list-style-one clearfix" style={{ marginBottom: '20px', flex: 1 }}>
                          {item.bullets.map((b: string, i: number) => (
                            <li key={i} style={{ marginBottom: '8px' }}>{b}</li>
                          ))}
                        </ul>
                      )}
                      <Link href="#contact-form" className="theme-btn btn-one" style={{ marginTop: 'auto' }}>
                        <span>{item.ctaText || 'Get Started'}</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Steps - from admin */}
        {stepsSection?.items?.length > 0 && (
          <section className="service-section p_relative pt_120 pb_90">
            <div className="auto-container">
              <div className="sec-title mb_60 centred">
                {(stepsSection.subTitle || (stepsSection as any).sub_title) && <span className="sub-title mb_5">{stepsSection.subTitle || (stepsSection as any).sub_title}</span>}
                <h2>{stepsSection.title}</h2>
              </div>
              <div className="row clearfix">
                {stepsSection.items.map((step: any, index: number) => (
                  <div key={index} className="col-lg-4 col-md-6 col-sm-12">
                    <div className="inner-box" style={{ textAlign: 'center', padding: '40px 24px', background: '#fff', borderRadius: '12px', boxShadow: '0 5px 20px rgba(0,0,0,0.06)', height: '100%' }}>
                      <div className="count-outer" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--theme-color)', color: '#fff', fontSize: '24px', fontWeight: '700', lineHeight: '60px', margin: '0 auto 20px' }}>
                        {index + 1}
                      </div>
                      <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>{step.title}</h3>
                      <p style={{ color: 'var(--title-color)', lineHeight: '26px', margin: 0 }}>{step.description || step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why / List - from admin */}
        {whySection?.items?.length > 0 && (
          <section className="about-section p_relative pt_90 pb_90" style={{ background: '#f5f8fa' }}>
            <div className="auto-container">
              <div className="row clearfix align-items-center">
                <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                  <div className="sec-title mb_30">
                    {(whySection.subTitle || (whySection as any).sub_title) && <span className="sub-title mb_5">{whySection.subTitle || (whySection as any).sub_title}</span>}
                    <h2>{whySection.title}</h2>
                    {whySection.subtitle && <p style={{ marginTop: '15px', color: 'var(--title-color)', lineHeight: '28px' }}>{whySection.subtitle}</p>}
                  </div>
                  <ul className="list-style-one clearfix">
                    {whySection.items.map((item: any, i: number) => (
                      <li key={i} style={{ marginBottom: '12px', fontSize: '16px' }}>{typeof item === 'string' ? item : (item.title || item.text || item)}</li>
                    ))}
                  </ul>
                  <Link href="#contact-form" className="theme-btn btn-one mt_30">
                    <span>Getting Started</span>
                  </Link>
                </div>
                <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                  {allMedia.length > 0 && (
                    <div className="image-box" style={{ borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                      <Image
                        src={getCloudinaryImageUrl(allMedia[1]?.fileUrl)}
                        alt={allMedia[1]?.altText || allMedia[1]?.title || 'Affiliate Program'}
                        width={560}
                        height={400}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        

        {/* FAQ - from FAQs API (admin) or CMS fallback */}
        {((apiFaqs.length > 0) || (faqSection?.items?.length > 0)) && (
          <section className="about-section p_relative pt_90 pb_90" style={{ background: '#f5f8fa' }}>
            <div className="auto-container">
              <div className="sec-title mb_60 centred">
                <span className="sub-title mb_5">{(faqSection as any)?.subTitle || (faqSection as any)?.sub_title || 'FAQs'}</span>
                <h2>{apiFaqs.length > 0 ? 'Frequently Asked Questions' : (faqSection?.title || 'Frequently Asked Questions')}</h2>
              </div>
              <div className="row clearfix justify-content-center">
                <div className="col-lg-8 col-md-12">
                  {apiFaqs.length > 0
                    ? apiFaqs.map((faq, index) => (
                        <div key={faq.id} className="faq-block" style={{ background: '#fff', marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                          <button
                            type="button"
                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            style={{ width: '100%', padding: '20px 24px', textAlign: 'left', border: 'none', background: 'none', fontSize: '18px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            {faq.question}
                            <span style={{ fontSize: '24px', color: 'var(--theme-color)' }}>{openFaq === index ? '−' : '+'}</span>
                          </button>
                          {openFaq === index && (
                            <div style={{ padding: '0 24px 20px' }}>
                              <p style={{ color: 'var(--title-color)', lineHeight: '26px', margin: 0 }}>{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))
                    : faqSection!.items.map((faq: any, index: number) => (
                        <div key={index} className="faq-block" style={{ background: '#fff', marginBottom: '12px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                          <button
                            type="button"
                            onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            style={{ width: '100%', padding: '20px 24px', textAlign: 'left', border: 'none', background: 'none', fontSize: '18px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            {faq.question || faq.title}
                            <span style={{ fontSize: '24px', color: 'var(--theme-color)' }}>{openFaq === index ? '−' : '+'}</span>
                          </button>
                          {openFaq === index && (
                            <div style={{ padding: '0 24px 20px' }}>
                              <p style={{ color: 'var(--title-color)', lineHeight: '26px', margin: 0 }}>{faq.answer || faq.description || faq.text}</p>
                            </div>
                          )}
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </section>
        )}

        

        {/* Contact Form - title/description from admin form section */}
        <section className="contact-section sec-pad p_relative pt_120 pb_120" id="contact-form">
          <div className="auto-container">
            <div className="inner-box" style={{ background: '#fff', padding: '60px 40px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
              <div className="sec-title mb_40 centred">
                <span className="sub-title mb_5">{(formSection as any)?.subTitle || (formSection as any)?.sub_title || 'Get in Touch'}</span>
                <h2>{formSection?.title || 'Contact Us'}</h2>
                {(formSection?.description || formSection?.subtitle) && (
                  <p style={{ fontSize: '16px', color: 'var(--title-color)', maxWidth: '700px', margin: '15px auto 0' }}>
                    {formSection.description || formSection.subtitle}
                  </p>
                )}
              </div>
              <ContactForm />
            </div>
          </div>
        </section>

        <style dangerouslySetInnerHTML={{ __html: `
          .skeleton { animation: pulse 1.5s ease-in-out infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .service-block-one .inner-box:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important; }
          .affiliate-program-page p,
          .affiliate-program-page li {
            color: var(--title-color);
          }
        `}} />
      </Layout>
    </div>
  );
}
