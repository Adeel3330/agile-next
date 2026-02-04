'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './media.module.css';

interface Media {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  position: 'home' | 'services' | 'about' | 'contact' | 'other' | 'cta';
  status: 'active' | 'inactive';
  displayOrder: number;
  altText?: string;
  linkUrl?: string;
  created_at: string;
  updated_at: string;
}

interface MediaResponse {
  success: boolean;
  media?: Media[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  message?: string;
}

export default function MediaPage() {
  const router = useRouter();
  
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchMedia = useCallback(async () => {
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
        ...(searchTerm && { search: searchTerm }),
        ...(positionFilter && { position: positionFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/media?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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
        setError(data.message || 'Failed to fetch media');
        setLoading(false);
        return;
      }

      setMedia(data.media || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch media error:', err);
      setError('Failed to fetch media');
    } finally {
      setLoading(false);
    }
  }, [router, currentPage, searchTerm, positionFilter, statusFilter]);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      fetchMedia();
    }
  }, [router, fetchMedia]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMedia();
  };

  const handlePositionChange = (position: string) => {
    setPositionFilter(position);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item? This action can be undone.')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await fetch(`/api/admin/media/${id}`, {
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
        alert(data.message || 'Failed to delete media item');
        return;
      }

      setSuccessMessage('Media item deleted successfully!');
      fetchMedia();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete media item');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'active' ? styles.badgeActive : styles.badgeInactive;
  };

  const getPositionBadgeClass = (position: string) => {
    const classes: { [key: string]: string } = {
      home: styles.badgeHome,
      services: styles.badgeServices,
      about: styles.badgeAbout,
      contact: styles.badgeContact,
      cta: styles.badgeCta,
      other: styles.badgeOther
    };
    return classes[position] || styles.badgeOther;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.mediaPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Media Management</h1>
        <Link href="/admin/media/create" className={styles.btnPrimary}>
          <i className="fa fa-plus"></i>
          Add New Media
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

      {/* Search Bar and Filters */}
      <div className={styles.searchBar}>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by title, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.positionFilter}
            value={positionFilter}
            onChange={(e) => handlePositionChange(e.target.value)}
          >
            <option value="">All Positions</option>
            <option value="home">Home</option>
            <option value="services">Services</option>
            <option value="about">About</option>
            <option value="contact">Contact</option>
            <option value="cta">CTA</option>
            <option value="other">Other</option>
          </select>
          <select
            className={styles.statusFilter}
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button type="submit" className={styles.btnSearch}>
            <i className="fa fa-search"></i> Search
          </button>
        </form>
      </div>

      {/* Media Table */}
      <div className={styles.mediaTableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className="mt-3 text-muted">Loading media...</p>
          </div>
        ) : media.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa fa-image"></i>
            <p>No media found. Upload your first media item!</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Position</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>File Info</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {media.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <img
                        src={item.fileUrl}
                        alt={item.altText || item.title}
                        className={styles.thumbnail}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </td>
                    <td>
                      <strong>{item.title}</strong>
                      {item.description && (
                        <div className={styles.description}>{item.description.substring(0, 50)}...</div>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.badge} ${getPositionBadgeClass(item.position)}`}>
                        {item.position.charAt(0).toUpperCase() + item.position.slice(1)}
                      </span>
                    </td>
                    <td>{item.displayOrder}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadgeClass(item.status)}`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {item.fileType || 'N/A'}<br />
                        {formatFileSize(item.fileSize)}
                      </small>
                    </td>
                    <td>{new Date(item.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <Link
                          href={`/admin/media/edit/${item._id}`}
                          className={`${styles.btnAction} ${styles.btnEdit}`}
                        >
                          <i className="fa fa-edit"></i> Edit
                        </Link>
                        <button
                          className={`${styles.btnAction} ${styles.btnDelete}`}
                          onClick={() => handleDelete(item._id)}
                        >
                          <i className="fa fa-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
