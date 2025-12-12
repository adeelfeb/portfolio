import React, { useState, useEffect } from 'react';
import { Clock, Edit, X, Check, Plus } from 'lucide-react';

export default function NewYearResolutionManager() {
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Personal',
    reminderFrequency: 'weekly',
    notificationEnabled: true,
  });

  useEffect(() => {
    fetchResolutions();
  }, []);

  async function fetchResolutions() {
    try {
      setLoading(true);
      const res = await fetch('/api/resolutions', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setResolutions(data.data.resolutions);
      } else {
        setError(data.message || 'Failed to fetch resolutions');
      }
    } catch (err) {
      setError('An error occurred while fetching resolutions');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    try {
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
        fetchResolutions();
        resetForm();
      } else {
        setError(data.message || 'Operation failed');
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
        {!showForm && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus className="icon-inline" size={18} />
            New Resolution
          </button>
        )}
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
                Enable email notifications
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
        }
        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .manager-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }
        .manager-header p {
          color: #64748b;
        }
        
        .btn-primary {
          background: #2563eb;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-primary:hover {
          background: #1d4ed8;
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
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          animation: slideDown 0.3s ease-out;
        }
        .form-card h3 {
          margin-top: 0;
          margin-bottom: 1.5rem;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #334155;
        }
        input[type="text"], textarea, select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 0.5rem;
          font-size: 1rem;
        }
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .resolutions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .resolution-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s;
        }
        .resolution-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        .resolution-card.completed {
          background: #f8fafc;
          border-color: #e2e8f0;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .category-tag {
          background: #eff6ff;
          color: #2563eb;
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
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
          background: #10b981;
          border-color: #10b981;
          color: white;
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

