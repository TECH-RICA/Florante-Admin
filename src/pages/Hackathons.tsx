import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Trophy, ChevronRight, AlertCircle, Clock, Users, Upload } from 'lucide-react';
import { fetchApi } from '../api';
import VideoPlayer from '../components/VideoPlayer';

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
  // New fields
  tagline?: string;
  long_description?: string;
  objectives?: string[];
  schedule?: any[];
  prizes?: any[];
  judges?: any[];
  sponsors?: any[];
  tech_stack?: string[];
  prize_pool_desc?: string;
  video_url?: string;
}


export function Hackathons() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [uploading, setUploading] = useState(false);

  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rules: '',
    start_date: '',
    deadline: '',
    status: 'upcoming' as Hackathon['status'],
    tagline: '',
    long_description: '',
    objectives: '',
    schedule: '',
    prizes: '',
    judges: '',
    sponsors: '',
    tech_stack: '',
    prize_pool_desc: '',
    video_url: ''
  });


  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString();
  };

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    try {
      const [hData, statsData] = await Promise.all([
        fetchApi('/hackathons'),
        fetchApi('/hackathons/stats/participants')
      ]);
      setHackathons(hData);
      setTotalParticipants(statsData.totalParticipants);
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
        status: hackathon.status,
        tagline: hackathon.tagline || '',
        long_description: hackathon.long_description || '',
        objectives: Array.isArray(hackathon.objectives) ? JSON.stringify(hackathon.objectives, null, 2) : '',
        schedule: Array.isArray(hackathon.schedule) ? JSON.stringify(hackathon.schedule, null, 2) : '',
        prizes: Array.isArray(hackathon.prizes) ? JSON.stringify(hackathon.prizes, null, 2) : '',
        judges: Array.isArray(hackathon.judges) ? JSON.stringify(hackathon.judges, null, 2) : '',
        sponsors: Array.isArray(hackathon.sponsors) ? JSON.stringify(hackathon.sponsors, null, 2) : '',
        tech_stack: Array.isArray(hackathon.tech_stack) ? hackathon.tech_stack.join(', ') : '',
        prize_pool_desc: hackathon.prize_pool_desc || '',
        video_url: hackathon.video_url || ''
      });

    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        rules: '',
        start_date: '',
        deadline: '',
        status: 'upcoming',
        tagline: '',
        long_description: '',
        objectives: '',
        schedule: '',
        prizes: '',
        judges: '',
        sponsors: '',
        tech_stack: '',
        prize_pool_desc: '',
        video_url: ''
      });

    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetchApi('/upload', {
        method: 'POST',
        body: formData,
      });

      setFormData(prev => ({ ...prev, video_url: res.url }));
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submissionData = {
        ...formData,
        objectives: formData.objectives ? JSON.parse(formData.objectives) : [],
        schedule: formData.schedule ? JSON.parse(formData.schedule) : [],
        prizes: formData.prizes ? JSON.parse(formData.prizes) : [],
        judges: formData.judges ? JSON.parse(formData.judges) : [],
        sponsors: formData.sponsors ? JSON.parse(formData.sponsors) : [],
        tech_stack: formData.tech_stack ? formData.tech_stack.split(',').map(s => s.trim()) : []
      };

      if (editingId) {
        await fetchApi(`/hackathons/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(submissionData),
        });
      } else {
        await fetchApi('/hackathons', {
          method: 'POST',
          body: JSON.stringify(submissionData),
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
        <div className="stat-card">
          <div className="stat-icon participants"><Users size={24} /></div>
          <div className="stat-info">
            <div className="stat-value">{totalParticipants}</div>
            <div className="stat-label">Total Participants</div>
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
                    Starts: {formatDateForDisplay(hackathon.start_date)}
                  </div>
                  <div className="date-tag">
                    <AlertCircle size={14} />
                    Deadline: {formatDateForDisplay(hackathon.deadline)}
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
                <label className="form-label">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={e => setFormData({...formData, tagline: e.target.value})}
                  className="form-input"
                  placeholder="Catchy phrase for the hackathon"
                />
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
                <label className="form-label required">Short Description</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  placeholder="Brief overview..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Long Description</label>
                <textarea
                  rows={4}
                  value={formData.long_description}
                  onChange={e => setFormData({...formData, long_description: e.target.value})}
                  className="form-textarea"
                  placeholder="Detailed information about the event..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prize Pool Description</label>
                <input
                  type="text"
                  value={formData.prize_pool_desc}
                  onChange={e => setFormData({...formData, prize_pool_desc: e.target.value})}
                  className="form-input"
                  placeholder="e.g., $10,000 in prizes"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rules & Guidelines</label>
                <textarea
                  rows={3}
                  value={formData.rules}
                  onChange={e => setFormData({...formData, rules: e.target.value})}
                  className="form-textarea"
                  placeholder="Submission rules, eligibility, etc..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={formData.tech_stack}
                  onChange={e => setFormData({...formData, tech_stack: e.target.value})}
                  className="form-input"
                  placeholder="React, Node.js, Supabase"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Objectives (JSON Array)</label>
                <textarea
                  rows={3}
                  value={formData.objectives}
                  onChange={e => setFormData({...formData, objectives: e.target.value})}
                  className="form-textarea"
                  placeholder='["Build AI tools", "Foster collaboration"]'
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prizes (JSON Array)</label>
                <textarea
                  rows={3}
                  value={formData.prizes}
                  onChange={e => setFormData({...formData, prizes: e.target.value})}
                  className="form-textarea"
                  placeholder='[{"place": "1st", "amount": "$5,000"}]'
                />
              </div>

              <div className="form-group">
                <label className="form-label">Schedule (JSON Array)</label>
                <textarea
                  rows={3}
                  value={formData.schedule}
                  onChange={e => setFormData({...formData, schedule: e.target.value})}
                  className="form-textarea"
                  placeholder='[{"time": "9:00 AM", "event": "Opening Ceremony"}]'
                />
              </div>

              <div className="form-group">
                <label className="form-group">Judges (JSON Array)</label>
                <textarea
                  rows={3}
                  value={formData.judges}
                  onChange={e => setFormData({...formData, judges: e.target.value})}
                  className="form-textarea"
                  placeholder='[{"name": "Jane Doe", "role": "CEO of Tech"}]'
                />
              </div>

              <div className="form-group">
                <label className="form-label">Trailer Video URL / Upload</label>
                <div className="media-input-group">
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={e => setFormData({...formData, video_url: e.target.value})}
                    className="form-input"
                    placeholder="YouTube URL or upload video file"
                  />
                  <label className="upload-btn-label">
                    <input type="file" onChange={handleFileUpload} accept="video/*" hidden />
                    {uploading ? '...' : <Upload size={18} />}
                  </label>
                </div>
                {formData.video_url && (
                  <div className="media-preview-container" style={{ marginTop: '10px' }}>
                    <VideoPlayer url={formData.video_url} />
                    <button type="button" className="remove-media-overlay" onClick={() => setFormData({ ...formData, video_url: '' })}>Remove Video</button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Sponsors (JSON Array)</label>

                <textarea
                  rows={3}
                  value={formData.sponsors}
                  onChange={e => setFormData({...formData, sponsors: e.target.value})}
                  className="form-textarea"
                  placeholder='[{"name": "Google", "logo": "url"}]'
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
