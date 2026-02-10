'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './faqs.module.css';
import type { Faq } from '@/types/faq';

export default function AdminFaqsPage() {
  const router = useRouter();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [positionFilter, setPositionFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const params = new URLSearchParams({ page: String(currentPage), limit: '20' });
      if (positionFilter) params.set('position', positionFilter);
      const response = await fetch(`/api/admin/faqs?${params}`, {
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
        setError(data.message || 'Failed to fetch FAQs');
        setLoading(false);
        return;
      }
      setFaqs(data.faqs || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  }, [router, currentPage, positionFilter]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
      router.push('/admin/login');
      return;
    }
    fetchFaqs();
  }, [router, fetchFaqs]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) { router.push('/admin/login'); return; }
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!data.success) {
        if (response.status === 401) { router.push('/admin/login'); return; }
        alert(data.message || 'Failed to delete');
        return;
      }
      setSuccessMessage('FAQ deleted successfully.');
      fetchFaqs();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert('Failed to delete FAQ');
    }
  };

  if (!mounted) return null;

  return (
    <div className={styles.faqsPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>FAQs</h1>
        <Link href="/admin/faqs/create" className={styles.btnPrimary}>
          <i className="fa fa-plus"></i> Add FAQs (single or multiple)
        </Link>
      </div>
      {successMessage && <div className={styles.alertSuccess}>{successMessage}</div>}
      {error && <div className={styles.alertError}>{error}</div>}

      <div className={styles.filterBar}>
        <label>Position:</label>
        <select
          value={positionFilter}
          onChange={(e) => {
            setPositionFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All</option>
          <option value="home">Home</option>
          <option value="affiliate">Affiliate</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading FAQs...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa fa-question-circle"></i>
            <p>No FAQs found. Create FAQs for Home or Affiliate page.</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Position</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map((faq) => (
                  <tr key={faq.id}>
                    <td className={styles.questionCell} title={faq.question}>{faq.question}</td>
                    <td className={styles.answerCell} title={faq.answer}>{faq.answer}</td>
                    <td>{faq.position}</td>
                    <td>{faq.display_order}</td>
                    <td>
                      <span className={`${styles.badge} ${faq.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
                        {faq.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/faqs/edit/${faq.id}`} className={`${styles.btnAction} ${styles.btnEdit}`}>
                        <i className="fa fa-edit"></i> Edit
                      </Link>
                      <button
                        type="button"
                        className={`${styles.btnAction} ${styles.btnDelete}`}
                        onClick={() => handleDelete(faq.id)}
                      >
                        <i className="fa fa-trash"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  type="button"
                  className={styles.btnPagination}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className={styles.paginationInfo}>
                  Page {currentPage} of {totalPages} ({total} total)
                </span>
                <button
                  type="button"
                  className={styles.btnPagination}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
