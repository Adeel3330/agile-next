'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './sliders.module.css';
import { isCloudinaryUrl, getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

// Placeholder SVG as data URI (no static files - all images from Cloudinary)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

interface Slider {
  _id: string;
  title: string;
  description?: string;
  file: string;
  fileType: 'image' | 'video';
  seoTitle?: string;
  seoContent?: string;
  created_at: string;
  updated_at: string;
}

interface SlidersResponse {
  success: boolean;
  sliders?: Slider[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  message?: string;
}

export default function SlidersPage() {
  const router = useRouter();
  
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Track failed images to prevent infinite loops
  const failedImages = useRef<Set<string>>(new Set());

  const fetchSliders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/sliders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: SlidersResponse = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
          }
          router.push('/admin/login');
          return;
        }
        setError(data.message || 'Failed to fetch sliders');
        setLoading(false);
        return;
      }

      setSliders(data.sliders || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch sliders error:', err);
      setError('Failed to fetch sliders');
    } finally {
      setLoading(false);
    }
  }, [router, currentPage, searchTerm]);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      fetchSliders();
    }
  }, [router, fetchSliders]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSliders();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slider? This action can be undone.')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await fetch(`/api/admin/sliders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
        alert(data.message || 'Failed to delete slider');
        return;
      }

      setSuccessMessage('Slider deleted successfully!');
      fetchSliders();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete slider');
    }
  };

  // Memoize sliders to prevent unnecessary re-renders
  const memoizedSliders = useMemo(() => sliders, [sliders]);

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.slidersPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Sliders Management</h1>
        <Link href="/admin/sliders/create" className={styles.btnPrimary}>
          <i className="fa fa-plus"></i>
          Add New Slider
        </Link>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className={styles.alertSuccess}>
          {successMessage}
        </div>
      )}
      {error && (
        <div className={styles.alertError}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by title, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className={styles.btnSearch}>
            <i className="fa fa-search"></i> Search
          </button>
        </form>
      </div>

      {/* Sliders Table */}
      <div className={styles.slidersTableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className="mt-3 text-muted">Loading sliders...</p>
          </div>
        ) : sliders.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa fa-images"></i>
            <p>No sliders found. Create your first slider!</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>SEO Title</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {memoizedSliders.map((slider) => {
                  // Check if file is a static path (placeholder.jpg or /assets/images) - reject these
                  const isStaticPath = slider.file && (
                    slider.file.includes('placeholder.jpg') ||
                    slider.file.includes('/assets/images/') ||
                    slider.file.startsWith('/assets/') ||
                    slider.file.startsWith('assets/')
                  );
                  
                  // Check if this image has already failed
                  const hasFailed = failedImages.current.has(slider._id);
                  
                  // Validate Cloudinary URL or use placeholder
                  const isValidCloudinaryUrl = !isStaticPath && !hasFailed && isCloudinaryUrl(slider.file);
                  
                  // Use optimized Cloudinary URL for thumbnails (80px width) or placeholder
                  const imageSrc = isValidCloudinaryUrl 
                    ? getCloudinaryImageUrl(slider.file, 80, 60, 'auto')
                    : PLACEHOLDER_IMAGE;
                  
                  return (
                    <tr key={slider._id}>
                      <td>
                        {slider.fileType === 'image' ? (
                          <img 
                            src={imageSrc} 
                            alt={slider.title}
                            className={styles.previewImage}
                            loading="lazy"
                            onError={(e) => {
                              // Prevent infinite loop - only handle error once per slider
                              if (failedImages.current.has(slider._id)) {
                                return;
                              }
                              
                              const target = e.target as HTMLImageElement;
                              const currentSrc = target.src || '';
                              
                              // Check if already placeholder or if error occurred on placeholder
                              const isAlreadyPlaceholder = currentSrc.includes('data:image/svg+xml') || 
                                                           currentSrc === PLACEHOLDER_IMAGE ||
                                                           currentSrc.includes('placeholder');
                              
                              if (!isAlreadyPlaceholder) {
                                // Set placeholder immediately
                                target.src = PLACEHOLDER_IMAGE;
                              }
                              
                              // Mark as failed and disable all error handlers
                              failedImages.current.add(slider._id);
                              target.onerror = null;
                              if (e.currentTarget) {
                                e.currentTarget.onerror = null;
                              }
                              
                              // Stop event propagation
                              e.stopPropagation();
                            }}
                          />
                        ) : (
                          <video 
                            src={isValidCloudinaryUrl ? slider.file : ''}
                            className={styles.previewVideo}
                            muted
                            preload="metadata"
                            onError={(e) => {
                              // Prevent video error loop
                              const target = e.target as HTMLVideoElement;
                              target.onerror = null;
                              if (e.currentTarget) {
                                e.currentTarget.onerror = null;
                              }
                              e.stopPropagation();
                            }}
                          />
                        )}
                      </td>
                      <td>
                        <div className={styles.titleCell}>
                          <strong>{slider.title}</strong>
                          {slider.description && (
                            <p className={styles.descriptionText}>{slider.description.substring(0, 50)}...</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${slider.fileType === 'image' ? styles.badgeImage : styles.badgeVideo}`}>
                          {slider.fileType === 'image' ? 'Image' : 'Video'}
                        </span>
                      </td>
                      <td>{slider.seoTitle || '-'}</td>
                      <td>
                        {new Date(slider.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Link
                          href={`/admin/sliders/edit/${slider._id}`}
                          className={`${styles.btnAction} ${styles.btnEdit}`}
                        >
                          <i className="fa fa-edit"></i> Edit
                        </Link>
                        <button
                          className={`${styles.btnAction} ${styles.btnDelete}`}
                          onClick={() => handleDelete(slider._id)}
                        >
                          <i className="fa fa-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.btnPagination}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <i className="fa fa-chevron-left"></i> Previous
                </button>
                <span className={styles.paginationInfo}>
                  Page {currentPage} of {totalPages} ({total} total)
                </span>
                <button
                  className={styles.btnPagination}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next <i className="fa fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
