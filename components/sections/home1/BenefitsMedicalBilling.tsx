'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface PageData {
  id: string;
  title: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  fileUrl?: string;
}

interface MediaItem {
  id: string;
  fileUrl: string;
  title?: string;
  altText?: string;
  description?: string;
}

export default function BenefitsMedicalBilling() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pageRes, mediaRes] = await Promise.all([
        fetch('/api/pages/benefits-medical-billing'),
        fetch('/api/media?position=benefits-medical-billing'),
      ]);

      try {
        const pageJson = await pageRes.json();
        if (pageJson.success && pageJson.page) {
          setPageData(pageJson.page);
        }
      } catch (err) {
        console.error('Failed to parse benefits of medical billing page JSON:', err);
      }

      try {
        const mediaJson = await mediaRes.json();
        if (mediaJson.success && mediaJson.media?.length > 0) {
          setMediaItems(mediaJson.media);
        }
      } catch (err) {
        console.error('Failed to parse benefits of medical billing media JSON:', err);
      }
    } catch (err) {
      console.error('Failed to fetch benefits of medical billing data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const heading = pageData?.title || 'Benefits of Medical Billing Outsourcing';

  const rawContentHtml =
    pageData?.content ||
    `
    <p>Outsourcing your medical billing gives your practice access to specialized revenue cycle expertise without the overhead of building a large in-house team.</p>
    <ul>
      <li>24/7 access to trained, in-demand professionals who shape your revenue cycle for profitability and plug revenue leaks.</li>
      <li>End-to-end HIPAA-compliant workflows that keep patient data secure and audit-ready at all times.</li>
      <li>Up to 70% reduction in operational and administrative costs, freeing cash flow to reinvest in patient care and growth.</li>
    </ul>
    <p>With Agile Nexus Solutions managing your billing, your team can refocus on delivering quality care instead of chasing claims and paperwork.</p>
  `;

  const contentHtml = rawContentHtml.replace(/Medivantek/gi, 'Agile Nexus Solutions');

  const heroImage = mediaItems[0]?.fileUrl || (pageData as any)?.fileUrl || '';
  const heroAlt =
    mediaItems[0]?.altText ||
    mediaItems[0]?.title ||
    pageData?.seoTitle ||
    'Benefits of medical billing illustration';

  if (!loading && !pageData && !heroImage) {
    return null;
  }

  return (
    <section className="service-section p_relative pt_90 pb_90">
      <div
        className="pattern-layer"
        style={{ backgroundImage: 'url(/assets/images/shape/shape-13.png)' }}
      />
      <div className="auto-container">
        <div className="sec-title mb_40 centred">
          <span className="sub-title mb_5">Why Outsource Your Billing</span>
          <h2>{heading}</h2>
        </div>

        <div className="row clearfix align-items-center flex-column-reverse-mobile">
          <div className="col-lg-6 col-md-12 col-sm-12">
            <div
              className="text-box"
              style={{ maxWidth: '620px', color: '#000', fontSize: '15px', lineHeight: 1.8 }}
            >
              {loading ? (
                <div>
                  <div
                    className="skeleton"
                    style={{
                      width: '80%',
                      height: '24px',
                      marginBottom: '12px',
                      borderRadius: '4px',
                      background: '#e0e0e0',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    className="skeleton"
                    style={{
                      width: '100%',
                      height: '16px',
                      marginBottom: '8px',
                      borderRadius: '4px',
                      background: '#e0e0e0',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    className="skeleton"
                    style={{
                      width: '95%',
                      height: '16px',
                      marginBottom: '8px',
                      borderRadius: '4px',
                      background: '#e0e0e0',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    className="skeleton"
                    style={{
                      width: '90%',
                      height: '16px',
                      marginBottom: '8px',
                      borderRadius: '4px',
                      background: '#e0e0e0',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              )}
            </div>
          </div>

          <div className="col-lg-6 col-md-12 col-sm-12">
            <div
              className="image-box"
              style={{
                textAlign: 'center',
                borderRadius: '16px',
                background: '#fff',
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              }}
            >
              {heroImage ? (
                <div style={{ position: 'relative', width: '100%', height: '400px',borderRadius: '16px' }}>
                  <Image
                    src={getCloudinaryImageUrl(heroImage)}
                    alt={heroAlt}
                    fill
                    style={{ objectFit: 'cover', borderRadius: '16px' }}
                  />
                </div>
              ) : (
                <div
                  className="skeleton"
                  style={{
                    width: '100%',
                    height: '280px',
                    borderRadius: '12px',
                    background: '#e0e0e0',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `,
        }}
      />
    </section>
  );
}

