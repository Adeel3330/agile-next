'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface PageVersion {
  _id: string;
  pageId: string;
  versionNumber: number;
  title: string;
  slug: string;
  content?: string;
  sections?: any[];
  status: string;
  changeNote?: string;
  created_at: string;
}

export default function PageVersionsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      fetchVersions();
    }
  }, [router, id]);

  const fetchVersions = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/pages/${id}/versions`, {
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
        setError(data.message || 'Failed to fetch versions');
        setLoading(false);
        return;
      }

      setVersions(data.versions || []);
      setLoading(false);
    } catch (err) {
      console.error('Fetch versions error:', err);
      setError('Failed to fetch versions');
      setLoading(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version? This will replace the current page content.')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/pages/${id}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ versionId })
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
        alert(data.message || 'Failed to restore version');
        return;
      }

      setSuccessMessage('Version restored successfully!');
      setTimeout(() => {
        router.push('/admin/pages');
      }, 1500);
    } catch (err) {
      console.error('Restore error:', err);
      alert('Failed to restore version');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid">
        <div className="card shadow-lg border-0">
          <div className="card-header border-0 bg-theme-one p-3 d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0 text-white">Page Versions</h1>
            <Link href="/admin/pages" className="btn btn-light btn-sm">
              <i className="fa fa-arrow-left me-2"></i> Back to Pages
            </Link>
          </div>

          <div className="card-body p-4">
            {successMessage && (
              <div className="alert alert-success" role="alert">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading versions...</p>
              </div>
            ) : versions.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa fa-history fa-3x text-muted mb-3"></i>
                <p className="text-muted">No versions found for this page.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Version</th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Change Note</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {versions.map((version) => (
                      <tr key={version._id}>
                        <td>
                          <span className="badge bg-secondary">v{version.versionNumber}</span>
                        </td>
                        <td>{version.title}</td>
                        <td>
                          <span className={`badge ${
                            version.status === 'published' ? 'bg-success' :
                            version.status === 'draft' ? 'bg-warning' :
                            'bg-secondary'
                          }`}>
                            {version.status}
                          </span>
                        </td>
                        <td>{version.changeNote || '-'}</td>
                        <td>{new Date(version.created_at).toLocaleString()}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleRestore(version._id)}
                          >
                            <i className="fa fa-undo me-1"></i> Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
