"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Settings {
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  contactCity?: string;
  contactState?: string;
  contactZip?: string;
  contactCountry?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
  socialYoutube?: string;
  whatsappUrl?: string;
  chatbotUrl?: string;
  logoUrl?: string;
}

interface CertificationMedia {
  id: string;
  fileUrl: string;
  altText?: string;
  title?: string;
}

export default function Footer1() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [certifications, setCertifications] = useState<CertificationMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch settings from API
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.settings);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch settings footer:', err);
        setLoading(false);
      });

    fetch('/api/media?position=certifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.media)) {
          setCertifications(data.media.slice(0, 6));
        }
      })
      .catch((err) => {
        console.error('Failed to fetch certifications footer:', err);
      });
  }, []);

  const formatAddress = () => {
    if (!settings) return '7901 4th St N, St. Petersburg, FL 33702, USA';
    const parts = [
      settings.contactAddress,
      settings.contactCity,
      settings.contactState,
      settings.contactZip,
      settings.contactCountry
    ].filter(Boolean);
    return parts.join(', ') || '7901 4th St N, St. Petersburg, FL 33702, USA';
  };

  // Always render footer on first paint (no mounted gate) to avoid CLS from
  // late-appearing pattern-layer / widget section.
  const logoSrc = settings?.logoUrl || '/assets/images/logo.png';

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .main-footer .footer-menu .logo-box,
          .main-footer .footer-menu .logo-box a {
            display: block;
            width: 203px;
            height: 66px;
          }
          .main-footer .footer-menu .logo-box img {
            width: 203px !important;
            height: 66px !important;
            object-fit: contain;
          }
          .main-footer .widget-section {
            min-height: 420px;
          }
          .main-footer .pattern-layer {
            position: absolute;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
          }
        `
      }} />
      <footer className="main-footer">
        <div className="widget-section p_relative">
          <div className="pattern-layer" aria-hidden="true">
            <div className="pattern-1" style={{ backgroundImage: "url(/assets/images/shape/shape-21.png)" }}></div>
            <div className="pattern-2" style={{ backgroundImage: "url(/assets/images/shape/shape-22.png)" }}></div>
            <div className="pattern-3" style={{ backgroundImage: "url(/assets/images/shape/shape-23.png)" }}></div>
            <div className="pattern-4" style={{ backgroundImage: "url(/assets/images/shape/shape-24.png)" }}></div>
          </div>
          <div className="auto-container">
            <div className="row clearfix">
              <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
                <div className="footer-widget about-widget">
                  <div className="widget-title">
                    <h3>About Us</h3>
                  </div>
                  <div className="widget-content">
                    <p>Agile Nexus Solutions provides medical billing and coding services to healthcare providers in the United States. Our mission is to be a trusted and valued healthcare partner offering advanced revenue cycle management services.</p>
                    <ul className="social-links clearfix">
                      {settings?.socialFacebook && (
                        <li><Link href={settings.socialFacebook} target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f"></i></Link></li>
                      )}
                      {settings?.socialTwitter && (
                        <li><Link href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" aria-label="X"><i className="fab fa-twitter"></i></Link></li>
                      )}
                      {settings?.socialInstagram && (
                        <li><Link href={settings.socialInstagram} target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></Link></li>
                      )}
                      {settings?.socialLinkedin && (
                        <li><Link href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></Link></li>
                      )}
                      {settings?.socialYoutube && (
                        <li><Link href={settings.socialYoutube} target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube"></i></Link></li>
                      )}

                    </ul>
                    {/* {certifications.length > 0 && (
                      <div className="mt-3">
                        <h6 className="mb-2">CPC & CPB Certificates</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {certifications.map((item) => (
                            <Image
                              key={item.id}
                              src={item.fileUrl}
                              alt={item.altText || item.title || 'Certification'}
                              width={70}
                              height={70}
                              style={{ objectFit: 'cover', borderRadius: '6px' }}
                            />
                          ))}
                        </div>
                      </div>
                    )} */}
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
                <div className="footer-widget links-widget ml_70">
                  <div className="widget-title">
                    <h3>Quick Links</h3>
                  </div>
                  <div className="widget-content">
                    <ul className="links-list clearfix">
                      <li><Link href="/about">About Us</Link></li>
                      <li><Link href="/services">Services</Link></li>
                      <li><Link href="/compliance">Compliance</Link></li>
                      <li><Link href="/software">Software</Link></li>
                      <li><Link href="/careers">Careers</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
                <div className="footer-widget links-widget ml_70">
                  <div className="widget-title">
                    <h3>Services</h3>
                  </div>
                  <div className="widget-content">
                    <ul className="links-list clearfix">
                      <li><Link href="/services#eligibility">Eligibility & Benefits Verification</Link></li>
                      <li><Link href="/services#coding">Coding – ICD 10</Link></li>
                      <li><Link href="/services#claims-submission">Claims Submission</Link></li>
                      <li><Link href="/services#denial-management">Denial Management</Link></li>
                      <li><Link href="/services#ar-follow-up">AR Follow Up</Link></li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-md-6 col-sm-12 footer-column">
                <div className="footer-widget contact-widget">
                  <div className="widget-title">
                    <h3>Contacts</h3>
                  </div>
                  <div className="widget-content">
                    <ul className="info-list clearfix">
                      <li>
                        <Image src="/assets/images/icons/icon-5.svg" alt="" width={20} height={15} />
                        Email: {loading ? (
                          <span style={{ display: 'inline-block', width: '180px', height: '16px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
                        ) : (
                          <Link href={settings?.contactEmail ? `mailto:${settings.contactEmail}` : 'mailto:info@agilenexussolutions.com'}>
                            {settings?.contactEmail || 'info@agilenexussolutions.com'}
                          </Link>
                        )}
                      </li>
                      <li>
                        <Image src="/assets/images/icons/icon-6.svg" alt="" width={20} height={21} />
                        Call: {loading ? (
                          <span style={{ display: 'inline-block', width: '140px', height: '16px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
                        ) : (
                          <Link href={settings?.contactPhone ? `tel:${settings.contactPhone.replace(/\s/g, '')}` : 'tel:+17274054050'}>
                            {settings?.contactPhone || '+1 (727) 405-4050'}
                          </Link>
                        )}
                      </li>
                      <li>
                        <Image src="/assets/images/icons/icon-7.svg" alt="" width={20} height={20} />
                        {loading ? (
                          <span style={{ display: 'inline-block', width: '250px', height: '16px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
                        ) : (
                          formatAddress()
                        )}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-menu mt_60">
              <figure className="logo-box">
                <Link href="/">
                  <Image
                    src={logoSrc}
                    alt="Agile Nexus Solutions"
                    width={203}
                    height={66}
                    sizes="203px"
                    style={{ width: 203, height: 66, objectFit: 'contain' }}
                  />
                </Link>
              </figure>
              <ul className="menu-list clearfix">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/services">Services</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom centred">
          <div className="auto-container">
            <div className="copyright">
              <p><Link href="/">Agile Nexus Solutions</Link> &copy; {new Date().getFullYear()} All Right Reserved</p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
