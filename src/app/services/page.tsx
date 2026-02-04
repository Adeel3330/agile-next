'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../../components/layout/Layout';
import Video from '../../../components/sections/home3/Video';
import Cta from '../../../components/sections/home2/Cta';
import ModalVideo from '../../../components/elements/VideoPopup';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface Service {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  imageUrl?: string;
  icon?: string;
}

interface PageData {
  id: string;
  title: string;
  slug: string;
  content?: string;
  sections?: any[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoImage?: string;
  template?: string;
}

interface TabSection {
  id: number;
  title: string;
  videoImg?: string;
  heading?: string;
  text?: string;
  list?: string[];
}

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  const [mounted, setMounted] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [tabs, setTabs] = useState<TabSection[]>([]);
  const [tabContent, setTabContent] = useState<TabSection[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchServices();
      fetchPageData();
    }
  }, [mounted, categorySlug]);

  const fetchPageData = useCallback(async () => {
    setPageLoading(true);
    try {
      const response = await fetch('/api/pages?template=services');
      const data = await response.json();

      if (data.success && data.page) {
        setPageData(data.page);
        
        // Parse sections - handle both string and array formats
        let sections: any[] = [];
        if (data.page.sections) {
          if (typeof data.page.sections === 'string') {
            try {
              sections = JSON.parse(data.page.sections);
            } catch (e) {
              console.error('Failed to parse sections JSON:', e);
              sections = [];
            }
          } else if (Array.isArray(data.page.sections)) {
            sections = data.page.sections;
          }
        }
        
        const tabsData: TabSection[] = [];
        const contentData: TabSection[] = [];
        
        // Process sections to extract tabs and content
        sections.forEach((section: any, index: number) => {
          // Handle tabs or chooseus type
          if (section.type === 'tabs' || section.type === 'chooseus') {
            if (section.tabs && Array.isArray(section.tabs)) {
              section.tabs.forEach((tab: any, tabIndex: number) => {
                tabsData.push({
                  id: tabIndex + 1,
                  title: tab.title || tab.heading || `Tab ${tabIndex + 1}`
                });
                
                contentData.push({
                  id: tabIndex + 1,
                  title: tab.title || tab.heading || `Tab ${tabIndex + 1}`,
                  videoImg: tab.videoImg || tab.image || '/assets/images/resource/video-1.jpg',
                  heading: tab.heading || tab.title,
                  text: tab.text || tab.description || tab.content,
                  list: tab.list || tab.items || []
                });
              });
            }
          }
          // Handle features type - convert features items to tabs (limit to first 3)
          else if (section.type === 'features' && section.items && Array.isArray(section.items)) {
            section.items.slice(0, 3).forEach((item: any, itemIndex: number) => {
              tabsData.push({
                id: itemIndex + 1,
                title: item.title || `Feature ${itemIndex + 1}`
              });
              
              contentData.push({
                id: itemIndex + 1,
                title: item.title || `Feature ${itemIndex + 1}`,
                videoImg: item.image || item.videoImg || '/assets/images/resource/video-1.jpg',
                heading: item.title,
                text: item.description || item.text || item.content,
                list: item.list || item.items || []
              });
            });
          }
          // Handle content array - multiple content items as tabs
          else if (section.type === 'content' && Array.isArray(section.content)) {
            section.content.forEach((contentItem: any, contentIndex: number) => {
              tabsData.push({
                id: contentIndex + 1,
                title: contentItem.title || contentItem.heading || `Content ${contentIndex + 1}`
              });
              
              contentData.push({
                id: contentIndex + 1,
                title: contentItem.title || contentItem.heading || `Content ${contentIndex + 1}`,
                videoImg: contentItem.videoImg || contentItem.image || '/assets/images/resource/video-1.jpg',
                heading: contentItem.heading || contentItem.title,
                text: contentItem.text || contentItem.description || contentItem.content,
                list: contentItem.list || contentItem.items || []
              });
            });
          }
          // Handle direct array of content items (if section is an array of content)
          else if (Array.isArray(section) && section.length > 0 && typeof section[0] === 'object' && section[0].title) {
            section.forEach((contentItem: any, contentIndex: number) => {
              tabsData.push({
                id: contentIndex + 1,
                title: contentItem.title || contentItem.heading || `Content ${contentIndex + 1}`
              });
              
              contentData.push({
                id: contentIndex + 1,
                title: contentItem.title || contentItem.heading || `Content ${contentIndex + 1}`,
                videoImg: contentItem.videoImg || contentItem.image || '/assets/images/resource/video-1.jpg',
                heading: contentItem.heading || contentItem.title,
                text: contentItem.text || contentItem.description || contentItem.content,
                list: contentItem.list || contentItem.items || []
              });
            });
          }
        });
        
        if (tabsData.length > 0) {
          setTabs(tabsData);
          setTabContent(contentData);
          setActiveTab(1);
        }
      }
    } catch (err) {
      console.error('Failed to fetch page data:', err);
    } finally {
      setPageLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      // Build API URL with category filter if present
      let apiUrl = '/api/services?limit=50';
      if (categorySlug) {
        apiUrl += `&category=${encodeURIComponent(categorySlug)}`;
      }
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success && data.services) {
        setServices(data.services);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Our Services">
        <section className="service-page-section p_relative">
          <div className="auto-container">
            {loading ? (
              <div className="row clearfix">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="col-lg-4 col-md-6 col-sm-12 service-block">
                    <div className="service-block-one">
                      <div className="inner-box">
                        <figure className="image-box">
                          <div style={{ 
                            width: '100%', 
                            height: '358px', 
                            background: '#e0e0e0', 
                            borderRadius: '8px',
                            animation: 'pulse 1.5s ease-in-out infinite'
                          }}></div>
                        </figure>
                        <div className="lower-content">
                          <div className="inner">
                            <div className="icon-box skeleton" style={{ width: '60px', height: '60px', borderRadius: '50%' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '80%', height: '24px', marginBottom: '10px' }}></div>
                            <div className="skeleton skeleton-text" style={{ width: '100%', height: '16px' }}></div>
                          </div>
                        </div>
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
                                priority 
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <Image 
                                src="/assets/images/service/service-1.jpg" 
                                alt={service.title} 
                                width={416} 
                                height={358} 
                                priority 
                              />
                            )}
                          </Link>
                        </figure>
                        <div className="lower-content">
                          <div className="inner">
                            {/* {service.icon && (
                              <div className="icon-box">
                                <i className={service.icon}></i>
                              </div>
                            )} */}
                            <h3>
                              <Link href={`/services/${service.slug}`}>{service.title}</Link>
                            </h3>
                            <p>{service.description ? (service.description.length > 100 ? service.description.substring(0, 100) + '...' : service.description) : 'Professional service for your needs.'}</p>
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
        {/* <Video /> */}

        {pageLoading ? (
          <section className="chooseus-section service-page sec-pad p_relative">
            <div className="auto-container">
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </section>
        ) : pageData && tabs.length > 0 ? (
          <section className="chooseus-section service-page sec-pad p_relative">
            <div className="auto-container">
              <div className="sec-title centred mb_55">
                <span className="sub-title mb_5">Why Choose Us</span>
                <h2>{pageData.title || 'What\'s Our Speciality'}</h2>
                {pageData.content && (
                  <p dangerouslySetInnerHTML={{ __html: pageData.content }}></p>
                )}
              </div>

              
            </div>
          </section>
        ) : null}

       
        <Cta />
      </Layout>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skeleton {
          display: inline-block;
          background: #e0e0e0;
          border-radius: 4px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .skeleton-text { margin-bottom: 8px; }
      `}} />
    </div>
  );
}
