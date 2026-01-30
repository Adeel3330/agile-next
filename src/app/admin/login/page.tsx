'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LoginResponse {
  success: boolean;
  token?: string;
  admin?: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  };
  message?: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  
  // All hooks must be called at the top level
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Effect for mounting and checking auth
  useEffect(() => {
    setMounted(true);
    
    // Check if already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      router.push('/admin');
    }
  }, [router]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data: LoginResponse = await response.json();

      if (!data.success) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminInfo', JSON.stringify(data.admin));
      }

      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  // But always call hooks before this check
  if (!mounted || isLoggedIn) {
    return null;
  }

  return (
    <div className="admin-login-wrapper">
      <style>{`
        .admin-login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          padding: 30px 15px;
        }
        .login-card {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          padding: 40px;
          max-width: 450px;
          width: 100%;
        }
        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .login-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #222;
          margin-bottom: 8px;
        }
        .login-header p {
          color: #666;
          font-size: 14px;
          margin: 0;
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
          width: 100%;
          padding: 12px;
          background: #0066cc;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-primary-custom:hover {
          background: #0052a3;
        }
        .btn-primary-custom:disabled {
          background: #3399ff;
          cursor: not-allowed;
        }
        .alert-danger {
          background: #fee;
          border: 1px solid #fcc;
          color: #c00;
          padding: 12px 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .back-link {
          text-align: center;
          margin-top: 25px;
        }
        .back-link a {
          color: #0066cc;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }
        .back-link a:hover {
          color: #004488;
        }
        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 1s ease-in-out infinite;
          margin-right: 8px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .loading-text {
          opacity: 0.8;
        }
      `}</style>

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h2>Admin Login</h2>
          <p>Sign in to access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="alert-danger">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              placeholder="admin@example.com"
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter your password"
            />
          </div>

          {/* Submit Button */}
          <div className="form-group">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-custom"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span className="loading-text">Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        {/* Back to Home Link */}
        <div className="back-link">
          <Link href="/">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

