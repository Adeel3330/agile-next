'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

export default function EffortlessOnboarding() {
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
        fetch('/api/pages/one-effortless-onboarding'),
        fetch('/api/media?position=one-effortless-onboarding'),
      ]);

      const pageJson = await pageRes.json();
      if (pageJson.success && pageJson.page) setPageData(pageJson.page);

      const mediaJson = await mediaRes.json();
      if (mediaJson.success && mediaJson.media?.length > 0) setMediaItems(mediaJson.media);
    } catch (err) {
      console.error('Failed to fetch effortless onboarding data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const heading = pageData?.title || 'Effortless Onboarding and Seamless Transition';
  const contentHtml =
    pageData?.content ||
    `
    <p>We understand that switching to a new billing service can seem daunting. That's why we've designed our onboarding and transition process to be as simple and stress-free as possible. Here's how we ensure an effortless start for your practice:</p>
    <ul>
      <li><strong>Personalized Onboarding Plan</strong> – Tailored to your practice size and specialty.</li>
      <li><strong>Comprehensive Data Migration</strong> – Secure transfer of your existing billing data.</li>
      <li><strong>Step-by-Step Guidance</strong> – Clear support at every stage.</li>
      <li><strong>Seamless Integration</strong> – Works with your current systems and workflows.</li>
      <li><strong>Quick Start to Improved Efficiency</strong> – Get up and running without delay.</li>
    </ul>
    <p>Let's connect and get you started with a smooth transition.</p>
  `;

  const heroImage = mediaItems[0]?.fileUrl || (pageData as any)?.fileUrl || '';
  const heroAlt = mediaItems[0]?.altText || mediaItems[0]?.title || pageData?.seoTitle || 'Effortless onboarding';

  return (
    <section className="service-section p_relative pt_90 pb_90">
      <div
        className="pattern-layer"
        style={{ backgroundImage: 'url(/assets/images/shape/shape-13.png)' }}
      />
      <div className="auto-container">
        <div className="sec-title mb_40 centred">
          <span className="sub-title mb_5">Welcome to a Smooth Start</span>
          <h2>{heading}</h2>
        </div>

        <div className="row clearfix align-items-center">
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
          <div className="col-lg-6 col-md-12 col-sm-12">
            <div
              className="text-box"
              style={{ maxWidth: '620px', color: '#555', fontSize: '15px', lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
            <div style={{ marginTop: '24px' }}>
              <Link href="/contact" className="theme-btn btn-two">
                <span>Let&apos;s Connect</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }` }} />
    </section>
  );
}
