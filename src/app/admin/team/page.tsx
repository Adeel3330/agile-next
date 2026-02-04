'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './team.module.css';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

interface TeamMember {
  _id: string;
  name: string;
  title: string;
  bio?: string;
  photoUrl: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  department?: string;
  created_at: string;
  updated_at: string;
}

interface TeamResponse {
  success: boolean;
  teamMembers?: TeamMember[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  message?: string;
}

export default function TeamPage() {
  const router = useRouter();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchTeamMembers = useCallback(async () => {
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
        ...(statusFilter && { status: statusFilter }),
        ...(departmentFilter && { department: departmentFilter })
      });

      const response = await fetch(`/api/admin/team?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: TeamResponse = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
          }
          router.push('/admin/login');
          return;
        }
        setError(data.message || 'Failed to fetch team members');
        setLoading(false);
        return;
      }

      setTeamMembers(data.teamMembers || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch team members error:', err);
      setError('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  }, [router, currentPage, searchTerm, statusFilter, departmentFilter]);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      fetchTeamMembers();
    }
  }, [router, fetchTeamMembers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTeamMembers();
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDepartmentChange = (department: string) => {
    setDepartmentFilter(department);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member? This action can be undone.')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await fetch(`/api/admin/team/${id}`, {
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
        alert(data.message || 'Failed to delete team member');
        return;
      }

      setSuccessMessage('Team member deleted successfully!');
      fetchTeamMembers();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete team member');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'active' ? styles.badgeActive : styles.badgeInactive;
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.teamPage}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Team Management</h1>
        <Link href="/admin/team/create" className={styles.btnPrimary}>
          <i className="fa fa-plus"></i>
          Add New Team Member
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
            placeholder="Search by name, title, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className={styles.statusFilter}
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            type="text"
            className={styles.departmentFilter}
            placeholder="Filter by department"
            value={departmentFilter}
            onChange={(e) => handleDepartmentChange(e.target.value)}
          />
          <button type="submit" className={styles.btnSearch}>
            <i className="fa fa-search"></i> Search
          </button>
        </form>
      </div>

      {/* Team Members Table */}
      <div className={styles.teamTableWrapper}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p className="mt-3 text-muted">Loading team members...</p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className={styles.emptyState}>
            <i className="fa fa-users"></i>
            <p>No team members found. Add your first team member!</p>
          </div>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <img
                        src={getCloudinaryImageUrl(member.photoUrl)}
                        alt={member.name}
                        className={styles.thumbnail}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </td>
                    <td>
                      <strong>{member.name}</strong>
                      {member.email && (
                        <div className={styles.email}>{member.email}</div>
                      )}
                    </td>
                    <td>{member.title}</td>
                    <td>{member.department || '-'}</td>
                    <td>{member.displayOrder}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadgeClass(member.status)}`}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(member.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <Link
                          href={`/admin/team/edit/${member._id}`}
                          className={`${styles.btnAction} ${styles.btnEdit}`}
                        >
                          <i className="fa fa-edit"></i> Edit
                        </Link>
                        <button
                          className={`${styles.btnAction} ${styles.btnDelete}`}
                          onClick={() => handleDelete(member._id)}
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
