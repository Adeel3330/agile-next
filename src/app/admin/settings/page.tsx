'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false });

interface Settings {
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  contactCity?: string;
  contactState?: string;
  contactZip?: string;
  contactCountry?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
  socialYoutube?: string;
  socialPinterest?: string;
  workingHours?: any;
  seoDefaultTitle?: string;
  seoDefaultDescription?: string;
  seoDefaultKeywords?: string;
  seoDefaultImage?: string;
  additionalSettings?: any;
}

export default function SettingsPage() {
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string>('');

  const [formData, setFormData] = useState<Settings>({
    logoUrl: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    contactCity: '',
    contactState: '',
    contactZip: '',
    contactCountry: '',
    socialFacebook: '',
    socialTwitter: '',
    socialInstagram: '',
    socialLinkedin: '',
    socialYoutube: '',
    socialPinterest: '',
    workingHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '14:00', closed: false },
      sunday: { open: null, close: null, closed: true }
    },
    seoDefaultTitle: '',
    seoDefaultDescription: '',
    seoDefaultKeywords: '',
    seoDefaultImage: '',
    additionalSettings: {}
  });

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      fetchSettings();
    }
  }, [router]);

  const fetchSettings = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch('/api/admin/settings', {
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
        setError(data.message || 'Failed to fetch settings');
        setLoading(false);
        return;
      }

      const settings = data.settings;
      setFormData({
        ...settings,
        workingHours: settings.workingHours || formData.workingHours
      });

      if (settings.logoUrl) {
        setPreviewUrl(settings.logoUrl);
        setUploadedLogoUrl(settings.logoUrl);
      }

      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch settings');
      setLoading(false);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setUploading(true);
    setError('');

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

      // Use media upload endpoint (or create a dedicated one)
      const uploadResponse = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        setError(uploadData.message || 'Failed to upload logo');
        setUploading(false);
        setPreviewUrl(uploadedLogoUrl || '');
        return;
      }

      setUploadedLogoUrl(uploadData.url);
      setFormData(prev => ({ ...prev, logoUrl: uploadData.url }));
      setUploading(false);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload logo. Please try again.');
      setUploading(false);
      setPreviewUrl(uploadedLogoUrl || '');
    }
  };

  const handleWorkingHoursChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
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
        logoUrl: uploadedLogoUrl || formData.logoUrl
      };

      const response = await fetch('/api/admin/settings', {
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
        setError(data.message || 'Failed to update settings');
        setSaving(false);
        return;
      }

      setSuccessMessage('Settings updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setSaving(false);
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to update settings');
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
              <p className="mt-3 text-muted">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid">
        <div className="card shadow-lg border-0">
          <div className="card-header border-0 bg-theme-one p-3 d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0 text-white">System Settings</h1>
          </div>

          <div className="card-body p-4">
            {successMessage && (
              <div className="alert alert-success" role="alert">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Logo Section */}
              <div className="mb-4 pb-3 border-bottom">
                <h5 className="mb-3">Logo</h5>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Logo Image</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleLogoChange}
                      disabled={uploading}
                    />
                    {uploading && (
                      <small className="text-muted d-block mt-1">
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Uploading...
                      </small>
                    )}
                    {previewUrl && !uploading && (
                      <div className="mt-2">
                        <img
                          src={previewUrl}
                          alt="Logo preview"
                          className="img-thumbnail"
                          style={{ maxHeight: '150px', maxWidth: '100%' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="mb-4 pb-3 border-bottom">
                <h5 className="mb-3">Contact Information</h5>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.contactEmail || ''}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={formData.contactPhone || ''}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+1 (123) 456-7890"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contactAddress || ''}
                      onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contactCity || ''}
                      onChange={(e) => setFormData({ ...formData, contactCity: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contactState || ''}
                      onChange={(e) => setFormData({ ...formData, contactState: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">ZIP Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contactZip || ''}
                      onChange={(e) => setFormData({ ...formData, contactZip: e.target.value })}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.contactCountry || ''}
                      onChange={(e) => setFormData({ ...formData, contactCountry: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Social Links Section */}
              <div className="mb-4 pb-3 border-bottom">
                <h5 className="mb-3">Social Media Links</h5>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Facebook</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.socialFacebook || ''}
                      onChange={(e) => setFormData({ ...formData, socialFacebook: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Twitter</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.socialTwitter || ''}
                      onChange={(e) => setFormData({ ...formData, socialTwitter: e.target.value })}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Instagram</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.socialInstagram || ''}
                      onChange={(e) => setFormData({ ...formData, socialInstagram: e.target.value })}
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">LinkedIn</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.socialLinkedin || ''}
                      onChange={(e) => setFormData({ ...formData, socialLinkedin: e.target.value })}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">YouTube</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.socialYoutube || ''}
                      onChange={(e) => setFormData({ ...formData, socialYoutube: e.target.value })}
                      placeholder="https://youtube.com/yourchannel"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Pinterest</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.socialPinterest || ''}
                      onChange={(e) => setFormData({ ...formData, socialPinterest: e.target.value })}
                      placeholder="https://pinterest.com/yourprofile"
                    />
                  </div>
                </div>
              </div>

              {/* Working Hours Section */}
              <div className="mb-4 pb-3 border-bottom">
                <h5 className="mb-3">Working Hours</h5>
                {days.map((day) => (
                  <div key={day} className="row mb-3 align-items-center">
                    <div className="col-md-2">
                      <label className="form-label text-capitalize">{day}</label>
                    </div>
                    <div className="col-md-2">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={!formData.workingHours?.[day]?.closed}
                          onChange={(e) => handleWorkingHoursChange(day, 'closed', !e.target.checked)}
                        />
                        <label className="form-check-label">Open</label>
                      </div>
                    </div>
                    {!formData.workingHours?.[day]?.closed && (
                      <>
                        <div className="col-md-4">
                          <label className="form-label">Open Time</label>
                          <input
                            type="time"
                            className="form-control"
                            value={formData.workingHours?.[day]?.open || ''}
                            onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Close Time</label>
                          <input
                            type="time"
                            className="form-control"
                            value={formData.workingHours?.[day]?.close || ''}
                            onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* SEO Defaults Section */}
              <div className="mb-4 pb-3 border-bottom">
                <h5 className="mb-3">SEO Defaults</h5>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <label className="form-label">Default SEO Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.seoDefaultTitle || ''}
                      onChange={(e) => setFormData({ ...formData, seoDefaultTitle: e.target.value })}
                      placeholder="Default page title"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <label className="form-label">Default SEO Description</label>
                    <textarea
                      className="form-control"
                      value={formData.seoDefaultDescription || ''}
                      onChange={(e) => setFormData({ ...formData, seoDefaultDescription: e.target.value })}
                      rows={3}
                      placeholder="Default meta description"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <label className="form-label">Default SEO Keywords</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.seoDefaultKeywords || ''}
                      onChange={(e) => setFormData({ ...formData, seoDefaultKeywords: e.target.value })}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-12">
                    <label className="form-label">Default SEO Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.seoDefaultImage || ''}
                      onChange={(e) => setFormData({ ...formData, seoDefaultImage: e.target.value })}
                      placeholder="https://res.cloudinary.com/... or Supabase Storage URL"
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <button
                  type="submit"
                  className="theme-btn btn-one rounded-1 px-3 py-2"
                  disabled={saving || uploading}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa fa-save me-2"></i> Save Settings
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
