'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from "../../../../components/layout/Layout";
import Link from "next/link";
import Cta from "../../../../components/sections/home2/Cta";

interface Career {
  id: string;
  title: string;
  slug: string;
  department?: string;
  location?: string;
  type?: string;
  description?: string;
  requirements?: string;
  created_at: string;
  updated_at: string;
}

export default function CareerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [career, setCareer] = useState<Career | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Resume form state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    resumeFile: null as File | null,
    resumeFileUrl: ''
  });

  const fetchCareer = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/careers/${slug}`);
      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Career not found');
        setLoading(false);
        return;
      }

      setCareer(data.career);
    } catch (err) {
      console.error('Failed to fetch career:', err);
      setError('Failed to load career');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchCareer();
    }
  }, [slug, fetchCareer]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmitError('');
    setSubmitSuccess(false);

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      setSubmitError('Only PDF and DOC/DOCX files are allowed');
      // Reset file input
      e.target.value = '';
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setSubmitError('File size must be less than 5MB');
      // Reset file input
      e.target.value = '';
      return;
    }

    setFormData(prev => ({ ...prev, resumeFile: file }));

    // Upload file
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const uploadResponse = await fetch('/api/resumes/upload', {
        method: 'POST',
        body: uploadFormData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.success) {
        const errorMessage = uploadData.message || `Upload failed (${uploadResponse.status})`;
        throw new Error(errorMessage);
      }

      if (!uploadData.url) {
        throw new Error('Upload succeeded but no URL returned');
      }

      setFormData(prev => ({ ...prev, resumeFileUrl: uploadData.url }));
    } catch (err: any) {
      console.error('Upload error:', err);
      setSubmitError(err.message || 'Failed to upload resume. Please try again.');
      setFormData(prev => ({ ...prev, resumeFile: null, resumeFileUrl: '' }));
      // Reset file input
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!career) {
      setSubmitError('Career information not loaded');
      return;
    }

    if (!formData.fullName.trim()) {
      setSubmitError('Please enter your full name');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setSubmitError('Please enter a valid email address');
      return;
    }

    if (!formData.resumeFileUrl) {
      setSubmitError('Please upload your resume');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          careerId: career.id,
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          coverLetter: formData.coverLetter.trim() || null,
          resumeFileUrl: formData.resumeFileUrl
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.message || `Failed to submit resume (${response.status})`;
        setSubmitError(errorMessage);
        setSubmitting(false);
        return;
      }

      setSubmitSuccess(true);
      setSubmitError('');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        coverLetter: '',
        resumeFile: null,
        resumeFileUrl: ''
      });
      
      // Reset file input
      const fileInput = document.getElementById('resume-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Failed to submit resume. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="boxed_wrapper">
        <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Career Details">
          <section className="sidebar-page-container pt_120 pb_120">
            <div className="auto-container">
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </section>
        </Layout>
      </div>
    );
  }

  if (error || !career) {
    return (
      <div className="boxed_wrapper">
        <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Career Details">
          <section className="sidebar-page-container pt_120 pb_120">
            <div className="auto-container">
              <div className="text-center py-5">
                <h3>Career Not Found</h3>
                <p>{error || 'The career position you are looking for does not exist.'}</p>
                <Link href="/careers" className="theme-btn btn-one">Back to Careers</Link>
              </div>
            </div>
          </section>
        </Layout>
      </div>
    );
  }

  return (
    <div className="boxed_wrapper">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: translateY(-50%) rotate(0deg); }
          100% { transform: translateY(-50%) rotate(360deg); }
        }
      `}} />
      <Layout headerStyle={1} footerStyle={1} breadcrumbTitle={career.title}>
        <section className="sidebar-page-container pt_120 pb_120">
          <div className="auto-container">
            <div className="row clearfix">
              <div className="col-lg-8 col-md-12 col-sm-12 content-side">
                <div className="blog-details-content">
                  <div className="news-block-one">
                    <div className="inner-box">
                      <div className="lower-content">
                        <h3>{career.title}</h3>
                        <ul className="post-info clearfix">
                          {career.department && (
                            <li><i className="icon-59"></i>{career.department}</li>
                          )}
                          {career.location && (
                            <li><i className="icon-60"></i>{career.location}</li>
                          )}
                          {career.type && (
                            <li><i className="icon-61"></i>{career.type}</li>
                          )}
                          <li><i className="icon-59"></i>{formatDate(career.created_at)}</li>
                        </ul>
                        {career.description && (
                          <div 
                            dangerouslySetInnerHTML={{ __html: career.description }} 
                            className="blog-content"
                          />
                        )}
                        {career.requirements && (
                          <div className="mt-4">
                            <h4>Requirements</h4>
                            <div 
                              dangerouslySetInnerHTML={{ __html: career.requirements }} 
                              className="blog-content"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resume Application Form */}
                  <div className="contact-section contact-form-area mt-5">
                    <div className="sec-title centred">
                      <h2>Apply for this Position</h2>
                      <p className="small mb-4">Fill out the form below to submit your application</p>
                    </div>
                    {submitSuccess && (
                      <div className="alert alert-success" role="alert">
                        Your resume has been submitted successfully! We will review your application and get back to you soon.
                      </div>
                    )}
                    {submitError && (
                      <div className="alert alert-danger" role="alert">
                        {submitError}
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="default-form">
                      <div className="row clearfix">
                        <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                          <input
                            type="text"
                            
                            name="fullName"
                            placeholder="Full Name *"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            required
                            disabled={submitting || uploading}
                          />
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                          <input
                            type="email"
                            
                            name="email"
                            placeholder="Email Address *"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            required
                            disabled={submitting || uploading}
                          />
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                          <input
                            type="text"
                            
                            name="phone"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            disabled={submitting || uploading}
                          />
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-12 form-group">
                          <input
                            type="file"
                            className="form-control"
                            id="resume-file"
                            name="resume"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            disabled={submitting || uploading}
                            required
                          />
                          {uploading && (
                            <p className="text-primary small mt-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span 
                                style={{ 
                                  display: 'inline-block',
                                  width: '14px',
                                  height: '14px',
                                  border: '2px solid #0066cc',
                                  borderTop: '2px solid transparent',
                                  borderRadius: '50%',
                                  animation: 'spin 0.8s linear infinite'
                                }}
                              />
                              Uploading resume... Please wait
                            </p>
                          )}
                          {formData.resumeFile && !uploading && formData.resumeFileUrl && (
                            <p className="text-success small mt-2" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>✓</span>
                              <span>{formData.resumeFile.name}</span>
                            </p>
                          )}
                          {formData.resumeFile && !uploading && !formData.resumeFileUrl && (
                            <p className="text-danger small mt-2">⚠ Upload failed. Please try again.</p>
                          )}
                        </div>
                        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                          <textarea
                            name="coverLetter"
                            
                            placeholder="Cover Letter (Optional)"
                            value={formData.coverLetter}
                            onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                            rows={5}
                            disabled={submitting || uploading}
                          />
                        </div>
                        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
                          <button
                            type="submit"
                            className="theme-btn btn-one cursor-pointer"
                            disabled={submitting || uploading || !formData.resumeFileUrl}
                            style={{ position: 'relative', minWidth: '200px' }}
                          >
                            {(submitting || uploading) && (
                              <p 
                                style={{ 
                                  position: 'absolute', 
                                  left: '20px', 
                                  top: '50%', 
                                  transform: 'translateY(-50%)',
                                  display: 'inline-block',
                                  width: '16px',
                                  height: '16px',
                                  border: '2px solid #fff',
                                  borderTop: '2px solid transparent',
                                  borderRadius: '50%',
                                  animation: 'spin 0.8s linear infinite'
                                }}
                              />
                            )}
                            <span style={{ marginLeft: submitting || uploading ? '30px' : '0' }}>
                              {submitting ? 'Submitting...' : uploading ? 'Uploading Resume...' : 'Submit Application'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-12 col-sm-12 sidebar-side">
                <div className="blog-sidebar">
                  <div className="consulting-widget">
                    <div className="bg-layer" style={{ backgroundImage: "url(/assets/images/resource/sidebar-1.jpg)" }}></div>
                    <h3>Join Our <br />Team Today!</h3>
                    <p>We're always looking for talented individuals to join our team. Explore our open positions and find your next career opportunity.</p>
                    <Link href="/careers" className="theme-btn btn-two"><span>View All Careers</span></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Cta/>
      </Layout>
    </div>
  );
}
