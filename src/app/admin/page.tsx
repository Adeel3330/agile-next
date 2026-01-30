'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  
  // All hooks at top level
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Only access localStorage in useEffect (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      const storedAdmin = localStorage.getItem('adminInfo');

      if (!token) {
        router.push('/admin/login');
        setLoading(false);
        return;
      }

      if (storedAdmin) {
        try {
          setAdminInfo(JSON.parse(storedAdmin));
        } catch (e) {
          console.error('Error parsing admin info:', e);
        }
      }
      
      // Set loading to false immediately after checking
      setLoading(false);
    } else {
      // If window is undefined (SSR), set loading to false immediately
      setLoading(false);
    }
  }, [router]);

  // Early return after all hooks
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="admin-dashboard-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const quickLinks = [
    {
      title: 'Profile',
      description: 'View and edit your admin profile',
      href: '/admin/profile',
      icon: 'fa-user'
    }
  ];

  return (
    <div className="admin-dashboard">
      <style>{`
        .admin-dashboard-wrapper {
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
        .admin-dashboard {
          background: #f8f9fa;
          min-height: 100vh;
        }
        .welcome-header {
          background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
          border-radius: 10px;
          padding: 30px;
          color: #fff;
          margin-bottom: 30px;
          box-shadow: 0 5px 20px rgba(0,102,204,0.3);
        }
        .welcome-header h1 {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .welcome-header p {
          opacity: 0.9;
          font-size: 15px;
          margin: 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          margin-bottom: 35px;
        }
        .stat-card {
          background: #fff;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.05);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 25px rgba(0,0,0,0.1);
        }
        .stat-icon {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          float: left;
        }
        .stat-icon.blue { background: #e6f0ff; }
        .stat-icon.green { background: #e6ffe6; }
        .stat-icon.purple { background: #f0e6ff; }
        .stat-content {
          margin-left: 70px;
        }
        .stat-label {
          font-size: 13px;
          color: #888;
          margin-bottom: 5px;
        }
        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: #222;
          word-break: break-all;
        }
        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #222;
          margin-bottom: 20px;
        }
        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 25px;
          margin-bottom: 35px;
        }
        .quick-link-card {
          background: #fff;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.05);
          display: block;
          text-decoration: none;
          color: inherit;
          transition: transform 0.3s, box-shadow 0.3s;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
        }
        .quick-link-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 25px rgba(0,0,0,0.1);
          color: inherit;
        }
        .quick-link-icon {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          background: #0066cc;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          float: left;
        }
        .quick-link-content {
          margin-left: 70px;
        }
        .quick-link-title {
          font-size: 17px;
          font-weight: 600;
          color: #222;
          margin-bottom: 5px;
        }
        .quick-link-desc {
          font-size: 13px;
          color: #888;
          margin: 0;
        }
        .account-card {
          background: #fff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 2px 15px rgba(0,0,0,0.05);
        }
        .account-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #222;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        .account-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }
        .account-info-item label {
          display: block;
          font-size: 13px;
          color: #888;
          margin-bottom: 5px;
        }
        .account-info-item p {
          font-size: 15px;
          color: #222;
          margin: 0;
          word-break: break-all;
        }
        .account-info-item p.mono {
          font-family: monospace;
          font-size: 13px;
        }
      `}</style>

      {/* Welcome Header */}
      <div className="welcome-header">
        <h1 className="text-white">Welcome back, {adminInfo?.name || 'Admin'}!</h1>
        <p className="text-white">Manage your admin account from here.</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <i className="fa fa-user"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Admin ID</div>
            <div className="stat-value">{adminInfo?.id?.substring(0, 15)}...</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <i className="fa fa-envelope"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Email</div>
            <div className="stat-value">{adminInfo?.email}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <i className="fa fa-calendar"></i>
          </div>
          <div className="stat-content">
            <div className="stat-label">Member Since</div>
            <div className="stat-value">
              {adminInfo?.created_at
                ? new Date(adminInfo.created_at).toLocaleDateString()
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <h2 className="section-title">Quick Actions</h2>
      <div className="quick-links-grid">
        {quickLinks.map((link, index) => (
          <Link key={index} href={link.href} className="quick-link-card">
            <div className="quick-link-icon">
              <i className={`fa ${link.icon}`}></i>
            </div>
            <div className="quick-link-content">
              <h3 className="quick-link-title">{link.title}</h3>
              <p className="quick-link-desc">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Account Info Card */}
      <div className="account-card">
        <h3>Account Information</h3>
        <div className="account-info-grid">
          <div className="account-info-item">
            <label>Full Name</label>
            <p>{adminInfo?.name}</p>
          </div>
          <div className="account-info-item">
            <label>Email Address</label>
            <p>{adminInfo?.email}</p>
          </div>
          <div className="account-info-item">
            <label>Admin ID</label>
            <p className="mono">{adminInfo?.id}</p>
          </div>
          <div className="account-info-item">
            <label>Created At</label>
            <p>
              {adminInfo?.created_at
                ? new Date(adminInfo.created_at).toLocaleString()
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

