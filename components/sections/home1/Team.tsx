'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";

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

export default function Team() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/team');
      const data = await response.json();

      if (data.success && data.teamMembers) {
        // Limit to 3 members for display
        setTeamMembers(data.teamMembers.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to fetch team members:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  // Default team members if API fails or no data
  const displayMembers = teamMembers.length > 0 
    ? teamMembers 
    : loading 
      ? [] 
      : [
          { id: '1', name: 'Catherine Denuve', title: 'Optegra eye', photoUrl: '/assets/images/team/team-1.jpg' },
          { id: '2', name: 'Jenny Wilson', title: 'Lens replacement', photoUrl: '/assets/images/team/team-2.jpg' },
          { id: '3', name: 'Guy Hawkins', title: 'Cataract surgery', photoUrl: '/assets/images/team/team-3.jpg' }
        ];

  return (
    <section className="team-section sec-pad centred">
      <div className="bg-layer" style={{ backgroundImage: "url(assets/images/background/team-bg.jpg)" }}></div>
      <div className="auto-container">
        <div className="sec-title mb_60">
          <span className="sub-title mb_5">Our Team</span>
          <h2>The Most Qualified Skillful & <br />Professional staff</h2>
          <p>Medical care is the practice of providing diagnosis, treatment, and preventive care for various <br />illnesses, injuries, and diseases. It</p>
        </div>
        <div className="row clearfix">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="col-lg-4 col-md-6 col-sm-12 team-block">
                <div className="team-block-one">
                  <div className="inner-box">
                    <figure className="image-box">
                      <div style={{ 
                        width: '416px', 
                        height: '430px', 
                        background: '#e0e0e0', 
                        borderRadius: '8px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                    </figure>
                    <div className="content-box">
                      <div style={{ 
                        width: '60%', 
                        height: '24px', 
                        background: '#e0e0e0', 
                        borderRadius: '4px',
                        marginBottom: '8px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                      <div style={{ 
                        width: '40%', 
                        height: '16px', 
                        background: '#e0e0e0', 
                        borderRadius: '4px',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            displayMembers.map((member, index) => (
              <div key={member.id} className="col-lg-4 col-md-6 col-sm-12 team-block">
                <div className="team-block-one wow fadeInUp animated" data-wow-delay={`${index * 300}ms`} data-wow-duration="1500ms">
                  <div className="inner-box">
                    <figure className="image-box">
                      <Link href="/doctor-details">
                        <Image 
                          src={member.photoUrl || '/assets/images/team/team-1.jpg'} 
                          alt={member.name} 
                          width={416} 
                          height={430} 
                          priority={index < 3}
                        />
                      </Link>
                    </figure>
                    <div className="content-box">
                      <h3><Link href="/doctor-details">{member.name}</Link></h3>
                      <span className="designation">{member.title}</span>
                      <ul className="social-links clearfix">
                        {member.linkedinUrl && (
                          <li><Link href={member.linkedinUrl} target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></Link></li>
                        )}
                        {member.twitterUrl && (
                          <li><Link href={member.twitterUrl} target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></Link></li>
                        )}
                        {!member.linkedinUrl && !member.twitterUrl && (
                          <>
                            <li><Link href="/"><i className="fab fa-facebook-f"></i></Link></li>
                            <li><Link href="/"><i className="fab fa-twitter"></i></Link></li>
                            <li><Link href="/"><i className="fab fa-dribbble"></i></Link></li>
                            <li><Link href="/"><i className="fab fa-behance"></i></Link></li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}} />
    </section>
  );
}
