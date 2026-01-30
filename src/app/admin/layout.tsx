'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface AdminInfo {
  name: string;
  email: string;
}

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  // All hooks at top level - MUST be before any conditional returns
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Define sidebar items outside conditional logic
  const sidebarItems = [
    { href: '/admin', label: 'Dashboard', icon: 'fa-tachometer-alt' },
    { href: '/admin/careers', label: 'Careers Development', icon: 'fa-briefcase' },
    { href: '/admin/sliders', label: 'Sliders', icon: 'fa-images' },
    { href: '/admin/profile', label: 'Profile', icon: 'fa-user' },
  ];

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

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
    }
    router.push('/admin/login');
    router.refresh();
  };

  // Skip layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Early return after all hooks
  if (!mounted) {
    return null;
  }

  // Show minimal loading only if we haven't checked auth yet
  // Don't block children - let pages handle their own loading states
  if (loading) {
    return (
      <div className="admin-layout-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <style>{`
        .admin-layout-loading {
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
        .admin-layout {
          min-height: 100vh;
          background: #f8f9fa;
          display: flex;
        }
        .admin-sidebar {
          width: 260px;
          background: #fff;
          box-shadow: 2px 0 10px rgba(0,0,0,0.05);
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 1000;
          transition: transform 0.3s ease;
        }
        .sidebar-header {
          padding: 25px 20px;
          border-bottom: 1px solid #eee;
          background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
        }
        .sidebar-brand {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          text-decoration: none;
          display: block;
        }
        .sidebar-menu {
          padding: 20px 0;
          list-style: none;
          margin: 0;
        }
        .sidebar-item {
          margin: 0;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          color: #555;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
          border-left: 3px solid transparent;
        }
        .sidebar-link:hover {
          background: #f8f9fa;
          color: #0066cc;
        }
        .sidebar-link.active {
          background: #e6f0ff;
          color: #0066cc;
          border-left-color: #0066cc;
        }
        .sidebar-link i {
          font-size: 16px;
          width: 20px;
          text-align: center;
        }
        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid #eee;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: #fff;
        }
        .sidebar-user {
          margin-bottom: 15px;
        }
        .sidebar-user-name {
          font-size: 14px;
          font-weight: 600;
          color: #222;
          margin: 0 0 3px 0;
        }
        .sidebar-user-email {
          font-size: 12px;
          color: #888;
          margin: 0;
        }
        .sidebar-logout {
          width: 100%;
          padding: 10px;
          background: #dc3545;
          color: #fff;
          border: none;
          border-radius: 5px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
        }
        .sidebar-logout:hover {
          background: #c82333;
        }
        .admin-main-wrapper {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .admin-topbar {
          background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          padding: 15px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .sidebar-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 20px;
          color: #555;
          cursor: pointer;
          padding: 5px 10px;
        }
        .main-content {
          flex: 1;
          padding: 30px;
        }
        .admin-footer {
          background: #fff;
          border-top: 1px solid #eee;
          padding: 20px 30px;
          margin-top: auto;
        }
        .footer-text {
          text-align: center;
          color: #888;
          font-size: 14px;
          margin: 0;
        }
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-main-wrapper {
            margin-left: 0;
          }
          .sidebar-toggle {
            display: block;
          }
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/admin" className="sidebar-brand">
            Admin Panel
          </Link>
        </div>
        
        <ul className="sidebar-menu">
          {sidebarItems.map((item) => (
            <li key={item.href} className="sidebar-item">
              <Link
                href={item.href}
                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <i className={`fa ${item.icon}`}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          {adminInfo && (
            <>
              <div className="sidebar-user">
                <p className="sidebar-user-name">{adminInfo.name}</p>
                <p className="sidebar-user-email">{adminInfo.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="sidebar-logout"
              >
                <i className="fa fa-sign-out-alt"></i> Logout
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        <div className="admin-topbar">
          <button
            className="sidebar-toggle d-block"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="fa fa-bars"></i>
          </button>
          <div className="flex-grow-1"></div>
        </div>

        <main className="main-content">
          {children}
        </main>

        <footer className="admin-footer">
          <p className="footer-text">
            &copy; {new Date().getFullYear()} Admin Panel. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

