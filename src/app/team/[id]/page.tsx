'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Layout from '../../../../components/layout/Layout';
import Cta from '../../../../components/sections/home2/Cta';
import ProgressBar from '../../../../components/elements/ProgressBar';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio?: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  department?: string;
}

export default function TeamMemberDetailsPage() {
  const params = useParams<{ id: string }>();
  const memberId = params?.id;

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (!memberId) return;

    const fetchMember = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/team/${memberId}`);
        const data = await res.json();
        if (data.success && data.teamMember) {
          setMember(data.teamMember);
        }
      } catch (e) {
        console.error('Failed to fetch team member:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId]);

  const breadcrumbTitle = member?.name || 'Team Member Details';

  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={breadcrumbTitle}>
        <section className="team-details pt_120 pb_120">
          <div className="auto-container">
            <div className="team-details-content mb_100">
              <div className="row clearfix">
                {/* Member Image */}
                <div className="col-lg-6 col-md-12 col-sm-12 image-column">
                  <figure className="image-box">
                    {loading ? (
                      <div
                        style={{
                          width: '100%',
                          height: '520px',
                          borderRadius: '23px',
                          background: '#e0e0e0',
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      />
                    ) : (
                      <Image
                        src={member?.photoUrl || '/assets/images/team/team-7.jpg'}
                        alt={member?.name || 'Team member'}
                        width={633}
                        height={701}
                        priority
                      />
                    )}
                  </figure>
                </div>

                {/* Member Info */}
                <div className="col-lg-6 col-md-12 col-sm-12 content-column">
                  <div className="content-box">
                    <h2>{member?.name || (loading ? 'Loading...' : 'Team Member')}</h2>
                    <span className="designation">
                      {member?.title || (!loading && 'Medical Billing Specialist')}
                    </span>
                    {loading ? (
                      <>
                        <p>
                          <span
                            style={{
                              display: 'block',
                              width: '100%',
                              height: '18px',
                              background: '#e0e0e0',
                              borderRadius: '4px',
                              marginBottom: '10px',
                              animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                          />
                          <span
                            style={{
                              display: 'block',
                              width: '90%',
                              height: '18px',
                              background: '#e0e0e0',
                              borderRadius: '4px',
                              marginBottom: '10px',
                              animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                          />
                          <span
                            style={{
                              display: 'block',
                              width: '80%',
                              height: '18px',
                              background: '#e0e0e0',
                              borderRadius: '4px',
                              animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                          />
                        </p>
                      </>
                    ) : (
                      <>
                        {member?.bio ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: member.bio }}
                          />
                        ) : (
                          <>
                            <p>
                              This team member is part of our dedicated medical billing and revenue
                              cycle management team, helping practices improve cash flow and
                              compliance.
                            </p>
                            <p>
                              With experience across multiple specialties and billing platforms,
                              they support accurate coding, timely claim submission, and
                              denial-prevention workflows.
                            </p>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Education & Experience / Skills / Working Hours sections keep the same layout */}
            

            {/* Contact Box */}
            <div className="contact-box">
              <h3>Contact Me</h3>
              <form method="post" action="#" className="default-form">
                <div className="row clearfix">
                  <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon">
                        <i className="icon-45"></i>
                      </div>
                      <input type="text" name="name" placeholder="Name" required />
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon">
                        <i className="icon-46"></i>
                      </div>
                      <input type="email" name="email" placeholder="Email" required />
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon">
                        <Image
                          src="/assets/images/icons/icon-18.svg"
                          alt="Phone"
                          width={14}
                          height={15}
                        />
                      </div>
                      <input type="text" name="phone" placeholder="Phone" required />
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                    <div className="form-group">
                      <div className="icon">
                        <i className="icon-48"></i>
                      </div>
                      <textarea name="message" placeholder="Message"></textarea>
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-12 col-sm-12 single-column">
                    <div className="form-group message-btn mx-0">
                      <button type="submit" className="theme-btn btn-two">
                        <span>Send your message</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        <Cta />
      </Layout>
    </div>
  );
}

