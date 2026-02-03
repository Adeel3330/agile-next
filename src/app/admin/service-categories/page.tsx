'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './service-categories.module.css';

interface ServiceCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parentName?: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface CategoriesResponse {
  success: boolean;
  categories?: ServiceCategory[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  message?: string;
}

export default function ServiceCategoriesPage() {
  const router = useRouter();
  
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCategories = useCallback(async () => {
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

      const response = await fetch(`/api/admin/service-categories?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: CategoriesResponse = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
          }
          router.push('/admin/login');
          return;
        }
        setError(data.message || 'Failed to fetch service categories');
        setLoading(false);
        return;
      }

      setCategories(data.categories || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch categories error:', err);
      setError('Failed to fetch service categories');
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
    }
  }, [router]);

  useEffect(() => {
    if (mounted) {
      fetchCategories();
    }
  }, [mounted, fetchCategories]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/service-categories/${id}`, {
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
        alert(data.message || 'Failed to delete category');
        return;
      }

      setSuccessMessage('Category deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchCategories();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete category');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCategories();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.categoriesPage}>
      <div className="container-fluid p-4">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Service Categories</h1>
          <Link href="/admin/service-categories/create" className={styles.btnPrimary}>
            <i className="fa fa-plus"></i> Create Category
          </Link>
        </div>

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
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search categories by name, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className={styles.btnSearch}>
              <i className="fa fa-search"></i> Search
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div className={styles.categoriesTableWrapper}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className="mt-3 text-muted">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="fa fa-folder"></i>
              <p>No categories found. Create your first category!</p>
            </div>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Parent</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id}>
                      <td>{category.name}</td>
                      <td>{category.parentName || '—'}</td>
                      <td>{category.displayOrder}</td>
                      <td>
                        <span className={`${styles.badge} ${category.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
                          {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/admin/service-categories/edit/${category._id}`}
                          className={`${styles.btnAction} ${styles.btnEdit}`}
                        >
                          <i className="fa fa-edit"></i> Edit
                        </Link>
                        <button
                          className={`${styles.btnAction} ${styles.btnDelete}`}
                          onClick={() => handleDelete(category._id)}
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
    </div>
  );
}
