'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Admin {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface ProfileResponse {
  success: boolean;
  admin?: Admin;
  message?: string;
}

export default function AdminProfilePage() {
  const router = useRouter();
  
  // All hooks at top level
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const fetchProfile = async () => {
      const token = localStorage.getItem('adminToken');

      if (!token) {
        router.push('/admin/login');
        return;
      }

      try {
        const response = await fetch('/api/admin/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data: ProfileResponse = await response.json();

        if (!data.success) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
          router.push('/admin/login');
          return;
        }

        setAdmin(data.admin || null);
        setEditForm({
          name: data.admin?.name || '',
          email: data.admin?.email || ''
        });
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to update profile');
        setSaving(false);
        return;
      }

      setAdmin(data.admin || null);
      localStorage.setItem('adminInfo', JSON.stringify(data.admin));
      setEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Early return after all hooks
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="profile-loading-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <style>{`
        .profile-loading-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }
        .loading-container {
          text-align: center;
        }
        .loading-spinner {
          display: inline-block;
          width: 50px;
          height: 50px;
          border: 3px solid #f3f3f3;
          border-radius: 50%;
          border-top: 3px solid #0066cc;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loading-text {
          margin-top: 15px;
          color: #666;
          font-size: 14px;
        }
        .page-header {
          margin-bottom: 30px;
        }
        .page-header h1 {
          font-size: 26px;
          font-weight: 700;
          color: #222;
          margin-bottom: 5px;
        }
        .page-header p {
          color: #666;
          font-size: 15px;
          margin: 0;
        }
        .alert-error {
          background: #fee;
          border: 1px solid #fcc;
          color: #c00;
          padding: 12px 15px;
          border-radius: 5px;
          margin-bottom: 25px;
          font-size: 14px;
        }
        .alert-success {
          background: #efe;
          border: 1px solid #cfc;
          color: #060;
          padding: 12px 15px;
          border-radius: 5px;
          margin-bottom: 25px;
          font-size: 14px;
        }
        .profile-card {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .profile-header {
          background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
          padding: 35px 30px;
          color: #fff;
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          float: left;
        }
        .profile-avatar span {
          font-size: 32px;
          font-weight: 700;
          color: #0066cc;
        }
        .profile-header-info {
          margin-left: 100px;
          padding-top: 10px;
        }
        .profile-header-info h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 5px;
        }
        .profile-header-info p {
          opacity: 0.9;
          font-size: 15px;
          margin: 0;
        }
        .profile-content {
          padding: 30px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-weight: 500;
          color: #444;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .form-control {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
          transition: all 0.3s;
        }
        .form-control:focus {
          border-color: #0066cc;
          box-shadow: 0 0 0 3px rgba(0,102,204,0.1);
          outline: none;
        }
        .btn-primary-custom {
          padding: 12px 25px;
          background: #0066cc;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-right: 10px;
        }
        .btn-primary-custom:hover {
          background: #0052a3;
        }
        .btn-primary-custom:disabled {
          background: #3399ff;
          cursor: not-allowed;
        }
        .btn-secondary-custom {
          padding: 12px 25px;
          background: #6c757d;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-secondary-custom:hover {
          background: #5a6268;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-item label {
          display: block;
          font-size: 13px;
          color: #888;
          margin-bottom: 5px;
        }
        .info-item p {
          font-size: 16px;
          color: #222;
          margin: 0;
        }
        .info-item p.mono {
          font-family: monospace;
          font-size: 13px;
          word-break: break-all;
        }
        .btn-edit {
          padding: 12px 25px;
          background: #0066cc;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 20px;
        }
        .btn-edit:hover {
          background: #0052a3;
        }
        .button-group {
          margin-top: 25px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
      `}</style>

      {/* Page Header */}
      <div className="page-header">
        <h1>Admin Profile</h1>
        <p>Manage your account settings</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="alert-success">
          {successMessage}
        </div>
      )}

      {/* Profile Card */}
      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{admin?.name?.charAt(0).toUpperCase() || 'A'}</span>
          </div>
          <div className="profile-header-info">
            <h2 className='text-white'>{admin?.name || 'Admin'}</h2>
            <p className='text-white'>{admin?.email}</p>
          </div>
          <div className="clearfix"></div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {editing ? (
            /* Edit Mode */
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="form-control"
                  required
                />
              </div>
              <div className="button-group">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary-custom"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setEditForm({
                      name: admin?.name || '',
                      email: admin?.email || ''
                    });
                  }}
                  className="btn-secondary-custom"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <p>{admin?.name}</p>
              </div>
              <div className="info-item">
                <label>Email Address</label>
                <p>{admin?.email}</p>
              </div>
              <div className="info-item">
                <label>Account Created</label>
                <p>
                  {admin?.created_at
                    ? new Date(admin.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'N/A'}
                </p>
              </div>
              <div className="info-item">
                <label>Admin ID</label>
                <p className="mono">{admin?.id || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Edit Button */}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn-edit"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

