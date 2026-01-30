'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateCareerPage() {
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: '',
    description: '',
    requirements: '',
    status: 'active' as 'active' | 'closed'
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      // Map frontend 'active' to backend 'open' before sending
      const submitData = {
        ...formData,
        status: formData.status === 'active' ? 'open' : formData.status
      };

      const response = await fetch('/api/admin/careers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
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
        setError(data.message || 'Failed to create career');
        setLoading(false);
        return;
      }

      router.push('/admin/careers');
      router.refresh();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to create career');
      setLoading(false);
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
            <h1 className="h4 mb-0 text-white">Create New Career</h1>
          </div>

          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Row 1: Title, Department, Location (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter career title"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Department *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    placeholder="Enter department"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                    placeholder="Enter location"
                  />
                </div>
              </div>

              {/* Row 2: Type, Status (2 fields) */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'closed' })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Description, Requirements (2 fields) */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    required
                    placeholder="Enter job description"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Requirements *</label>
                  <textarea
                    className="form-control"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    rows={4}
                    required
                    placeholder="Enter job requirements"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link href="/admin/careers" className="theme-btn btn-two rounded-1 px-3 py-2">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="theme-btn btn-one rounded-1 px-3 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-save me-2"></i> Create Career
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
