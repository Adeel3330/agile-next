'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../../components/layout/Layout';
import Cta from '../../../components/sections/home2/Cta';
import WhyAgileSolutionsCards from '../../../components/sections/home1/WhyAgileSolutionsCards';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';
import { TEXT_ONLY_MEDIA_PLACEHOLDER_URL } from '@/lib/media-positions';

interface MediaItem {
  id: string;
  fileUrl: string;
  title?: string;
  altText?: string;
  description?: string;
  displayOrder?: number;
}

const SECTION_HEADINGS: Record<string, string> = {
  'who-we-are': 'Who We Are',
  'best-in-industry': 'Best In Industry',
  wecare: 'WeCare',
  mission: 'Our Mission',
  support: '24/7 Support: Anytime, Anywhere Services',
};

function getSectionKey(title?: string) {
  return (title || '').toLowerCase().trim();
}

function sectionHeading(title?: string) {
  const key = getSectionKey(title);
  return SECTION_HEADINGS[key] || title || '';
}

function isDisplayableImage(url?: string) {
  const trimmed = url?.trim();
  if (!trimmed || trimmed === TEXT_ONLY_MEDIA_PLACEHOLDER_URL) return false;
  return true;
}

function extractFirstParagraph(html?: string): string | null {
  if (!html?.trim()) return null;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const firstP = doc.querySelector('p');
  return firstP?.textContent?.trim() || null;
}

interface PageData {
  id: string;
  title: string;
  content?: string;
  description?: string;
  sections?: any[] | string;
}

