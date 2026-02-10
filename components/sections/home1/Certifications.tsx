'use client';

import { useState, useEffect } from 'react';
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

export default function Certifications() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/media?position=certifications');
      const data = await response.json();
      if (data.success && data.media?.length > 0) {
        setItems(data.media);
      }
    } catch (err) {
      console.error('Failed to fetch certifications media:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  if (!loading && items.length === 0) return null;

  return (
    <section className="funfact-section p_relative pt_90 pb_90" style={{ background: '#f5f8fa' }}>
      <div className="auto-container">
        <div className="sec-title mb_50 centred">
          <span className="sub-title mb_5">Our Standards</span>
          <h2>Trusted. Certified. Compliant.</h2>
          <p style={{ maxWidth: '600px', margin: '15px auto 0', color: '#666' }}>
            We uphold the highest standards in medical billing and data protection.
          </p>
        </div>

        {loading ? (
          <div className="row clearfix justify-content-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-lg-3 col-md-4 col-sm-6">
                <div
                  className="skeleton"
                  style={{
                    height: '100px',
                    margin: '0 15px 20px',
                    borderRadius: '10px',
                    background: '#e0e0e0',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="row clearfix justify-content-center align-items-center">
            {items.map((item) => (
              <div key={item.id} className="col-lg-2 col-md-3 col-sm-4 col-6">
                <div
                  className="certification-badge"
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
                  <div style={{ width: '100%', maxWidth: '120px', height: '80px', position: 'relative', margin: '0 auto 12px' }}>
                    <Image
                      src={getCloudinaryImageUrl(item.fileUrl)}
                      alt={item.altText || item.title || 'Certification'}
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                  {item.title && (
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>{item.title}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .certification-badge:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(0,0,0,0.1); }
      `}} />
    </section>
  );
}
