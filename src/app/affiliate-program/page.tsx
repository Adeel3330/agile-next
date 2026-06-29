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
  linkUrl?: string;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoImage?: string;
}

function parseParagraphs(description?: string) {
  return (description || '').split('\n\n').map((p) => p.trim()).filter(Boolean);
}

function parseLeadAndBullets(description?: string) {
  const parts = parseParagraphs(description);
  return { lead: parts[0] || '', bullets: parts.slice(1) };
}

function parseCommission(description?: string) {
  const parts = parseParagraphs(description);
  if (parts.length <= 1) {
    return { subtitle: parts[0] || '', bullets: [] as string[], closing: '' };
  }
  return {
    subtitle: parts[0],
    bullets: parts.slice(1, -1),
    closing: parts[parts.length - 1],
  };
}

function parseWhyHeading(description?: string) {
  const parts = parseParagraphs(description);
  return {
    intro: parts[0] || '',
    subtitle: parts[1] || '',
    listLabel: parts[2] || '',
    closing: parts.slice(3),
  };
}

async function fetchMediaByPosition(position: string): Promise<MediaItem[]> {
  const response = await fetch(`/api/media?position=${encodeURIComponent(position)}`);
  const data = await response.json();
  if (!data.success || !Array.isArray(data.media)) return [];
  return data.media.map((item: any) => ({
    id: item.id,
    fileUrl: item.fileUrl,
    title: item.title,
    altText: item.altText,
    description: item.description,
    linkUrl: item.linkUrl,
  }));
}

