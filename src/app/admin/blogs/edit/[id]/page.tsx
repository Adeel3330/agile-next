'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface Blog {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  file: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  seoTitle?: string;
  seoContent?: string;
  created_at: string;
  updated_at: string;
}


export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    file: '',
    seoTitle: '',
    seoContent: '',
    categoryId: ''
  });

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      fetchCategories();
      fetchBlog();
    }
  }, [router, id]);

  const fetchCategories = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) return;

      const response = await fetch('/api/admin/blog-categories?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title: title,
      slug: title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    });
  };

  const fetchBlog = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/blogs/${id}`, {
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
        setError(data.message || 'Failed to fetch blog');
        setLoading(false);
        return;
      }

      const blog: Blog = data.blog;
      setFormData({
        title: blog.title,
        slug: blog.slug,
        description: blog.description || '',
        content: blog.content || '',
        file: blog.file,
        seoTitle: blog.seoTitle || '',
        seoContent: blog.seoContent || '',
        categoryId: blog.categoryId || ''
      });
      setCloudinaryUrl(blog.file); // Set existing Cloudinary URL
      setPreviewUrl(blog.file);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch blog');
      setLoading(false);
    }
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
    
    // Use Cloudinary URL if new file was uploaded, otherwise use existing file
    const fileUrl = cloudinaryUrl || formData.file;
    
    if (!fileUrl) {
      setError('Please upload a file or keep the existing file. Files must be from Cloudinary.');
      return;
    }
    
    setSaving(true);

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

      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: 'PUT',
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
        setError(data.message || 'Failed to update blog');
        setSaving(false);
        return;
      }

      router.push('/admin/blogs');
      router.refresh();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to update blog');
      setSaving(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading blog...</p>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid">
        <div className="card shadow-lg border-0">
          <div className="card-header border-0 bg-theme-one p-3 d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0 text-white">Edit Blog</h1>
          </div>

          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Row 1: Title, Slug, Category (3 fields) */}
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
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat: any) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.parent ? `${cat.parent.name} > ` : ''}{cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: SEO Title (full width) */}
              <div className="row mb-3">
                <div className="col-md-12">
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

              {/* Row 3: File (full width) */}
              <div className="row mb-3">
                <div className="col-md-12">

                  <label className="form-label">File</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    accept="image/*"
                    disabled={uploading}
                  />
                  <small className="form-text text-muted">
                    {uploading ? 'Uploading to Cloudinary...' : 'Select an image file (will be uploaded to Cloudinary)'}
                  </small>
                  {cloudinaryUrl && cloudinaryUrl !== formData.file && (
                    <div className="alert alert-success mt-2 py-1 px-2" role="alert">
                      <small>✓ New file uploaded to Cloudinary</small>
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

              {/* Row 4: SEO Content (full width) */}
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

              {/* Row 5: Description, Content (2 fields - description last) */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Content</label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    placeholder="Enter blog content"
                    height="300px"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                    placeholder="Enter blog description"
                    height="300px"
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
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-save me-2"></i> Update Blog
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
