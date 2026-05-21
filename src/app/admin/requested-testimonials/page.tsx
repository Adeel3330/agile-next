'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../media/media.module.css';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface RequestedTestimonial {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  created_at: string;
}

interface MediaResponse {
  success: boolean;
  media?: RequestedTestimonial[];
  total?: number;
  message?: string;
}

export default function RequestedTestimonialsPage() {
  const router = useRouter();
  const [items, setItems] = useState<RequestedTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchRequested = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await fetch(
        '/api/admin/media?position=testimonials&status=inactive&limit=50',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data: MediaResponse = await response.json();
      if (!data.success) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
          }
          router.push('/admin/login');
          return;
        }
        setError(data.message || 'Failed to fetch requested testimonials');
        setItems([]);
        return;
      }
      setItems(data.media || []);
    } catch (err) {
      console.error('Fetch requested testimonials error:', err);
      setError('Failed to fetch requested testimonials');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      fetchRequested();
    }
  }, [router, fetchRequested]);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await fetch(`/api/admin/media/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'active' }),
      });
      const data = await response.json();
      if (!data.success) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
          }
          router.push('/admin/login');
          return;
        }
        setError(data.message || 'Failed to approve');
        return;
      }
      setSuccessMessage('Testimonial approved. It will now appear on the website.');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchRequested();
    } catch (err) {
      console.error('Approve error:', err);
      setError('Failed to approve testimonial');
    } finally {
      setApprovingId(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className={styles.mediaPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Requested Testimonials</h1>
      </div>

      {successMessage && (
        <div className={styles.alertSuccess}>{successMessage}</div>
      )}
      {error && (
        <div className={styles.alertError}>{error}</div>
      )}

      <div className={styles.mediaTableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className="mt-3 text-muted">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa fa-quote-right"></i>
            <p>No requested testimonials. New submissions from the website will appear here.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Preview</th>
                <th>Name</th>
                <th>Message</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.fileUrl ? (
                      <div style={{ width: 80, height: 60, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                        <Image
                          src={getCloudinaryImageUrl(item.fileUrl)}
                          alt={item.title}
                          width={80}
                          height={60}
                          className={styles.thumbnail}
                        />
                      </div>
                    ) : (
                      <span style={{ color: '#888' }}>—</span>
                    )}
                  </td>
                  <td>
                    <strong>{item.title}</strong>
                  </td>
                  <td>
                    {item.description ? (
                      <span className={styles.description} title={item.description}>
                        {item.description.length > 60 ? item.description.substring(0, 60) + '...' : item.description}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Link
                        href={`/admin/requested-testimonials/view/${item._id}`}
                        className={`${styles.btnAction} ${styles.btnView}`}
                      >
                        <i className="fa fa-eye"></i> View
                      </Link>
                      <button
                        type="button"
                        className={`${styles.btnAction} ${styles.btnEdit}`}
                        onClick={() => handleApprove(item._id)}
                        disabled={approvingId === item._id}
                      >
                        {approvingId === item._id ? (
                          <><span className="spinner-border spinner-border-sm me-1" role="status" /> Approving...</>
                        ) : (
                          <><i className="fa fa-check"></i> Approve</>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
