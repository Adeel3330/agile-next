'use client';

import Link from 'next/link';
import Layout from '../../../components/layout/Layout';

const resourceCards = [
  {
    title: 'Compliance',
    description: 'Policies, standards, and audit-ready billing operations.',
    href: '/compliance'
  },
  {
    title: 'Software',
    description: 'Platform and system coverage used in your billing workflows.',
    href: '/software'
  },
  {
    title: 'Specialities',
    description: 'Specialty-focused billing support and coding workflows.',
    href: '/specialities'
  },
  {
    title: 'Blog',
    description: 'Insights, updates, and practical medical billing guidance.',
    href: '/blog'
  }
];

export default function ResourcesPage() {
  return (
    <div className="boxed_wrapper">
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Resources">
        <section className="service-page-section p_relative pt_120 pb_120">
          <div className="auto-container">
            <div className="sec-title centred mb_55">
              <span className="sub-title mb_5">Resource Center</span>
              <h2>Explore Helpful Resources</h2>
              <p>
                Find compliance guidance, software information, specialty support details, and educational insights from our team.
              </p>
            </div>

            <div className="row clearfix">
              {resourceCards.map((card) => (
                <div key={card.title} className="col-lg-6 col-md-6 col-sm-12 mb-4">
                  <div className="service-block-one">
                    <div className="inner-box" style={{ padding: '35px 30px' }}>
                      <div className="lower-content" style={{ position: 'relative', bottom: 'auto', left: 'auto' }}>
                        <div className="inner" style={{ padding: 0 }}>
                          <h3>{card.title}</h3>
                          <p>{card.description}</p>
                          <Link href={card.href} className="theme-btn btn-one mt-3">
                            <span>View {card.title}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </div>
  );
}
