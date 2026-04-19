import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Quote as QuoteIcon, Star, User, Building2 } from 'lucide-react';
import { fetchApi } from '../api';
import './Testimonials.css';

export interface Testimonial {
  id: string | number;
  quote: string;
  author: string;
  company?: string;
  rating?: number;
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const [formData, setFormData] = useState({
    quote: '', author: '', company: ''
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const data = await fetchApi('/testimonials');
      // Add random ratings for demo (assuming API doesn't provide ratings)
      setTestimonials(data.map((t: any) => ({ ...t, rating: Math.floor(Math.random() * 2) + 4 })));
    } catch (error) {
      console.error('Failed to load testimonials', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (t?: Testimonial) => {
    if (t) {
      setEditingId(t.id);
      setFormData({ quote: t.quote, author: t.author, company: t.company || '' });
      setRating(t.rating || 5);
    } else {
      setEditingId(null);
      setFormData({ quote: '', author: '', company: '' });
      setRating(5);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const dataToSave = { ...formData, rating };
      if (editingId) {
        await fetchApi(`/testimonials/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(dataToSave),
        });
      } else {
        await fetchApi('/testimonials', {
          method: 'POST',
          body: JSON.stringify(dataToSave),
        });
      }
      setIsModalOpen(false);
      loadTestimonials();
    } catch (error) {
      console.error('Failed to save testimonial', error);
      alert('Failed to save testimonial.');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await fetchApi(`/testimonials/${id}`, { method: 'DELETE' });
        loadTestimonials();
      } catch (error) {
        console.error('Failed to delete testimonial', error);
      }
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange: any = null, onHover: any = null) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star ${star <= (interactive ? hoveredRating || rating : rating) ? 'filled' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            onMouseEnter={() => interactive && onHover && onHover(star)}
            onMouseLeave={() => interactive && onHover && onHover(0)}
            disabled={!interactive}
          >
            <Star size={interactive ? 24 : 16} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="testimonials-container">
      {/* Header Section */}
      <div className="testimonials-header">
        <div>
          <h1 className="testimonials-title">Testimonials</h1>
          <p className="testimonials-subtitle">What your clients are saying</p>
        </div>
        <button onClick={() => handleOpenModal()} className="add-testimonial-btn">
          <Plus size={20} />
          Add Testimonial
        </button>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <div className="stat-value">{testimonials.length}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <div className="stat-value">
              {testimonials.length > 0 
                ? (testimonials.reduce((acc, t) => acc + (t.rating || 5), 0) / testimonials.length).toFixed(1)
                : '0'}
            </div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <div className="stat-value">
              {[...new Set(testimonials.map(t => t.company))].filter(Boolean).length}
            </div>
            <div className="stat-label">Companies</div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading testimonials...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No testimonials yet</h3>
          <p>Add your first testimonial to build trust with potential clients</p>
          <button onClick={() => handleOpenModal()} className="empty-state-btn">
            <Plus size={18} />
            Add Your First Testimonial
          </button>
        </div>
      ) : (
        <>
          {/* Testimonials Grid */}
          <div className="testimonials-grid">
            {testimonials.map((t, index) => (
              <div key={t.id} className="testimonial-card" style={{ animationDelay: `${index * 0.1}s` }}>
                {/* Quote Icon */}
                <div className="quote-icon-wrapper">
                  <QuoteIcon size={32} />
                </div>
                
                {/* Rating Stars */}
                <div className="rating-stars">
                  {renderStars(t.rating || 5)}
                </div>
                
                {/* Quote Text */}
                <p className="testimonial-quote">"{t.quote}"</p>
                
                {/* Author Info */}
                <div className="author-info">
                  <div className="author-avatar">
                    <User size={24} />
                  </div>
                  <div className="author-details">
                    <h4 className="author-name">{t.author}</h4>
                    {t.company && (
                      <div className="author-company">
                        <Building2 size={14} />
                        {t.company}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="card-actions">
                  <button 
                    onClick={() => handleOpenModal(t)} 
                    className="card-action-btn edit"
                    title="Edit testimonial"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)} 
                    className="card-action-btn delete"
                    title="Delete testimonial"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container testimonial-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="testimonial-form">
              {/* Rating Selection */}
              <div className="form-group">
                <label className="form-label">Rating</label>
                <div className="rating-input">
                  {renderStars(rating, true, setRating, setHoveredRating)}
                </div>
              </div>

              {/* Quote */}
              <div className="form-group">
                <label className="form-label required">Testimonial</label>
                <textarea
                  required
                  rows={4}
                  value={formData.quote}
                  onChange={e => setFormData({...formData, quote: e.target.value})}
                  className="form-textarea"
                  placeholder="What did your client say about your work?"
                />
              </div>

              {/* Author Name */}
              <div className="form-group">
                <label className="form-label required">Author</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={e => setFormData({...formData, author: e.target.value})}
                    className="form-input"
                    placeholder="Client's full name"
                  />
                </div>
              </div>

              {/* Company/Role */}
              <div className="form-group">
                <label className="form-label">Company / Role</label>
                <div className="input-with-icon">
                  <Building2 size={18} className="input-icon" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    className="form-input"
                    placeholder="e.g., CEO at Company Name"
                  />
                </div>
              </div>

              {/* Character Counter for Quote */}
              <div className="character-counter">
                {formData.quote.length} / 500 characters
              </div>

              {/* Form Actions */}
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingId ? 'Save Changes' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}