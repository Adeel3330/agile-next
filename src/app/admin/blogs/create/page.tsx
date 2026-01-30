'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateBlogPage() {
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    file: '',
    seoTitle: '',
    seoContent: ''
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
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title: title,
      slug: title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setUploading(true);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Upload to Cloudinary immediately
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
          setError(uploadData.message || 'Failed to upload file to Cloudinary');
          setUploading(false);
          return;
        }

        // Store Cloudinary URL in state
        setCloudinaryUrl(uploadData.url);
        setFormData(prev => ({ ...prev, file: uploadData.url }));
        setUploading(false);
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload file to Cloudinary. Please try again.');
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate that file is uploaded to Cloudinary
    if (!formData.file || !cloudinaryUrl) {
      setError('Please upload a file first. Files must be uploaded to Cloudinary.');
      return;
    }

    // Ensure we use the Cloudinary URL
    const fileUrl = cloudinaryUrl || formData.file;
    
    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const submitData = {
        ...formData,
        file: fileUrl // Cloudinary URL
      };

      const response = await fetch('/api/admin/blogs', {
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
        setError(data.message || 'Failed to create blog');
        setLoading(false);
        return;
      }

      router.push('/admin/blogs');
      router.refresh();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to create blog');
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
            <h1 className="h4 mb-0 text-white">Create New Blog</h1>
          </div>

          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Row 1: Title, Slug, SEO Title (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={handleTitleChange}
                    required
                    placeholder="Enter blog title"
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
                    placeholder="blog-slug"
                  />
                  <small className="form-text text-muted">
                    URL-friendly version (auto-generated from title)
                  </small>
                </div>

                <div className="col-md-4">
                  <label className="form-label">SEO Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="Enter SEO title"
                    maxLength={200}
                  />
                  <small className="form-text text-muted">
                    {formData.seoTitle.length}/200
                  </small>
                </div>
              </div>

              {/* Row 2: File (full width) */}
              <div className="row mb-3">
                <div className="col-md-12">

                  <label className="form-label">File *</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                    disabled={uploading}
                  />
                  <small className="form-text text-muted">
                    {uploading ? 'Uploading to Cloudinary...' : 'Select an image file (will be uploaded to Cloudinary)'}
                  </small>
                  {cloudinaryUrl && (
                    <div className="alert alert-success mt-2 py-1 px-2" role="alert">
                      <small>✓ File uploaded to Cloudinary</small>
                    </div>
                  )}
                  
                  {previewUrl && (
                    <div className="mt-2">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="img-fluid rounded border" 
                        onError={() => setPreviewUrl('')} 
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: SEO Content (full width) */}
              <div className="row mb-3">
                <div className="col-md-12">
                  <label className="form-label">SEO Content</label>
                  <textarea
                    className="form-control"
                    value={formData.seoContent}
                    onChange={(e) => setFormData({ ...formData, seoContent: e.target.value })}
                    rows={4}
                    placeholder="Enter SEO content"
                    maxLength={500}
                  />
                  <small className="form-text text-muted">
                    {formData.seoContent.length}/500
                  </small>
                </div>
              </div>

              {/* Row 4: Description, Content (2 fields - description last) */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-control"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    placeholder="Enter blog content"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    placeholder="Enter blog description"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link href="/admin/blogs" className="theme-btn btn-two rounded-1 px-3 py-2">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="theme-btn btn-one rounded-1 px-3 py-2"
                  disabled={loading || uploading || !cloudinaryUrl}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-save me-2"></i> Create Blog
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
