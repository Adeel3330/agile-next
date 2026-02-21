"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  whatsappUrl?: string;
  chatbotUrl?: string;
  logoUrl?: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export default function Header1({ scroll, handleMobileMenu }: Header1Props) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper function to check if a path is active
  const isActive = (path: string) => {
    if (!pathname || !path) return false;

    // Exact match for root - only match exactly '/'
    if (path === '/') {
      return pathname === '/';
    }

    // Exact match
    if (pathname === path) {
      return true;
    }

    // For paths that should match sub-routes (like /services should match /services/...)
    // Check if pathname starts with path + '/' or path + '?'
    // This prevents /services from matching /service-details
    const pathWithSlash = path + '/';
    const pathWithQuery = path + '?';
    if (pathname.startsWith(pathWithSlash) || pathname.startsWith(pathWithQuery)) {
      return true;
    }

    return false;
  };

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

    // Fetch categories and subcategories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) {
          setCategories(data.categories);
          console.log('Categories loaded:', data.categories.length);
        }
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
      });
  }, []);

  const serviceRoot = categories.find((category) => category.slug === 'service-categories');
  const serviceCategories = serviceRoot
    ? categories.filter((category) => category.parentId === serviceRoot.id)
    : [];

  const getSubcategories = (parentId: string) =>
    categories.filter((category) => category.parentId === parentId);

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
                  <div className="d-flex justify-center align-items-center">
                    <div className="icon-box">
                      <Image src="/assets/images/icons/icon-1.svg" alt="Icon Image" width={15} height={15} priority />
                    </div>
                    {loading ? (
                      <span style={{ display: 'inline-block', width: '150px', height: '16px', background: '#e0e0e0', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
                    ) : (
                      <a className="ms-2" href={settings?.contactPhone ? `tel:${settings.contactPhone}` : 'tel:17276354993'}>
                        {settings?.contactPhone || '1-727-635-4993'}
                      </a>
                    )}
                  </div>
                </li>
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
                    <Link href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" aria-label="X">
                      <i className="fab fa-x-twitter"></i>
                    </Link>
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
                    {loading ? (
                      <div
                        style={{
                          width: '203px',
                          height: '40px',
                          background: '#e0e0e0',
                          borderRadius: '4px',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      ></div>
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
                      <li className={isActive('/') ? "current" : ""}>
                        <Link href="/">Home</Link>
                      </li>
                      <li className={`dropdown ${isActive('/about') ? "current" : ""}`}>
                        <Link href="/about">About Us</Link>
                        <ul>
                          <li>
                            <Link href="/about?view=all">About Agile Nexus Solutions</Link>
                          </li>
                          <li>
                            <Link href="/about?view=team#our-teams">Our Teams</Link>
                          </li>
                        </ul>
                      </li>
                      <li className={`dropdown ${isActive('/services') ? "current" : ""}`}>
                        <Link href="/services">Services</Link>
                        <ul>
                          {serviceCategories.length > 0 ? (
                            <>
                              {serviceCategories.map((category) => {
                                const subcategories = getSubcategories(category.id);
                                const isCategoryActive = pathname === '/services';

                                return (
                                  <li key={category.id} className={`${subcategories.length > 0 ? "dropdown" : ""} ${isCategoryActive ? "current" : ""}`}>
                                    <Link href={`/services?category=${category.slug}`}>
                                      {category.name}
                                    </Link>
                                    {subcategories.length > 0 && (
                                      <ul className="submenu">
                                        {subcategories.map((subcategory) => (
                                          <li key={subcategory.id}>
                                            <Link href={`/services?category=${subcategory.slug}`}>
                                              {subcategory.name}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                );
                              })}
                            </>
                          ) : (
                            <li>
                              <Link href="/services">All Services</Link>
                            </li>
                          )}
                        </ul>
                      </li>
                      <li className={`dropdown ${isActive('/resources') || isActive('/compliance') || isActive('/software') || isActive('/specialities') || isActive('/specialties') || isActive('/blog') ? "current" : ""}`}>
                        <Link href="/resources">Resources</Link>
                        <ul>
                          <li className={isActive('/compliance') ? "current" : ""}>
                            <Link href="/compliance">Compliance</Link>
                          </li>
                          <li className={isActive('/software') ? "current" : ""}>
                            <Link href="/software">Software</Link>
                          </li>
                          <li className={isActive('/specialities') || isActive('/specialties') ? "current" : ""}>
                            <Link href="/specialities">Specialities</Link>
                          </li>
                          {/* <li className={isActive('/affiliate-program') ? "current" : ""}>
                            <Link href="/affiliate-program">Affiliate Program</Link>
                          </li> */}
                          {/* <li className={isActive('/development') ? "current" : ""}>
                            <Link href="/development">Development</Link>
                          </li> */}
                          <li className={isActive('/blog') ? "current" : ""}>
                            <Link href="/blog">Blog</Link>
                          </li>
                        </ul>
                      </li>
                      <li className={isActive('/affiliate-program') ? "current" : ""}>
                        <Link href="/affiliate-program">Affiliate Program</Link>
                      </li>
                      <li className={isActive('/careers') ? "current" : ""}>
                        <Link href="/careers">Careers</Link>
                      </li>
                      <li className={isActive('/contact') ? "current" : ""}>
                        <Link href="/contact">Contact</Link>
                      </li>

                    </ul>
                  </div>
                </nav>
              </div>

              <div className="menu-right-content">
                {/* <div className="support-box">
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
                </div> */}
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
                      <li className={isActive('/') ? "current" : ""}>
                        <Link href="/">Home</Link>
                      </li>
                      <li className={`dropdown ${isActive('/about') ? "current" : ""}`}>
                        <Link href="/about">About Us</Link>
                        <ul>
                          <li>
                            <Link href="/about?view=all">About Agile Nexus Solutions</Link>
                          </li>
                          <li>
                            <Link href="/about?view=team#our-teams">Our Teams</Link>
                          </li>
                        </ul>
                      </li>
                      <li className={`dropdown ${isActive('/services') ? "current" : ""}`}>
                        <Link href="/services">Services</Link>
                        <ul>
                          {serviceCategories.length > 0 ? (
                            <>
                              {serviceCategories.map((category) => {
                                const subcategories = getSubcategories(category.id);

                                return (
                                  <li key={category.id} className={subcategories.length > 0 ? "dropdown" : ""}>
                                    <Link href={`/services?category=${category.slug}`}>
                                      {category.name}
                                    </Link>
                                    {subcategories.length > 0 && (
                                      <ul className="submenu">
                                        {subcategories.map((subcategory) => (
                                          <li key={subcategory.id}>
                                            <Link href={`/services?category=${subcategory.slug}`}>
                                              {subcategory.name}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                );
                              })}
                            </>
                          ) : (
                            <li>
                              <Link href="/services">All Services</Link>
                            </li>
                          )}
                        </ul>
                      </li>
                      <li className={`dropdown ${isActive('/resources') || isActive('/compliance') || isActive('/software') || isActive('/specialities') || isActive('/specialties') || isActive('/blog') ? "current" : ""}`}>
                        <Link href="/resources">Resources</Link>
                        <ul>
                          <li className={isActive('/compliance') ? "current" : ""}>
                            <Link href="/compliance">Compliance</Link>
                          </li>
                          <li className={isActive('/software') ? "current" : ""}>
                            <Link href="/software">Software</Link>
                          </li>
                          <li className={isActive('/specialities') || isActive('/specialties') ? "current" : ""}>
                            <Link href="/specialities">Specialities</Link>
                          </li>

                          <li className={isActive('/blog') ? "current" : ""}>
                            <Link href="/blog">Blog</Link>
                          </li>
                        </ul>
                      </li>
                      <li className={isActive('/affiliate-program') ? "current" : ""}>
                        <Link href="/affiliate-program">Affiliate Program</Link>
                      </li>
                      <li className={isActive('/careers') ? "current" : ""}>
                        <Link href="/careers">Careers</Link>
                      </li>
                      <li className={isActive('/contact') ? "current" : ""}>
                        <Link href="/contact">Contact</Link>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>

              <div className="menu-right-content">
                {/* <div className="support-box">
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
                </div> */}
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
          handleSidebar={() => { }}
        />
      </header>
    </>
  );
}
