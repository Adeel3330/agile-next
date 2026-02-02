'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";

interface MediaItem {
  id: string;
  title?: string;
  fileUrl: string;
  altText?: string;
  linkUrl?: string;
}

interface Settings {
  contactPhone?: string;
}

export default function Cta() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ctaMedia, setCtaMedia] = useState<MediaItem | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchCtaData();
  }, []);

  const fetchCtaData = async () => {
    setLoading(true);
    
    // Fetch CTA media (title and image)
    try {
      const mediaRes = await fetch('/api/media?position=cta');
      const mediaData = await mediaRes.json();
      if (mediaData.success && mediaData.media && mediaData.media.length > 0) {
        setCtaMedia(mediaData.media[0]);
      }
    } catch (err) {
      console.error('Failed to fetch CTA media:', err);
    }

    // Fetch settings for phone number
    try {
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.settings) {
        setSettings(settingsData.settings);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  const title = ctaMedia?.title || 'Need a Doctor for Check-up? Call for an Emergency Service!';
  const imageUrl = ctaMedia?.fileUrl || '/assets/images/resource/ambulance-1.png';
  const phoneNumber = settings?.contactPhone || '+1 (123)-456-155-23';
  const phoneLink = phoneNumber.replace(/\s/g, '');

  return (
    <section className="cta-section">
      <div className="auto-container">
        <div className="inner-container">
          <div className="content-box">
            {loading ? (
              <div style={{ minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '100%', 
                  height: '24px', 
                  background: '#e0e0e0', 
                  borderRadius: '4px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></div>
              </div>
            ) : (
              <h2>{title}</h2>
            )}
            <div className="support-box">
              <div className="icon-box">
                <Image src="/assets/images/icons/icon-8.svg" alt="Image" width={34} height={34} priority />
              </div>
              {loading ? (
                <span style={{ 
                  display: 'inline-block', 
                  width: '150px', 
                  height: '16px', 
                  background: '#e0e0e0', 
                  borderRadius: '4px',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}></span>
              ) : (
                <span>Call: <Link href={`tel:${phoneLink}`}>{phoneNumber}</Link></span>
              )}
            </div>
          </div>
          <figure className="image-layer">
            {loading ? (
              <div style={{ 
                width: '576px', 
                height: '303px', 
                background: '#e0e0e0', 
                borderRadius: '8px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}></div>
            ) : (
              <Image 
                src={imageUrl} 
                alt={ctaMedia?.altText || 'CTA Image'} 
                width={576} 
                height={303} 
                priority 
              />
            )}
          </figure>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}} />
    </section>
  );
}
