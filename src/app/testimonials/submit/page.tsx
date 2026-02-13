'use client';

import { useState } from 'react';
import Layout from '../../../../components/layout/Layout';
import Link from 'next/link';

export default function SubmitTestimonialPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter your testimonial message.');
      return;
    }
    if (!image) {
      setError('Please upload your photo.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('message', message.trim());
      formData.append('image', image);

      const res = await fetch('/api/testimonials/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Submission failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setName('');
      setMessage('');
      setImage(null);
      setPreview(null);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Submit a Testimonial">
      <section className="contact-section p_relative pt_120 pb_120">
        <div className="auto-container">
          <div className="sec-title centred mb_60">
            <span className="sub-title mb_5">Share your experience</span>
            <h2>Submit a Testimonial</h2>
            <p style={{ maxWidth: '640px', margin: '15px auto 0', color: '#666' }}>
              Doctors and clients: share your experience with Agile Nexus Solutions. Your testimonial and photo may be featured on our website after review.
            </p>
          </div>

          <div className="row clearfix justify-content-center">
            <div className="col-lg-8 col-md-10">
              <div className="form-inner" style={{ background: '#fff', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 30px rgba(0,0,0,0.08)' }}>
                {success ? (
                  <div className="alert alert-success" style={{ padding: '20px', borderRadius: '8px', background: '#d4edda', color: '#155724' }}>
                    <strong>Thank you!</strong> Your testimonial has been submitted and will appear on our site after review.
                    <div className="mt-3">
                      <Link href="/#testimonials" className="theme-btn btn-one">
                        <span>Back to Testimonials</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="alert alert-danger mb-4" style={{ padding: '12px 16px', borderRadius: '8px', background: '#f8d7da', color: '#721c24' }}>
                        {error}
                      </div>
                    )}

                    <div className="form-group mb-4">
                      <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                        Your name / Practice name *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dr. Jane Smith or Family Medicine Centre"
                        required
                        style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '8px' }}
                      />
                    </div>

                    <div className="form-group mb-4">
                      <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                        Your testimonial *
                      </label>
                      <textarea
                        className="form-control"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Share your experience with our medical billing and RCM services..."
                        rows={5}
                        required
                        style={{ width: '100%', padding: '12px 16px', border: '1px solid #ddd', borderRadius: '8px' }}
                      />
                    </div>

                    <div className="form-group mb-4">
                      <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                        Your photo *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        required={!preview}
                        className="form-control"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '8px' }}
                      />
                      <small className="text-muted" style={{ display: 'block', marginTop: '6px' }}>
                        JPG, PNG or WebP, max 5MB. This will be shown next to your testimonial.
                      </small>
                      {preview && (
                        <div style={{ marginTop: '12px' }}>
                          <img
                            src={preview}
                            alt="Preview"
                            style={{ maxWidth: '120px', height: '120px', objectFit: 'cover', borderRadius: '50%', border: '2px solid #eee' }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-3 align-items-center flex-wrap">
                      <button
                        type="submit"
                        className="theme-btn btn-one"
                        disabled={loading}
                      >
                        {loading ? (
                          <span>
                            <p className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            Submitting...
                          </span>
                        ) : (
                          <span>Submit Testimonial</span>
                        )}
                      </button>
                      <Link href="/#testimonials" className="theme-btn btn-two">
                        <span>Cancel</span>
                      </Link>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
