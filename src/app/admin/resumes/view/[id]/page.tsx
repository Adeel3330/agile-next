'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getCloudinaryDownloadUrl, isCloudinaryUrl } from '@/lib/cloudinary-utils';

interface ResumeDetail {
  id: string;
  careerId: string;
  career: { id: string; title: string; slug: string } | null;
  fullName: string;
  email: string;
  phone?: string;
  coverLetter?: string;
  resumeFileUrl: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export default function ResumeViewerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resume, setResume] = useState<ResumeDetail | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await fetch(`/api/admin/resumes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!data.success) {
          if (response.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
            router.push('/admin/login');
            return;
          }
          setError(data.message || 'Failed to fetch resume');
          setResume(null);
          return;
        }

        setResume(data.resume as ResumeDetail);
      } catch (e) {
        console.error('Resume viewer error:', e);
        setError('Failed to fetch resume');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [mounted, id, router]);

  const isPdf = useMemo(() => {
    const url = (resume?.resumeFileUrl || '').toLowerCase();
    return url.includes('.pdf') || url.includes('application/pdf');
  }, [resume?.resumeFileUrl]);

  const downloadUrl = useMemo(() => {
    const url = resume?.resumeFileUrl || '';
    return isCloudinaryUrl(url) ? getCloudinaryDownloadUrl(url) : url;
  }, [resume?.resumeFileUrl]);

  if (!mounted) return null;

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid">
        <div className="card shadow-lg border-0">
          <div className="card-header border-0 bg-theme-one p-3 d-flex justify-content-between align-items-center">
            <h1 className="h5 mb-0 text-white">Resume Viewer</h1>
            <Link href="/admin/resumes" className="btn btn-sm btn-light">
              Back
            </Link>
          </div>

          <div className="card-body p-4">
            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : !resume ? null : (
              <>
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <div>
                    <div className="fw-bold">{resume.fullName}</div>
                    <div className="text-muted" style={{ fontSize: 13 }}>{resume.email}{resume.phone ? ` • ${resume.phone}` : ''}</div>
                    {resume.career && (
                      <div style={{ fontSize: 13 }}>
                        Applied for:{' '}
                        <a href={`/careers/${resume.career.slug}`} target="_blank" rel="noreferrer">
                          {resume.career.title}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <a
                      href={resume.resumeFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      Open
                    </a>
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-success"
                    >
                      Download
                    </a>
                  </div>
                </div>

                {isPdf ? (
                  <div className="border rounded overflow-hidden bg-white" style={{ width: '100%', height: '75vh' }}>
                    <iframe
                      src={resume.resumeFileUrl}
                      title="Resume PDF"
                      style={{ width: '100%', height: '100%', border: 0 }}
                    />
                  </div>
                ) : (
                  <div className="alert alert-info">
                    This file is not a PDF. Use “Open” or “Download”.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
