'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './services.module.css';

interface Service {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  status: 'active' | 'inactive';
  displayOrder: number;
  created_at: string;
  updated_at: string;
}

interface ServicesResponse {
  success: boolean;
  services?: Service[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  message?: string;
}

export default function ServicesPage() {
  const router = useRouter();
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) return;

      const response = await fetch('/api/admin/service-categories?limit=100&parent=null', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories.map((cat: any) => ({ id: cat._id, name: cat.name })));
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchServices = useCallback(async () => {
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
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await fetch(`/api/admin/services?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: ServicesResponse = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
          }
          router.push('/admin/login');
          return;
        }
        setError(data.message || 'Failed to fetch services');
        setLoading(false);
        return;
      }

      setServices(data.services || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch services error:', err);
      setError('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, [router, currentPage, searchTerm, selectedCategory]);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }
    }
    fetchCategories();
  }, [router, fetchCategories]);

  useEffect(() => {
    if (mounted) {
      fetchServices();
    }
  }, [mounted, fetchServices]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/services/${id}`, {
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
        alert(data.message || 'Failed to delete service');
        return;
      }

      setSuccessMessage('Service deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchServices();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete service');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchServices();
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.servicesPage}>
      <div className="container-fluid p-4">
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Services Management</h1>
          <Link href="/admin/services/create" className={styles.btnPrimary}>
            <i className="fa fa-plus"></i> Create Service
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

        {/* Search and Filter Bar */}
        <div className={styles.searchBar}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search services by title, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className={styles.searchInput}
              style={{ maxWidth: '200px' }}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button type="submit" className={styles.btnSearch}>
              <i className="fa fa-search"></i> Search
            </button>
          </form>
        </div>

        {/* Services Table */}
        <div className={styles.servicesTableWrapper}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p className="mt-3 text-muted">Loading services...</p>
            </div>
          ) : services.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="fa fa-briefcase"></i>
              <p>No services found. Create your first service!</p>
            </div>
          ) : (
            <>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service._id}>
                      <td>{service.title}</td>
                      <td>{service.category?.name || 'Uncategorized'}</td>
                      <td>{service.displayOrder}</td>
                      <td>
                        <span className={`${styles.badge} ${service.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
                          {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/admin/services/edit/${service._id}`}
                          className={`${styles.btnAction} ${styles.btnEdit}`}
                        >
                          <i className="fa fa-edit"></i> Edit
                        </Link>
                        <button
                          className={`${styles.btnAction} ${styles.btnDelete}`}
                          onClick={() => handleDelete(service._id)}
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
