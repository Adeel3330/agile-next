'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateMediaPage() {
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadedFileData, setUploadedFileData] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: 'home' as 'home' | 'services' | 'about' | 'contact' | 'other' | 'cta',
    status: 'active' as 'active' | 'inactive',
    displayOrder: 0,
    altText: '',
    linkUrl: ''
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
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

      const uploadResponse = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        setError(uploadData.message || 'Failed to upload image to Supabase Storage');
        setUploading(false);
        setPreviewUrl('');
        return;
      }

      // Store uploaded file data
      setUploadedFileData({
        url: uploadData.url,
        fileName: uploadData.fileName,
        fileSize: uploadData.fileSize,
        fileType: uploadData.fileType
      });
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
    
    if (!uploadedFileData) {
      setError('Please upload an image first');
      return;
    }

    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const submitData = {
        ...formData,
        fileUrl: uploadedFileData.url,
        fileName: uploadedFileData.fileName,
        fileSize: uploadedFileData.fileSize,
        fileType: uploadedFileData.fileType
      };

      const response = await fetch('/api/admin/media', {
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
        setError(data.message || 'Failed to create media item');
        setLoading(false);
        return;
      }

      router.push('/admin/media');
      router.refresh();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to create media item');
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
            <h1 className="h4 mb-0 text-white">Create New Media</h1>
          </div>

          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Row 1: Title, Position, Status (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter media title"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Position *</label>
                  <select
                    className="form-select"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                    required
                  >
                    <option value="home">Home</option>
                    <option value="services">Services</option>
                    <option value="about">About</option>
                    <option value="contact">Contact</option>
                    <option value="cta">CTA</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Display Order, Alt Text, Link URL (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Display Order</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    min="0"
                    placeholder="0"
                  />
                  <small className="text-muted">Lower numbers appear first</small>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Alt Text</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.altText}
                    onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                    placeholder="Image alt text for accessibility"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Link URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                  <small className="text-muted">Optional link when image is clicked</small>
                </div>
              </div>

              {/* Row 3: Image Upload */}
              <div className="row mb-3">
                <div className="col-md-8">
                  <label className="form-label">Image *</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    required
                  />
                  {uploading && (
                    <small className="text-muted d-block mt-1">
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Uploading to Supabase Storage...
                    </small>
                  )}
                  {previewUrl && !uploading && (
                    <div className="mt-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxHeight: '200px', maxWidth: '100%' }}
                      />
                      {uploadedFileData && (
                        <small className="text-success d-block mt-1">
                          <i className="fa fa-check-circle me-1"></i> Uploaded successfully
                        </small>
                      )}
                    </div>
                  )}
                  <small className="text-muted d-block mt-1">
                    Upload an image file (max 10MB). Supported formats: JPG, PNG, GIF, WebP
                  </small>
                </div>
              </div>

              {/* Row 4: Description (spans 2 columns) */}
              <div className="row mb-3">
                <div className="col-md-8">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Enter media description"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link href="/admin/media" className="theme-btn btn-two rounded-1 px-3 py-2">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="theme-btn btn-one rounded-1 px-3 py-2"
                  disabled={loading || uploading || !uploadedFileData}
                >
                  {loading ? (
                    <>
                      <p className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></p>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-save me-2"></i> Create Media
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
