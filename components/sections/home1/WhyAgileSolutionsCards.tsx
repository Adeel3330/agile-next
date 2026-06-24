'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';
import { TEXT_ONLY_MEDIA_PLACEHOLDER_URL } from '@/lib/media-positions';

interface MediaItem {
  id: string;
  fileUrl: string;
  title?: string;
  altText?: string;
  description?: string;
  linkUrl?: string;
  displayOrder?: number;
}

const CARD_ICONS = ['icon-18', 'icon-19', 'icon-20', 'icon-21'];
const DESC_TRUNCATE_CHARS = 110;

function isDisplayableImage(url?: string) {
  const trimmed = url?.trim();
  if (!trimmed || trimmed === TEXT_ONLY_MEDIA_PLACEHOLDER_URL) return false;
  return true;
}

function extractFirstParagraph(html?: string): string | null {
  if (!html?.trim()) return null;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.querySelector('p')?.textContent?.trim() || null;
}

function isHeadingItem(item: MediaItem) {
  const key = (item.title || '').toLowerCase().trim();
  return key === 'heading' || key === 'section-heading';
}

function WhyAgileCardItem({ card, index }: { card: MediaItem; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const hasImage = isDisplayableImage(card.fileUrl);
  const iconClass = CARD_ICONS[index % CARD_ICONS.length];
  const description = card.description?.trim() || '';
  const isTruncatable = description.length > DESC_TRUNCATE_CHARS;

  return (
    <article className="why-agile-card">
      <div className="why-agile-card-media">
        {hasImage ? (
          <>
            <Image
              src={getCloudinaryImageUrl(card.fileUrl)}
              alt={card.altText || card.title || 'Why Agile'}
              fill
              sizes="(max-width: 768px) 90vw, 340px"
              className="why-agile-card-img"
            />
            <div className="why-agile-card-media-overlay" />
          </>
        ) : (
          <div className="why-agile-card-icon-wrap">
            <span className="why-agile-card-icon-ring">
              <i className={iconClass} />
            </span>
          </div>
        )}
      </div>

      <div className="why-agile-card-content">
        {card.title && <h4>{card.title}</h4>}
        {description && (
          <p className={`why-agile-card-desc${expanded ? ' is-expanded' : ''}`}>{description}</p>
        )}
        {isTruncatable && (
          <button
            type="button"
            className="why-agile-see-more"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
          >
            {expanded ? 'See less' : 'See more'}
          </button>
        )}
      </div>
    </article>
  );
}

interface WhyAgileSolutionsCardsProps {
  instanceId?: string;
  hideIntro?: boolean;
}

export default function WhyAgileSolutionsCards({
  instanceId = 'why-agile-cards',
  hideIntro = false,
}: WhyAgileSolutionsCardsProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<MediaItem[]>([]);
  const [headingMedia, setHeadingMedia] = useState<MediaItem | null>(null);
  const [pageIntro, setPageIntro] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [mediaRes, pageRes] = await Promise.all([
          fetch('/api/media?position=why-agile-solutions'),
          fetch('/api/pages/why-agile-solutions'),
        ]);

        const mediaPayload = await mediaRes.json();
        const pagePayload = await pageRes.json();

        if (pagePayload.success && pagePayload.page?.content) {
          setPageIntro(extractFirstParagraph(pagePayload.page.content));
        }

        if (mediaPayload.success && Array.isArray(mediaPayload.media)) {
          const sorted = [...mediaPayload.media].sort(
            (a: MediaItem, b: MediaItem) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
          );
          const heading = sorted.find(isHeadingItem) ?? null;
          const cardItems = sorted.filter((item) => !isHeadingItem(item));
          setHeadingMedia(heading);
          setCards(cardItems);
        }
      } catch (err) {
        console.error('Failed to fetch why agile solutions cards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  if (!mounted) return null;
  if (!loading && cards.length === 0 && !headingMedia && !pageIntro) return null;

  const introSubTitle = headingMedia?.altText?.trim() || '';
  const introText =
    headingMedia?.description?.trim() ||
    pageIntro ||
    'We deliver what we promise with 24/7 support, quick turnaround, cost-effective solutions, and advanced technology for healthcare providers.';

  const canLoop = cards.length > 2;

  return (
    <div className={`why-agile-cards-block ${instanceId}`} id={instanceId}>
      {!hideIntro && (introSubTitle || introText) && (
        <div className="why-agile-intro centred">
          {introSubTitle && <span className="sub-title mb_5">{introSubTitle}</span>}
          <p>{introText}</p>
        </div>
      )}

      {hideIntro && introText && (
        <p className="why-agile-intro why-agile-intro--compact centred">{introText}</p>
      )}

      {loading ? (
        <div className="why-agile-skeleton-row">
          {[1, 2, 3].map((i) => (
            <div key={i} className="why-agile-skeleton-card" />
          ))}
        </div>
      ) : cards.length > 0 ? (
        <div className="why-agile-carousel-wrap">
          <Swiper
            modules={[Autoplay]}
            className="why-agile-swiper"
            loop={canLoop}
            autoplay={{
              delay: 2800,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={900}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              576: { slidesPerView: 2, spaceBetween: 20 },
              992: { slidesPerView: 3, spaceBetween: 24 },
            }}
            grabCursor
          >
            {cards.map((card, index) => (
              <SwiperSlide key={card.id} className="why-agile-slide">
                <WhyAgileCardItem card={card} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : null}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .why-agile-cards-block {
              margin-bottom: 40px;
            }
            .why-agile-intro {
              max-width: 720px;
              margin: 0 auto 32px;
            }
            .why-agile-intro p {
              color: #334155;
              line-height: 1.75;
              font-size: 16px;
              margin: 0;
            }
            .why-agile-intro--compact {
              margin-bottom: 28px;
            }
            .why-agile-carousel-wrap {
              width: 100%;
              overflow: hidden;
              padding: 10px 0 6px;
            }
            .why-agile-swiper {
              width: 100%;
              overflow: hidden;
            }
            .why-agile-swiper .swiper-wrapper {
              align-items: stretch;
            }
            .why-agile-slide {
              height: auto;
              display: flex;
              box-sizing: border-box;
            }
            .why-agile-card {
              position: relative;
              width: 100%;
              min-height: 100%;
              display: flex;
              flex-direction: column;
              background: #fff;
              border-radius: 20px;
              border: 1px solid rgba(244, 103, 0, 0.12);
              box-shadow: 0 8px 32px rgba(15, 23, 42, 0.06);
              transition: box-shadow 0.3s ease, border-color 0.3s ease;
            }
            .why-agile-card:hover {
              border-color: rgba(244, 103, 0, 0.35);
              box-shadow: 0 16px 40px rgba(244, 103, 0, 0.12);
            }
            .why-agile-card-media {
              position: relative;
              width: 100%;
              height: 220px;
              flex-shrink: 0;
              border-radius: 20px 20px 0 0;
              overflow: hidden;
              background: linear-gradient(135deg, #fff5eb 0%, #ffe8d4 100%);
            }
            .why-agile-card-img {
              object-fit: cover;
            }
            .why-agile-card-media-overlay {
              position: absolute;
              inset: 0;
              background: linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.12) 100%);
              pointer-events: none;
            }
            .why-agile-card-icon-wrap {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100%;
            }
            .why-agile-card-icon-ring {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 72px;
              height: 72px;
              border-radius: 50%;
              background: #fff;
              box-shadow: 0 8px 24px rgba(244, 103, 0, 0.2);
              font-size: 32px;
              color: var(--theme-color);
            }
            .why-agile-card-content {
              flex: 1;
              display: flex;
              flex-direction: column;
              padding: 22px 22px 24px;
            }
            .why-agile-card-content h4 {
              font-size: 17px;
              font-weight: 700;
              line-height: 1.35;
              color: #0f172a;
              margin: 0 0 10px;
            }
            .why-agile-card-desc {
              flex: 1;
              font-size: 14px;
              line-height: 1.65;
              color: #64748b;
              margin: 0;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .why-agile-card-desc.is-expanded {
              display: block;
              -webkit-line-clamp: unset;
              overflow: visible;
            }
            .why-agile-see-more {
              align-self: flex-start;
              margin-top: 12px;
              padding: 0;
              border: none;
              background: none;
              font-size: 14px;
              font-weight: 600;
              color: var(--theme-color);
              cursor: pointer;
              text-decoration: underline;
              text-underline-offset: 3px;
            }
            .why-agile-see-more:hover {
              color: #0f172a;
            }
            .why-agile-skeleton-row {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 24px;
            }
            @media (max-width: 991px) {
              .why-agile-skeleton-row {
                grid-template-columns: repeat(2, 1fr);
              }
            }
            @media (max-width: 575px) {
              .why-agile-skeleton-row {
                grid-template-columns: 1fr;
              }
            }
            .why-agile-skeleton-card {
              width: 100%;
              height: 320px;
              border-radius: 20px;
              background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
              background-size: 200% 100%;
              animation: whyAgileShimmer 1.4s infinite;
            }
            @keyframes whyAgileShimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `,
        }}
      />
    </div>
  );
}
