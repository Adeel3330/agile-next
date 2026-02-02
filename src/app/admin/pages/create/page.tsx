'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

export default function CreatePagePage() {
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    sections: '[]',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoImage: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    template: ''
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

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setUploading(true);
    setError('');

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        setError('Authentication required');
        setUploading(false);
        return;
      }

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const uploadResponse = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        setError(uploadData.message || 'Failed to upload image to Cloudinary');
        setUploading(false);
        setPreviewUrl('');
        return;
      }

      // Store Cloudinary URL
      setCloudinaryUrl(uploadData.url);
      setFormData(prev => ({ ...prev, seoImage: uploadData.url }));
      setUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
      setUploading(false);
      setPreviewUrl('');
    }
  };

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

      // Parse sections JSON
      let sections = [];
      try {
        sections = JSON.parse(formData.sections || '[]');
      } catch (err) {
        setError('Invalid sections JSON format');
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        sections,
        seoImage: cloudinaryUrl || formData.seoImage // Use Cloudinary URL if available
      };

      const response = await fetch('/api/admin/pages', {
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
        setError(data.message || 'Failed to create page');
        setLoading(false);
        return;
      }

      router.push('/admin/pages');
      router.refresh();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to create page');
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
            <h1 className="h4 mb-0 text-white">Create New Page</h1>
          </div>

          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Row 1: Title, Slug, Template (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter page title"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Slug *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    placeholder="page-slug"
                  />
                  <small className="text-muted">URL-friendly identifier (auto-generated from title)</small>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Template</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.template}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                    placeholder="e.g., about, contact"
                  />
                  <small className="text-muted">Template identifier for frontend</small>
                </div>
              </div>

              {/* Row 2: Status (1 field) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Row 3: SEO Title, SEO Description, SEO Keywords (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">SEO Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="SEO meta title"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">SEO Keywords</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.seoKeywords}
                    onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">SEO Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                  {uploading && (
                    <small className="text-muted d-block mt-1">
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Uploading...
                    </small>
                  )}
                  {previewUrl && !uploading && (
                    <div className="mt-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxHeight: '150px', maxWidth: '100%' }}
                      />
                      {cloudinaryUrl && (
                        <small className="text-success d-block mt-1">
                          <i className="fa fa-check-circle me-1"></i> Uploaded successfully
                        </small>
                      )}
                    </div>
                  )}
                  {cloudinaryUrl && (
                    <input
                      type="hidden"
                      value={cloudinaryUrl}
                    />
                  )}
                  <small className="text-muted d-block mt-1">
                    Upload an image for SEO/Open Graph preview
                  </small>
                </div>
              </div>

              {/* Row 4: SEO Description (spans 2 columns) */}
              <div className="row mb-3">
                <div className="col-md-8">
                  <label className="form-label">SEO Description</label>
                  <textarea
                    className="form-control"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    rows={3}
                    placeholder="SEO meta description"
                  />
                </div>
              </div>

              {/* Row 5: Content (spans 2 columns) */}
              <div className="row mb-3">
                <div className="col-md-8">
                  <label className="form-label">Content</label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder="Enter page content"
                    height="300px"
                  />
                </div>
              </div>

              {/* Row 6: Sections JSON (spans 2 columns) */}
              <div className="row mb-3">
                <div className="col-md-8">
                  <label className="form-label">Sections (JSON)</label>
                  <textarea
                    className="form-control"
                    value={formData.sections}
                    onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                    rows={6}
                    placeholder='[{"type": "hero", "title": "Welcome"}, {"type": "content", "content": "..."}]'
                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                  />
                  <small className="text-muted">
                    JSON array of section objects. See documentation for structure.
                  </small>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link href="/admin/pages" className="theme-btn btn-two rounded-1 px-3 py-2">
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
                      <i className="fa fa-save me-2"></i> Create Page
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
