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

export default function WhyAgileSolutions() {
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
        fetch('/api/pages/why-agile-solutions'),
        fetch('/api/media?position=why-agile-solutions'),
      ]);

      const pageJson = await pageRes.json();
      if (pageJson.success && pageJson.page) setPageData(pageJson.page);

      const mediaJson = await mediaRes.json();
      if (mediaJson.success && mediaJson.media?.length > 0) setMediaItems(mediaJson.media);
    } catch (err) {
      console.error('Failed to fetch why agile solutions data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  const heading = pageData?.title || 'Why Agile Nexus Solutions?';
  const contentHtml =
    pageData?.content ||
    `
    <p>We deliver what we promise. Agile Nexus Solutions offers revenue cycle management services to Healthcare Providers and Medical Billing Companies across the USA. Our goal is to help you manage your business so you can focus on patient care and operations, not paperwork.</p>
    <ul>
      <li><strong>24/7 Services</strong> – Round-the-clock support for your billing needs.</li>
      <li><strong>Quick Turnaround Time</strong> – Faster claims and follow-ups.</li>
      <li><strong>Cost Effective</strong> – Affordable solutions that maximize your revenue.</li>
      <li><strong>Advanced Technology</strong> – Modern tools and workflows for accuracy and efficiency.</li>
    </ul>
  `;

  const heroImage = mediaItems[0]?.fileUrl || (pageData as any)?.fileUrl || '';
  const heroAlt = mediaItems[0]?.altText || mediaItems[0]?.title || pageData?.seoTitle || 'Why Agile Solutions';

  return (
    <section className="chooseus-section p_relative pt_120 pb_90" style={{ background: '#f5f8fa' }}>
      <div className="auto-container">
        <div className="sec-title mb_40 centred">
          <span className="sub-title mb_5">Why Choose Us</span>
          <h2>{heading}</h2>
        </div>

        <div className="row clearfix align-items-center">
          <div className="col-lg-7 col-md-12 col-sm-12">
            <div
              className="content-box text"
              style={{ maxWidth: '640px', color: '#555', fontSize: '15px', lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
          <div className="col-lg-5 col-md-12 col-sm-12">
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
                    height: '260px',
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
      <style dangerouslySetInnerHTML={{ __html: `@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }` }} />
    </section>
  );
}
