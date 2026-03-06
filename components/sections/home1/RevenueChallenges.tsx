'use client';

import { useEffect, useState } from 'react';

interface PageData {
  id: string;
  title: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

export default function RevenueChallenges() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const pageRes = await fetch('/api/pages/revenue-challenges');

      try {
        const pageJson = await pageRes.json();
        if (pageJson.success && pageJson.page) {
          setPageData(pageJson.page);
        }
      } catch (err) {
        console.error('Failed to parse revenue challenges page JSON:', err);
      }
    } catch (err) {
      console.error('Failed to fetch revenue challenges data:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseChallengesFromContent = (html?: string): string[] => {
    if (!html) return [];
    const matches = Array.from(html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi));
    return matches
      .map((match) => match[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim())
      .filter(Boolean);
  };

  const fallbackChallenges = [
    'Declining collections are putting consistent growth out of reach.',
    'Lack of financial visibility keeps your practice flying blind.',
    'Denied claims from coding errors are cutting deep into profits.',
    'Unresolved A/R over 90 days is quietly draining your revenue.',
    'Claims stagnating without follow-up are blocking your cash flow.',
  ];

  const challengeItems =
    parseChallengesFromContent(pageData?.content).length > 0
      ? parseChallengesFromContent(pageData?.content)
      : fallbackChallenges;

  const toggleChallenge = (challenge: string) => {
    setSelectedChallenges((prev) =>
      prev.includes(challenge) ? prev.filter((item) => item !== challenge) : [...prev, challenge]
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitMessage(null);
    setSubmitError(null);

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setSubmitError('Please enter your name, email, and phone number.');
      return;
    }

    if (selectedChallenges.length === 0) {
      setSubmitError('Please select at least one revenue challenge.');
      return;
    }

    setIsSubmitting(true);

    try {
      const today = new Date();
      // Format as YYYY-MM-DD
      const formattedDate = today.toISOString().split('T')[0];

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          serviceNames: selectedChallenges,
          appointmentDate: formattedDate,
          message: `Consultation regarding revenue challenges.`,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setSubmitError(result.message || 'Unable to submit your request. Please try again.');
        return;
      }

      setSubmitMessage('Thanks! Your request has been submitted successfully.');
      setName('');
      setEmail('');
      setPhone('');
      setSelectedChallenges([]);
    } catch (error) {
      console.error('Failed to submit revenue challenges form:', error);
      setSubmitError('Unable to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  const heading =
    pageData?.title || 'Which of These Revenue Challenges Are Holding Your Practice Back?';

  return (
    <section className="chooseus-section p_relative pt_120 pb_90" style={{ background: '#f5f8fa' }}>
      <div className="auto-container">
        <div className="sec-title mb_40 centred">
          <span className="sub-title mb_5">Revenue Roadblocks</span>
          <h2>{heading}</h2>
        </div>

        <div className="row clearfix">
          <div className="col-lg-7 col-md-12 col-sm-12 mb_30">
            <div className="challenges-box">
              {loading ? (
                <div>
                  <div
                    className="skeleton"
                    style={{
                      width: '80%',
                      height: '24px',
                      marginBottom: '12px',
                      borderRadius: '4px',
                      background: '#e0e0e0',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    className="skeleton"
                    style={{
                      width: '100%',
                      height: '16px',
                      marginBottom: '8px',
                      borderRadius: '4px',
                      background: '#e0e0e0',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    className="skeleton"
                    style={{
                      width: '95%',
                      height: '16px',
                      marginBottom: '8px',
                      borderRadius: '4px',
                      background: '#e0e0e0',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    className="skeleton"
                    style={{
                      width: '90%',
                      height: '16px',
                      marginBottom: '8px',
                      borderRadius: '4px',
                      background: '#e0e0e0',
                      animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                  />
                </div>
              ) : (
                <>
                  <p className="challenges-intro">
                    Select all the challenges your practice is facing right now.
                  </p>
                  <div className="challenge-list">
                    {challengeItems.map((challenge) => {
                      const id = challenge.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      const checked = selectedChallenges.includes(challenge);

                      return (
                        <label key={id} htmlFor={id} className="challenge-item">
                          <input
                            id={id}
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleChallenge(challenge)}
                          />
                          <span>{challenge}</span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="col-lg-5 col-md-12 col-sm-12 mb_30">
            <div className="booking-form-box">
              <h4>Book a Free Consultation</h4>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="theme-btn btn-two" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Submitting...' : 'Book Now'}</span>
                </button>

                {submitError && <p className="form-feedback error">{submitError}</p>}
                {submitMessage && <p className="form-feedback success">{submitMessage}</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .challenges-box,
        .booking-form-box {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          padding: 30px;
          height: 100%;
        }
        .challenges-intro {
          color: #555;
          margin-bottom: 18px;
        }
        .challenge-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .challenge-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          color: #232323;
          font-size: 15px;
          line-height: 1.6;
          cursor: pointer;
        }
        .challenge-item input {
          margin-top: 4px;
          width: 18px;
          height: 18px;
        }
        .booking-form-box h4 {
          margin-bottom: 18px;
          font-size: 24px;
        }
        .booking-form-box .form-group {
          margin-bottom: 14px;
        }
        .booking-form-box input {
          width: 100%;
          border: 1px solid #d8d8d8;
          border-radius: 10px;
          height: 52px;
          padding: 0 16px;
          font-size: 15px;
        }
        .booking-form-box button {
          width: 100%;
          border: 0;
          margin-top: 4px;
        }
        .form-feedback {
          margin-top: 12px;
          margin-bottom: 0;
          font-size: 14px;
        }
        .form-feedback.error {
          color: #d93025;
        }
        .form-feedback.success {
          color: #1e8e3e;
        }
      `,
        }}
      />
    </section>
  );
}

