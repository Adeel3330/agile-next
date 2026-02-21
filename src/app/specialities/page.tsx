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
              <div className="row clearfix">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="col-lg-3 col-md-6 col-sm-12 chooseus-block">
                    <div className="chooseus-block-one">
                      <div className="inner-box">
                        <div className="icon-box">
                          <div className="icon">
                            <div
                              className="skeleton"
                              style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: '#e0e0e0',
                                animation: 'pulse 1.5s ease-in-out infinite',
                              }}
                            />
                          </div>
                          <span className="count-text">0{i}</span>
                        </div>
                        <div
                          className="skeleton"
                          style={{
                            width: '70%',
                            height: '20px',
                            marginTop: '10px',
                            borderRadius: '4px',
                            background: '#e0e0e0',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="row clearfix">
                {items.map((item) => {
                  const inner = (
                    <div className="chooseus-block-one">
                      <div className="inner-box">
                        <div className="icon-box">
                          <div className="icon">
                            <Image
                              src={getCloudinaryImageUrl(item.fileUrl)}
                              alt={item.altText || item.title || 'Specialty'}
                              width={80}
                              height={80}
                              style={{
                                objectFit: 'cover',
                                borderRadius: '50%',
                                width: '80px',
                                height: '80px',
                              }}
                            />
                          </div>
                        </div>
                        <div className="text">
                          <h3>{item.title}</h3>
                        </div>
                      </div>
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
                .chooseus-block-one .inner-box {
                  background: #fff;
                  padding: 30px 25px;
                  border-radius: 10px;
                  box-shadow: 0 5px 20px rgba(0,0,0,0.06);
                  height: 100%;
                  transition: all 0.3s ease;
                }
                .chooseus-block-one .inner-box .icon-box {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  gap: 10px;
                  margin-bottom: 10px;
                  left: 0px !important;
                }
                .chooseus-block-one .inner-box .text {
                  text-align: center;
                  left: 0px !important;
                  position: relative;
                  left: 62px !important;
                  width: 200px;
                }
                .chooseus-block-one .inner-box .text h3 {
                  margin-bottom: 0;
                  font-size: 16px;
                  font-weight: 600;
                }
                .chooseus-block-one .inner-box .icon-box .icon {
                  width: 80px;
                  height: 80px;
                  border-radius: 50%;
                  overflow: hidden;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #f5f8fa;
                }
                .chooseus-block-one .inner-box .icon-box .count-text {
                  font-size: 18px;
                  font-weight: 700;
                  color: var(--theme-color);
                  top: 5px !important;
                  left: 1px !important;
                }
                .chooseus-block-one .inner-box h3 {
                  font-size: 18px;
                  font-weight: 700;
                  margin-bottom: 10px;
                }
                .chooseus-block-one .inner-box p {
                  margin: 0;
                  color: #666;
                  line-height: 26px;
                  font-size: 14px;
                }
                .chooseus-block-one .inner-box:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 10px 30px rgba(0,0,0,0.12) !important;
                }
              `,
            }}
          />
        </section>
      </Layout>
    </div>
  );
}
