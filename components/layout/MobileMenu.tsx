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

export default function MobileMenu({ isSidebar, handleMobileMenu, handleSidebar }: MobileMenuProps) {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
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
    fetch('/api/categories/service-categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.categories) setCategories(data.categories);
      })
      .catch(() => {});
    fetch('/api/services?limit=100')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.services) setServices(data.services);
      })
      .catch(() => {});
  }, []);

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
            <Link href="/"><Image src="/assets/images/logo-2.png" alt="Logo Image" width={203} height={40} priority /></Link>
          </div>
          <div className="menu-outer">
            <ul className="navigation clearfix">

              <li>
                <Link href="/" onClick={handleMobileMenu}>Home</Link>
              </li>

              <li>
                <Link href="/about" onClick={handleMobileMenu}>About Us</Link>
              </li>

              {/* Services - same structure as Header1 */}
              <li className={openKeys.has("services") ? "current" : ""}>
                <Link href="/services" onClick={handleMobileMenu}>Services</Link>
                {(categories.length > 0 || hasOtherServices) && (
                  <>
                    <ul style={{ display: openKeys.has("services") ? "block" : "none" }}>
                      {categories.map((category) => {
                        const categoryServices = services.filter(
                          s => s.categoryId === category.id || s.category?.id === category.id
                        );
                        const catKey = `cat-${category.id}`;
                        const isCatOpen = openKeys.has(catKey);
                        return (
                          <li key={category.id} className={categoryServices.length > 0 ? (isCatOpen ? "current" : "") : ""}>
                            {categoryServices.length > 0 ? (
                              <>
                                <Link href={`/services?category=${category.slug}`} onClick={handleMobileMenu}>{category.name}</Link>
                                <ul className="submenu" style={{ display: isCatOpen ? "block" : "none" }}>
                                  {categoryServices.map((service) => (
                                    <li key={service.id}>
                                      <Link href={`/services/${service.slug}`} onClick={handleMobileMenu}>{service.title}</Link>
                                    </li>
                                  ))}
                                </ul>
                                <div className={`dropdown-btn ${isCatOpen ? "open" : ""}`} onClick={() => toggle(catKey)}>
                                  <span className="fa fa-angle-right" />
                                </div>
                              </>
                            ) : (
                              <Link href={`/services?category=${category.slug}`} onClick={handleMobileMenu}>{category.name}</Link>
                            )}
                          </li>
                        );
                      })}
                      {hasOtherServices && (
                        <li className={openKeys.has("other-services") ? "current" : ""}>
                          <Link href="/services" onClick={handleMobileMenu}>Other Services</Link>
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
                          <div className={`dropdown-btn ${openKeys.has("other-services") ? "open" : ""}`} onClick={() => toggle("other-services")}>
                            <span className="fa fa-angle-right" />
                          </div>
                        </li>
                      )}
                    </ul>
                    <div className={`dropdown-btn ${openKeys.has("services") ? "open" : ""}`} onClick={() => toggle("services")}>
                      <span className="fa fa-angle-right" />
                    </div>
                  </>
                )}
              </li>

              {/* Resources - same as Header1 */}
              <li className={openKeys.has("resources") ? "current" : ""}>
                <Link href="/resources" onClick={handleMobileMenu}>Resources</Link>
                <ul style={{ display: openKeys.has("resources") ? "block" : "none" }}>
                  <li><Link href="/compliance" onClick={handleMobileMenu}>Compliance</Link></li>
                  <li><Link href="/software" onClick={handleMobileMenu}>Software</Link></li>
                  <li><Link href="/blog" onClick={handleMobileMenu}>Blog</Link></li>
                </ul>
                <div className={`dropdown-btn ${openKeys.has("resources") ? "open" : ""}`} onClick={() => toggle("resources")}>
                  <span className="fa fa-angle-right" />
                </div>
              </li>

              <li>
                <Link href="/careers" onClick={handleMobileMenu}>Careers</Link>
              </li>

              <li>
                <Link href="/contact" onClick={handleMobileMenu}>Contact</Link>
              </li>

            </ul>
          </div>

          <div className="contact-info">
            <h4>Contact Info</h4>
            <ul>
              <li>Chicago 12, Melborne City, USA</li>
              <li><Link href="tel:+8801682648101">+88 01682648101</Link></li>
              <li><Link href="mailto:info@example.com">info@example.com</Link></li>
            </ul>
          </div>

          <div className="social-links">
            <ul className="clearfix">
              <li><Link href="/#"><span className="fab fa-twitter" /></Link></li>
              <li><Link href="/#"><span className="fab fa-facebook-square" /></Link></li>
              <li><Link href="/#"><span className="fab fa-pinterest-p" /></Link></li>
              <li><Link href="/#"><span className="fab fa-instagram" /></Link></li>
              <li><Link href="/#"><span className="fab fa-youtube" /></Link></li>
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