export default function AffiliateProgramPage() {
  const [mounted, setMounted] = useState(false);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [heroMedia, setHeroMedia] = useState<MediaItem | null>(null);
  const [heroCtas, setHeroCtas] = useState<MediaItem[]>([]);
  const [featuresHeading, setFeaturesHeading] = useState<MediaItem | null>(null);
  const [features, setFeatures] = useState<MediaItem[]>([]);
  const [programsHeading, setProgramsHeading] = useState<MediaItem | null>(null);
  const [programs, setPrograms] = useState<MediaItem[]>([]);
  const [stepsHeading, setStepsHeading] = useState<MediaItem | null>(null);
  const [steps, setSteps] = useState<MediaItem[]>([]);
  const [whyHeading, setWhyHeading] = useState<MediaItem | null>(null);
  const [whyBullets, setWhyBullets] = useState<MediaItem[]>([]);
  const [whyImage, setWhyImage] = useState<MediaItem | null>(null);
  const [commission, setCommission] = useState<MediaItem | null>(null);
  const [formHeading, setFormHeading] = useState<MediaItem | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [apiFaqs, setApiFaqs] = useState<{ id: string; question: string; answer: string }[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      }
    } catch (err) {
      console.error('Failed to fetch affiliate page:', err);
    } finally {
      setPageLoading(false);
    }
  }, []);

  const fetchAffiliateMedia = useCallback(async () => {
    setMediaLoading(true);
    try {
      const [
        heroItems,
        ctaItems,
        featuresHeadingItems,
        featureItems,
        programsHeadingItems,
        programItems,
        stepsHeadingItems,
        stepItems,
        whyHeadingItems,
        whyBulletItems,
        whyImageItems,
        commissionItems,
        formHeadingItems,
      ] = await Promise.all([
        fetchMediaByPosition('affiliate-hero'),
        fetchMediaByPosition('affiliate-hero-ctas'),
        fetchMediaByPosition('affiliate-features-heading'),
        fetchMediaByPosition('affiliate-features'),
        fetchMediaByPosition('affiliate-programs-heading'),
        fetchMediaByPosition('affiliate-programs'),
        fetchMediaByPosition('affiliate-steps-heading'),
        fetchMediaByPosition('affiliate-steps'),
        fetchMediaByPosition('affiliate-why-heading'),
        fetchMediaByPosition('affiliate-why'),
        fetchMediaByPosition('affiliate-why-image'),
        fetchMediaByPosition('affiliate-commission'),
        fetchMediaByPosition('affiliate-form-heading'),
      ]);

      setHeroMedia(heroItems[0] ?? null);
      setHeroCtas(ctaItems);
      setFeaturesHeading(featuresHeadingItems[0] ?? null);
      setFeatures(featureItems);
      setProgramsHeading(programsHeadingItems[0] ?? null);
      setPrograms(programItems);
      setStepsHeading(stepsHeadingItems[0] ?? null);
      setSteps(stepItems);
      setWhyHeading(whyHeadingItems[0] ?? null);
      setWhyBullets(whyBulletItems);
      setWhyImage(whyImageItems[0] ?? null);
      setCommission(commissionItems[0] ?? null);
      setFormHeading(formHeadingItems[0] ?? null);
    } catch (err) {
      console.error('Failed to fetch affiliate media:', err);
    } finally {
      setMediaLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPageData();
      fetchAffiliateMedia();
      fetchAffiliateFaqs();
    }
  }, [mounted, fetchPageData, fetchAffiliateMedia, fetchAffiliateFaqs]);

  useEffect(() => {
    if (!pageData || typeof window === 'undefined') return;
    const title = pageData.seoTitle || pageData.title || '';
    const description = pageData.seoDescription || '';
    const keywords = pageData.seoKeywords || '';
    const image = pageData.seoImage || heroMedia?.fileUrl || '';
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
  }, [pageData, heroMedia]);

  if (!mounted) return null;

  const heroParts = parseParagraphs(heroMedia?.description);
  const heroSubtitle = heroParts[0] || '';
  const heroDescription = heroParts[1] || '';
  const whyParsed = parseWhyHeading(whyHeading?.description);
  const commissionParsed = parseCommission(commission?.description);

  const renderProgramImage = (item: MediaItem) => (
    <div className="col-lg-6 col-md-12 col-sm-12 image-column mb_30">
      {item.fileUrl && (
        <div className="affiliate-image-box">
          <Image
            src={getCloudinaryImageUrl(item.fileUrl)}
            alt={item.altText || item.title || 'Affiliate Program'}
            width={560}
            height={400}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>
      )}
    </div>
  );

  const renderProgramContent = (item: MediaItem) => {
    const { lead, bullets } = parseLeadAndBullets(item.description);
    return (
      <div className="col-lg-6 col-md-12 col-sm-12 content-column mb_30">
        <div className="affiliate-program-block">
          <h3>{item.title}</h3>
          {lead && <p className="affiliate-program-lead">{lead}</p>}
          {bullets.length > 0 && (
            <ul className="list-style-one clearfix affiliate-program-bullets">
              {bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
          <Link href="#contact-form" className="theme-btn btn-one">
            <span>{item.linkUrl || 'Get Started'}</span>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="boxed_wrapper affiliate-program-page">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={pageData?.title || 'Affiliate Program'}>
        {/* Hero */}
        {heroMedia && (
          <section
            className="affiliate-hero p_relative"
            style={{
              background: heroMedia.fileUrl
                ? `linear-gradient(135deg, rgba(13, 59, 92, 0.92) 0%, rgba(26, 95, 122, 0.88) 100%), url(${getCloudinaryImageUrl(heroMedia.fileUrl)}) center/cover no-repeat`
                : 'linear-gradient(135deg, #0d3b5c 0%, #1a5f7a 100%)',
              padding: '120px 0 100px',
              color: '#fff',
            }}
          >
            <div className="auto-container">
              <div className="row clearfix justify-content-center">
                <div className="col-lg-10 col-md-12 col-sm-12">
                  <div className="content-box text-center">
                    {pageLoading || mediaLoading ? (
                      <div className="skeleton-content">
                        <div className="skeleton skeleton-text" style={{ width: '40%', height: '28px', margin: '0 auto 16px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
                        <div className="skeleton skeleton-text" style={{ width: '90%', height: '48px', margin: '0 auto 16px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px' }} />
                      </div>
                    ) : (
                      <>
                        {heroMedia.title && (
                          <span className="sub-title mb_5" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: '600', display: 'block' }}>
                            {heroMedia.title}
                          </span>
                        )}
                        {heroSubtitle && (
                          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: '1.2', fontWeight: '700', marginBottom: '20px', color: '#fff' }}>
                            {heroSubtitle}
                          </h1>
                        )}
                        {heroDescription && (
                          <p style={{ fontSize: '18px', lineHeight: '28px', opacity: 0.95, marginBottom: '32px', color: '#fff', maxWidth: '760px', marginLeft: 'auto', marginRight: 'auto' }}>
                            {heroDescription}
                          </p>
                        )}
                        {heroCtas.length > 0 && (
                          <div className="btn-box" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                            {heroCtas.map((cta, index) => (
                              <Link
                                key={cta.id || cta.title}
                                href={cta.linkUrl || '#programs'}
                                className={`theme-btn ${index === 0 ? 'btn-one' : 'btn-two'}`}
                              >
                                <span>{cta.title}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        {features.length > 0 && (
          <section className="service-section p_relative pt_120 pb_90">
            <div className="auto-container">
              <div className="sec-title mb_60 centred">
                <h2>{featuresHeading?.title || 'Why partner with Agile Nexus Solutions Medical Billing'}</h2>
                {featuresHeading?.description && (
                  <p style={{ maxWidth: '860px', margin: '15px auto 0', color: 'var(--title-color)', lineHeight: '28px' }}>
                    {featuresHeading.description}
                  </p>
                )}
              </div>
              <div className="row clearfix">
                {features.map((item) => (
                  <div key={item.id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                    <div className="affiliate-feature-card">
                      {item.fileUrl && (
                        <div className="affiliate-feature-icon-img">
                          <Image
                            src={getCloudinaryImageUrl(item.fileUrl)}
                            alt={item.altText || item.title || 'Feature'}
                            width={350}
                            height={150}
                            style={{ objectFit: 'contain',height:'100%' }}
                          />
                        </div>
                      )}
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Programs — alternating layout */}
        {programs.length > 0 && (
          <section className="about-section p_relative pt_90 pb_120" id="programs" style={{ background: '#f5f8fa' }}>
            <div className="auto-container">
              <div className="sec-title mb_60 centred">
                <h2>{programsHeading?.title || 'Affiliate Programs Built Around Your Success'}</h2>
                {programsHeading?.description && (
                  <p style={{ maxWidth: '860px', margin: '15px auto 0', color: 'var(--title-color)', lineHeight: '28px' }}>
                    {programsHeading.description}
                  </p>
                )}
              </div>
              {programs.map((item, index) => {
                const imageFirst = index % 2 === 1;
                return (
                  <div key={item.id} className="row clearfix align-items-center affiliate-program-row mb_60">
                    {imageFirst ? (
                      <>
                        {renderProgramImage(item)}
                        {renderProgramContent(item)}
                      </>
                    ) : (
                      <>
                        {renderProgramContent(item)}
                        {renderProgramImage(item)}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <section className="service-section p_relative pt_120 pb_90">
            <div className="auto-container">
              <div className="sec-title mb_60 centred">
                <h2>{stepsHeading?.title || 'Getting Started: Your Path to Partnership'}</h2>
                {stepsHeading?.description && (
                  <p style={{ maxWidth: '760px', margin: '15px auto 0', color: 'var(--title-color)', lineHeight: '28px' }}>
                    {stepsHeading.description}
                  </p>
                )}
              </div>
              <div className="row clearfix">
                {steps.map((step, index) => (
                  <div key={step.id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                    <div className="affiliate-step-card">
                      {step.fileUrl ? (
                        <div className="affiliate-step-icon-img">
                          <Image
                            src={getCloudinaryImageUrl(step.fileUrl)}
                            alt={step.altText || step.title || 'Step'}
                            width={350}
                            height={150}
                            style={{ objectFit: 'contain',height:'100%' }}
                          />
                        </div>
                      ) : (
                        <div className="affiliate-step-number">{index + 1}</div>
                      )}
                      <h3>{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Why Affiliate Program */}
        {(whyHeading || whyBullets.length > 0) && (
          <section className="about-section p_relative pt_90 pb_90" style={{ background: '#f5f8fa' }}>
            <div className="auto-container">
              <div className="row clearfix align-items-center">
                <div className="col-lg-6 col-md-12 col-sm-12 content-column mb_30">
                  <div className="sec-title mb_30">
                    <h2>{whyHeading?.title || 'Why Agile Nexus Affiliate Program?'}</h2>
                  </div>
                  {whyParsed.intro && <p className="affiliate-body-text">{whyParsed.intro}</p>}
                  {whyParsed.subtitle && <p className="affiliate-body-text">{whyParsed.subtitle}</p>}
                  {whyParsed.listLabel && (
                    <p className="affiliate-body-text" style={{ fontWeight: 600 }}>
                      {whyParsed.listLabel}
                    </p>
                  )}
                  {whyBullets.length > 0 && (
                    <ul className="list-style-one clearfix">
                      {whyBullets.map((item) => (
                        <li key={item.id} className="affiliate-body-text">
                          {item.description}
                        </li>
                      ))}
                    </ul>
                  )}
                  {whyParsed.closing.map((paragraph, i) => (
                    <p key={i} className="affiliate-body-text" style={{ marginTop: '16px' }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                  {!mediaLoading && whyImage?.fileUrl && (
                    <div className="affiliate-image-box">
                      <Image
                        src={getCloudinaryImageUrl(whyImage.fileUrl)}
                        alt={whyImage.altText || whyImage.title || 'Affiliate Program'}
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

        {/* Commission */}
        {commission && (
          <section className="service-section p_relative pt_90 pb_90">
            <div className="auto-container">
              <div className="row clearfix align-items-center">
                <div className="col-lg-6 col-md-12 col-sm-12 content-column mb_30">
                  <div className="affiliate-commission-card">
                    <div className="sec-title mb_30">
                      <h2>{commission.title || 'Commission Structure'}</h2>
                      {commissionParsed.subtitle && (
                        <p style={{ marginTop: '15px', color: 'var(--title-color)', lineHeight: '28px' }}>
                          {commissionParsed.subtitle}
                        </p>
                      )}
                    </div>
                    {commissionParsed.bullets.length > 0 && (
                      <ul className="list-style-one clearfix affiliate-commission-list">
                        {commissionParsed.bullets.map((bullet, i) => (
                          <li key={i}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                    {commissionParsed.closing && (
                      <p className="affiliate-body-text" style={{ marginTop: '24px' }}>
                        {commissionParsed.closing}
                      </p>
                    )}
                  </div>
                </div>
                <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                  {commission.fileUrl && (
                    <div className="affiliate-image-box">
                      <Image
                        src={getCloudinaryImageUrl(commission.fileUrl)}
                        alt={commission.altText || commission.title || 'Commission Structure'}
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

        {/* Contact Form */}
        <section className="contact-section sec-pad p_relative pt_120 pb_120" id="contact-form" style={{ background: '#f5f8fa' }}>
          <div className="auto-container">
            <div className="affiliate-form-card">
              <div className="sec-title mb_40 centred">
                <h2>{formHeading?.title || 'Speak to Our Friendly Team'}</h2>
                {formHeading?.description && (
                  <p style={{ fontSize: '16px', color: 'var(--title-color)', maxWidth: '700px', margin: '15px auto 0', lineHeight: '28px' }}>
                    {formHeading.description}
                  </p>
                )}
              </div>
              <ContactForm defaultSubject="Affiliate Program Inquiry" />
            </div>
          </div>
        </section>

        {/* FAQ */}
        {apiFaqs.length > 0 && (
          <section className="about-section p_relative pt_90 pb_90">
            <div className="auto-container">
              <div className="sec-title mb_60 centred">
                <h2>Frequently Asked Questions (FAQs)</h2>
              </div>
              <div className="row clearfix justify-content-center">
                <div className="col-lg-8 col-md-12">
                  {apiFaqs.map((faq, index) => (
                    <div key={faq.id} className="affiliate-faq-block">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="affiliate-faq-btn"
                      >
                        {faq.question}
                        <span>{openFaq === index ? '−' : '+'}</span>
                      </button>
                      {openFaq === index && (
                        <div className="affiliate-faq-answer">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <style
          dangerouslySetInnerHTML={{
            __html: `
          .skeleton { animation: pulse 1.5s ease-in-out infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          .affiliate-program-page p,
          .affiliate-program-page li {
            color: var(--title-color);
          }
          .affiliate-feature-card {
            background: #fff;
            padding: 36px 28px;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.06);
            height: 100%;
          }
          .affiliate-feature-card h3 {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 12px;
          }
          .affiliate-feature-card p {
            line-height: 26px;
            margin: 0;
          }
          .affiliate-feature-icon-img {
            width: 100%;
            max-width: 350px;
            height: 150px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .affiliate-feature-icon-img img {
            max-width: 100%;
            height: 100%;
          }
          .affiliate-program-row:last-child {
            margin-bottom: 0 !important;
          }
          .affiliate-program-block {
            background: #fff;
            padding: 40px 36px;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.06);
            height: 100%;
          }
          .affiliate-program-block h3 {
            font-size: 26px;
            font-weight: 700;
            margin-bottom: 16px;
          }
          .affiliate-program-lead {
            line-height: 28px;
            margin-bottom: 20px;
          }
          .affiliate-program-bullets {
            margin-bottom: 24px;
          }
          .affiliate-program-bullets li {
            margin-bottom: 10px;
            line-height: 26px;
          }
          .affiliate-step-card {
            text-align: center;
            padding: 40px 24px;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.06);
            height: 100%;
          }
          .affiliate-step-icon-img {
            width: 100%;
            max-width: 350px;
            height: 150px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .affiliate-step-icon-img img {
            max-width: 100%;
            height: 100%;
          }
          .affiliate-step-number {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: var(--theme-color);
            color: #fff;
            font-size: 24px;
            font-weight: 700;
            line-height: 60px;
            margin: 0 auto 20px;
          }
          .affiliate-step-card h3 {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 12px;
          }
          .affiliate-step-card p {
            line-height: 26px;
            margin: 0;
          }
          .affiliate-body-text {
            color: var(--title-color);
            line-height: 28px;
            margin-bottom: 12px;
          }
          .affiliate-image-box {
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          .affiliate-image-box img {
            display: block;
            width: 100%;
            height: 100%;
          }
          .affiliate-commission-card {
            background: #fff;
            padding: 48px 40px;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.06);
            height: 100%;
          }
          .affiliate-commission-list li {
            margin-bottom: 12px;
            font-size: 16px;
          }
          .affiliate-form-card {
            background: #fff;
            padding: 60px 40px;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          .affiliate-faq-block {
            background: #fff;
            margin-bottom: 12px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          }
          .affiliate-faq-btn {
            width: 100%;
            padding: 20px 24px;
            text-align: left;
            border: none;
            background: none;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: var(--title-color);
          }
          .affiliate-faq-btn span {
            font-size: 24px;
            color: var(--theme-color);
          }
          .affiliate-faq-answer {
            padding: 0 24px 20px;
          }
          .affiliate-faq-answer p {
            line-height: 26px;
            margin: 0;
          }

          /* Tablet */
          @media only screen and (max-width: 991px) {
            .affiliate-hero {
              padding: 90px 0 70px !important;
            }
            .affiliate-program-row .image-column {
              margin-bottom: 30px;
            }
            .affiliate-image-box {
              max-height: 360px;
            }
          }

          /* Mobile */
          @media only screen and (max-width: 767px) {
            .affiliate-hero {
              padding: 70px 0 50px !important;
            }
            .affiliate-feature-card,
            .affiliate-step-card {
              padding: 28px 20px;
            }
            .affiliate-program-block {
              padding: 30px 24px;
            }
            .affiliate-commission-card {
              padding: 32px 24px;
            }
            .affiliate-form-card {
              padding: 36px 20px;
            }
            .affiliate-feature-icon-img,
            .affiliate-step-icon-img {
              max-width: 100%;
              height: 130px;
            }
            .affiliate-image-box {
              max-height: 280px;
            }
            .affiliate-faq-btn {
              font-size: 16px;
              padding: 16px 18px;
            }
          }

          /* Small mobile */
          @media only screen and (max-width: 479px) {
            .affiliate-feature-icon-img,
            .affiliate-step-icon-img {
              height: 110px;
            }
            .affiliate-image-box {
              max-height: 220px;
            }
          }
        `,
          }}
        />
      </Layout>
    </div>
  );
}
