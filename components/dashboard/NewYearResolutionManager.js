import React, { useState, useEffect, useRef } from 'react';
import { Clock, Edit, X, Check, Plus, Bell, BellOff } from 'lucide-react';
import {
  initializeNotificationSystem,
  requestPermissionWithMessage,
  getNotificationPermission,
  scheduleAllResolutions,
  clearAllScheduledNotifications,
  showResolutionReminder,
} from '../../utils/notificationService';

export default function NewYearResolutionManager() {
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [notificationSupported, setNotificationSupported] = useState(false);
  const scheduledTimeoutsRef = useRef([]);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Personal',
    reminderFrequency: 'weekly',
    notificationEnabled: true,
  });

  // Initialize notifications on mount
  useEffect(() => {
    initializeNotifications();
  }, []);

  // Initialize notification system
  const initializeNotifications = async () => {
    try {
      const result = await initializeNotificationSystem();
      setNotificationSupported(result.supported);
      setNotificationPermission(result.permission || 'default');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  // Request notification permission
  const handleRequestNotificationPermission = async () => {
    try {
      await requestPermissionWithMessage(
        (permission) => {
          setNotificationPermission(permission);
          // Schedule notifications for existing resolutions
          scheduleNotificationsForResolutions(resolutions);
        },
        (error) => {
          setError(error.message || 'Failed to enable notifications');
        }
      );
    } catch (error) {
      setError(error.message || 'Failed to enable notifications');
    }
  };

  // Schedule notifications for all resolutions
  const scheduleNotificationsForResolutions = (resolutionsList) => {
    // Clear existing scheduled notifications
    clearAllScheduledNotifications(scheduledTimeoutsRef.current);
    scheduledTimeoutsRef.current = [];

    // Only schedule if permission is granted
    if (getNotificationPermission() === 'granted') {
      const timeouts = scheduleAllResolutions(resolutionsList, (resolution) => {
        console.log('Notification triggered for:', resolution.title);
      });
      scheduledTimeoutsRef.current = timeouts;
    }
  };

  useEffect(() => {
    fetchResolutions();
  }, []);

  // Schedule notifications when resolutions change
  useEffect(() => {
    if (resolutions.length > 0 && notificationPermission === 'granted') {
      scheduleNotificationsForResolutions(resolutions);
    }

    // Cleanup on unmount
    return () => {
      clearAllScheduledNotifications(scheduledTimeoutsRef.current);
    };
  }, [resolutions, notificationPermission]);

  async function fetchResolutions() {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const res = await fetch('/api/resolutions', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Handle network errors
      if (!res.ok && res.status >= 500) {
        throw new Error('Server unavailable. Please try again later.');
      }
      
      const data = await res.json();
      if (data.success) {
        setResolutions(data.data?.resolutions || []);
      } else {
        // Don't show error if it's just "database not configured"
        if (data.error !== 'DATABASE_NOT_CONFIGURED') {
          setError(data.message || 'Failed to fetch resolutions');
        } else {
          setResolutions([]); // Show empty state instead of error
        }
      }
    } catch (err) {
      // Only show error if it's not a network/server issue
      if (err.message && !err.message.includes('fetch')) {
        setError(err.message);
      } else {
        setError('Unable to connect to server. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    try {
      const textsToCheck = [formData.title, formData.description].filter(Boolean);
      const checkRes = await fetch('/api/moderation/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ texts: textsToCheck }),
      });
      const checkData = await checkRes.json();
      if (checkData.success && checkData.data?.blocked) {
        setError(checkData.data.message || 'Your text contains words that are not allowed. Please remove them.');
        return;
      }

      const url = editingId 
        ? `/api/resolutions/${editingId}` 
        : '/api/resolutions';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        await fetchResolutions();
        resetForm();
        // Reschedule notifications after adding/updating resolution
        if (notificationPermission === 'granted') {
          setTimeout(() => {
            fetchResolutions().then(() => {
              // Notifications will be rescheduled in the useEffect
            });
          }, 100);
        }
      } else {
        if (data.error === 'CONTENT_BLOCKED') {
          setError(data.message || 'Your text contains words that are not allowed. Please remove them.');
        } else {
          setError(data.message || 'Operation failed');
        }
      }
    } catch (err) {
      setError('An error occurred');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this resolution?')) return;
    
    try {
      const res = await fetch(`/api/resolutions/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setResolutions(prev => prev.filter(r => r._id !== id));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete resolution');
    }
  }

  async function toggleCompletion(id, currentStatus) {
    try {
      const res = await fetch(`/api/resolutions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isCompleted: !currentStatus }),
      });
      
      if (res.ok) {
        setResolutions(prev => prev.map(r => 
          r._id === id ? { ...r, isCompleted: !currentStatus } : r
        ));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      category: 'Personal',
      reminderFrequency: 'weekly',
      notificationEnabled: true,
    });
    setEditingId(null);
    setShowForm(false);
  }

  function handleEdit(resolution) {
    setFormData({
      title: resolution.title,
      description: resolution.description || '',
      category: resolution.category || 'Personal',
      reminderFrequency: resolution.reminderFrequency || 'weekly',
      notificationEnabled: resolution.notificationEnabled,
    });
    setEditingId(resolution._id);
    setShowForm(true);
  }

  return (
    <div className="resolution-manager">
      <div className="manager-header">
        <div>
          <h2>My New Year Resolutions</h2>
          <p>Track your goals and get reminders to stay on track.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {notificationSupported && notificationPermission !== 'granted' && (
            <button 
              className="btn-notification" 
              onClick={handleRequestNotificationPermission}
              title="Enable browser notifications for reminders"
            >
              {notificationPermission === 'denied' ? (
                <>
                  <BellOff className="icon-inline" size={18} />
                  Notifications Blocked
                </>
              ) : (
                <>
                  <Bell className="icon-inline" size={18} />
                  Enable Notifications
                </>
              )}
            </button>
          )}
          {notificationSupported && notificationPermission === 'granted' && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div className="notification-status" title="Notifications enabled">
                <Bell className="icon-inline" size={18} />
                <span>Notifications Enabled</span>
              </div>
              <button 
                className="btn-test-notification" 
                onClick={() => {
                  showResolutionReminder({
                    _id: 'test',
                    title: 'Test Notification',
                    description: 'This is a test notification. Your notifications are working correctly!',
                    category: 'Personal',
                  });
                }}
                title="Test notification"
              >
                Test
              </button>
            </div>
          )}
          {!showForm && (
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus className="icon-inline" size={18} />
              New Resolution
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h3>{editingId ? 'Edit Resolution' : 'Add New Resolution'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Read 12 books this year"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Details about your goal..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Health">Health</option>
                  <option value="Career">Career</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Personal">Personal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reminder Frequency</label>
                <select
                  value={formData.reminderFrequency}
                  onChange={e => setFormData({...formData, reminderFrequency: e.target.value})}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={formData.notificationEnabled}
                  onChange={e => setFormData({...formData, notificationEnabled: e.target.checked})}
                />
                Enable browser notifications
              </label>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
              <button type="submit" className="btn-primary">Save Resolution</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading resolutions...</div>
      ) : (
        <div className="resolutions-grid">
          {resolutions.length === 0 && !showForm ? (
            <div className="empty-state">
              <p>No resolutions set yet. Start by adding one!</p>
            </div>
          ) : (
            resolutions.map(resolution => (
              <div key={resolution._id} className={`resolution-card ${resolution.isCompleted ? 'completed' : ''}`}>
                <div className="card-header">
                  <span className="category-tag">{resolution.category}</span>
                  <div className="card-actions">
                    <button onClick={() => handleEdit(resolution)} className="icon-btn" title="Edit">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(resolution._id)} className="icon-btn delete" title="Delete">
                      <X size={18} />
                    </button>
                  </div>
                </div>
                
                <h3 className={resolution.isCompleted ? 'strike' : ''}>{resolution.title}</h3>
                {resolution.description && <p>{resolution.description}</p>}
                
                <div className="card-footer">
                  <div className="status">
                    <span className="frequency-badge">
                      <Clock size={14} className="icon-inline" />
                      {resolution.reminderFrequency}
                    </span>
                  </div>
                  <button 
                    className={`btn-toggle ${resolution.isCompleted ? 'active' : ''}`}
                    onClick={() => toggleCompletion(resolution._id, resolution.isCompleted)}
                  >
                    {resolution.isCompleted ? (
                      <>
                        <Check size={16} className="icon-inline" />
                        Completed
                      </>
                    ) : (
                      'Mark Complete'
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style jsx>{`
        .resolution-manager {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05));
          padding: 2rem;
          border-radius: 1.5rem;
          border: 2px solid rgba(139, 92, 246, 0.2);
        }
        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .manager-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.25rem;
        }
        .manager-header p {
          color: #6366f1;
          font-weight: 500;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
          background: linear-gradient(135deg, #7c3aed, #2563eb);
        }
        .btn-notification {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
        }
        .btn-notification:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
          background: linear-gradient(135deg, #059669, #047857);
        }
        .notification-status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #10b981;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 0.75rem;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .btn-test-notification {
          background: white;
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.875rem;
        }
        .btn-test-notification:hover {
          background: rgba(16, 185, 129, 0.1);
          border-color: #10b981;
          transform: translateY(-1px);
        }
        .icon-inline {
          display: inline-block;
          vertical-align: middle;
        }
        .btn-secondary {
          background: white;
          color: #475569;
          border: 1px solid #cbd5e1;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
        }
        
        .form-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
          padding: 2rem;
          border-radius: 1.25rem;
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(59, 130, 246, 0.1);
          border: 2px solid rgba(139, 92, 246, 0.2);
          animation: slideDown 0.3s ease-out;
        }
        .form-card h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
          color: #6366f1;
          font-weight: 700;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        label {
          display: block;
          margin-bottom: 0.65rem;
          font-weight: 600;
          color: #4f46e5;
          font-size: 0.9rem;
        }
        input[type="text"], textarea, select {
          width: 100%;
          padding: 0.875rem 1.125rem;
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-radius: 0.75rem;
          font-size: 1rem;
          background: white;
          color: #1e293b;
          transition: all 0.3s ease;
          font-family: inherit;
        }
        input[type="text"]:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
          background: #fefefe;
        }
        input[type="text"]:hover, textarea:hover, select:hover {
          border-color: rgba(139, 92, 246, 0.4);
        }
        select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b5cf6' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .resolutions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.75rem;
        }
        .resolution-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
          padding: 1.75rem;
          border-radius: 1.25rem;
          border: 2px solid rgba(139, 92, 246, 0.2);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.12), 0 2px 4px rgba(59, 130, 246, 0.08);
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }
        .resolution-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(139, 92, 246, 0.2), 0 4px 8px rgba(59, 130, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.4);
        }
        .resolution-card.completed {
          background: linear-gradient(135deg, rgba(236, 253, 245, 0.95), rgba(240, 253, 250, 0.95));
          border-color: rgba(16, 185, 129, 0.3);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .category-tag {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
          color: #6366f1;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
        .card-actions {
          display: flex;
          gap: 0.5rem;
        }
        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 0.5rem;
          border-radius: 0.375rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .icon-btn:hover {
          color: #2563eb;
          background: #eff6ff;
        }
        .icon-btn.delete:hover {
          color: #ef4444;
          background: #fef2f2;
        }
        
        .resolution-card h3 {
          margin: 0 0 0.5rem 0;
          color: #0f172a;
          font-size: 1.25rem;
        }
        .resolution-card p {
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.5;
          margin: 0 0 1.5rem 0;
          flex: 1;
        }
        .strike {
          text-decoration: line-through;
          color: #94a3b8 !important;
        }
        
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }
        .frequency-badge {
          font-size: 0.85rem;
          color: #64748b;
          background: #f1f5f9;
          padding: 0.35rem 0.65rem;
          border-radius: 0.375rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .btn-toggle {
          background: white;
          border: 1px solid #cbd5e1;
          color: #64748b;
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .btn-toggle:hover {
          border-color: #2563eb;
          color: #2563eb;
        }
        .btn-toggle.active {
          background: linear-gradient(135deg, #10b981, #059669);
          border-color: #10b981;
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 1rem;
          border: 2px dashed #cbd5e1;
          color: #64748b;
        }
        
        .alert {
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        .alert.error {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

