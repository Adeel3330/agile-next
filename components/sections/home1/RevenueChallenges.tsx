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

export default function RevenueChallenges() {
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
        fetch('/api/pages/revenue-challenges'),
        fetch('/api/media?position=revenue-challenges'),
      ]);

      try {
        const pageJson = await pageRes.json();
        if (pageJson.success && pageJson.page) {
          setPageData(pageJson.page);
        }
      } catch (err) {
        console.error('Failed to parse revenue challenges page JSON:', err);
      }

      try {
        const mediaJson = await mediaRes.json();
        if (mediaJson.success && mediaJson.media?.length > 0) {
          setMediaItems(mediaJson.media);
        }
      } catch (err) {
        console.error('Failed to parse revenue challenges media JSON:', err);
      }
    } catch (err) {
      console.error('Failed to fetch revenue challenges data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // Fallback content based on Medivantek copy
  const heading =
    pageData?.title || 'Which of These Revenue Challenges Are Holding Your Practice Back?';

  const contentHtml =
    pageData?.content ||
    `
    <p>These common revenue challenges keep practices from reaching their full potential:</p>
    <ul>
      <li>Declining collections are putting consistent growth out of reach.</li>
      <li>Lack of financial visibility keeps your practice flying blind.</li>
      <li>Denied claims from coding errors are cutting deep into profits.</li>
      <li>Unresolved A/R over 90 days is quietly draining your revenue.</li>
      <li>Claims stagnating without follow-up are blocking your cash flow.</li>
    </ul>
    <p>If any of these sound familiar, it's time to rethink your billing strategy.</p>
  `;

  const heroImage = mediaItems[0]?.fileUrl || (pageData as any)?.fileUrl || '';
  const heroAlt =
    mediaItems[0]?.altText ||
    mediaItems[0]?.title ||
    pageData?.seoTitle ||
    'Revenue challenges illustration';

  // If nothing was loaded and we're not loading anymore, let the section quietly disappear
  if (!loading && !pageData && !heroImage) {
    return null;
  }

  return (
    <section className="chooseus-section p_relative pt_120 pb_90" style={{ background: '#f5f8fa' }}>
      <div className="auto-container">
        <div className="sec-title mb_40 centred">
          <span className="sub-title mb_5">Revenue Roadblocks</span>
          <h2>{heading}</h2>
        </div>

        <div className="row clearfix align-items-center">
          <div className="col-lg-7 col-md-12 col-sm-12">
            <div className="content-box">
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
                <div
                  className="text"
                  style={{ maxWidth: '640px', color: '#555', fontSize: '15px', lineHeight: 1.8 }}
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              )}
            </div>
          </div>

          <div className="col-lg-5 col-md-12 col-sm-12">
            <div
              className="image-box"
              style={{
                textAlign: 'center',
                padding: '24px',
                borderRadius: '16px',
                background: '#fff',
                boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              }}
            >
              {heroImage ? (
                <div style={{ position: 'relative', width: '100%', height: '260px' }}>
                  <Image
                    src={getCloudinaryImageUrl(heroImage)}
                    alt={heroAlt}
                    fill
                    style={{ objectFit: 'contain' }}
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

