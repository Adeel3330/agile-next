'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface MediaItem {
  id: string;
  fileUrl: string;
  title?: string;
  altText?: string;
  description?: string;
  linkUrl?: string;
  displayOrder?: number;
}

export default function Specialties() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/media?position=specialties');
      const data = await response.json();
      if (data.success && data.media?.length > 0) {
        setItems(data.media);
      }
    } catch (err) {
      console.error('Failed to fetch specialties media:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  if (!loading && items.length === 0) return null;

  return (
    <section className="chooseus-section p_relative pt_120 pb_90" id="specialties">
      <div
        className="pattern-layer"
        style={{ backgroundImage: 'url(/assets/images/shape/shape-13.png)' }}
      />
      <div className="auto-container">
        <div className="sec-title mb_60 centred">
          <span className="sub-title mb_5">Specialties We Serve</span>
          <h2>Medical Specialties We Support</h2>
          <p style={{ maxWidth: '720px', margin: '15px auto 0', color: '#666' }}>
            From urgent care to specialty practices, we provide end-to-end medical billing and revenue cycle management
            tailored to each specialty.
          </p>
        </div>

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
                        marginBottom: '8px',
                        borderRadius: '4px',
                        background: '#e0e0e0',
                      }}
                    />
                    <div
                      className="skeleton"
                      style={{
                        width: '100%',
                        height: '32px',
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
            {items.map((item, index) => {
              const inner = (
                <div className="chooseus-block-one">
                  <div className="inner-box">
                    <div className="icon-box">
                      <div className="icon">
                        <Image
                          src={getCloudinaryImageUrl(item.fileUrl)}
                          alt={item.altText || item.title || 'Specialty'}
                          width={60}
                          height={60}
                          style={{ objectFit: 'cover', borderRadius: '50%',width: '50px',height: '50px' }}
                        />
                      </div>
                      <span className="count-text">
                        {index + 1 < 10 ? `0${index + 1}` : index + 1}
                      </span>
                    </div>
                    <div className="text">
                    <h3>{item.title}</h3>
                    <p>
                      {item.description ||
                        `Comprehensive billing and RCM support for ${item.title}.`}
                    </p>
                    </div>
                  </div>
                </div>
              );

              return (
                <div key={item.id} className="col-lg-3 col-md-6 col-sm-12 chooseus-block">
                  {item.linkUrl ? (
                    <Link
                      href={item.linkUrl}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
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
        ) : null}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
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
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
          left: 0px !important;
          justify-content: center;
        }
          .chooseus-block-one .inner-box .text {
            left: 0px !important;
            position: relative;
            left: 62px !important;
            width: 200px;
          }
          .chooseus-block-one .inner-box .text h3 {
            
            margin-bottom: 0px;
          }
          .chooseus-block-one .inner-box .text p {
            font-size: 14px;
            color: #666;
          }
        .chooseus-block-one .inner-box .icon-box .icon {
          width: 60px;
          height: 60px;
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
          top:5px!important;
          left: 1px!important; 
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
      `}} />
    </section>
  );
}
