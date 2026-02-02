'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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

export default function EditAffiliatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    website: '',
    commissionRate: '10.00',
    status: 'pending' as 'pending' | 'active' | 'inactive' | 'blocked',
    notes: ''
  });

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      fetchAffiliate();
    }
  }, [router, id]);

  const fetchAffiliate = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/affiliates/${id}`, {
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
        setError(data.message || 'Failed to fetch affiliate');
        setLoading(false);
        return;
      }

      const affiliate: Affiliate = data.affiliate;
      setFormData({
        name: affiliate.name,
        email: affiliate.email,
        phone: affiliate.phone || '',
        companyName: affiliate.companyName || '',
        website: affiliate.website || '',
        commissionRate: affiliate.commissionRate.toString(),
        status: affiliate.status,
        notes: affiliate.notes || ''
      });
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch affiliate');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/affiliates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
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
        setError(data.message || 'Failed to update affiliate');
        setSaving(false);
        return;
      }

      router.push('/admin/affiliates');
      router.refresh();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to update affiliate');
      setSaving(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-light min-vh-100 py-4">
        <div className="container-fluid">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted">Loading affiliate...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid">
        <div className="card shadow-lg border-0">
          <div className="card-header border-0 bg-theme-one p-3 d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0 text-white">Edit Affiliate</h1>
          </div>

          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Row 1: Name, Email, Phone (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter affiliate name"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="Enter email address"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Row 2: Company Name, Website, Commission Rate (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Website</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Commission Rate (%) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="10.00"
                  />
                </div>
              </div>

              {/* Row 3: Status (1 field) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'active' | 'inactive' | 'blocked' })}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>

              {/* Row 4: Notes (spans 2 columns) */}
              <div className="row mb-3">
                <div className="col-md-8">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    placeholder="Enter any additional notes about this affiliate"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link href="/admin/affiliates" className="theme-btn btn-two rounded-1 px-3 py-2">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="theme-btn btn-one rounded-1 px-3 py-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-save me-2"></i> Update Affiliate
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
