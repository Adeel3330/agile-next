'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './pages.module.css';

interface Page {
  _id: string;
  title: string;
  slug: string;
  content?: string;
  sections?: any[];
  seoTitle?: string;
  seoDescription?: string;
  status: 'draft' | 'published' | 'archived';
  template?: string;
  publishedAt?: string;
  created_at: string;
  updated_at: string;
}

interface PagesResponse {
  success: boolean;
  pages?: Page[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  message?: string;
}

export default function PagesPage() {
  const router = useRouter();
  
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchPages = useCallback(async () => {
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
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/pages?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: PagesResponse = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
          }
          router.push('/admin/login');
          return;
        }
        setError(data.message || 'Failed to fetch pages');
        setLoading(false);
        return;
      }

      setPages(data.pages || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch pages error:', err);
      setError('Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  }, [router, currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      fetchPages();
    }
  }, [router, fetchPages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPages();
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page? This action can be undone.')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await fetch(`/api/admin/pages/${id}`, {
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
        alert(data.message || 'Failed to delete page');
        return;
      }

      setSuccessMessage('Page deleted successfully!');
      fetchPages();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete page');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return styles.badgeActive;
      case 'draft':
        return styles.badgePending;
      case 'archived':
        return styles.badgeInactive;
      default:
        return styles.badgePending;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.pagesPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Pages CMS</h1>
        <Link href="/admin/pages/create" className={styles.btnPrimary}>
          <i className="fa fa-plus"></i>
          Add New Page
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
            placeholder="Search by title, slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.statusFilter}
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <button type="submit" className={styles.btnSearch}>
            <i className="fa fa-search"></i> Search
          </button>
        </form>
      </div>

      {/* Pages Table */}
      <div className={styles.pagesTableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className="mt-3 text-muted">Loading pages...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa fa-file-alt"></i>
            <p>No pages found. Create your first page!</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Template</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page._id}>
                    <td>{page.title}</td>
                    <td>
                      <code className={styles.codeBadge}>{page.slug}</code>
                    </td>
                    <td>{page.template || '-'}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadgeClass(page.status)}`}>
                        {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(page.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <Link
                          href={`/admin/pages/edit/${page._id}`}
                          className={`${styles.btnAction} ${styles.btnEdit}`}
                        >
                          <i className="fa fa-edit"></i> Edit
                        </Link>
                        <Link
                          href={`/admin/pages/${page._id}/versions`}
                          className={`${styles.btnAction} ${styles.btnVersions}`}
                        >
                          <i className="fa fa-history"></i> Versions
                        </Link>
                        <button
                          className={`${styles.btnAction} ${styles.btnDelete}`}
                          onClick={() => handleDelete(page._id)}
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
