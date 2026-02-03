'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminInfo {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface DashboardStats {
  careers: number;
  services: number;
  blogs: number;
  pages: number;
  media: number;
  team: number;
  contacts: number;
  bookings: number;
  resumes: number;
  affiliates: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    careers: 0,
    services: 0,
    blogs: 0,
    pages: 0,
    media: 0,
    team: 0,
    contacts: 0,
    bookings: 0,
    resumes: 0,
    affiliates: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
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
      
      setLoading(false);
      fetchDashboardStats();
    } else {
      setLoading(false);
    }
  }, [router]);

  const fetchDashboardStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) return;

      // Fetch all stats in parallel
      const [
        careersRes,
        servicesRes,
        blogsRes,
        pagesRes,
        mediaRes,
        teamRes,
        contactsRes,
        bookingsRes,
        resumesRes,
        affiliatesRes
      ] = await Promise.all([
        fetch('/api/admin/careers?limit=1', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/services?limit=1', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/blogs?limit=1', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/pages?limit=1', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/media?limit=1', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/team?limit=1', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/contacts?limit=1', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/bookings?limit=1', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/resumes?limit=1', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/affiliates?limit=1', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const [
        careersData,
        servicesData,
        blogsData,
        pagesData,
        mediaData,
        teamData,
        contactsData,
        bookingsData,
        resumesData,
        affiliatesData
      ] = await Promise.all([
        careersRes.json(),
        servicesRes.json(),
        blogsRes.json(),
        pagesRes.json(),
        mediaRes.json(),
        teamRes.json(),
        contactsRes.json(),
        bookingsRes.json(),
        resumesRes.json(),
        affiliatesRes.json()
      ]);

      setStats({
        careers: careersData.total || 0,
        services: servicesData.total || 0,
        blogs: blogsData.total || 0,
        pages: pagesData.total || 0,
        media: mediaData.total || 0,
        team: teamData.total || 0,
        contacts: contactsData.total || 0,
        bookings: bookingsData.total || 0,
        resumes: resumesData.total || 0,
        affiliates: affiliatesData.total || 0
      });
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const quickLinks = [
    { title: 'Careers', href: '/admin/careers', icon: 'fa-briefcase', color: '#0066cc' },
    { title: 'Services', href: '/admin/services', icon: 'fa-cogs', color: '#28a745' },
    { title: 'Blogs', href: '/admin/blogs', icon: 'fa-newspaper', color: '#ffc107' },
    { title: 'Pages CMS', href: '/admin/pages', icon: 'fa-file-alt', color: '#17a2b8' },
    { title: 'Media', href: '/admin/media', icon: 'fa-image', color: '#6f42c1' },
    { title: 'Team', href: '/admin/team', icon: 'fa-users', color: '#e83e8c' },
    { title: 'Categories', href: '/admin/blog-categories', icon: 'fa-folder', color: '#fd7e14' },
    { title: 'Sliders', href: '/admin/sliders', icon: 'fa-images', color: '#20c997' },
    { title: 'Bookings', href: '/admin/bookings', icon: 'fa-calendar-check', color: '#dc3545' },
    { title: 'Contacts', href: '/admin/contacts', icon: 'fa-envelope', color: '#6610f2' },
    { title: 'Resumes', href: '/admin/resumes', icon: 'fa-file-alt', color: '#6c757d' },
    { title: 'Affiliates', href: '/admin/affiliates', icon: 'fa-handshake', color: '#0d6efd' },
    { title: 'Settings', href: '/admin/settings', icon: 'fa-cog', color: '#212529' },
    { title: 'Profile', href: '/admin/profile', icon: 'fa-user', color: '#198754' }
  ];

  const totalItems = stats.careers + stats.services + stats.blogs + stats.pages + stats.media + stats.team;

  return (
    <div className="dashboard-container">
      <style dangerouslySetInnerHTML={{ __html: `
        .dashboard-loading {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
        }
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #0066cc;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .dashboard-container {
          padding: 30px;
          background: #f8f9fa;
          min-height: 100vh;
        }
        .dashboard-header {
          background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
          border-radius: 12px;
          padding: 30px;
          color: #fff;
          margin-bottom: 30px;
          box-shadow: 0 4px 20px rgba(0,102,204,0.2);
        }
        .dashboard-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }
        .dashboard-header p {
          opacity: 0.9;
          font-size: 15px;
          margin: 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          border-left: 4px solid;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 24px rgba(0,0,0,0.12);
        }
        .stat-card.blue { border-left-color: #0066cc; }
        .stat-card.green { border-left-color: #28a745; }
        .stat-card.orange { border-left-color: #ffc107; }
        .stat-card.purple { border-left-color: #6f42c1; }
        .stat-card.pink { border-left-color: #e83e8c; }
        .stat-card.red { border-left-color: #dc3545; }
        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: #fff;
        }
        .stat-icon.blue { background: #0066cc; }
        .stat-icon.green { background: #28a745; }
        .stat-icon.orange { background: #ffc107; }
        .stat-icon.purple { background: #6f42c1; }
        .stat-icon.pink { background: #e83e8c; }
        .stat-icon.red { background: #dc3545; }
        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #222;
          line-height: 1;
        }
        .stat-label {
          font-size: 14px;
          color: #666;
          margin-top: 8px;
          font-weight: 500;
        }
        .section-title {
          font-size: 22px;
          font-weight: 600;
          color: #222;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }
        .quick-link-card {
          background: #fff;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border: 2px solid transparent;
        }
        .quick-link-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 24px rgba(0,0,0,0.12);
          border-color: #0066cc;
          color: inherit;
        }
        .quick-link-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #fff;
          margin-bottom: 12px;
        }
        .quick-link-title {
          font-size: 15px;
          font-weight: 600;
          color: #222;
          margin: 0;
        }
        .charts-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .chart-card {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .chart-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: #222;
          margin: 0 0 20px 0;
        }
        .chart-bar {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .chart-label {
          width: 120px;
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }
        .chart-bar-container {
          flex: 1;
          height: 32px;
          background: #f0f0f0;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }
        .chart-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #0066cc 0%, #0052a3 100%);
          border-radius: 6px;
          transition: width 0.6s ease;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
        }
        .chart-value {
          width: 60px;
          text-align: right;
          font-size: 14px;
          font-weight: 600;
          color: #222;
        }
      `}} />

      {/* Welcome Header */}
      <div className="dashboard-header">
        <h1 className='text-white'>Welcome back, {adminInfo?.name || 'Admin'}!</h1>
        <p className='text-white'>Here's an overview of your website management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-header">
            <div className="stat-icon blue">
              <i className="fa fa-briefcase"></i>
            </div>
            <div className="stat-value">
              {statsLoading ? '...' : stats.careers}
            </div>
          </div>
          <div className="stat-label">Careers</div>
        </div>

        <div className="stat-card green">
          <div className="stat-header">
            <div className="stat-icon green">
              <i className="fa fa-cogs"></i>
            </div>
            <div className="stat-value">
              {statsLoading ? '...' : stats.services}
            </div>
          </div>
          <div className="stat-label">Services</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-header">
            <div className="stat-icon orange">
              <i className="fa fa-newspaper"></i>
            </div>
            <div className="stat-value">
              {statsLoading ? '...' : stats.blogs}
            </div>
          </div>
          <div className="stat-label">Blogs</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-header">
            <div className="stat-icon purple">
              <i className="fa fa-file-alt"></i>
            </div>
            <div className="stat-value">
              {statsLoading ? '...' : stats.pages}
            </div>
          </div>
          <div className="stat-label">Pages</div>
        </div>

        <div className="stat-card pink">
          <div className="stat-header">
            <div className="stat-icon pink">
              <i className="fa fa-image"></i>
            </div>
            <div className="stat-value">
              {statsLoading ? '...' : stats.media}
            </div>
          </div>
          <div className="stat-label">Media Items</div>
        </div>

        <div className="stat-card blue">
          <div className="stat-header">
            <div className="stat-icon blue">
              <i className="fa fa-users"></i>
            </div>
            <div className="stat-value">
              {statsLoading ? '...' : stats.team}
            </div>
          </div>
          <div className="stat-label">Team Members</div>
        </div>

        <div className="stat-card red">
          <div className="stat-header">
            <div className="stat-icon red">
              <i className="fa fa-envelope"></i>
            </div>
            <div className="stat-value">
              {statsLoading ? '...' : stats.contacts}
            </div>
          </div>
          <div className="stat-label">Contact Submissions</div>
        </div>

        <div className="stat-card green">
          <div className="stat-header">
            <div className="stat-icon green">
              <i className="fa fa-calendar-check"></i>
            </div>
            <div className="stat-value">
              {statsLoading ? '...' : stats.bookings}
            </div>
          </div>
          <div className="stat-label">Bookings</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-header">
            <div className="stat-icon orange">
              <i className="fa fa-file-alt"></i>
            </div>
            <div className="stat-value">
              {statsLoading ? '...' : stats.resumes}
            </div>
          </div>
          <div className="stat-label">Resumes</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-header">
            <div className="stat-icon purple">
              <i className="fa fa-handshake"></i>
            </div>
            <div className="stat-value">
              {statsLoading ? '...' : stats.affiliates}
            </div>
          </div>
          <div className="stat-label">Affiliates</div>
        </div>
      </div>

      {/* Charts Section */}
      <h2 className="section-title">
        <i className="fa fa-chart-bar"></i>
        Content Overview
      </h2>
      <div className="charts-section">
        <div className="chart-card">
          <h3>Content Distribution</h3>
          {totalItems > 0 ? (
            <>
              <div className="chart-bar">
                <div className="chart-label">Careers</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar-fill" 
                    style={{ width: `${(stats.careers / totalItems) * 100}%` }}
                  >
                    {stats.careers > 0 && stats.careers}
                  </div>
                </div>
                <div className="chart-value">{stats.careers}</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">Services</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar-fill" 
                    style={{ width: `${(stats.services / totalItems) * 100}%` }}
                  >
                    {stats.services > 0 && stats.services}
                  </div>
                </div>
                <div className="chart-value">{stats.services}</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">Blogs</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar-fill" 
                    style={{ width: `${(stats.blogs / totalItems) * 100}%` }}
                  >
                    {stats.blogs > 0 && stats.blogs}
                  </div>
                </div>
                <div className="chart-value">{stats.blogs}</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">Pages</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar-fill" 
                    style={{ width: `${(stats.pages / totalItems) * 100}%` }}
                  >
                    {stats.pages > 0 && stats.pages}
                  </div>
                </div>
                <div className="chart-value">{stats.pages}</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">Media</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar-fill" 
                    style={{ width: `${(stats.media / totalItems) * 100}%` }}
                  >
                    {stats.media > 0 && stats.media}
                  </div>
                </div>
                <div className="chart-value">{stats.media}</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">Team</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar-fill" 
                    style={{ width: `${(stats.team / totalItems) * 100}%` }}
                  >
                    {stats.team > 0 && stats.team}
                  </div>
                </div>
                <div className="chart-value">{stats.team}</div>
              </div>
            </>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No content data available</p>
          )}
        </div>

        <div className="chart-card">
          <h3>Submissions Overview</h3>
          {stats.contacts + stats.bookings + stats.resumes > 0 ? (
            <>
              <div className="chart-bar">
                <div className="chart-label">Contacts</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar-fill" 
                    style={{ 
                      width: `${((stats.contacts / (stats.contacts + stats.bookings + stats.resumes)) || 0) * 100}%`,
                      background: 'linear-gradient(90deg, #dc3545 0%, #c82333 100%)'
                    }}
                  >
                    {stats.contacts > 0 && stats.contacts}
                  </div>
                </div>
                <div className="chart-value">{stats.contacts}</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">Bookings</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar-fill" 
                    style={{ 
                      width: `${((stats.bookings / (stats.contacts + stats.bookings + stats.resumes)) || 0) * 100}%`,
                      background: 'linear-gradient(90deg, #28a745 0%, #218838 100%)'
                    }}
                  >
                    {stats.bookings > 0 && stats.bookings}
                  </div>
                </div>
                <div className="chart-value">{stats.bookings}</div>
              </div>
              <div className="chart-bar">
                <div className="chart-label">Resumes</div>
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar-fill" 
                    style={{ 
                      width: `${((stats.resumes / (stats.contacts + stats.bookings + stats.resumes)) || 0) * 100}%`,
                      background: 'linear-gradient(90deg, #ffc107 0%, #e0a800 100%)'
                    }}
                  >
                    {stats.resumes > 0 && stats.resumes}
                  </div>
                </div>
                <div className="chart-value">{stats.resumes}</div>
              </div>
            </>
          ) : (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No submissions yet</p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <h2 className="section-title">
        <i className="fa fa-link"></i>
        Quick Links
      </h2>
      <div className="quick-links-grid">
        {quickLinks.map((link, index) => (
          <Link key={index} href={link.href} className="quick-link-card">
            <div className="quick-link-icon" style={{ background: link.color }}>
              <i className={`fa ${link.icon}`}></i>
            </div>
            <h3 className="quick-link-title">{link.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
