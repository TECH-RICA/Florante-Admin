import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tag, Briefcase, X } from 'lucide-react';
import { fetchApi } from '../api';
import './Services.css';

export interface Service {
  id: string | number;
  title: string;
  description: string;
  icon?: string;
  category?: string;
  price?: string;
  image_url?: string;
  full_description?: string;
  languages?: string[];
  extra_images?: string[];
  created_at: string | Date;
}

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '', 
    description: '', 
    icon: '', 
    category: '', 
    price: '', 
    image_url: '',
    full_description: '',
    languages: '', // Comma separated for input
    extra_images: [] as string[]
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const data = await fetchApi('/services');
      setServices(data);
    } catch (error) {
      console.error('Failed to load services', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingId(service.id);
      setFormData({
        title: service.title,
        description: service.description,
        icon: service.icon || '',
        category: service.category || '',
        price: service.price || '',
        image_url: service.image_url || '',
        full_description: service.full_description || '',
        languages: service.languages ? service.languages.join(', ') : '',
        extra_images: service.extra_images || []
      });
      setImagePreview(service.image_url || '');
    } else {
      setEditingId(null);
      setFormData({ 
        title: '', 
        description: '', 
        icon: '', 
        category: '', 
        price: '', 
        image_url: '',
        full_description: '',
        languages: '',
        extra_images: []
      });
      setImagePreview('');
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isExtra: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const result = await fetchApi('/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (result && result.url) {
        if (isExtra) {
          setFormData({ ...formData, extra_images: [...formData.extra_images, result.url] });
        } else {
          setFormData({ ...formData, image_url: result.url });
          setImagePreview(result.url);
        }
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const removeExtraImage = (index: number) => {
    const newImages = [...formData.extra_images];
    newImages.splice(index, 1);
    setFormData({ ...formData, extra_images: newImages });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      languages: formData.languages.split(',').map(s => s.trim()).filter(s => s !== '')
    };
    
    try {
      if (editingId) {
        await fetchApi(`/services/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(submissionData),
        });
      } else {
        await fetchApi('/services', {
          method: 'POST',
          body: JSON.stringify(submissionData),
        });
      }
      setIsModalOpen(false);
      loadServices();
    } catch (error) {
      console.error('Failed to save service', error);
      alert('Failed to save service.');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await fetchApi(`/services/${id}`, { method: 'DELETE' });
        loadServices();
      } catch (error) {
        console.error('Failed to delete service', error);
      }
    }
  };

  return (
    <div className="services-container">
      <div className="services-header">
        <div>
          <h1 className="services-title">Services</h1>
          <p className="services-subtitle">Manage the services you offer</p>
        </div>
        <button onClick={() => handleOpenModal()} className="add-service-btn">
          <Plus size={20} />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛠️</div>
          <h3>No services yet</h3>
          <p>Add your first service to show what you offer</p>
          <button onClick={() => handleOpenModal()} className="empty-state-btn">
            <Plus size={18} />
            Add Your First Service
          </button>
        </div>
      ) : (
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-image-wrapper">
                {service.image_url ? (
                  <img src={service.image_url} alt={service.title} className="service-image" />
                ) : (
                  <div className="service-no-image">
                    <Briefcase size={48} />
                  </div>
                )}
                <div className="service-overlay">
                  <button onClick={() => handleOpenModal(service)} className="overlay-btn edit">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="overlay-btn delete">
                    <Trash2 size={18} />
                  </button>
                </div>
                {service.category && (
                  <div className="service-category">
                    <Tag size={14} />
                    {service.category}
                  </div>
                )}
              </div>
              
              <div className="service-content">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                {service.price && (
                  <div className="service-price-tag">
                    {service.price}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container service-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Service' : 'Add New Service'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="service-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="form-input"
                    placeholder="e.g., Web Development"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="form-input"
                    placeholder="e.g., Development"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price Info</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="form-input"
                    placeholder="e.g., Starting from $500"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Languages / Tools (comma separated)</label>
                  <input
                    type="text"
                    value={formData.languages}
                    onChange={e => setFormData({...formData, languages: e.target.value})}
                    className="form-input"
                    placeholder="e.g., React, Node.js, PostgreSQL"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Main Service Image</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e)}
                    className="file-input"
                    id="service-image-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="service-image-upload" className={`upload-label ${uploading ? 'uploading' : ''}`}>
                    {uploading ? 'Uploading...' : 'Click to upload main image'}
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={e => {
                      setFormData({...formData, image_url: e.target.value});
                      setImagePreview(e.target.value);
                    }}
                    className="form-input"
                    placeholder="Or enter image URL"
                  />
                </div>
                {imagePreview && (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview-img" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Extra Images (at least 2 recommended)</label>
                <div className="image-upload-section">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, true)}
                    className="file-input"
                    id="extra-image-upload"
                    disabled={uploading}
                  />
                  <label htmlFor="extra-image-upload" className={`upload-label ${uploading ? 'uploading' : ''}`}>
                    {uploading ? 'Uploading...' : 'Click to add extra image'}
                  </label>
                </div>
                <div className="extra-images-preview">
                  {formData.extra_images.map((img, idx) => (
                    <div key={idx} className="extra-image-item">
                      <img src={img} alt={`Extra ${idx}`} />
                      <button type="button" onClick={() => removeExtraImage(idx)} className="remove-extra"><X size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Short Description (for card)</label>
                <textarea
                  required
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  placeholder="Short summary..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Detailed Description</label>
                <textarea
                  rows={6}
                  value={formData.full_description}
                  onChange={e => setFormData({...formData, full_description: e.target.value})}
                  className="form-textarea"
                  placeholder="Detailed explanation of the service..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Cancel</button>
                <button type="submit" className="btn-submit">{editingId ? 'Save Changes' : 'Create Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
