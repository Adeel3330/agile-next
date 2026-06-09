'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import styles from '../../../media/media.module.css';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface MediaItem {
  _id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  created_at?: string;
  status?: 'active' | 'inactive';
  position?: string;
}

export default function RequestedTestimonialViewPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [item, setItem] = useState<MediaItem | null>(null);

  useEffect(() => setMounted(true), []);

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

        const response = await fetch(`/api/admin/media/${id}`, {
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
          setError(data.message || 'Failed to fetch testimonial');
          setItem(null);
          return;
        }

        setItem(data.media as MediaItem);
      } catch (e) {
        console.error('Requested testimonial view error:', e);
        setError('Failed to fetch testimonial');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [mounted, id, router]);

  if (!mounted) return null;

  return (
    <div className={styles.mediaPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>View Testimonial</h1>
        <Link href="/admin/requested-testimonials" className={styles.btnPrimary}>
          Back
        </Link>
      </div>

      {error && <div className={styles.alertError}>{error}</div>}

      <div className={styles.mediaTableWrapper} style={{ padding: 20 }}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className="mt-3 text-muted">Loading...</p>
          </div>
        ) : !item ? null : (
          <div className="row g-4">
            <div className="col-lg-4">
              {item.fileUrl ? (
                <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #eee' }}>
                  <Image
                    src={getCloudinaryImageUrl(item.fileUrl)}
                    alt={item.title}
                    width={600}
                    height={450}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              ) : (
                <div className="text-muted">No image</div>
              )}
            </div>
            <div className="col-lg-8">
              <div style={{ fontSize: 14, color: '#000', marginBottom: 8 }}>
                {item.created_at ? `Submitted: ${new Date(item.created_at).toLocaleString()}` : ''}
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{item.title}</h2>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
                {item.description || '—'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
