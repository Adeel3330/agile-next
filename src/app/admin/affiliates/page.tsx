'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './affiliates.module.css';

interface Affiliate {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  website?: string;
  affiliateCode: string;
  commissionRate: number;
  status: 'pending' | 'active' | 'inactive' | 'blocked';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface AffiliatesResponse {
  success: boolean;
  affiliates?: Affiliate[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  message?: string;
}

export default function AffiliatesPage() {
  const router = useRouter();
  
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAffiliates = useCallback(async () => {
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

      const response = await fetch(`/api/admin/affiliates?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: AffiliatesResponse = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
          }
          router.push('/admin/login');
          return;
        }
        setError(data.message || 'Failed to fetch affiliates');
        setLoading(false);
        return;
      }

      setAffiliates(data.affiliates || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch affiliates error:', err);
      setError('Failed to fetch affiliates');
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

      fetchAffiliates();
    }
  }, [router, fetchAffiliates]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAffiliates();
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await fetch(`/api/admin/affiliates/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
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
        alert(data.message || 'Failed to update affiliate status');
        return;
      }

      setSuccessMessage('Affiliate status updated successfully!');
      fetchAffiliates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Update status error:', err);
      alert('Failed to update affiliate status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this affiliate? This action can be undone.')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await fetch(`/api/admin/affiliates/${id}`, {
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
        alert(data.message || 'Failed to delete affiliate');
        return;
      }

      setSuccessMessage('Affiliate deleted successfully!');
      fetchAffiliates();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete affiliate');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return styles.badgeActive;
      case 'pending':
        return styles.badgePending;
      case 'inactive':
        return styles.badgeInactive;
      case 'blocked':
        return styles.badgeBlocked;
      default:
        return styles.badgePending;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.affiliatesPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Affiliates</h1>
        <Link href="/admin/affiliates/create" className={styles.btnPrimary}>
          <i className="fa fa-plus"></i>
          Add New Affiliate
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
            placeholder="Search by name, email, affiliate code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.statusFilter}
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
          <button type="submit" className={styles.btnSearch}>
            <i className="fa fa-search"></i> Search
          </button>
        </form>
      </div>

      {/* Affiliates Table */}
      <div className={styles.affiliatesTableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className="mt-3 text-muted">Loading affiliates...</p>
          </div>
        ) : affiliates.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa fa-handshake"></i>
            <p>No affiliates found. Create your first affiliate partner!</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Affiliate Code</th>
                  <th>Company</th>
                  <th>Commission Rate</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((affiliate) => (
                  <tr key={affiliate._id}>
                    <td>{affiliate.name}</td>
                    <td>{affiliate.email}</td>
                    <td>
                      <code className={styles.codeBadge}>{affiliate.affiliateCode}</code>
                    </td>
                    <td>{affiliate.companyName || '-'}</td>
                    <td>{affiliate.commissionRate}%</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadgeClass(affiliate.status)}`}>
                        {affiliate.status.charAt(0).toUpperCase() + affiliate.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <select
                          className={styles.statusSelect}
                          value={affiliate.status}
                          onChange={(e) => handleStatusUpdate(affiliate._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="blocked">Blocked</option>
                        </select>
                        <Link
                          href={`/admin/affiliates/edit/${affiliate._id}`}
                          className={`${styles.btnAction} ${styles.btnEdit}`}
                        >
                          <i className="fa fa-edit"></i> Edit
                        </Link>
                        <button
                          className={`${styles.btnAction} ${styles.btnDelete}`}
                          onClick={() => handleDelete(affiliate._id)}
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
