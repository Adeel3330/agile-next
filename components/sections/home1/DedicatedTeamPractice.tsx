'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface PageData {
  id: string;
  title: string;
  content?: string;
  description?: string;
  seoTitle?: string;
}

interface MediaItem {
  id: string;
  fileUrl: string;
  title?: string;
  altText?: string;
}

export default function DedicatedTeamPractice() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [pageRes, mediaRes] = await Promise.all([
          fetch('/api/pages/dedicated-team-billers-coders'),
          fetch('/api/media?position=dedicated-team-billers-coders'),
        ]);

        try {
          const pageJson = await pageRes.json();
          if (pageJson.success && pageJson.page) {
            setPageData(pageJson.page);
          }
        } catch (error) {
          console.error('Failed to parse dedicated team page data:', error);
        }

        try {
          const mediaJson = await mediaRes.json();
          if (mediaJson.success && Array.isArray(mediaJson.media)) {
            setMediaItems(mediaJson.media);
          }
        } catch (error) {
          console.error('Failed to parse dedicated team media data:', error);
        }
      } catch (error) {
        console.error('Failed to fetch dedicated team section data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  const heading =
    pageData?.title || 'Dedicated Account Managers & Certified Medical Billers for Your Practice';

  const parsedListItems = useMemo(() => {
    if (!pageData?.content) return [] as string[];
    const matches = Array.from(pageData.content.matchAll(/<li[^>]*>(.*?)<\/li>/gis));
    return matches
      .map((match) => match[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim())
      .filter(Boolean);
  }, [pageData?.content]);

  const fallbackText =
    pageData?.description ||
    'At Agile Nexus Solutions, we bring together certified medical coders, experienced account managers, and claims specialists who act as an extension of your in-house team.';

  const fallbackList = [
    'Dedicated billers and coders aligned to your specialty and workflow.',
    'Proactive claim follow-up to reduce denials and improve collections.',
    'Transparent communication and reporting from assigned account managers.',
    'HIPAA-compliant processes built for consistency and scale.',
  ];

  const listItems = parsedListItems.length > 0 ? parsedListItems : fallbackList;
  const heroImage = mediaItems[0]?.fileUrl;
  const heroAlt = mediaItems[0]?.altText || mediaItems[0]?.title || pageData?.seoTitle || heading;

  if (!mounted) return null;

  return (
    <section className="about-section p_relative pt_90 pb_90" style={{ background: '#ffffff' }}>
      <div className="auto-container">
        <div className="row clearfix align-items-center">
          <div className="col-lg-6 col-md-12 col-sm-12 image-column mb_30">
            <div className="image-box-dedicated">
              {heroImage ? (
                <div style={{ position: 'relative', width: '100%', height: '430px', borderRadius: '16px' }}>
                  <Image
                    src={getCloudinaryImageUrl(heroImage)}
                    alt={heroAlt}
                    fill
                    style={{ objectFit: 'cover', borderRadius: '16px' }}
                  />
                </div>
              ) : (
                <div className="skeleton-dedicated" />
              )}
            </div>
          </div>

          <div className="col-lg-6 col-md-12 col-sm-12 content-column mb_30">
            <div className="sec-title mb_25">
              <span className="sub-title mb_5">Dedicated Team</span>
              <h2>{heading}</h2>
            </div>

            {loading ? (
              <div>
                <div className="skeleton-line long" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
              </div>
            ) : (
              <>
                <p style={{ color: '#555', lineHeight: 1.8, marginBottom: '18px' }}>{fallbackText}</p>
                <ul className="list-style-one clearfix dedicated-list">
                  {listItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .image-box-dedicated {
              border-radius: 16px;
              overflow: hidden;
              background: #f5f8fa;
              box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            }
            .skeleton-dedicated {
              width: 100%;
              height: 430px;
              border-radius: 16px;
              background: #e0e0e0;
              animation: pulse 1.5s ease-in-out infinite;
            }
            .skeleton-line {
              width: 90%;
              height: 16px;
              border-radius: 4px;
              margin-bottom: 10px;
              background: #e0e0e0;
              animation: pulse 1.5s ease-in-out infinite;
            }
            .skeleton-line.long {
              width: 100%;
            }
            .dedicated-list li {
              margin-bottom: 10px;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `,
        }}
      />
    </section>
  );
}
