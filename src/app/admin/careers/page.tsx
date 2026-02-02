'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './careers.module.css';

interface Career {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  status: 'active' | 'closed' | 'open' | 'draft';
  created_at: string;
  updated_at: string;
}

interface CareersResponse {
  success: boolean;
  careers?: Career[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  message?: string;
}

export default function CareersPage() {
  const router = useRouter();
  
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCareers = useCallback(async () => {
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

      const response = await fetch(`/api/admin/careers?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: CareersResponse = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
          }
          router.push('/admin/login');
          return;
        }
        setError(data.message || 'Failed to fetch careers');
        setLoading(false);
        return;
      }

      // Map backend status 'open' to frontend 'active' for display
      const mappedCareers = (data.careers || []).map((career: Career) => ({
        ...career,
        status: career.status === 'open' ? 'active' : career.status
      }));
      setCareers(mappedCareers);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch careers error:', err);
      setError('Failed to fetch careers');
    } finally {
      setLoading(false);
    }
  }, [router, currentPage, searchTerm]);

  useEffect(() => {
    setMounted(true);
    
    // Only access localStorage in useEffect (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      fetchCareers();
    }
  }, [router, fetchCareers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCareers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this career?')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await fetch(`/api/admin/careers/${id}`, {
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
        alert(data.message || 'Failed to delete career');
        return;
      }

      setSuccessMessage('Career deleted successfully!');
      fetchCareers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete career');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.careersPage}>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Careers Development</h1>
        <Link href="/admin/careers/create" className={styles.btnPrimary}>
          <i className="fa fa-plus"></i>
          Add New Career
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
            placeholder="Search by title, department, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className={styles.btnSearch}>
            <i className="fa fa-search"></i> Search
          </button>
        </form>
      </div>

      {/* Careers Table */}
      <div className={styles.careersTableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className="mt-3 text-muted">Loading careers...</p>
          </div>
        ) : careers.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa fa-briefcase"></i>
            <p>No careers found. Create your first career opportunity!</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {careers.map((career) => (
                  <tr key={career._id}>
                    <td>{career.title}</td>
                    <td>{career.department}</td>
                    <td>{career.location}</td>
                    <td>{career.type}</td>
                    <td>
                      <span className={`${styles.badge} ${career.status === 'open' || career.status === 'active' ? styles.badgeActive : styles.badgeClosed}`}>
                        {(career.status === 'open' ? 'active' : career.status).charAt(0).toUpperCase() + (career.status === 'open' ? 'active' : career.status).slice(1)}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/admin/careers/edit/${career.id}`}
                        className={`${styles.btnAction} ${styles.btnEdit}`}
                      >
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <button
                        className={`${styles.btnAction} ${styles.btnDelete}`}
                        onClick={() => handleDelete(career.id)}
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>
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
