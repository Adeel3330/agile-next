"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import MobileMenu from "../MobileMenu";

// ✅ Define props type
type Header1Props = {
  scroll: boolean;
  handleMobileMenu: () => void;
};

interface Settings {
  contactEmail?: string;
  contactPhone?: string;
  workingHours?: any;
  socialFacebook?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
  logoUrl?: string;
}

export default function Header1({ scroll, handleMobileMenu }: Header1Props) {
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

  const formatWorkingHours = () => {
    if (!settings?.workingHours) return 'Mon - Fri: 9:00am to 6:00pm';
    const hours = settings.workingHours;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const firstDay = hours[days[0]];
    if (firstDay && !firstDay.closed) {
      return `Mon - Fri: ${firstDay.open || '9:00'}am to ${firstDay.close || '6:00'}pm`;
    }
    return 'Mon - Fri: 9:00am to 6:00pm';
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
      {/* main header */}
      <header className={`main-header ${scroll ? "fixed-header" : ""}`}>
        <div className="header-top">
          <div className="outer-container">
            <div className="top-inner">
              <ul className="info-list clearfix">
                <li>
                  <i className="icon-46"></i>
                  {loading ? (
                    <span style={{ display: 'inline-block', width: '150px', height: '16px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
                  ) : (
                    <a href={settings?.contactEmail ? `mailto:${settings.contactEmail}` : 'mailto:info@agilenexussolution.com'}>
                      {settings?.contactEmail || 'info@agilenexussolution.com'}
                    </a>
                  )}
                </li>
                <li>
                  <i className="icon-2"></i>
                  <Link href="/contact">Get Started</Link>
                </li>
                <li>
                  <i className="icon-3"></i>
                  Open Hours: {loading ? (
                    <span style={{ display: 'inline-block', width: '120px', height: '16px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
                  ) : (
                    <span>{formatWorkingHours()}</span>
                  )}
                </li>
              </ul>
              <ul className="social-links clearfix">
                <li>
                  <h6>Follow Us</h6>
                </li>
                {settings?.socialFacebook && (
                  <li>
                    <Link href={settings.socialFacebook} target="_blank" rel="noopener noreferrer"><i className="icon-4"></i></Link>
                  </li>
                )}
                {settings?.socialTwitter && (
                  <li>
                    <Link href={settings.socialTwitter} target="_blank" rel="noopener noreferrer"><i className="icon-5"></i></Link>
                  </li>
                )}
                {settings?.socialInstagram && (
                  <li>
                    <Link href={settings.socialInstagram} target="_blank" rel="noopener noreferrer"><i className="icon-6"></i></Link>
                  </li>
                )}
                {settings?.socialLinkedin && (
                  <li>
                    <Link href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="header-lower">
          <div className="outer-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link href="/">
                  <Image 
                        src={settings?.logoUrl || '/assets/images/logo.png'} 
                        alt="Logo Image" 
                        width={203} 
                        height={40} 
                        priority 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/images/logo.png';
                        }}
                      />
                  </Link>
                </figure>
              </div>
              <div className="menu-area">
                <div className="mobile-nav-toggler" onClick={handleMobileMenu}>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                </div>

                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div
                    className="collapse navbar-collapse show clearfix"
                    id="navbarSupportedContent"
                  >
                    <ul className="navigation clearfix">
                      <li className="current">
                        <Link href="/">Home</Link>
                      </li>
                      <li className="dropdown">
                        <Link href="/about">About Us</Link>
                        <ul>
                          <li>
                            <Link href="/about">About Agile Nexus Solutions</Link>
                          </li>
                          <li>
                            <Link href="/about#leadership">Leadership</Link>
                          </li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link href="/services">Services</Link>
                        <ul>
                          <li>
                            <Link href="/services#physicians">Physicians/Medical Groups</Link>
                          </li>
                          <li>
                            <Link href="/services#billing-companies">Medical Billing Companies</Link>
                          </li>
                          <li className="dropdown">
                            <Link href="/services#rcm">Revenue Cycle Management</Link>
                            <ul>
                              <li><Link href="/services#eligibility">Eligibility & Benefits Verification</Link></li>
                              <li><Link href="/services#demographics">Patients Demographics Entry</Link></li>
                              <li><Link href="/services#authorizations">Authorizations</Link></li>
                              <li><Link href="/services#coding">Coding – ICD 10</Link></li>
                              <li><Link href="/services#charge-capture">Charge Capture</Link></li>
                              <li><Link href="/services#claims-submission">Claims Submission</Link></li>
                              <li><Link href="/services#claims-audit">Claims Audit (Fix Rejections)</Link></li>
                              <li><Link href="/services#payment-posting">Payment Posting</Link></li>
                              <li><Link href="/services#denial-management">Denial Management</Link></li>
                              <li><Link href="/services#ar-follow-up">AR Follow Up</Link></li>
                              <li><Link href="/services#patient-statements">Patient Statements & Follow Up</Link></li>
                              <li><Link href="/services#credit-balance">Credit Balance Solution</Link></li>
                              <li><Link href="/services#credentialing">Credentialing & Enrollment</Link></li>
                              <li><Link href="/services#ipa-contracting">IPA Contracting</Link></li>
                              <li><Link href="/services#virtual-assistance">Virtual Assistance</Link></li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link href="/resources">Resources</Link>
                        <ul>
                          <li>
                            <Link href="/compliance">Compliance</Link>
                          </li>
                          <li>
                            <Link href="/software">Software</Link>
                          </li>
                          <li>
                            <Link href="/development">Development</Link>
                          </li>
                          <li>
                            <Link href="/blog">Blog</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link href="/careers">Careers</Link>
                      </li>
                      <li>
                        <Link href="/contact">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              <div className="menu-right-content">
                <div className="support-box">
                  <div className="icon-box">
                    <Image src="/assets/images/icons/icon-1.svg" alt="Icon Image" width={25} height={25} priority />
                  </div>
                  <span>Call Us</span>
                  <h6>
                    {loading ? (
                      <span style={{ display: 'inline-block', width: '120px', height: '16px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
                    ) : (
                      <Link href={settings?.contactPhone ? `tel:${settings.contactPhone.replace(/\s/g, '')}` : 'tel:17276354993'}>
                        {settings?.contactPhone || '1-727-635-4993'}
                      </Link>
                    )}
                  </h6>
                </div>
                <div className="btn-box">
                  <Link href="/contact" className="theme-btn btn-one">
                    <span>Get Started</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* sticky header */}
        <div className={`sticky-header ${scroll ? "animated slideInDown" : ""}`}>
          <div className="outer-container">
            <div className="outer-box">
              <div className="logo-box">
                <figure className="logo">
                  <Link href="/">
                    {loading ? (
                      <div style={{ width: '203px', height: '40px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                    ) : (
                      <Image 
                        src={settings?.logoUrl || '/assets/images/logo.png'} 
                        alt="Logo Image" 
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
              </div>
              <div className="menu-area">
                <div className="mobile-nav-toggler" onClick={handleMobileMenu}>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                  <i className="icon-bar"></i>
                </div>

                <nav className="main-menu navbar-expand-md navbar-light clearfix">
                  <div
                    className="collapse navbar-collapse show clearfix"
                    id="navbarSupportedContent"
                  >
                    <ul className="navigation clearfix">
                      <li className="current">
                        <Link href="/">Home</Link>
                      </li>
                      <li className="dropdown">
                        <Link href="/about">About Us</Link>
                        <ul>
                          <li>
                            <Link href="/about">About Agile Nexus Solutions</Link>
                          </li>
                          <li>
                            <Link href="/about#leadership">Leadership</Link>
                          </li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link href="/services">Services</Link>
                        <ul>
                          <li>
                            <Link href="/services#physicians">Physicians/Medical Groups</Link>
                          </li>
                          <li>
                            <Link href="/services#billing-companies">Medical Billing Companies</Link>
                          </li>
                          <li className="dropdown">
                            <Link href="/services#rcm">Revenue Cycle Management</Link>
                            <ul>
                              <li><Link href="/services#eligibility">Eligibility & Benefits Verification</Link></li>
                              <li><Link href="/services#demographics">Patients Demographics Entry</Link></li>
                              <li><Link href="/services#authorizations">Authorizations</Link></li>
                              <li><Link href="/services#coding">Coding – ICD 10</Link></li>
                              <li><Link href="/services#charge-capture">Charge Capture</Link></li>
                              <li><Link href="/services#claims-submission">Claims Submission</Link></li>
                              <li><Link href="/services#claims-audit">Claims Audit (Fix Rejections)</Link></li>
                              <li><Link href="/services#payment-posting">Payment Posting</Link></li>
                              <li><Link href="/services#denial-management">Denial Management</Link></li>
                              <li><Link href="/services#ar-follow-up">AR Follow Up</Link></li>
                              <li><Link href="/services#patient-statements">Patient Statements & Follow Up</Link></li>
                              <li><Link href="/services#credit-balance">Credit Balance Solution</Link></li>
                              <li><Link href="/services#credentialing">Credentialing & Enrollment</Link></li>
                              <li><Link href="/services#ipa-contracting">IPA Contracting</Link></li>
                              <li><Link href="/services#virtual-assistance">Virtual Assistance</Link></li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li className="dropdown">
                        <Link href="/resources">Resources</Link>
                        <ul>
                          <li>
                            <Link href="/compliance">Compliance</Link>
                          </li>
                          <li>
                            <Link href="/software">Software</Link>
                          </li>
                          <li>
                            <Link href="/development">Development</Link>
                          </li>
                          <li>
                            <Link href="/blog">Blog</Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <Link href="/careers">Careers</Link>
                      </li>
                      <li>
                        <Link href="/contact">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              <div className="menu-right-content">
                <div className="support-box">
                  <div className="icon-box">
                    <Image src="/assets/images/icons/icon-1.svg" alt="Icon Image" width={25} height={25} priority />
                  </div>
                  <span>Call Us</span>
                  <h6>
                    {loading ? (
                      <span style={{ display: 'inline-block', width: '120px', height: '16px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
                    ) : (
                      <Link href={settings?.contactPhone ? `tel:${settings.contactPhone.replace(/\s/g, '')}` : 'tel:17276354993'}>
                        {settings?.contactPhone || '1-727-635-4993'}
                      </Link>
                    )}
                  </h6>
                </div>
                <div className="btn-box">
                  <Link href="/contact" className="theme-btn btn-one">
                    <span>Get Started</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Fixed MobileMenu props */}
        <MobileMenu
          isSidebar={false}
          handleMobileMenu={handleMobileMenu}
          handleSidebar={() => {}}
        />
      </header>
    </>
  );
}
