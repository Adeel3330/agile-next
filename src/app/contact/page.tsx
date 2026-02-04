'use client';

import { useState, useEffect, useCallback } from 'react';
import Layout from "../../../components/layout/Layout";
import ContactForm from "../../../components/elements/ContactForm";
import Image from "next/image";
import Link from "next/link";
import GoogleMapSection from "../../../components/sections/home1/GoogleMap";

interface MediaItem {
  id: string;
  fileUrl: string;
  title?: string;
  altText?: string;
}

interface PageData {
  id: string;
  title: string;
  content?: string;
  sections?: any[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoImage?: string;
}

interface Settings {
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  contactCity?: string;
  contactState?: string;
  contactZip?: string;
  contactCountry?: string;
  workingHours?: any;
  mapLocation?: string;
  mapEmbedUrl?: string;
  seoDefaultTitle?: string;
  seoDefaultDescription?: string;
  seoDefaultKeywords?: string;
  seoDefaultImage?: string;
}

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  
  const [contactImage, setContactImage] = useState<MediaItem | null>(null);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchContactData();
  }, []);

  // Update document metadata for SEO
  useEffect(() => {
    if (pageData || settings) {
      // Use page SEO first, then fallback to settings default SEO
      const title = pageData?.seoTitle || settings?.seoDefaultTitle || pageData?.title || 'Contact Us - Agile Nexus Solution';
      const description = pageData?.seoDescription || settings?.seoDefaultDescription || 
        'Get in touch with Agile Nexus Solution. Contact us for medical billing services, support, or inquiries. We are here to help you.';
      const keywords = pageData?.seoKeywords || settings?.seoDefaultKeywords || 
        'contact, medical billing, healthcare, support, inquiry, Agile Nexus Solution';
      const image = pageData?.seoImage || contactImage?.fileUrl || settings?.seoDefaultImage || '';

      // Update document title
      document.title = title;

      // Update or create meta tags
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

      // Update meta tags
      updateMetaTag('description', description);
      updateMetaTag('keywords', keywords);
      updateMetaTag('og:title', title, 'property');
      updateMetaTag('og:description', description, 'property');
      updateMetaTag('og:image', image, 'property');
      updateMetaTag('og:url', typeof window !== 'undefined' ? window.location.href : '', 'property');
      updateMetaTag('og:type', 'website', 'property');
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', title);
      updateMetaTag('twitter:description', description);
      if (image) {
        updateMetaTag('twitter:image', image);
      }
    }
  }, [pageData, settings, contactImage]);

  const fetchContactData = useCallback(async () => {
    setLoading(true);
    
    // Fetch media (contact image)
    try {
      const mediaRes = await fetch('/api/media?position=contact');
      const mediaData = await mediaRes.json();
      if (mediaData.success && mediaData.media && mediaData.media.length > 0) {
        setContactImage(mediaData.media[0]);
      }
    } catch (err) {
      console.error('Failed to fetch contact media:', err);
    } finally {
      setMediaLoading(false);
    }

    // Fetch page content (contact page)
    try {
      const pageRes = await fetch('/api/pages/contact');
      const pageData = await pageRes.json();
      if (pageData.success && pageData.page) {
        setPageData(pageData.page);
      }
    } catch (err) {
      console.error('Failed to fetch contact page:', err);
    } finally {
      setPageLoading(false);
    }

    // Fetch settings
    try {
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.settings) {
        setSettings(settingsData.settings);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setSettingsLoading(false);
      setLoading(false);
    }
  }, []);

  const formatAddress = () => {
    if (!settings) return '2972 Westheimer Rd. Santa Ana, Illinois 85486';
    const parts = [
      settings.contactAddress,
      settings.contactCity,
      settings.contactState,
      settings.contactZip,
      settings.contactCountry
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '2972 Westheimer Rd. Santa Ana, Illinois 85486';
  };

  const formatWorkingHours = () => {
    if (!settings?.workingHours) {
      return (
        <>
          <li>Mon - Wed: <span>8:00AM - 7:00PM</span></li>
          <li>Thu: <span>8:00AM - 7:00PM</span></li>
          <li>Fri: <span>8:00AM - 7:00PM</span></li>
          <li>Sat - Sun: <span>8:00AM - 7:00PM</span></li>
        </>
      );
    }

    const hours = settings.workingHours;
    const daysMap: { [key: string]: string } = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };

    const formatDay = (day: string, dayData: any) => {
      if (dayData.closed) return null;
      const open = dayData.open || '8:00AM';
      const close = dayData.close || '7:00PM';
      return `${daysMap[day]}: <span>${open} - ${close}</span>`;
    };

    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const weekend = ['saturday', 'sunday'];

    const weekdayHours = weekdays.map(day => formatDay(day, hours[day])).filter(Boolean);
    const weekendHours = weekend.map(day => formatDay(day, hours[day])).filter(Boolean);

    return (
      <>
        {weekdayHours.length > 0 && (
          <li dangerouslySetInnerHTML={{ __html: `Mon - Fri: <span>${hours.monday?.open || '8:00AM'} - ${hours.monday?.close || '7:00PM'}</span>` }} />
        )}
        {weekendHours.length > 0 && (
          <li dangerouslySetInnerHTML={{ __html: `Sat - Sun: <span>${hours.saturday?.open || '8:00AM'} - ${hours.saturday?.close || '7:00PM'}</span>` }} />
        )}
      </>
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="boxed_wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .skeleton {
          display: inline-block;
          background: #e0e0e0;
          border-radius: 4px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .skeleton-text {
          height: 16px;
          width: 100%;
          margin-bottom: 8px;
        }
        .skeleton-title {
          height: 24px;
          width: 60%;
          margin-bottom: 12px;
        }
        .skeleton-image {
          width: 100%;
          height: 200px;
          border-radius: 8px;
        }
      `}} />
      
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Contact Us">
        <section className="contact-info-two centred">
          <div 
            className="pattern-layer" 
            style={{ 
              backgroundImage: mediaLoading || !contactImage 
                ? 'none' 
                : `url(${contactImage.fileUrl})` 
            }}
          >
            {mediaLoading && (
              <div className="skeleton skeleton-image" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}></div>
            )}
          </div>
          <div className="auto-container">
            <div className="row clearfix">
              <div className="col-lg-4 col-md-6 col-sm-12 info-block">
                <div className="info-block-two wow fadeInUp animated" data-wow-delay="00ms" data-wow-duration="1500ms">
                  <div className="inner-box">
                    <div className="icon-box">
                      <Image src="/assets/images/icons/icon-23.svg" alt="Icon" width={50} height={50} priority />
                    </div>
                    <h3>Office Location</h3>
                    {settingsLoading ? (
                      <div>
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
                      </div>
                    ) : (
                      <p>{formatAddress()}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-12 info-block">
                <div className="info-block-two wow fadeInUp animated" data-wow-delay="300ms" data-wow-duration="1500ms">
                  <div className="inner-box">
                    <div className="icon-box">
                      <Image src="/assets/images/icons/icon-24.svg" alt="Icon" width={50} height={50} priority />
                    </div>
                    <h3>Company Email</h3>
                    {settingsLoading ? (
                      <div>
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
                      </div>
                    ) : (
                      <p>
                        {settings?.contactEmail ? (
                          <>
                            <Link href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</Link>
                            {settings.contactEmail.includes('info') && settings.contactEmail !== 'info@agilenexussolution.com' && (
                              <><br /><Link href="mailto:contact@agilenexussolution.com">contact@agilenexussolution.com</Link></>
                            )}
                          </>
                        ) : (
                          <>
                            <Link href="mailto:info@agilenexussolution.com">info@agilenexussolution.com</Link>
                            <br /><Link href="mailto:contact@agilenexussolution.com">contact@agilenexussolution.com</Link>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 col-sm-12 info-block">
                <div className="info-block-two wow fadeInUp animated" data-wow-delay="600ms" data-wow-duration="1500ms">
                  <div className="inner-box">
                    <div className="icon-box">
                      <Image src="/assets/images/icons/icon-25.svg" alt="Icon" width={50} height={50} priority />
                    </div>
                    <h3>Contact Us</h3>
                    {settingsLoading ? (
                      <div>
                        <div className="skeleton skeleton-text"></div>
                        <div className="skeleton skeleton-text" style={{ width: '75%' }}></div>
                      </div>
                    ) : (
                      <p>
                        {settings?.contactPhone ? (
                          <>
                            <Link href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}>{settings.contactPhone}</Link>
                          </>
                        ) : (
                          <>
                            <Link href="tel:+000111555999">+000 111555999</Link>
                            <br /><Link href="tel:+000111555888">+000 111555888</Link>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="contact-section sec-pad">
          <div className="pattern-layer" style={{ backgroundImage: "url(assets/images/shape/shape-42.png)" }}></div>
          <div className="auto-container">
            <div className="inner-box">
              {pageLoading ? (
                <div>
                  <div className="skeleton skeleton-title"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text" style={{ width: '90%' }}></div>
                </div>
              ) : (
                <>
                  <h2>{pageData?.title || 'Leave a Comment'}</h2>
                 
                </>
              )}
              <ContactForm />
            </div>
          </div>
        </section>
        <GoogleMapSection settings={settings || undefined} loading={settingsLoading} />
      </Layout>
    </div>
  );
}
