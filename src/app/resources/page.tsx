'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../../components/layout/Layout';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';
import { TEXT_ONLY_MEDIA_PLACEHOLDER_URL } from '@/lib/media-positions';

interface MediaItem {
  id: string;
  fileUrl?: string;
  title?: string;
  altText?: string;
  description?: string;
  linkUrl?: string;
  displayOrder?: number;
}

interface PageData {
  id: string;
  title: string;
  content?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoImage?: string;
}

const CARD_ICONS = ['icon-18', 'icon-19', 'icon-20', 'icon-21'];

function isDisplayableImage(url?: string) {
  const trimmed = url?.trim();
  if (!trimmed || trimmed === TEXT_ONLY_MEDIA_PLACEHOLDER_URL) return false;
  return true;
}

export default function ResourcesPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [cards, setCards] = useState<MediaItem[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [pageRes, mediaRes] = await Promise.all([
          fetch('/api/pages?template=resources'),
          fetch('/api/media?position=resources'),
        ]);

        const pagePayload = await pageRes.json();
        const mediaPayload = await mediaRes.json();

        if (pagePayload.success && pagePayload.page) {
          setPageData(pagePayload.page);
        }

        if (mediaPayload.success && Array.isArray(mediaPayload.media)) {
          const sorted = [...mediaPayload.media].sort(
            (a: MediaItem, b: MediaItem) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
          );
          setCards(sorted);
        }
      } catch (err) {
        console.error('Failed to fetch resources data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  useEffect(() => {
    if (!pageData || typeof window === 'undefined') return;

    const title = pageData.seoTitle || pageData.title || 'Resources | Agile Nexus Solutions';
    const description =
      pageData.seoDescription ||
      pageData.description ||
      'Explore compliance guidance, software information, specialty support, and medical billing insights.';
    const keywords = pageData.seoKeywords || 'resources, medical billing, compliance, software';
    const image = pageData.seoImage || '';

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
  }, [pageData]);

  if (!mounted) {
    return null;
  }

  const subTitle = pageData?.content?.trim() || 'Resource Center';
  const heading = pageData?.title || 'Explore Helpful Resources';
  const intro =
    pageData?.description ||
    'Find compliance guidance, software information, specialty support details, and educational insights from our team.';

  const renderCard = (card: MediaItem, index: number) => {
    const hasImage = isDisplayableImage(card.fileUrl);
    const iconClass = CARD_ICONS[index % CARD_ICONS.length];

    const inner = (
      <article className="resource-card">
        <div className="resource-card-top">
          {hasImage ? (
            <figure className="resource-card-image">
              <Image
                src={getCloudinaryImageUrl(card.fileUrl!)}
                alt={card.altText || card.title || 'Resource'}
                width={560}
                height={220}
                style={{  width: '100%', height: '100%' }}
              />
            </figure>
          ) : (
            <div className="resource-card-icon">
              <i className={iconClass} />
            </div>
          )}
        </div>
        <div className="resource-card-body">
          <h3>{card.title}</h3>
          {card.description && <p>{card.description}</p>}
          {card.linkUrl && (
            <span className="resource-card-link">
              View {card.title}
              <i className="icon-7" />
            </span>
          )}
        </div>
      </article>
    );

    return (
      <div key={card.id} className="col-lg-6 col-md-6 col-sm-12 resource-block mb_30">
        {card.linkUrl ? (
          <Link href={card.linkUrl} className="resource-card-wrap">
            {inner}
          </Link>
        ) : (
          inner
        )}
      </div>
    );
  };

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Resources">
        <section className="resources-section p_relative pt_120 pb_120">
          <div
            className="pattern-layer"
            style={{ backgroundImage: 'url(/assets/images/shape/shape-13.png)' }}
          />
          <div className="auto-container">
            <div className="sec-title centred mb_60">
              <span className="sub-title mb_5">{subTitle}</span>
              <h2>{heading}</h2>
              <p style={{ maxWidth: '760px', margin: '14px auto 0' }}>{intro}</p>
            </div>

            {loading ? (
              <div className="row clearfix">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="col-lg-6 col-md-6 col-sm-12 mb_30">
                    <div className="resource-card-skeleton" />
                  </div>
                ))}
              </div>
            ) : cards.length > 0 ? (
              <div className="row clearfix">{cards.map(renderCard)}</div>
            ) : (
              <p className="text-center text-muted">
                Resource cards will appear here once added from Admin &gt; Media (position: resources).
              </p>
            )}
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
                .resources-section {
                  background: #f8fbff;
                }
                .resource-card-wrap {
                  display: block;
                  height: 100%;
                  text-decoration: none;
                  color: inherit;
                }
                .resource-card {
                  height: 100%;
                  background: #fff;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
                  border: 1px solid rgba(218, 235, 251, 0.9);
                  transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .resource-card-wrap:hover .resource-card,
                .resource-block:hover .resource-card {
                  transform: translateY(-6px);
                  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.1);
                }
                .resource-card-top {
                  position: relative;
                  min-height: 160px;
                  background: linear-gradient(135deg, #0d3b5c 0%, #1a5f7a 100%);
                }
                .resource-card-image {
                  margin: 0;
                  height: 320px;
                  overflow: hidden;
                }
                  .resource-card-image img{
                    object-fit: cover !important;
                  }
                .resource-card-icon {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 160px;
                  font-size: 72px;
                  color: rgba(255, 255, 255, 0.95);
                }
                .resource-card-body {
                  padding: 28px 30px 32px;
                }
                .resource-card-body h3 {
                  font-size: 22px;
                  line-height: 1.3;
                  font-weight: 700;
                  margin-bottom: 12px;
                  color: var(--title-color);
                }
                .resource-card-body p {
                  font-size: 15px;
                  line-height: 1.75;
                  color: #4a5568;
                  margin-bottom: 20px;
                }
                .resource-card-link {
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  font-size: 15px;
                  font-weight: 600;
                  color: var(--theme-color);
                  transition: gap 0.2s ease;
                }
                .resource-card-link i {
                  font-size: 12px;
                }
                .resource-card-wrap:hover .resource-card-link {
                  gap: 12px;
                }
                .resource-card-skeleton {
                  height: 320px;
                  border-radius: 16px;
                  background: linear-gradient(90deg, #e8eef5 25%, #f4f7fb 50%, #e8eef5 75%);
                  background-size: 200% 100%;
                  animation: resourceShimmer 1.4s infinite;
                }
                @keyframes resourceShimmer {
                  0% { background-position: 200% 0; }
                  100% { background-position: -200% 0; }
                }

                @media (max-width: 479px) {
                  .resource-card-image {
                    height: 250px;
                    background: #f5f8fa;
                  }
                  .resource-card-image img{
                    object-fit: contain !important;
                  }
                }
              `,
            }}
          />
        </section>
      </Layout>
    </div>
  );
}
