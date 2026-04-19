import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Users, Trophy, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import { fetchApi } from '../api';
import { Link } from 'react-router-dom';
import './Hackathons.css';

export interface Hackathon {
  id: string | number;
  title: string;
  description: string;
  rules?: string;
  start_date: string;
  deadline: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: string;
}

export function Hackathons() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    start_date: '',
    deadline: '',
    status: 'upcoming' as Hackathon['status']
  });

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    try {
      const data = await fetchApi('/hackathons');
      setHackathons(data);
    } catch (error) {
      console.error('Failed to load hackathons', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (hackathon?: Hackathon) => {
    if (hackathon) {
      setEditingId(hackathon.id);
      setFormData({
        title: hackathon.title,
        description: hackathon.description,
        rules: hackathon.rules || '',
        start_date: hackathon.start_date.split('T')[0],
        deadline: hackathon.deadline.split('T')[0],
        status: hackathon.status
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        rules: '',
        start_date: '',
        deadline: '',
        status: 'upcoming'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchApi(`/hackathons/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await fetchApi('/hackathons', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      loadHackathons();
    } catch (error) {
      console.error('Failed to save hackathon', error);
      alert('Failed to save hackathon. Please try again.');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this hackathon? This will also delete all associated teams and submissions.')) {
      try {
        await fetchApi(`/hackathons/${id}`, { method: 'DELETE' });
        loadHackathons();
      } catch (error) {
        console.error('Failed to delete hackathon', error);
      }
    }
  };

  const getStatusColor = (status: Hackathon['status']) => {
    switch (status) {
      case 'upcoming': return 'status-upcoming';
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="hackathons-container">
      <div className="hackathons-header">
        <div>
          <h1 className="hackathons-title">Hackathons</h1>
          <p className="hackathons-subtitle">Manage and monitor your hackathon events</p>
        </div>
        <button onClick={() => handleOpenModal()} className="add-hackathon-btn">
          <Plus size={20} />
          Create Hackathon
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon upcoming"><Calendar size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{hackathons.filter(h => h.status === 'upcoming').length}</div>
            <div className="stat-label">Upcoming</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon ongoing"><Clock size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{hackathons.filter(h => h.status === 'ongoing').length}</div>
            <div className="stat-label">Ongoing</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed"><Trophy size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{hackathons.filter(h => h.status === 'completed').length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading hackathons...</p>
        </div>
      ) : hackathons.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Trophy size={48} /></div>
          <h3>No hackathons yet</h3>
          <p>Start by creating your first hackathon event</p>
          <button onClick={() => handleOpenModal()} className="empty-state-btn">
            <Plus size={18} />
            Create Your First Hackathon
          </button>
        </div>
      ) : (
        <div className="hackathons-list">
          {hackathons.map((hackathon) => (
            <div key={hackathon.id} className="hackathon-item">
              <div className="hackathon-main-info">
                <div className={`hackathon-status-badge ${getStatusColor(hackathon.status)}`}>
                  {hackathon.status.charAt(0).toUpperCase() + hackathon.status.slice(1)}
                </div>
                <h3 className="hackathon-item-title">{hackathon.title}</h3>
                <p className="hackathon-item-desc">{hackathon.description}</p>
                <div className="hackathon-dates">
                  <div className="date-tag">
                    <Calendar size={14} />
                    Starts: {new Date(hackathon.start_date).toLocaleDateString()}
                  </div>
                  <div className="date-tag">
                    <AlertCircle size={14} />
                    Deadline: {new Date(hackathon.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="hackathon-actions">
                <Link to={`/hackathons/${hackathon.id}`} className="view-details-btn">
                  View Participants & Projects
                  <ChevronRight size={18} />
                </Link>
                <div className="item-ops">
                  <button onClick={() => handleOpenModal(hackathon)} className="op-btn edit" title="Edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(hackathon.id)} className="op-btn delete" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container hackathon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Hackathon' : 'Create New Hackathon'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="hackathon-form">
              <div className="form-group">
                <label className="form-label required">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                  placeholder="e.g., Summer AI Hackathon 2024"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={e => setFormData({...formData, start_date: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label required">Deadline</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as Hackathon['status']})}
                  className="form-input"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  placeholder="Brief overview of the hackathon..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rules & Guidelines</label>
                <textarea
                  rows={4}
                  value={formData.rules}
                  onChange={e => setFormData({...formData, rules: e.target.value})}
                  className="form-textarea"
                  placeholder="Submission rules, eligibility, etc..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingId ? 'Save Changes' : 'Create Hackathon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hackathons;
