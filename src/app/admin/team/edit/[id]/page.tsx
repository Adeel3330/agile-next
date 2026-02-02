'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getCloudinaryImageUrl } from '@/lib/cloudinary-utils';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface TeamMember {
  _id: string;
  name: string;
  title: string;
  bio?: string;
  photoUrl: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  displayOrder: number;
  status: 'active' | 'inactive';
  department?: string;
  created_at: string;
  updated_at: string;
}

export default function EditTeamMemberPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    linkedinUrl: '',
    twitterUrl: '',
    displayOrder: 0,
    status: 'active' as 'active' | 'inactive',
    department: ''
  });

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      fetchTeamMember();
    }
  }, [router, id]);

  const fetchTeamMember = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`/api/admin/team/${id}`, {
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
        setError(data.message || 'Failed to fetch team member');
        setLoading(false);
        return;
      }

      const member: TeamMember = data.teamMember;
      setFormData({
        name: member.name,
        title: member.title,
        bio: member.bio || '',
        email: member.email || '',
        phone: member.phone || '',
        linkedinUrl: member.linkedinUrl || '',
        twitterUrl: member.twitterUrl || '',
        displayOrder: member.displayOrder,
        status: member.status,
        department: member.department || ''
      });
      
      // Set existing photo as preview
      if (member.photoUrl) {
        setPreviewUrl(getCloudinaryImageUrl(member.photoUrl));
        setCloudinaryUrl(member.photoUrl);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch team member');
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setPreviewUrl(getCloudinaryImageUrl(cloudinaryUrl));
        return;
      }

      // Store Cloudinary URL
      setCloudinaryUrl(uploadData.url);
      setUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
      setUploading(false);
      setPreviewUrl(getCloudinaryImageUrl(cloudinaryUrl));
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

      const submitData = {
        ...formData,
        photoUrl: cloudinaryUrl // Use new URL if uploaded, otherwise keep existing from cloudinaryUrl state
      };

      const response = await fetch(`/api/admin/team/${id}`, {
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
        setError(data.message || 'Failed to update team member');
        setSaving(false);
        return;
      }

      router.push('/admin/team');
      router.refresh();
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to update team member');
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
              <p className="mt-3 text-muted">Loading team member...</p>
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
            <h1 className="h4 mb-0 text-white">Edit Team Member</h1>
          </div>

          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Row 1: Name, Title, Department (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter team member name"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g., CEO, CTO, Lead Developer"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Leadership, Development, Sales"
                  />
                </div>
              </div>

              {/* Row 2: Email, Phone, Display Order (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

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
              </div>

              {/* Row 3: LinkedIn, Twitter, Status (3 fields) */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Twitter URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    placeholder="https://twitter.com/username"
                  />
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

              {/* Row 4: Photo Upload */}
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Photo</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={uploading}
                  />
                  {uploading && (
                    <small className="text-muted d-block mt-1">
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Uploading to Cloudinary...
                    </small>
                  )}
                  {previewUrl && !uploading && (
                    <div className="mt-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="img-thumbnail"
                        style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '50%', objectFit: 'cover', width: '200px', height: '200px' }}
                      />
                      {cloudinaryUrl && (
                        <small className="text-success d-block mt-1">
                          <i className="fa fa-check-circle me-1"></i> {cloudinaryUrl !== formData.photoUrl ? 'New photo uploaded' : 'Current photo'}
                        </small>
                      )}
                    </div>
                  )}
                  <small className="text-muted d-block mt-1">
                    Upload a new photo to replace the current one (square image recommended, max 10MB)
                  </small>
                </div>
              </div>

              {/* Row 5: Bio (spans 2 columns) */}
              <div className="row mb-3">
                <div className="col-md-8">
                  <label className="form-label">Bio</label>
                  <RichTextEditor
                    value={formData.bio}
                    onChange={(value) => setFormData({ ...formData, bio: value })}
                    placeholder="Enter team member bio/introduction"
                    height="250px"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Link href="/admin/team" className="theme-btn btn-two rounded-1 px-3 py-2">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="theme-btn btn-one rounded-1 px-3 py-2"
                  disabled={saving || uploading}
                >
                  {saving ? (
                    <>
                      <p className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></p>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-save me-2"></i> Update Team Member
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
