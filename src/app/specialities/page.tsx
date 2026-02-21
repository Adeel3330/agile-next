'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../../components/layout/Layout';
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
  content?: string;
  description?: string;
}

export default function SpecialitiesPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [pageRes, pageAltRes, mediaRes] = await Promise.all([
          fetch('/api/pages?template=specialties'),
          fetch('/api/pages?template=specialities'),
          fetch('/api/media?position=specialties')
        ]);

        const pageDataPrimary = await pageRes.json();
        const pageDataAlt = await pageAltRes.json();
        const mediaData = await mediaRes.json();

        if (pageDataPrimary.success && pageDataPrimary.page) {
          setPageData(pageDataPrimary.page);
        } else if (pageDataAlt.success && pageDataAlt.page) {
          setPageData(pageDataAlt.page);
        }

        if (mediaData.success && Array.isArray(mediaData.media)) {
          setItems(mediaData.media);
        }
      } catch (err) {
        console.error('Failed to fetch specialities data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={pageData?.title || 'Specialities'}>
        <section className="chooseus-section p_relative pt_120 pb_90" id="specialities-resources">
          <div className="pattern-layer" style={{ backgroundImage: 'url(/assets/images/shape/shape-13.png)' }} />
          <div className="auto-container">
            <div className="sec-title mb_60 centred">
              <span className="sub-title mb_5">Specialties We Serve</span>
              <h2>{pageData?.title || 'Medical Specialties We Support'}</h2>
              <p style={{ maxWidth: '720px', margin: '15px auto 0', color: '#666' }}>
                {pageData?.description ||
                  'From urgent care to specialty practices, we provide end-to-end medical billing and revenue cycle management tailored to each specialty.'}
              </p>
            </div>

            {pageData?.content && (
              <div className="mb_50" dangerouslySetInnerHTML={{ __html: pageData.content }} />
            )}

            {loading ? (
              <div className="row clearfix justify-content-center">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="col-lg-3 col-md-4 col-sm-6">
                    <div
                      className="skeleton"
                      style={{
                        height: '140px',
                        margin: '0 10px 20px',
                        borderRadius: '12px',
                        background: '#e0e0e0',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="row clearfix">
                {items.map((item) => {
                  const inner = (
                    <div
                      className="specialty-simple-card"
                      style={{
                        textAlign: 'center',
                        padding: '24px 16px',
                        marginBottom: '20px',
                        background: '#fff',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '100px',
                          height: '80px',
                          position: 'relative',
                          margin: '0 auto 12px',
                        }}
                      >
                        <Image
                          src={getCloudinaryImageUrl(item.fileUrl)}
                          alt={item.altText || item.title || 'Specialty'}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      {item.title && (
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#555' }}>{item.title}</span>
                      )}
                    </div>
                  );

                  return (
                    <div key={item.id} className="col-lg-3 col-md-6 col-sm-12 chooseus-block mb_30">
                      {item.linkUrl ? (
                        <Link
                          href={item.linkUrl}
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'block',
                            height: '100%',
                          }}
                        >
                          {inner}
                        </Link>
                      ) : (
                        inner
                      )}
                    </div>
                  );
                })}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No speciality entries are published yet.</p>
              </div>
            ) : null}

            <div className="text-center mt_40">
              <Link href="/resources" className="theme-btn btn-two">
                <span>Back to Resources</span>
              </Link>
            </div>
          </div>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                .specialty-simple-card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
                }
              `,
            }}
          />
        </section>
      </Layout>
    </div>
  );
}
