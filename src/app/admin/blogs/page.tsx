'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../sliders/sliders.module.css';
import { isCloudinaryUrl, getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

// Placeholder SVG as data URI (no static files - all images from Cloudinary)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  file: string;
  seoTitle?: string;
  seoContent?: string;
  created_at: string;
  updated_at: string;
}

interface BlogsResponse {
  success: boolean;
  blogs?: Blog[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  message?: string;
}

export default function BlogsPage() {
  const router = useRouter();
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
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

  const fetchBlogs = useCallback(async () => {
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

      const response = await fetch(`/api/admin/blogs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: BlogsResponse = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
          }
          router.push('/admin/login');
          return;
        }
        setError(data.message || 'Failed to fetch blogs');
        setLoading(false);
        return;
      }

      setBlogs(data.blogs || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch blogs error:', err);
      setError('Failed to fetch blogs');
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

      fetchBlogs();
    }
  }, [router, fetchBlogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog? This action can be undone.')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await fetch(`/api/admin/blogs/${id}`, {
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
        alert(data.message || 'Failed to delete blog');
        return;
      }

      setSuccessMessage('Blog deleted successfully!');
      fetchBlogs();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete blog');
    }
  };

  const memoizedBlogs = useMemo(() => blogs, [blogs]);

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.slidersPage}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Blogs Management</h1>
        <Link href="/admin/blogs/create" className={styles.btnPrimary}>
          <i className="fa fa-plus"></i>
          Add New Blog
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

      <div className={styles.slidersTableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className="mt-3 text-muted">Loading blogs...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa fa-newspaper"></i>
            <p>No blogs found. Create your first blog!</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>SEO Title</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {memoizedBlogs.map((blog) => {
                  // Check if file is a static path - reject these
                  const isStaticPath = blog.file && (
                    blog.file.includes('placeholder.jpg') ||
                    blog.file.includes('/assets/images/') ||
                    blog.file.startsWith('/assets/') ||
                    blog.file.startsWith('assets/')
                  );
                  
                  // Check if this image has already failed
                  const hasFailed = failedImages.current.has(blog._id);
                  
                  // Validate Cloudinary URL or use placeholder
                  const isValidCloudinaryUrl = !isStaticPath && !hasFailed && isCloudinaryUrl(blog.file);
                  
                  // Use optimized Cloudinary URL for thumbnails (80px width) or placeholder
                  const imageSrc = isValidCloudinaryUrl 
                    ? getCloudinaryImageUrl(blog.file, 80, 60, 'auto')
                    : PLACEHOLDER_IMAGE;
                  
                  return (
                    <tr key={blog._id}>
                      <td>
                        <img 
                          src={imageSrc} 
                          alt={blog.title}
                          className={styles.previewImage}
                          loading="lazy"
                          onError={(e) => {
                            // Prevent infinite loop - only handle error once per blog
                            if (failedImages.current.has(blog._id)) {
                              return;
                            }
                            
                            const target = e.target as HTMLImageElement;
                            const currentSrc = target.src || '';
                            
                            // Check if already placeholder
                            const isAlreadyPlaceholder = currentSrc.includes('data:image/svg+xml') || 
                                                         currentSrc === PLACEHOLDER_IMAGE ||
                                                         currentSrc.includes('placeholder');
                            
                            if (!isAlreadyPlaceholder) {
                              target.src = PLACEHOLDER_IMAGE;
                            }
                            
                            // Mark as failed and disable all error handlers
                            failedImages.current.add(blog._id);
                            target.onerror = null;
                            if (e.currentTarget) {
                              e.currentTarget.onerror = null;
                            }
                            
                            e.stopPropagation();
                          }}
                        />
                      </td>
                      <td>
                        <div className={styles.titleCell}>
                          <strong>{blog.title}</strong>
                          {blog.description && (
                            <p className={styles.descriptionText}>{blog.description.substring(0, 50)}...</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <code style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '3px', fontSize: '12px' }}>
                          {blog.slug}
                        </code>
                      </td>
                      <td>{blog.seoTitle || '-'}</td>
                      <td>
                        {new Date(blog.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Link
                          href={`/admin/blogs/edit/${blog._id}`}
                          className={`${styles.btnAction} ${styles.btnEdit}`}
                        >
                          <i className="fa fa-edit"></i> Edit
                        </Link>
                        <button
                          className={`${styles.btnAction} ${styles.btnDelete}`}
                          onClick={() => handleDelete(blog._id)}
                        >
                          <i className="fa fa-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

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
