'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Layout from '../../../components/layout/Layout';
import Team from '../../../components/sections/home1/Team';
import Cta from '../../../components/sections/home2/Cta';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface MediaItem {
  id: string;
  fileUrl: string;
  title?: string;
  altText?: string;
}

interface PageData {
  id: string;
  title: string;
  content?: string;
  description?: string;
  sections?: any[] | string;
}

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [aboutMedia, setAboutMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [pageRes, mediaRes] = await Promise.all([
          fetch('/api/pages?template=about-us'),
          fetch('/api/media?position=about')
        ]);

        const pagePayload = await pageRes.json();
        const mediaPayload = await mediaRes.json();

        if (pagePayload.success && pagePayload.page) {
          setPageData(pagePayload.page);
        }

        if (mediaPayload.success && Array.isArray(mediaPayload.media) && mediaPayload.media.length > 0) {
          setAboutMedia(mediaPayload.media);
        }
      } catch (err) {
        console.error('Failed to fetch about page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  const parsedSections = useMemo(() => {
    if (!pageData?.sections) return [] as any[];
    if (Array.isArray(pageData.sections)) return pageData.sections;
    if (typeof pageData.sections === 'string') {
      try {
        const parsed = JSON.parse(pageData.sections);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [] as any[];
  }, [pageData?.sections]);

  const sectionText = (keyword: string, fallback: string) => {
    const section = parsedSections.find((entry: any) => {
      const title = (entry?.title || entry?.heading || '').toLowerCase();
      return title.includes(keyword.toLowerCase());
    });

    return (
      section?.text ||
      section?.description ||
      section?.content ||
      fallback
    );
  };

  const overviewText =
    pageData?.description ||
    'Agile Nexus Solutions delivers secure, cost-effective medical billing, coding, and revenue cycle management solutions that help healthcare providers optimize reimbursements and streamline operations.';

  const whoWeAreText = sectionText(
    'who we are',
    'We are a trusted partner for healthcare organizations, combining experienced teams and smart workflows to reduce complexity, improve collections, and support long-term financial growth.'
  );

  const missionText = sectionText(
    'mission',
    'Our mission is to improve the financial and operational health of medical practices through accurate, compliant, and transparent revenue cycle services that allow providers to focus on patient care.'
  );

  const supportText = sectionText(
    'support',
    'Healthcare runs around the clock. Our team is available to support urgent billing and operational needs so your revenue workflows stay uninterrupted.'
  );

  const supportHighlights = [
    'Healthcare is continuous and your billing support should be too.',
    'Real-time assistance across time zones and provider locations.',
    'Fast response for urgent denials, eligibility, and claim issues.',
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={pageData?.title || 'About Us'}>
        <section className="about-section about-page p_relative pt_120 pb_90" style={{ background: '#f8fbff' }}>
          <div className="auto-container">
            <div className="sec-title centred mb_60">
              <span className="sub-title mb_5">Company Overview</span>
              <h2>{pageData?.title || 'About Agile Nexus Solutions'}</h2>
              <p style={{ maxWidth: '860px', margin: '14px auto 0' }}>{overviewText}</p>
            </div>

            <div className="row clearfix align-items-center mb_70">
              <div className="col-lg-6 col-md-12 col-sm-12 image-column mb_30">
                <figure className="about-feature-image">
                  <Image
                    src={getCloudinaryImageUrl(aboutMedia[0]?.fileUrl || '/assets/images/resource/about-1.jpg')}
                    alt={aboutMedia[0]?.altText || aboutMedia[0]?.title || 'Who we are'}
                    width={640}
                    height={460}
                    style={{ objectFit: 'cover', borderRadius: '16px' }}
                    priority
                  />
                </figure>
              </div>

              <div className="col-lg-6 col-md-12 col-sm-12 content-column mb_30">
                <div className="about-card">
                  <h3>Who We Are</h3>
                  <p>{whoWeAreText}</p>

                  {loading ? (
                    <p>Loading details...</p>
                  ) : pageData?.content ? (
                    <div className="about-content-html" dangerouslySetInnerHTML={{ __html: pageData.content }} />
                  ) : null}
                </div>
              </div>
            </div>

            <div className="row clearfix mb_30">
              <div className="col-lg-6 col-md-12 col-sm-12 mb_30">
                <div className="about-card h-100">
                  <h3>Our Mission</h3>
                  <p>{missionText}</p>
                </div>
              </div>

              <div className="col-lg-6 col-md-12 col-sm-12 mb_30">
                <div className="about-card h-100">
                  <h3>24/7 Support: Anytime, Anywhere Services</h3>
                  <p>{supportText}</p>
                  <ul className="list-style-one clearfix mt_20">
                    {supportHighlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="row clearfix">
              <div className="col-lg-12 col-md-12 col-sm-12">
                <figure className="about-feature-image">
                  <Image
                    src={getCloudinaryImageUrl(aboutMedia[1]?.fileUrl || aboutMedia[0]?.fileUrl || '/assets/images/resource/about-1.jpg')}
                    alt={aboutMedia[1]?.altText || aboutMedia[1]?.title || 'About operations'}
                    width={1280}
                    height={420}
                    style={{ objectFit: 'cover', borderRadius: '16px', width: '100%', height: '420px' }}
                  />
                </figure>
              </div>
            </div>
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
                .about-card {
                  background: #fff;
                  border-radius: 16px;
                  padding: 30px;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                }
                .about-card h3 {
                  margin-bottom: 14px;
                }
                .about-card p {
                  color: #555;
                  line-height: 1.8;
                  margin-bottom: 0;
                }
                .about-content-html {
                  margin-top: 16px;
                  color: #555;
                }
                .about-feature-image {
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
                }
              `,
            }}
          />
        </section>

        <section className="team-section p_relative pt_30 pb_80" id="meet-our-team">
          <div className="auto-container">
            <div className="sec-title centred mb_50">
              <span className="sub-title mb_5">Meet Our Team</span>
              <h2>Our Leadership and Operations Team</h2>
            </div>
          </div>
          <Team />
        </section>

        <Cta />
      </Layout>
    </div>
  );
}
