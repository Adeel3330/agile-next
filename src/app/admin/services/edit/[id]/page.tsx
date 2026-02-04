'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface Category {
  _id: string;
  name: string;
}

interface Service {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  categoryId?: string;
  imageUrl?: string;
  icon?: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoImage?: string;
}

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>('');
  const [hasNewFile, setHasNewFile] = useState(false);
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [seoImageUrl, setSeoImageUrl] = useState<string>('');
  const [seoImageUploading, setSeoImageUploading] = useState(false);
  const [hasNewSeoImage, setHasNewSeoImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    categoryId: '',
    imageUrl: '',
    icon: '',
    displayOrder: 0,
    status: 'active' as 'active' | 'inactive',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoImage: ''
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
      if (id) {
        fetchService();
      }
    }
  }, [router, id]);

  const fetchCategories = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) return;

      // Fetch service categories from unified categories API (children of "service-categories" parent)
      const response = await fetch('/api/categories/service-categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories.map((cat: any) => ({
          _id: cat.id,
          name: cat.name
        })));
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchService = async () => {
    setFetching(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/services/${id}`, {
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
        setError(data.message || 'Failed to fetch service');
        setFetching(false);
        return;
      }

      const service: Service = data.service;
      setFormData({
        title: service.title || '',
        slug: service.slug || '',
        description: service.description || '',
        content: service.content || '',
        categoryId: service.categoryId || '',
        imageUrl: service.imageUrl || '',
        icon: service.icon || '',
        displayOrder: service.displayOrder || 0,
        status: service.status || 'active',
        seoTitle: service.seoTitle || '',
        seoDescription: service.seoDescription || '',
        seoKeywords: service.seoKeywords || '',
        seoImage: service.seoImage || ''
      });

      if (service.imageUrl) {
        setPreviewUrl(service.imageUrl);
        setExistingImageUrl(service.imageUrl);
        setHasNewFile(false);
      }

      if (service.seoImage) {
        setSeoImageUrl(service.seoImage);
        setHasNewSeoImage(false);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch service');
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setUploading(true);
      setHasNewFile(true);
      
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
        setFormData(prev => ({ ...prev, imageUrl: uploadData.url }));
        setUploading(false);
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload file to Cloudinary. Please try again.');
        setUploading(false);
      }
    }
  };

  const handleSeoImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError('');
      setSeoImageUploading(true);
      setHasNewSeoImage(true);
      
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
        if (!token) {
          setError('Authentication required');
          setSeoImageUploading(false);
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
          setError(uploadData.message || 'Failed to upload SEO image');
          setSeoImageUploading(false);
          return;
        }

        setSeoImageUrl(uploadData.url);
        setFormData(prev => ({ ...prev, seoImage: uploadData.url }));
        setSeoImageUploading(false);
      } catch (err) {
        console.error('Upload error:', err);
        setError('Failed to upload SEO image. Please try again.');
        setSeoImageUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title.trim()) {
      setError('Please provide a service title');
      return;
    }

    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const submitData: any = {
        ...formData,
        categoryId: formData.categoryId || null
      };

      // Only include imageUrl if a new file was uploaded
      if (hasNewFile && cloudinaryUrl) {
        submitData.imageUrl = cloudinaryUrl;
      } else if (!hasNewFile) {
        // Keep existing image
        submitData.imageUrl = existingImageUrl;
      }

      // Only include seoImage if a new file was uploaded
      if (hasNewSeoImage && seoImageUrl) {
        submitData.seoImage = seoImageUrl;
      } else if (!hasNewSeoImage) {
        // Keep existing SEO image
        submitData.seoImage = formData.seoImage;
      }

      const response = await fetch(`/api/admin/services/${id}`, {
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
        setError(data.message || 'Failed to update service');
        setLoading(false);
        return;
      }

      router.push('/admin/services');
      router.refresh();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to update service');
      setLoading(false);
    }
  };

  if (!mounted || fetching) {
    return (
      <div className="bg-light min-vh-100 py-4 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading service...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid">
        <div className="card shadow-lg border-0">
          <div className="card-header border-0 bg-theme-one p-3 d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0 text-white">Edit Service</h1>
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
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData({
                        ...formData,
                        title: title,
                        slug: title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                      });
                    }}
                    required
                    placeholder="Enter service title"
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
                    placeholder="service-slug"
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
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Image, Icon, Display Order (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Service Image</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  {uploading && (
                    <small className="text-primary">Uploading...</small>
                  )}
                  {previewUrl && !uploading && (
                    <div className="mt-2">
                      <img src={previewUrl} alt="Preview" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '5px' }} />
                    </div>
                  )}
                </div>

                <div className="col-md-4">
                  <label className="form-label">Icon Class</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="icon-18"
                  />
                  <small className="form-text text-muted">
                    Icon class name (e.g., icon-18)
                  </small>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Display Order</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
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
                    placeholder="SEO title"
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
                    onChange={handleSeoImageChange}
                    disabled={seoImageUploading}
                  />
                  {seoImageUploading && (
                    <small className="text-primary">Uploading...</small>
                  )}
                  {seoImageUrl && !seoImageUploading && (
                    <div className="mt-2">
                      <img src={seoImageUrl} alt="SEO Preview" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '5px' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: SEO Description (1 field, full width) */}
              <div className="row mb-3">
                <div className="col-md-12">
                  <label className="form-label">SEO Description</label>
                  <textarea
                    className="form-control"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    rows={3}
                    placeholder="SEO description"
                  />
                </div>
              </div>

              {/* Row 5: Description (2 columns) */}
              <div className="row mb-3">
                <div className="col-md-12">
                  <label className="form-label">Description</label>
                  {mounted && <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData({ ...formData, description: value })}
                  />}
                </div>
              </div>

              {/* Row 6: Content (2 columns) */}
              <div className="row mb-3">
                <div className="col-md-12">
                  <label className="form-label">Content</label>
                  {mounted && <RichTextEditor
                    value={formData.content}
                    onChange={(value) => setFormData({ ...formData, content: value })}
                  />}
                </div>
              </div>

              {/* Row 7: Status */}
              <div className="row mb-3">
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

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Link href="/admin/services" className="btn btn-secondary">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary" disabled={loading || uploading || seoImageUploading}>
                  {loading ? 'Updating...' : 'Update Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
