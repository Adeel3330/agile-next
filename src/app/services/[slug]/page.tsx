'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../../../components/layout/Layout';
import Cta from '../../../../components/sections/home2/Cta';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  imageUrl?: string;
  icon?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoImage?: string;
}

interface ServiceListItem {
  id: string;
  title: string;
  slug: string;
}

export default function ServiceDetailsPage() {
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : (params?.slug as string | undefined);
  
  const [mounted, setMounted] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchService = useCallback(async () => {
    if (!slug) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/services/${slug}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Service not found');
        setLoading(false);
        return;
      }

      setService(data.service);

      // Update SEO metadata
      if (data.service && typeof window !== 'undefined') {
        const title = data.service.seoTitle || data.service.title || 'Service';
        const description = data.service.seoDescription || data.service.description || '';
        const keywords = data.service.seoKeywords || '';
        const image = data.service.seoImage || data.service.imageUrl || '';

        document.title = title;

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

        updateMetaTag('description', description);
        if (keywords) updateMetaTag('keywords', keywords);
        updateMetaTag('og:title', title, 'property');
        updateMetaTag('og:description', description, 'property');
        if (image) updateMetaTag('og:image', image, 'property');
        updateMetaTag('og:url', window.location.href, 'property');
        updateMetaTag('og:type', 'website', 'property');
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        if (image) updateMetaTag('twitter:image', image);
      }
    } catch (err) {
      console.error('Failed to fetch service:', err);
      setError('Failed to load service');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('/api/services?limit=20');
      const data = await response.json();

      if (data.success && data.services) {
        setServices(data.services.map((s: Service) => ({
          id: s.id,
          title: s.title,
          slug: s.slug
        })));
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && slug) {
      fetchService();
      fetchServices();
    }
  }, [mounted, slug, fetchService, fetchServices]);

  if (!mounted || !slug) {
    return null;
  }

  if (loading) {
    return (
      <div className="boxed_wrapper">
        <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Loading...">
          <section className="service-details pt_120 pb_110">
            <div className="auto-container">
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading service...</p>
              </div>
            </div>
          </section>
        </Layout>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="boxed_wrapper">
        <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Service Not Found">
          <section className="service-details pt_120 pb_110">
            <div className="auto-container">
              <div className="text-center py-5">
                <h2>Service Not Found</h2>
                <p className="text-muted">{error || 'The service you are looking for does not exist.'}</p>
                <Link href="/services" className="theme-btn btn-two mt-3">
                  <span>Back to Services</span>
                </Link>
              </div>
            </div>
          </section>
        </Layout>
      </div>
    );
  }

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={service.title}>
        <section className="service-details pt_120 pb_110">
          <div className="auto-container">
            <div className="row clearfix">
              <div className="col-lg-4 col-md-12 col-sm-12 sidebar-side">
                <div className="service-sidebar">
                  <div className="sidebar-widget category-widget mb_40">
                    <div className="shape" style={{ backgroundImage: 'url(assets/images/shape/shape-41.png)' }}></div>
                    <div className="widget-title">
                      <h2>Services</h2>
                    </div>
                    <div className="widget-content">
                      <ul className="category-list clearfix">
                        {services.map((s) => (
                          <li key={s.id}>
                            <Link 
                              href={`/services/${s.slug}`} 
                              className={s.slug === service.slug ? 'current' : ''}
                            >
                              {s.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="sidebar-widget appointment-widget mb_40">
                    <div className="widget-title">
                      <h2>Appointment</h2>
                    </div>
                    <div className="form-inner">
                      <form method="post" action="/contact" className="default-form">
                        <div className="form-group">
                          <div className="icon"><i className="icon-45"></i></div>
                          <input type="text" name="name" placeholder="Name" required />
                        </div>
                        <div className="form-group">
                          <div className="icon"><i className="icon-46"></i></div>
                          <input type="email" name="email" placeholder="Email" required />
                        </div>
                        <div className="form-group">
                          <div className="icon"><Image src="/assets/images/icons/icon-15.svg" alt="Image" width={15} height={15} priority /></div>
                          <div className="select-box">
                            <select className="selectmenu" name="service" defaultValue={service.title}>
                              <option>I&apos;m interested in *</option>
                              {services.map((s) => (
                                <option key={s.id} value={s.title}>
                                  {s.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="form-group">
                          <div className="icon"><i className="icon-48"></i></div>
                          <textarea name="message" placeholder="Message"></textarea>
                        </div>
                        <div className="form-group message-btn">
                          <button type="submit" className="theme-btn btn-two"><span>Send your message</span></button>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="sidebar-widget schedule-widget">
                    <div className="widget-title">
                      <h2>Working Hours</h2>
                    </div>
                    <div className="widget-content">
                      <ul className="schedule-list clearfix">
                        <li>Sunday<span>02 pm to 06 pm</span></li>
                        <li>Monday<span>03 pm to 07 pm</span></li>
                        <li>Tuesday<span>02 pm to 06 pm</span></li>
                        <li>Wednesday<span>02 pm to 06 pm</span></li>
                        <li>Thursday<span>04 pm to 06 pm</span></li>
                        <li>Friday<span>03 pm to 08 pm</span></li>
                        <li>Saturday<span>Closed</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                <div className="service-details-content">
                  <div className="content-one mb_40">
                    {service.imageUrl && (
                      <figure className="image-box mb_60">
                        <Image 
                          src={getCloudinaryImageUrl(service.imageUrl)} 
                          alt={service.title} 
                          width={856} 
                          height={525} 
                          priority 
                          style={{ objectFit: 'cover' }}
                        />
                      </figure>
                    )}
                    <div className="text-box">
                      <h2>{service.title || 'Service'}</h2>
                      {service.description && (
                        <p>{service.description}</p>
                      )}
                      {service.content && (
                        <div 
                          dangerouslySetInnerHTML={{ __html: service.content || '' }} 
                          style={{ lineHeight: '1.8' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Cta />
      </Layout>
    </div>
  );
}
