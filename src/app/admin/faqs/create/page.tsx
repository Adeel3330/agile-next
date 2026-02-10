'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type FaqRow = { question: string; answer: string; position: 'home' | 'affiliate' };

const emptyRow: FaqRow = { question: '', answer: '', position: 'home' };

export default function CreateFaqsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState<FaqRow[]>([{ ...emptyRow }]);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && !localStorage.getItem('adminToken')) {
      router.push('/admin/login');
    }
  }, [router]);

  const addRow = () => setRows((r) => [...r, { ...emptyRow }]);
  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((r) => r.filter((_, i) => i !== index));
  };
  const updateRow = (index: number, field: keyof FaqRow, value: string) => {
    setRows((r) => {
      const next = [...r];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const valid = rows.filter((r) => r.question.trim() && r.answer.trim());
    if (valid.length === 0) {
      setError('At least one FAQ must have both question and answer.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) { router.push('/admin/login'); return; }
      const body = valid.length === 1
        ? { question: valid[0].question.trim(), answer: valid[0].answer.trim(), position: valid[0].position }
        : { faqs: valid.map((r, i) => ({ question: r.question.trim(), answer: r.answer.trim(), position: r.position, display_order: i })) };
      const response = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!data.success) {
        if (response.status === 401) { router.push('/admin/login'); return; }
        setError(data.message || 'Failed to create FAQs');
        setLoading(false);
        return;
      }
      router.push('/admin/faqs');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Failed to create FAQs');
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid">
        <div className="card shadow-lg border-0">
          <div className="card-header border-0 bg-theme-one p-3 d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0 text-white">Create FAQs (single or multiple)</h1>
            <Link href="/admin/faqs" className="btn btn-light btn-sm">Back to list</Link>
          </div>
          <div className="card-body p-4">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              {rows.map((row, index) => (
                <div key={index} className="border rounded p-3 mb-3 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>FAQ #{index + 1}</strong>
                    {rows.length > 1 && (
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeRow(index)}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="row g-2">
                    <div className="col-12">
                      <label className="form-label">Question *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={row.question}
                        onChange={(e) => updateRow(index, 'question', e.target.value)}
                        placeholder="e.g. How are referrals tracked?"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Answer *</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={row.answer}
                        onChange={(e) => updateRow(index, 'answer', e.target.value)}
                        placeholder="Answer text..."
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Position</label>
                      <select
                        className="form-select"
                        value={row.position}
                        onChange={(e) => updateRow(index, 'position', e.target.value as 'home' | 'affiliate')}
                      >
                        <option value="home">Home</option>
                        <option value="affiliate">Affiliate</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mb-3">
                <button type="button" className="btn btn-outline-primary" onClick={addRow}>
                  <i className="fa fa-plus me-1"></i> Add another FAQ
                </button>
              </div>
              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link href="/admin/faqs" className="btn btn-secondary">Cancel</Link>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create FAQ(s)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
