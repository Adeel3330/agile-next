'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { Faq } from '@/types/faq';

export default function EditFaqPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ question: '', answer: '', position: 'home' as 'home' | 'affiliate', display_order: 0, status: 'active' as 'active' | 'inactive' });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
      router.push('/admin/login');
      return;
    }
    if (!id) return;
    (async () => {
      setFetching(true);
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) { router.push('/admin/login'); return; }
        const response = await fetch(`/api/admin/faqs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!data.success) {
          if (response.status === 401) router.push('/admin/login');
          else setError(data.message || 'FAQ not found');
          setFetching(false);
          return;
        }
        const faq: Faq = data.faq;
        setForm({
          question: faq.question || '',
          answer: faq.answer || '',
          position: faq.position === 'affiliate' ? 'affiliate' : 'home',
          display_order: faq.display_order ?? 0,
          status: faq.status === 'inactive' ? 'inactive' : 'active',
        });
      } catch (err) {
        setError('Failed to load FAQ');
      } finally {
        setFetching(false);
      }
    })();
  }, [router, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setError('Question and answer are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) { router.push('/admin/login'); return; }
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!data.success) {
        if (response.status === 401) router.push('/admin/login');
        else setError(data.message || 'Update failed');
        setLoading(false);
        return;
      }
      router.push('/admin/faqs');
      router.refresh();
    } catch (err) {
      setError('Failed to update FAQ');
      setLoading(false);
    }
  };

  if (!mounted) return null;
  if (fetching) return <div className="p-5 text-center">Loading...</div>;

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid">
        <div className="card shadow-lg border-0">
          <div className="card-header border-0 bg-theme-one p-3 d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0 text-white">Edit FAQ</h1>
            <Link href="/admin/faqs" className="btn btn-light btn-sm">Back to list</Link>
          </div>
          <div className="card-body p-4">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Question *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.question}
                  onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Answer *</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={form.answer}
                  onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                  required
                />
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Position</label>
                  <select
                    className="form-select"
                    value={form.position}
                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value as 'home' | 'affiliate' }))}
                  >
                    <option value="home">Home</option>
                    <option value="affiliate">Affiliate</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Display order</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.display_order}
                    onChange={(e) => setForm((f) => ({ ...f, display_order: parseInt(e.target.value, 10) || 0 }))}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as 'active' | 'inactive' }))}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link href="/admin/faqs" className="btn btn-secondary">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
