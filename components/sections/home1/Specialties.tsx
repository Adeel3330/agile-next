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
    <section className="service-section p_relative pt_120 pb_90" id="specialties">
      <div
        className="pattern-layer"
        style={{ backgroundImage: 'url(/assets/images/shape/shape-13.png)' }}
      />
      <div className="auto-container">
        <div className="sec-title mb_60 centred">
          <span className="sub-title mb_5">What We Serve</span>
          <h2>Specialties We Serve</h2>
          <p>
            We offer revenue cycle management and medical billing support across a wide range of healthcare specialties.
          </p>
        </div>

        {loading ? (
          <div className="row clearfix">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="col-lg-2 col-md-4 col-sm-6 col-6">
                <div className="specialty-block" style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div
                    className="skeleton"
                    style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 12px',
                      borderRadius: '12px',
                      background: '#e0e0e0',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div className="skeleton" style={{ width: '70%', height: '18px', margin: '0 auto', borderRadius: '4px', background: '#e0e0e0' }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="row clearfix">
            {items.map((item) => {
              const content = (
                <>
                  <div className="image-box" style={{ marginBottom: '12px', borderRadius: '10px', overflow: 'hidden', width: '80px', height: '80px', margin: '0 auto 12px' }}>
                    <Image
                      src={getCloudinaryImageUrl(item.fileUrl)}
                      alt={item.altText || item.title || 'Specialty'}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>{item.title}</h4>
                </>
              );
              return (
                <div key={item.id} className="col-lg-2 col-md-4 col-sm-6 col-6">
                  <div
                    className="specialty-block"
                    style={{
                      textAlign: 'center',
                      marginBottom: '24px',
                      padding: '16px 8px',
                      borderRadius: '10px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {item.linkUrl ? (
                      <Link href={item.linkUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .specialty-block:hover { background: rgba(0,0,0,0.03); }
        .specialty-block a:hover h4 { color: var(--theme-color); }
      `}} />
    </section>
  );
}
