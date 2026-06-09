'use client';

import { useState, useEffect } from 'react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  position: string;
  display_order: number;
}

export default function FaqSection() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<FaqItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/faqs?position=home');
      const data = await response.json();
      if (data.success && data.faqs?.length > 0) {
        setItems(data.faqs);
        setOpenIndex(0);
      }
    } catch (err) {
      console.error('Failed to fetch FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  if (!loading && items.length === 0) return null;

  return (
    <section className="about-section p_relative pt_90 pb_90" style={{ background: '#f5f8fa' }} id="faq">
      <div className="auto-container">
        <div className="sec-title mb_60 centred">
          <span className="sub-title mb_5">FAQs</span>
          <h2>Frequently Asked Questions</h2>
          <p style={{ maxWidth: '700px', margin: '15px auto 0', color: '#000' }}>
            Common questions about our medical billing and revenue cycle management services.
          </p>
        </div>
        {loading ? (
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: '56px', marginBottom: '12px', borderRadius: '8px', background: '#e0e0e0' }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="row clearfix justify-content-center">
            <div className="col-lg-8 col-md-12">
              {items.map((faq, index) => (
                <div
                  key={faq.id}
                  className="faq-block"
                  style={{
                    background: '#fff',
                    marginBottom: '12px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      fontSize: '18px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    {faq.question}
                    <span style={{ fontSize: '24px', color: 'var(--theme-color)' }}>
                      {openIndex === index ? '−' : '+'}
                    </span>
                  </button>
                  {openIndex === index && (
                    <div style={{ padding: '0 24px 20px' }}>
                      <p style={{ color: '#000', lineHeight: '26px', margin: 0 }}>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
