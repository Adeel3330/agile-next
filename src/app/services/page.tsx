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
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
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
  const subCategorySlug = searchParams.get('sub-category') || searchParams.get('subcategory');
  const hasCategoryParam = Boolean(categorySlug) || Boolean(subCategorySlug);

  const [mounted, setMounted] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchPageData = useCallback(async () => {
    try {
      const template = categorySlug?.trim() || 'services';
      setPageData(null);
      const response = await fetch(`/api/pages?template=${encodeURIComponent(template)}`, {
        cache: 'no-store'
      });
      const data = await response.json();
      setPageData(data.success && data.page ? data.page : null);
    } catch (err) {
      console.error('Failed to fetch services page data:', err);
      setPageData(null);
    }
  }, [categorySlug]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      let apiUrl = '/api/services?limit=100';
      if (subCategorySlug) {
        if (categorySlug) {
          apiUrl += `&category=${encodeURIComponent(categorySlug)}`;
        }
        apiUrl += `&subCategory=${encodeURIComponent(subCategorySlug)}`;
      } else if (categorySlug) {
        apiUrl += `&category=${encodeURIComponent(categorySlug)}`;
      }

      const response = await fetch(apiUrl,{
        cache: 'no-store'
      });
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
  }, [categorySlug, subCategorySlug]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchPageData();
      fetchServices();
      fetchCategories();
    }
  }, [mounted, fetchPageData, fetchServices, fetchCategories, categorySlug, subCategorySlug]);

  const serviceRoot = categories.find((category) => category.slug === 'service-categories');
  const serviceCategories = serviceRoot
    ? categories.filter((category) => category.parentId === serviceRoot.id)
    : [];

  const selectedCategory = categorySlug
    ? categories.find((category) => category.slug === categorySlug)
    : null;

  const selectedSubCategory = subCategorySlug
    ? categories.find(
        (category) =>
          category.slug === subCategorySlug &&
          (!selectedCategory || String(category.parentId) === String(selectedCategory.id))
      ) || categories.find((category) => category.slug === subCategorySlug)
    : null;

  const serviceSectionDescription = selectedSubCategory?.description || selectedCategory?.description || '';

  const getDescendantIds = (parentId: string) => {
    const ids = new Set<string>([parentId]);
    const queue = [parentId];

    while (queue.length > 0) {
      const currentId = queue.shift() as string;
      const children = categories.filter((category) => category.parentId === currentId);

      for (const child of children) {
        if (!ids.has(child.id)) {
          ids.add(child.id);
          queue.push(child.id);
        }
      }
    }

    return ids;
  };

  const groupedServices = (() => {
    if (services.length === 0) return [] as Array<{ id: string; title: string; slug: string; services: Service[] }>;

    if (!selectedCategory) {
      return serviceCategories
        .map((category) => {
          const ids = getDescendantIds(category.id);
          const items = services.filter((service) => service.categoryId && ids.has(service.categoryId));

          return {
            id: category.id,
            title: category.name,
            slug: category.slug,
            services: items
          };
        })
        .filter((group) => group.services.length > 0);
    }

    const directSubcategories = categories.filter((category) => category.parentId === selectedCategory.id);

    if (directSubcategories.length > 0) {
      return directSubcategories
        .map((subcategory) => {
          const ids = getDescendantIds(subcategory.id);
          const items = services.filter((service) => service.categoryId && ids.has(service.categoryId));

          return {
            id: subcategory.id,
            title: subcategory.name,
            slug: subcategory.slug,
            services: items
          };
        })
        .filter((group) => group.services.length > 0);
    }

    return [
      {
        id: selectedCategory.id,
        title: selectedCategory.name,
        slug: selectedCategory.slug,
        services
      }
    ];
  })();

  const breadcrumbTitle = (() => {
    const formatSlug = (slug: string) => {
      return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    if (subCategorySlug) {
      const catName = selectedSubCategory?.name || formatSlug(subCategorySlug);
      // const subCatName = selectedSubCat?.name || formatSlug(subCategorySlug);
      return `${catName}`;
    }

    if (categorySlug) {
      return selectedCategory?.name || formatSlug(categorySlug);
    }

    return "Our Services";
  })();

  if (!mounted) {
    return null;
  }

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={breadcrumbTitle}>
        <section className="service-page-section p_relative pt_100 pb_70 services-safe-grid">
          <div className="auto-container">
            <div className="sec-title centred mb_55">
              <span className="sub-title mb_5">Our Services</span>
              <h2>{pageData?.title || 'Medical Billing Services for All Healthcare Organizations'}</h2>

              <div
                dangerouslySetInnerHTML={{ __html: pageData?.content || 'We begin with a focused introduction and service strategy, then deliver the same high-impact service capabilities across new providers, established groups, and facilities.' }}
              />
            </div>



            {/* <div className="sec-title mb_30">
              <span className="sub-title mb_5">Core Offerings</span>
              <h3>Unified Service Stack for All Segments</h3>
            </div>
            <ul className="list-style-one clearfix mb_60">
              {coreOfferings.map((offering) => (
                <li key={offering}>{offering}</li>
              ))}
            </ul> */}

            <div className="sec-title mb_40">
              {/* <span className="sub-title mb_5">Detailed Service Modules</span> */}
              <h3>
                Services
              </h3>
              {serviceSectionDescription && (
                <div
                  className="services-section-description"
                  dangerouslySetInnerHTML={{ __html: serviceSectionDescription }}
                />
              )}
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
            ) : subCategorySlug ? (
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

                            <div
                              dangerouslySetInnerHTML={{
                                __html: service.description
                                  ? service.description.length > 120
                                    ? `${service.description.slice(0, 300)}...`
                                    : service.description
                                  : 'Professional service module with detailed backend-managed content.'
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : categorySlug ? (
              groupedServices.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No services found for this category.</p>
                </div>
              ) : (
                <>
                  {groupedServices.map((group) => (
                    <div key={group.id} className="mb_55">
                      <div className="sec-title mb_25">
                        <h3>{group.title}</h3>
                      </div>

                      {group.services.length === 0 ? (
                        <p className="text-muted">No services found.</p>
                      ) : (
                        <div className="row clearfix">
                          {group.services.map((service) => (
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
                                     
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: service.description
                                            ? service.description.length > 120
                                              ? `${service.description.slice(0, 300)}...`
                                              : service.description
                                            : 'Professional service module with detailed backend-managed content.'
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )
            ) : groupedServices.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No services found for this category.</p>
              </div>
            ) : (
              <>
                <div className='row sec-card-bg clearfix p-5'>
                {groupedServices.map((group) => (
                  <div key={group.id} className="col-md-4 col-sm-12">
                    <div className="sec-card sec-title mb_25">
                      {/* <h3>{group.title}</h3> */}
                      <Link href={`/services?category=${group?.slug}`} className="view-all-link">
                        {group.title}
                      </Link>
                    </div>

                    
                  </div>
                ))}
                </div>
              </>
            )}
          </div>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .services-safe-grid .service-block-one .inner-box {
                  padding-bottom: 0;
                  border-radius: 14px;
                  overflow: hidden;
                  background: #fff;
                  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
                }
                .services-safe-grid .service-block-one .inner-box .image-box,
                .services-safe-grid .service-block-one .inner-box .image-box img {
                  border-radius: 0;
                }
                .services-safe-grid .service-block-one .inner-box:hover .image-box img {
                  transform: none !important;
                }
                .services-safe-grid .service-block-one .inner-box .lower-content {
                  position: static;
                  width: 100%;
                  height: auto;
                  border: 0;
                  border-radius: 0;
                  box-shadow: none;
                  background: #fff;
                  padding: 20px 18px;
                  display: block;
                  text-align: left;
                }
                .services-safe-grid .service-block-one .inner-box .lower-content:before {
                  display: none;
                }
                .services-safe-grid .service-block-one .inner-box:hover .lower-content,
                .services-safe-grid .service-block-one .inner-box:hover .lower-content h3 a,
                .services-safe-grid .service-block-one .inner-box:hover .lower-content p {
                  color: inherit;
                  border-color: transparent;
                }
                  .sec-card-bg{
                    background: #0a3366;
                    // opacity: 0.5;
                    border-radius: 12px;
                    margin-bottom: 40px;
                  }
                .sec-card{
                  padding: 20px;
                  border-radius: 12px;
                  background: #fff;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                  transition: all 0.3s ease;
                }
                .sec-card:hover {
                  transform: translateY(-4px);
                  box-shadow: 0 8px 28px rgba(0,0,0,0.1);
                }
                  .sec-card a{
                    font-size: 18px;
                    font-weight: 600;
                    color: #140c0c;
                    text-decoration: none;
                  }
                  .sec-card a:hover{
                    color: #0070f3;  
                  }
                  .services-section-description {
                    margin-top: 10px;
                  }
              `,
            }}
          />
        </section>
        <Cta />
      </Layout>
    </div>
  );
}
