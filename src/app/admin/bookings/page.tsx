'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../careers/careers.module.css';

interface Booking {
  id: string;
  service_id?: string;
  service_name?: string;
  name: string;
  email: string;
  phone: string;
  appointment_date: string;
  appointment_time?: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

interface BookingsResponse {
  success: boolean;
  bookings?: Booking[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  message?: string;
}

export default function BookingsPage() {
  const router = useRouter();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/bookings?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data: BookingsResponse = await response.json();

      if (!data.success) {
        if (response.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminInfo');
          }
          router.push('/admin/login');
          return;
        }
        setError(data.message || 'Failed to fetch bookings');
        setLoading(false);
        return;
      }

      setBookings(data.bookings || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch bookings error:', err);
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [router, currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      fetchBookings();
    }
  }, [router, fetchBookings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBookings();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
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
        alert(data.message || 'Failed to update booking status');
        return;
      }

      setSuccessMessage('Booking status updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchBookings();
    } catch (err) {
      console.error('Update status error:', err);
      alert('Failed to update booking status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) {
      return;
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (!token) {
        router.push('/admin/login');
        return;
      }
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
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
        alert(data.message || 'Failed to delete booking');
        return;
      }

      setSuccessMessage('Booking deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchBookings();
    } catch (err) {
      console.error('Delete booking error:', err);
      alert('Failed to delete booking');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'confirmed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      case 'completed':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatAppointmentDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid">
        <div className="card shadow-lg border-0">
          <div className="card-header border-0 bg-theme-one p-3 d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0 text-white">Bookings</h1>
          </div>

          <div className="card-body p-4">
            {successMessage && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                {successMessage}
                <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
              </div>
            )}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            {/* Search and Filter */}
            <div className="row mb-4">
              <div className="col-md-6">
                <form onSubmit={handleSearch} className="d-flex">
                  <input
                    type="text"
                    className="form-control me-2"
                    placeholder="Search by name, email, phone, or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">Search</button>
                </form>
              </div>
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="col-md-3 text-end">
                <span className="text-muted">Total: {total}</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No bookings found.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Service</th>
                        <th>Appointment Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Booked</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td>{booking.name}</td>
                          <td>{booking.email}</td>
                          <td>{booking.phone}</td>
                          <td>{booking.service_name || '-'}</td>
                          <td>{formatAppointmentDate(booking.appointment_date)}</td>
                          <td>{booking.appointment_time || '-'}</td>
                          <td>
                            <select
                              className={`form-select form-select-sm ${getStatusBadgeClass(booking.status)} text-white`}
                              value={booking.status}
                              onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                              style={{ minWidth: '120px' }}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td>{formatDate(booking.created_at)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-info me-2"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowModal(true);
                                setModalClosing(false);
                              }}
                              title="View Details"
                            >
                              <i className="fa fa-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(booking.id)}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Booking Details Modal */}
                {showModal && selectedBooking && (
                  <>
                    <div 
                      className={`modal-backdrop fade ${modalClosing ? '' : 'show'}`}
                      style={{ 
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: 1040,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        transition: 'opacity 0.15s linear'
                      }}
                      onClick={() => {
                        setModalClosing(true);
                        setTimeout(() => {
                          setShowModal(false);
                          setSelectedBooking(null);
                          setModalClosing(false);
                        }, 150);
                      }}
                    ></div>
                    <div 
                      className={`modal fade ${modalClosing ? '' : 'show'}`}
                      style={{ 
                        display: 'block',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: 1050,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        outline: 0
                      }}
                      tabIndex={-1}
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="bookingModalLabel"
                    >
                      <div 
                        className="modal-dialog modal-dialog-centered modal-lg"
                        style={{
                          margin: '1.75rem auto',
                          maxWidth: '800px',
                          transition: 'transform 0.3s ease-out'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="modal-content" style={{
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          width: '100%',
                          pointerEvents: 'auto',
                          backgroundColor: '#fff',
                          backgroundClip: 'padding-box',
                          border: '1px solid rgba(0, 0, 0, 0.2)',
                          borderRadius: '0.3rem',
                          outline: 0,
                          boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                          animation: modalClosing ? 'fadeOut 0.15s linear' : 'fadeIn 0.15s linear'
                        }}>
                          <div className="modal-header" style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            padding: '1rem 1rem',
                            borderBottom: '1px solid #dee2e6',
                            borderTopLeftRadius: 'calc(0.3rem - 1px)',
                            borderTopRightRadius: 'calc(0.3rem - 1px)',
                            background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                            color: '#fff'
                          }}>
                            <h5 className="modal-title" id="bookingModalLabel" style={{
                              marginBottom: 0,
                              lineHeight: '1.5',
                              fontSize: '1.25rem',
                              fontWeight: 500,
                              color: '#fff'
                            }}>Booking Details</h5>
                            <button
                              type="button"
                              className="btn-close btn-close-white"
                              onClick={() => {
                                setModalClosing(true);
                                setTimeout(() => {
                                  setShowModal(false);
                                  setSelectedBooking(null);
                                  setModalClosing(false);
                                }, 150);
                              }}
                              aria-label="Close"
                              style={{
                                padding: '0.5rem 0.5rem',
                                margin: '-0.5rem -0.5rem -0.5rem auto',
                                opacity: 0.5,
                                cursor: 'pointer',
                                border: 0,
                                borderRadius: '0.25rem',
                                background: 'transparent'
                              }}
                            ></button>
                          </div>
                          <div className="modal-body" style={{
                            position: 'relative',
                            flex: '1 1 auto',
                            padding: '1.5rem'
                          }}>
                            <div style={{ marginBottom: '1rem' }}>
                              <strong>Name:</strong> {selectedBooking.name}
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                              <strong>Email:</strong> {selectedBooking.email}
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                              <strong>Phone:</strong> {selectedBooking.phone}
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                              <strong>Service:</strong> {selectedBooking.service_name || 'Not specified'}
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                              <strong>Appointment Date:</strong> {formatAppointmentDate(selectedBooking.appointment_date)}
                            </div>
                            {selectedBooking.appointment_time && (
                              <div style={{ marginBottom: '1rem' }}>
                                <strong>Time:</strong> {selectedBooking.appointment_time}
                              </div>
                            )}
                            {selectedBooking.message && (
                              <>
                                <div style={{ marginBottom: '0.5rem' }}>
                                  <strong>Message:</strong>
                                </div>
                                <div className="border p-3 rounded" style={{ marginBottom: '1rem', backgroundColor: '#f8f9fa' }}>
                                  {selectedBooking.message}
                                </div>
                              </>
                            )}
                            <div style={{ marginBottom: '1rem' }}>
                              <strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(selectedBooking.status)}`}>{selectedBooking.status}</span>
                            </div>
                            <div>
                              <small className="text-muted">Booked: {formatDate(selectedBooking.created_at)}</small>
                            </div>
                          </div>
                          <div className="modal-footer" style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            padding: '0.75rem',
                            borderTop: '1px solid #dee2e6',
                            borderBottomRightRadius: 'calc(0.3rem - 1px)',
                            borderBottomLeftRadius: 'calc(0.3rem - 1px)'
                          }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => {
                                setModalClosing(true);
                                setTimeout(() => {
                                  setShowModal(false);
                                  setSelectedBooking(null);
                                  setModalClosing(false);
                                }, 150);
                              }}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <style dangerouslySetInnerHTML={{ __html: `
                      @keyframes fadeIn {
                        from {
                          opacity: 0;
                        }
                        to {
                          opacity: 1;
                        }
                      }
                      @keyframes fadeOut {
                        from {
                          opacity: 1;
                        }
                        to {
                          opacity: 0;
                        }
                      }
                      .modal.show {
                        display: block !important;
                      }
                      .modal-backdrop.show {
                        opacity: 0.5;
                      }
                      .modal-backdrop.fade {
                        opacity: 0;
                        transition: opacity 0.15s linear;
                      }
                      .modal-backdrop.fade.show {
                        opacity: 0.5;
                      }
                      .modal.fade {
                        transition: opacity 0.15s linear;
                      }
                      .modal.fade:not(.show) {
                        opacity: 0;
                      }
                      .modal.fade.show {
                        opacity: 1;
                      }
                      .modal-dialog {
                        transition: transform 0.3s ease-out;
                      }
                      .modal.fade .modal-dialog {
                        transform: translate(0, -50px);
                      }
                      .modal.show .modal-dialog {
                        transform: none;
                      }
                    `}} />
                  </>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav aria-label="Page navigation">
                    <ul className="pagination justify-content-center mt-4">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