interface TeamMember {
  id: string;
  name: string;
  title: string;
  photoUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

export default function AboutPage() {
  const searchParams = useSearchParams();
  const viewMode = searchParams.get('view');
  const showTeamOnly = viewMode === 'team';

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [aboutMedia, setAboutMedia] = useState<MediaItem[]>([]);
  const [aboutSections, setAboutSections] = useState<MediaItem[]>([]);
  const [teamMedia, setTeamMedia] = useState<MediaItem[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [pageRes, mediaRes, sectionsRes, teamMediaRes] = await Promise.all([
          fetch('/api/pages?template=about-us'),
          fetch('/api/media?position=about'),
          fetch('/api/media?position=about-us-sections'),
          fetch('/api/media?position=team')
        ]);

        const pagePayload = await pageRes.json();
        const mediaPayload = await mediaRes.json();
        const sectionsPayload = await sectionsRes.json();
        const teamMediaPayload = await teamMediaRes.json();

        if (pagePayload.success && pagePayload.page) {
          setPageData(pagePayload.page);
        }

        if (mediaPayload.success && Array.isArray(mediaPayload.media) && mediaPayload.media.length > 0) {
          setAboutMedia(mediaPayload.media);
        }

        if (sectionsPayload.success && Array.isArray(sectionsPayload.media)) {
          const sortedSections = [...sectionsPayload.media].sort(
            (a: MediaItem, b: MediaItem) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
          );
          setAboutSections(sortedSections);
        }

        if (teamMediaPayload.success && Array.isArray(teamMediaPayload.media) && teamMediaPayload.media.length > 0) {
          setTeamMedia(teamMediaPayload.media);
        }

        try {
          const teamRes = await fetch('/api/team');
          const teamPayload = await teamRes.json();
          if (teamPayload.success && Array.isArray(teamPayload.teamMembers)) {
            setTeamMembers(teamPayload.teamMembers);
          }
        } catch (teamErr) {
          console.error('Failed to fetch team data:', teamErr);
        } finally {
          setTeamLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch about page data:', err);
        setTeamLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mounted]);

  const sectionItem = (key: string) => {
    const normalizedKey = key.toLowerCase();
    return aboutSections.find((entry) => {
      const title = getSectionKey(entry.title);
      return title === normalizedKey || title.replace(/\s+/g, '-') === normalizedKey;
    });
  };

  const whoWeAreSection = sectionItem('who-we-are');

  const gridSections = useMemo(
    () =>
      aboutSections.filter((item) => {
        const key = getSectionKey(item.title);
        return key !== 'who-we-are' && key !== 'support-highlights';
      }),
    [aboutSections]
  );

  const supportHighlights = useMemo(() => {
    const highlightsItem = aboutSections.find(
      (entry) => getSectionKey(entry.title) === 'support-highlights'
    );
    if (!highlightsItem?.description) return [];
    return highlightsItem.description
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }, [aboutSections]);

  const overviewText = useMemo(() => {
    const fromContent = extractFirstParagraph(pageData?.content);
    if (fromContent) return fromContent;
    return 'Agile Nexus Solutions delivers secure, cost-effective medical billing, coding, and revenue cycle management solutions that help healthcare providers optimize reimbursements and streamline operations.';
  }, [pageData?.content]);

  const renderSectionImage = (section: MediaItem) => {
    if (!isDisplayableImage(section.fileUrl)) return null;
    return (
      <figure className="about-card-image">
        <Image
          src={getCloudinaryImageUrl(section.fileUrl)}
          alt={section.altText || sectionHeading(section.title) || 'About section'}
          width={520}
          height={280}
          style={{ objectFit: 'cover', width: '100%', height: '400px', borderRadius: '12px' }}
        />
      </figure>
    );
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={
        viewMode === 'team'
          ? 'Meet Our Team'
          : (pageData?.title || 'About Us')
      }>
        {!showTeamOnly && (
          <section className="about-section about-page p_relative pt_120 pb_90" style={{ background: '#f8fbff' }}>
            <div className="auto-container">
              <div className="sec-title centred mb_60">
                <span className="sub-title mb_5">Company Overview</span>
                <h2>{pageData?.title || 'About Agile Nexus Solutions'}</h2>
                <p style={{ maxWidth: '860px', margin: '14px auto 0' }}>{overviewText}</p>
              </div>

              {whoWeAreSection && (
                <div className="row clearfix align-items-center mb_70">
                  <div className="col-lg-6 col-md-12 col-sm-12 image-column mb_30">
                    {isDisplayableImage(whoWeAreSection.fileUrl) ? (
                      <figure className="about-feature-image">
                        <Image
                          src={getCloudinaryImageUrl(whoWeAreSection.fileUrl)}
                          alt={whoWeAreSection.altText || sectionHeading(whoWeAreSection.title) || 'Who we are'}
                          width={640}
                          height={460}
                          style={{ objectFit: 'cover', borderRadius: '16px' }}
                          priority
                        />
                      </figure>
                    ) : (
                      <figure className="about-feature-image">
                        <Image
                          src={getCloudinaryImageUrl('/assets/images/resource/about-1.jpg')}
                          alt="Who we are"
                          width={640}
                          height={460}
                          style={{ objectFit: 'cover', borderRadius: '16px' }}
                          priority
                        />
                      </figure>
                    )}
                  </div>

                  <div className="col-lg-6 col-md-12 col-sm-12 content-column mb_30">
                    <div className="about-card">
                      <h3>{sectionHeading(whoWeAreSection.title)}</h3>
                      {whoWeAreSection.description && (
                        <p style={{ whiteSpace: 'pre-line' }}>{whoWeAreSection.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {gridSections.length > 0 && (
                <div className="row clearfix mb_30">
                  {gridSections.map((section) => (
                    <div key={section.id} className="col-lg-6 col-md-12 col-sm-12 mb_30">
                      <div className="about-card h-100">
                        {renderSectionImage(section)}
                        <h3>{sectionHeading(section.title)}</h3>
                        {section.description && (
                          <p style={{ whiteSpace: 'pre-line' }}>{section.description}</p>
                        )}
                        {getSectionKey(section.title) === 'support' && supportHighlights.length > 0 && (
                          <ul className="list-style-one clearfix mt_20">
                            {supportHighlights.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb_70">
                <div className="sec-title centred mb_40">
                  <span className="sub-title mb_5">Why Choose Us</span>
                  <h2>Why Agile Nexus Solutions?</h2>
                </div>
                <WhyAgileSolutionsCards instanceId="about-why-agile-cards" hideIntro />
              </div>

              {/* <div className="row clearfix">
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
              </div> */}
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
                  .about-card-image {
                    margin: 0 0 20px;
                    border-radius: 12px;
                    overflow: hidden;
                  }
                  .about-card p {
                    color: #000;
                    line-height: 1.8;
                    margin-bottom: 0;
                  }
                  .about-content-html {
                    margin-top: 16px;
                    color: #000;
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
        )}

        {showTeamOnly && (
          <section className="team-section sec-pad centred" id="our-teams">
            
            <div className="auto-container">
              <div className="sec-title mb_60">
                <span className="sub-title mb_5">Our Team</span>
                <h2>{teamMedia[0]?.title || 'Our Leadership and Operations Team'}</h2>
                {teamMedia[0]?.description && (
                  <p style={{ maxWidth: '860px', margin: '14px auto 0', color: '#000' }}>
                    {teamMedia[0].description}
                  </p>
                )}
              </div>

              {teamLoading ? (
                <div className="row clearfix">
                  {[1, 2, 3].map((index) => (
                    <div key={`skeleton-${index}`} className="col-lg-4 col-md-6 col-sm-12 team-block">
                      <div className="team-block-one">
                        <div className="inner-box">
                          <figure className="image-box">
                            <div style={{ width: '100%', height: '430px', background: '#e0e0e0', borderRadius: '8px' }} />
                          </figure>
                          <div className="content-box">
                            <div style={{ width: '60%', height: '24px', background: '#e0e0e0', borderRadius: '4px', margin: '0 auto 8px' }} />
                            <div style={{ width: '40%', height: '16px', background: '#e0e0e0', borderRadius: '4px', margin: '0 auto' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : teamMembers.length > 0 ? (
                <div className="row clearfix">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="col-lg-4 col-md-6 col-sm-12 mt-5 team-block">
                      <div className="team-block-one">
                        <div className="inner-box">
                          <figure className="image-box">
                            <Link href={`/team/${member.id}`}>
                              <Image
                                src={getCloudinaryImageUrl(member.photoUrl || '/assets/images/team/team-1.jpg')}
                                alt={member.name}
                                width={416}
                                height={430}
                                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                              />
                            </Link>
                          </figure>
                          <div className="content-box">
                            <h3><Link href={`/team/${member.id}`}>{member.name}</Link></h3>
                            <span className="designation">{member.title}</span>
                            <ul className="social-links clearfix">
                              {member.linkedinUrl && (
                                <li><Link href={member.linkedinUrl} target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in" /></Link></li>
                              )}
                              {member.twitterUrl && (
                                <li><Link href={member.twitterUrl} target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter" /></Link></li>
                              )}
                              {!member.linkedinUrl && !member.twitterUrl && (
                                <>
                                  <li><Link href="/"><i className="fab fa-facebook-f" /></Link></li>
                                  <li><Link href="/"><i className="fab fa-twitter" /></Link></li>
                                  <li><Link href="/"><i className="fab fa-dribbble" /></Link></li>
                                  <li><Link href="/"><i className="fab fa-behance" /></Link></li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted">Team members will appear here once added from admin.</p>
              )}
            </div>
          </section>
        )}

        {!showTeamOnly && <Cta />}
      </Layout>
    </div>
  );
}
