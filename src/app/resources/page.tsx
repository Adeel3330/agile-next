'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../../../components/layout/Layout';

interface MediaItem {
  id: string;
  title?: string;
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

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Resources">
        <section className="service-page-section p_relative pt_120 pb_120">
          <div className="auto-container">
            <div className="sec-title centred mb_55">
              <span className="sub-title mb_5">{subTitle}</span>
              <h2>{heading}</h2>
              <p>{intro}</p>
            </div>

            {loading ? (
              <div className="row clearfix">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="col-lg-6 col-md-6 col-sm-12 mb-4">
                    <div
                      style={{
                        height: '180px',
                        borderRadius: '12px',
                        background: '#e8e8e8',
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : cards.length > 0 ? (
              <div className="row clearfix">
                {cards.map((card) => (
                  <div key={card.id} className="col-lg-6 col-md-6 col-sm-12 mb-4">
                    <div className="service-block-one">
                      <div className="inner-box" style={{ padding: '35px 30px' }}>
                        <div
                          className="lower-content"
                          style={{ position: 'relative', bottom: 'auto', left: 'auto' }}
                        >
                          <div className="inner" style={{ padding: 0 }}>
                            <h3>{card.title}</h3>
                            {card.description && <p>{card.description}</p>}
                            {card.linkUrl && (
                              <Link href={card.linkUrl} className="theme-btn btn-one mt-3">
                                <span>View {card.title}</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted">
                Resource cards will appear here once added from Admin &gt; Media (position: resources).
              </p>
            )}
          </div>
        </section>
      </Layout>
    </div>
  );
}
