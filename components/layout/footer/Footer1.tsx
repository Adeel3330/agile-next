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
  logoUrl?: string;
}

export default function Footer1() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
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
        console.error('Failed to fetch settings:', err);
        setLoading(false);
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

  if (!mounted) {
    return null;
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `
      }} />
      <footer className="main-footer">
        <div className="widget-section p_relative">
          <div className="pattern-layer">
            <div className="pattern-1" style={{ backgroundImage: "url(assets/images/shape/shape-21.png)" }}></div>
            <div className="pattern-2" style={{ backgroundImage: "url(assets/images/shape/shape-22.png)" }}></div>
            <div className="pattern-3" style={{ backgroundImage: "url(assets/images/shape/shape-23.png)" }}></div>
            <div className="pattern-4" style={{ backgroundImage: "url(assets/images/shape/shape-24.png)" }}></div>
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
                        <li><Link href={settings.socialTwitter} target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></Link></li>
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
                        <Image src="/assets/images/icons/icon-5.svg" alt="Icon" width={20} height={15} priority />
                        Email: {loading ? (
                          <span style={{ display: 'inline-block', width: '180px', height: '16px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
                        ) : (
                          <Link href={settings?.contactEmail ? `mailto:${settings.contactEmail}` : 'mailto:info@agilenexussolution.com'}>
                            {settings?.contactEmail || 'info@agilenexussolution.com'}
                          </Link>
                        )}
                      </li>
                      <li>
                        <Image src="/assets/images/icons/icon-6.svg" alt="Icon" width={20} height={21} priority />
                        Call: {loading ? (
                          <span style={{ display: 'inline-block', width: '140px', height: '16px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
                        ) : (
                          <Link href={settings?.contactPhone ? `tel:${settings.contactPhone.replace(/\s/g, '')}` : 'tel:17276354993'}>
                            {settings?.contactPhone || '1-727-635-4993'}
                          </Link>
                        )}
                      </li>
                      <li>
                        <Image src="/assets/images/icons/icon-7.svg" alt="Icon" width={20} height={20} priority />
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
                  {loading ? (
                    <div style={{ width: '203px', height: '40px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                  ) : (
                    <Image 
                      src={settings?.logoUrl || '/assets/images/logo.png'} 
                      alt="Footer Logo" 
                      width={203} 
                      height={40} 
                      priority 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/images/logo.png';
                      }}
                    />
                  )}
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
