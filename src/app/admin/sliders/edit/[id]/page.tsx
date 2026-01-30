'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Slider {
  _id: string;
  title: string;
  description?: string;
  file: string;
  fileType: 'image' | 'video';
  seoTitle?: string;
  seoContent?: string;
  created_at: string;
  updated_at: string;
}

export default function EditSliderPage() {
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
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
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

      fetchSlider();
    }
  }, [router, id]);

  const fetchSlider = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/sliders/${id}`, {
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
        setError(data.message || 'Failed to fetch slider');
        setLoading(false);
        return;
      }

      const slider: Slider = data.slider;
      setFormData({
        title: slider.title,
        description: slider.description || '',
        file: slider.file,
        seoTitle: slider.seoTitle || '',
        seoContent: slider.seoContent || ''
      });
      setFileType(slider.fileType);
      setPreviewUrl(slider.file);
      setCloudinaryUrl(slider.file); // Set existing Cloudinary URL
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch slider');
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setUploading(true);
      
      // Detect file type
      const isVideo = file.type.startsWith('video/');
      const detectedType = isVideo ? 'video' : 'image';
      setFileType(detectedType);
      
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
        file: fileUrl, // Cloudinary URL
        fileType: fileType
      };

      const response = await fetch(`/api/admin/sliders/${id}`, {
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
        setError(data.message || 'Failed to update slider');
        setSaving(false);
        return;
      }

      router.push('/admin/sliders');
      router.refresh();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to update slider');
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
        <p className="mt-3 text-muted">Loading slider...</p>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid">
        <div className="card shadow-lg border-0">
          <div className="card-header border-0 bg-theme-one p-3 d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0 text-white">Edit Slider</h1>
          
          </div>

          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Row 1: Title, SEO Title, SEO Content (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Enter slider title"
                  />
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
                <div className="col-md-4">
                  {/* Row 2: File (full width) */}
              <div className="mb-3">
                <label className="form-label">File</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  disabled={uploading}
                />
                <small className="form-text text-muted">
                  {uploading ? 'Uploading to Cloudinary...' : 'Select an image or video file (will be uploaded to Cloudinary)'}
                </small>
                {cloudinaryUrl && cloudinaryUrl !== formData.file && (
                  <div className="alert alert-success mt-2 py-1 px-2" role="alert">
                    <small>✓ New file uploaded to Cloudinary</small>
                  </div>
                )}
              </div>

              {previewUrl && (
                <div className="mb-3">
                  <label className="form-label">Preview</label>
                  <div className="mt-2">
                    {fileType === 'image' ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="img-fluid rounded border" 
                        onError={() => setPreviewUrl('')} 
                      />
                    ) : (
                      <video 
                        src={previewUrl} 
                        className="w-100 rounded border" 
                        controls 
                      />
                    )}
                  </div>
                </div>
              )}
                </div>

              
              </div>

              

              {/* Row 3: Description (2/3 width) */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Enter slider description"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">SEO Content</label>
                  <textarea
                    className="form-control"
                    value={formData.seoContent}
                    onChange={(e) => setFormData({ ...formData, seoContent: e.target.value })}
                    rows={3}
                    placeholder="Enter SEO content"
                    maxLength={500}
                  />
                  <small className="form-text text-muted">
                    {formData.seoContent.length}/500
                  </small>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link href="/admin/sliders" className="theme-btn btn-two rounded-1 px-3 py-2">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="theme-btn btn-one rounded-1 px-3 py-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <p className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></p>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-save me-2"></i> Update Slider
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
