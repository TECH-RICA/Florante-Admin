import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Image as ImageIcon, DollarSign, Link as LinkIcon, Tag } from 'lucide-react';
import { fetchApi } from '../api';
import './Projects.css';

export interface Project {
  id: string | number;
  title: string;
  description: string;
  price?: string;
  image_url: string;
  category: string;
  link?: string;
  created_at: string | Date;
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', image_url: '', category: '', link: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchApi('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingId(project.id);
      setFormData({
        title: project.title,
        description: project.description,
        price: project.price || '',
        image_url: project.image_url,
        category: project.category,
        link: project.link || ''
      });
      setImagePreview(project.image_url);
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', price: '', image_url: '', category: '', link: '' });
      setImagePreview('');
    }
    setIsModalOpen(true);
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image_url: url });
    setImagePreview(url);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      const result = await fetchApi('/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (result && result.url) {
        setFormData({ ...formData, image_url: result.url });
        setImagePreview(result.url);
      }
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchApi(`/projects/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await fetchApi('/projects', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      setIsModalOpen(false);
      loadProjects();
    } catch (error) {
      console.error('Failed to save project', error);
      alert('Failed to save project. Make sure all required fields are filled.');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await fetchApi(`/projects/${id}`, { method: 'DELETE' });
        loadProjects();
      } catch (error) {
        console.error('Failed to delete project', error);
      }
    }
  };

  const categories = [...new Set(projects.map(p => p.category))];

  return (
    <div className="projects-container">
      {/* Header Section */}
      <div className="projects-header">
        <div>
          <h1 className="projects-title">Projects</h1>
          <p className="projects-subtitle">Manage your portfolio projects</p>
        </div>
        <button onClick={() => handleOpenModal()} className="add-project-btn">
          <Plus size={20} />
          Add Project
        </button>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            {/* <span>📊</span> */}
          </div>
          <div className="stat-info">
            <div className="stat-value">{projects.length}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            {/* <span>🏷️</span> */}
          </div>
          <div className="stat-info">
            <div className="stat-value">{categories.length}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            {/* <span>🔄</span> */}
          </div>
          <div className="stat-info">
            <div className="stat-value">{projects.filter(p => p.link).length}</div>
            <div className="stat-label">With Links</div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Add your first project to showcase your work</p>
          <button onClick={() => handleOpenModal()} className="empty-state-btn">
            <Plus size={18} />
            Add Your First Project
          </button>
        </div>
      ) : (
        <>
          {/* Projects Grid */}
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-image-wrapper">
                  <img 
                    src={project.image_url} 
                    alt={project.title} 
                    className="project-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                    }}
                  />
                  <div className="project-overlay">
                    <button onClick={() => handleOpenModal(project)} className="overlay-btn edit">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="overlay-btn delete">
                      <Trash2 size={18} />
                    </button>
                    {project.link && (
                      <a href={project.link} target="_blank" rel="noopener noreferrer" className="overlay-btn link">
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                  <div className="project-category">
                    <Tag size={14} />
                    {project.category}
                  </div>
                  {project.price && (
                    <div className="project-price">
                      {/* <DollarSign size={14} /> */}
                      {project.price}
                    </div>
                  )}
                </div>
                
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-description">{project.description}</p>
                  
                  <div className="project-footer">
                    <div className="project-actions">
                      <button onClick={() => handleOpenModal(project)} className="action-btn edit" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(project.id)} className="action-btn delete" title="Delete">
                        <Trash2 size={16} />
                      </button>
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="action-btn link" title="View Project">
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                    <div className="project-date">
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container project-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Project' : 'Add New Project'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="form-input"
                    placeholder="Enter project title"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label required">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="form-input"
                    placeholder="e.g., Web Development"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price</label>
                  <div className="input-with-icon">
                    <DollarSign size={18} className="input-icon" />
                    <input
                      type="text"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      className="form-input"
                      placeholder="e.g., $500 or Custom Quote"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Project Link</label>
                  <div className="input-with-icon">
                    <LinkIcon size={18} className="input-icon" />
                    <input
                      type="url"
                      value={formData.link}
                      onChange={e => setFormData({...formData, link: e.target.value})}
                      className="form-input"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Project Image</label>
                <div className="image-upload-section">
                  <div className="upload-box">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="image-upload" className={`upload-label ${uploading ? 'uploading' : ''}`}>
                      {uploading ? (
                        <div className="upload-spinner-container">
                          <div className="upload-spinner"></div>
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        <>
                          <ImageIcon size={24} />
                          <span>Click to upload or drag and drop</span>
                        </>
                      )}
                    </label>
                  </div>
                  
                  <div className="upload-divider">
                    <span>OR</span>
                  </div>

                  <div className="input-with-icon">
                    <ImageIcon size={18} className="input-icon" />
                    <input
                      type="url"
                      required
                      value={formData.image_url}
                      onChange={e => handleImageUrlChange(e.target.value)}
                      className="form-input"
                      placeholder="Enter image URL"
                    />
                  </div>
                </div>
                {imagePreview && (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Preview" className="image-preview-img" />
                    <button 
                      type="button" 
                      className="remove-image" 
                      onClick={() => {
                        setFormData({...formData, image_url: ''});
                        setImagePreview('');
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label required">Description</label>
                <textarea
                  required
                  rows={5}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  placeholder="Describe your project..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingId ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}