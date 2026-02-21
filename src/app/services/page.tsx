'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../../components/layout/Layout';
import Cta from '../../../components/sections/home2/Cta';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}

interface PageData {
  id: string;
  title: string;
  content?: string;
}

const coreOfferings = [
  'Revenue Cycle Management',
  'Old AR Recovery and Denial Management',
  'Credentialing and Enrollment with Payers',
  'IPA Contracting',
  'Virtual Assistance',
  'Business Development'
];

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');

  const [mounted, setMounted] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPageData = useCallback(async () => {
    try {
      const response = await fetch('/api/pages?template=services');
      const data = await response.json();
      if (data.success && data.page) {
        setPageData(data.page);
      }
    } catch (err) {
      console.error('Failed to fetch services page data:', err);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      let apiUrl = '/api/services?limit=100';
      if (categorySlug) {
        apiUrl += `&category=${encodeURIComponent(categorySlug)}`;
      }

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success && data.services) {
        setServices(data.services);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    if (mounted) {
      fetchPageData();
      fetchServices();
    }
  }, [mounted, fetchPageData, fetchServices]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Our Services">
        <section className="service-page-section p_relative pt_100 pb_70">
          <div className="auto-container">
            <div className="sec-title centred mb_55">
              <span className="sub-title mb_5">Our Services</span>
              <h2>{pageData?.title || 'Medical Billing Services for All Healthcare Organizations'}</h2>
             
                 <div
                            dangerouslySetInnerHTML={{ __html: pageData?.content || 'We begin with a focused introduction and service strategy, then deliver the same high-impact service capabilities across new providers, established groups, and facilities.' }}
                          />
            </div>

          

            <div className="sec-title mb_30">
              <span className="sub-title mb_5">Core Offerings</span>
              <h3>Unified Service Stack for All Segments</h3>
            </div>
            <ul className="list-style-one clearfix mb_60">
              {coreOfferings.map((offering) => (
                <li key={offering}>{offering}</li>
              ))}
            </ul>

            <div className="sec-title mb_40">
              <span className="sub-title mb_5">Detailed Service Modules</span>
              <h3>Explore Service Details</h3>
            </div>

            {loading ? (
              <div className="row clearfix">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`service-skeleton-${index}`} className="col-lg-4 col-md-6 col-sm-12 service-block">
                    <div className="service-block-one">
                      <div className="inner-box">
                        <div style={{ width: '100%', height: 300, background: '#e0e0e0', borderRadius: 8 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No services available at the moment.</p>
              </div>
            ) : (
              <div className="row clearfix">
                {services.map((service) => (
                  <div key={service.id} className="col-lg-4 col-md-6 col-sm-12 service-block">
                    <div className="service-block-one">
                      <div className="inner-box">
                        <figure className="image-box">
                          <Link href={`/services/${service.slug}`}>
                            {service.imageUrl ? (
                              <Image
                                src={getCloudinaryImageUrl(service.imageUrl)}
                                alt={service.title}
                                width={416}
                                height={358}
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <Image
                                src="/assets/images/service/service-1.jpg"
                                alt={service.title}
                                width={416}
                                height={358}
                              />
                            )}
                          </Link>
                        </figure>
                        <div className="lower-content">
                          <div className="inner">
                            <h3>
                              <Link href={`/services/${service.slug}`}>{service.title}</Link>
                            </h3>
                            <p>
                              {service.description
                                ? service.description.length > 120
                                  ? `${service.description.slice(0, 120)}...`
                                  : service.description
                                : 'Professional service module with detailed backend-managed content.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <Cta />
      </Layout>
    </div>
  );
}
