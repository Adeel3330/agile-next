'use client'

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type MobileMenuProps = {
  isSidebar: boolean;
  handleMobileMenu: () => void;
  handleSidebar: () => void;
};

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Service {
  id: string;
  title: string;
  slug: string;
  categoryId?: string;
  category?: { id: string; name: string; slug: string } | null;
}

interface Settings {
  logoUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactAddress?: string | null;
  contactCity?: string | null;
  contactState?: string | null;
  contactZip?: string | null;
  contactCountry?: string | null;
  socialFacebook?: string | null;
  socialTwitter?: string | null;
  socialInstagram?: string | null;
  socialLinkedin?: string | null;
  socialYoutube?: string | null;
  socialPinterest?: string | null;
  whatsappUrl?: string | null;
}

export default function MobileMenu({ isSidebar, handleMobileMenu, handleSidebar }: MobileMenuProps) {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) setSettings(data.settings);
      })
      .catch(() => { });

    fetch('/api/categories/service-categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) setCategories(data.categories);
      })
      .catch(() => { });
    fetch('/api/services?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.services) setServices(data.services);
      })
      .catch(() => { });
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

  const uncategorizedServices = services.filter(s => !s.categoryId && !s.category?.id);
  const allCategoryIds = new Set(categories.map(c => c.id));
  const servicesNotInCategories = services.filter(s => {
    const id = s.categoryId || s.category?.id;
    return id && !allCategoryIds.has(id);
  });
  const hasOtherServices = uncategorizedServices.length > 0 || servicesNotInCategories.length > 0;

  return (
    <>
      <div className="mobile-menu">
        <div className="menu-backdrop" onClick={handleMobileMenu} />
        <div className="close-btn" onClick={handleMobileMenu}>
          <span className="far fa-times" />
        </div>
        <nav className="menu-box">
          <div className="nav-logo">
            <Link href="/">
              <Image
              style={{ background: 'white' }}
                src={settings?.logoUrl || "/assets/images/logo-2.png"}
                alt="Logo Image"
                width={203}
                  height={40}
                  priority
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/images/logo-2.png';
                }}
              />
            </Link>
          </div>
          <div className="menu-outer">
            <ul className="navigation clearfix">

              <li>
                <Link href="/" onClick={handleMobileMenu}>Home</Link>
              </li>

              <li className={`dropdown ${openKeys.has("about") ? "current" : ""}`}>
                <span
                  className="mobile-menu-trigger"
                  onClick={() => toggle("about")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle("about"); } }}
                  style={{ display: "block", padding: "10px 45px 10px 25px", lineHeight: "24px", fontSize: "15px", fontWeight: 500, color: "#fff", textTransform: "uppercase", cursor: "pointer" }}
                >
                  About Us
                </span>
                <ul style={{ display: openKeys.has("about") ? "block" : "none" }}>
                  <li>
                    <Link href="/about?view=all" onClick={handleMobileMenu}>About Agile Nexus Solutions</Link>
                  </li>
                  <li>
                    <Link href="/about?view=team#our-teams" onClick={handleMobileMenu}>Meet Our Team</Link>
                  </li>
                </ul>
                <div className={`dropdown-btn ${openKeys.has("about") ? "open" : ""}`} onClick={(e) => { e.stopPropagation(); toggle("about"); }}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>


              {/* Services - same structure as Header1 */}
              <li className={`${categories.length > 0 || hasOtherServices ? "dropdown " : ""}${openKeys.has("services") ? "current" : ""}`}>
                {categories.length > 0 || hasOtherServices ? (
                  <>
                    <span
                      className="mobile-menu-trigger"
                      onClick={() => toggle("services")}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle("services"); } }}
                      style={{ display: "block", padding: "10px 45px 10px 25px", lineHeight: "24px", fontSize: "15px", fontWeight: 500, color: "#fff", textTransform: "uppercase", cursor: "pointer" }}
                    >
                      Services
                    </span>
                    <ul style={{ display: openKeys.has("services") ? "block" : "none" }}>
                      {categories.map((category) => {
                        const categoryServices = services.filter(
                          s => s.categoryId === category.id || s.category?.id === category.id
                        );
                        const catKey = `cat-${category.id}`;
                        const isCatOpen = openKeys.has(catKey);
                        return (
                          <li key={category.id} className={`${categoryServices.length > 0 ? "dropdown " : ""}${isCatOpen ? "current" : ""}`}>
                            {categoryServices.length > 0 ? (
                              <>
                                <span
                                  className="mobile-menu-trigger"
                                  onClick={() => toggle(catKey)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(catKey); } }}
                                  style={{ display: "block", padding: "10px 45px 10px 20px", lineHeight: "24px", fontSize: "16px", color: "#fff", cursor: "pointer", marginLeft: "20px" }}
                                >
                                  {category.name}
                                </span>
                                <ul className="submenu" style={{ display: isCatOpen ? "block" : "none" }}>
                                  {categoryServices.map((service) => (
                                    <li key={service.id}>
                                      <Link href={`/services/${service.slug}`} onClick={handleMobileMenu}>{service.title}</Link>
                                    </li>
                                  ))}
                                </ul>
                                <div className={`dropdown-btn ${isCatOpen ? "open" : ""}`} onClick={(e) => { e.stopPropagation(); toggle(catKey); }}>
                                  <span className="fa fa-angle-right" />
                                </div>
                              </>
                            ) : (
                              <Link href={`/services?category=${category.slug}`} onClick={handleMobileMenu} style={{ marginLeft: "20px" }}>{category.name}</Link>
                            )}
                          </li>
                        );
                      })}
                      {hasOtherServices && (
                        <li className={`dropdown ${openKeys.has("other-services") ? "current" : ""}`}>
                          <span
                            className="mobile-menu-trigger"
                            onClick={() => toggle("other-services")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle("other-services"); } }}
                            style={{ display: "block", padding: "10px 45px 10px 20px", lineHeight: "24px", fontSize: "16px", color: "#fff", cursor: "pointer", marginLeft: "20px" }}
                          >
                            Other Services
                          </span>
                          <ul className="submenu" style={{ display: openKeys.has("other-services") ? "block" : "none" }}>
                            {uncategorizedServices.map((service) => (
                              <li key={service.id}>
                                <Link href={`/services/${service.slug}`} onClick={handleMobileMenu}>{service.title}</Link>
                              </li>
                            ))}
                            {servicesNotInCategories.map((service) => (
                              <li key={service.id}>
                                <Link href={`/services/${service.slug}`} onClick={handleMobileMenu}>{service.title}</Link>
                              </li>
                            ))}
                          </ul>
                          <div className={`dropdown-btn ${openKeys.has("other-services") ? "open" : ""}`} onClick={(e) => { e.stopPropagation(); toggle("other-services"); }}>
                            <span className="fa fa-angle-right" />
                          </div>
                        </li>
                      )}
                    </ul>
                    <div className={`dropdown-btn ${openKeys.has("services") ? "open" : ""}`} onClick={(e) => { e.stopPropagation(); toggle("services"); }}>
                      <span className="fa fa-angle-right" />
                    </div>
                  </>
                ) : (
                  <Link href="/services" onClick={handleMobileMenu}>Services</Link>
                )}
              </li>

              {/* Resources - same as Header1 */}
              <li className={`dropdown ${openKeys.has("resources") ? "current" : ""}`}>
                <Link
                  href="/resources"
                  onClick={handleMobileMenu}
                  style={{ display: "block", padding: "10px 45px 10px 25px", lineHeight: "24px", fontSize: "15px", fontWeight: 500, color: "#fff", textTransform: "uppercase", cursor: "pointer" }}
                >
                  Resources
                </Link>
                <ul style={{ display: openKeys.has("resources") ? "block" : "none" }}>
                  <li><Link href="/compliance" onClick={handleMobileMenu}>Compliance</Link></li>
                  <li><Link href="/software" onClick={handleMobileMenu}>Software</Link></li>
                  <li><Link href="/specialities" onClick={handleMobileMenu}>Specialities</Link></li>
                  <li><Link href="/blog" onClick={handleMobileMenu}>Blog</Link></li>
                </ul>
                <div className={`dropdown-btn ${openKeys.has("resources") ? "open" : ""}`} onClick={(e) => { e.stopPropagation(); toggle("resources"); }}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              <li>
                <Link href="/affiliate-program" onClick={handleMobileMenu}>Affiliate Program</Link>
              </li>

              <li>
                <Link href="/careers" onClick={handleMobileMenu}>Careers</Link>
              </li>

              <li>
                <Link href="/contact" onClick={handleMobileMenu}>Contact</Link>
              </li>

              {settings?.whatsappUrl && (
                <li>
                  <Link href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={handleMobileMenu}>WhatsApp</Link>
                </li>
              )}

            </ul>
          </div>

          <div className="contact-info">
            <h4>Contact Info</h4>
            <ul>
              <li>{formatAddress()}</li>
              <li><Link href={settings?.contactPhone ? `tel:${settings.contactPhone}` : "tel:+8801682648101"}>{settings?.contactPhone || '+88 01682648101'}</Link></li>
              <li><Link href={settings?.contactEmail ? `mailto:${settings.contactEmail}` : "mailto:info@example.com"}>{settings?.contactEmail || 'info@example.com'}</Link></li>
            </ul>
          </div>

          <div className="social-links">
            <ul className="clearfix">
              {settings?.socialTwitter && (
                <li><Link href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" aria-label="X"><span className="fab fa-x-twitter" /></Link></li>
              )}
              {settings?.socialFacebook && (
                <li><Link href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><span className="fab fa-facebook-square" /></Link></li>
              )}
              {settings?.socialPinterest && (
                <li><Link href={settings.socialPinterest} target="_blank" rel="noopener noreferrer" aria-label="Pinterest"><span className="fab fa-pinterest-p" /></Link></li>
              )}
              {settings?.socialInstagram && (
                <li><Link href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><span className="fab fa-instagram" /></Link></li>
              )}
              {settings?.socialYoutube && (
                <li><Link href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><span className="fab fa-youtube" /></Link></li>
              )}
              {settings?.socialLinkedin && (
                <li><Link href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><span className="fab fa-linkedin-in" /></Link></li>
              )}
              {settings?.whatsappUrl && (
                <li><Link href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><span className="fab fa-whatsapp" /></Link></li>
              )}
            </ul>
          </div>

        </nav>
      </div>

      <div
        className="nav-overlay"
        style={{ display: isSidebar ? "block" : "none" }}
        onClick={handleSidebar}
      />
    </>
  );
}
