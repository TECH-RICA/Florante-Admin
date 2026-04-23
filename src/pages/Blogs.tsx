import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, Star, Upload } from 'lucide-react';
import { fetchApi } from '../api';
import VideoPlayer from '../components/VideoPlayer';

import './Blogs.css';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  video_url: string | null;
  category: string;
  tags: string[];
  author_name: string;
  is_featured: boolean;
  is_published: boolean;
  is_approved: boolean;
  views_count: number;
  likes_count: number;
  saves_count: number;
  created_at: string;
  published_at: string | null;
}

const CATEGORIES = ['General', 'Technology', 'Design', 'Business', 'Tutorial', 'News', 'Opinion', 'Case Study'];

export function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);


  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', featured_image: '',
    video_url: '', category: 'General', tags: '[]',
    is_featured: false, is_published: false, is_approved: true,
    author_name: 'Admin',
  });

  useEffect(() => { loadBlogs(); }, []);

  const loadBlogs = async () => {
    try {
      const data = await fetchApi('/blogs/admin/all');
      setBlogs(data);
    } catch (error) {
      console.error('Failed to load blogs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (blog?: Blog) => {
    if (blog) {
      setEditingId(blog.id);
      setForm({
        title: blog.title, slug: blog.slug, excerpt: blog.excerpt || '',
        content: blog.content, featured_image: blog.featured_image || '',
        video_url: blog.video_url || '', category: blog.category,
        tags: JSON.stringify(blog.tags || []),
        is_featured: blog.is_featured, is_published: blog.is_published,
        is_approved: blog.is_approved, author_name: blog.author_name,
      });
    } else {
      setEditingId(null);
      setForm({
        title: '', slug: '', excerpt: '', content: '', featured_image: '',
        video_url: '', category: 'General', tags: '[]',
        is_featured: false, is_published: false, is_approved: true, author_name: 'Admin',
      });
    }
    setIsModalOpen(true);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'featured_image' | 'video_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetchApi('/upload', {
        method: 'POST',
        body: formData,
      });

      setForm(prev => ({ ...prev, [field]: res.url }));
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedTags: string[] = [];
      try { parsedTags = JSON.parse(form.tags); } catch { parsedTags = form.tags.split(',').map(t => t.trim()).filter(Boolean); }

      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.title),
        tags: parsedTags,
        published_at: form.is_published ? new Date().toISOString() : null,
      };

      if (editingId) {
        await fetchApi(`/blogs/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await fetchApi('/blogs', { method: 'POST', body: JSON.stringify(payload) });
      }
      setIsModalOpen(false);
      loadBlogs();
    } catch (error) {
      console.error('Failed to save blog', error);
      alert('Failed to save blog.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this blog?')) {
      try {
        await fetchApi(`/blogs/${id}`, { method: 'DELETE' });
        loadBlogs();
      } catch (error) { console.error('Failed to delete', error); }
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      await fetchApi(`/blogs/${id}/approve`, { method: 'PUT', body: JSON.stringify({ is_approved: approved }) });
      loadBlogs();
    } catch (error) { console.error('Approve failed', error); }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      await fetchApi(`/blogs/${id}/feature`, { method: 'PUT', body: JSON.stringify({ is_featured: featured }) });
      loadBlogs();
    } catch (error) { console.error('Feature toggle failed', error); }
  };

  const filteredBlogs = blogs.filter(b => {
    const matchesFilter = filter === 'all' ||
      (filter === 'published' && b.is_published) ||
      (filter === 'draft' && !b.is_published) ||
      (filter === 'featured' && b.is_featured) ||
      (filter === 'pending' && !b.is_approved);
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: blogs.length,
    published: blogs.filter(b => b.is_published).length,
    drafts: blogs.filter(b => !b.is_published).length,
    featured: blogs.filter(b => b.is_featured).length,
    pending: blogs.filter(b => !b.is_approved).length,
    views: blogs.reduce((s, b) => s + (b.views_count || 0), 0),
  };

  return (
    <div className="blogs-admin">
      <div className="blogs-admin-header">
        <div>
          <h1>Blog Management</h1>
          <p>Create, manage, and moderate blog content</p>
        </div>
        <button onClick={() => handleOpenModal()} className="blogs-admin-add-btn">
          <Plus size={18} /> New Blog
        </button>
      </div>

      {/* Stats */}
      <div className="blogs-admin-stats">
        <div className="blogs-stat-card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total</div></div>
        <div className="blogs-stat-card"><div className="stat-value">{stats.published}</div><div className="stat-label">Published</div></div>
        <div className="blogs-stat-card"><div className="stat-value">{stats.drafts}</div><div className="stat-label">Drafts</div></div>
        <div className="blogs-stat-card featured"><div className="stat-value">{stats.featured}</div><div className="stat-label">Featured</div></div>
        <div className="blogs-stat-card pending"><div className="stat-value">{stats.pending}</div><div className="stat-label">Pending</div></div>
        <div className="blogs-stat-card"><div className="stat-value">{stats.views}</div><div className="stat-label">Total Views</div></div>
      </div>

      {/* Filters */}
      <div className="blogs-admin-filters">
        {['all', 'published', 'draft', 'featured', 'pending'].map(f => (
          <button key={f} className={`blogs-admin-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <input type="text" placeholder="Search blogs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="blogs-admin-search" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="blogs-admin-loading"><div className="blogs-admin-loading-spinner" /><p>Loading blogs...</p></div>
      ) : filteredBlogs.length === 0 ? (
        <div className="blogs-admin-empty"><p>No blogs found</p></div>
      ) : (
        <table className="blogs-admin-table">
          <thead>
            <tr>
              <th>Blog</th>
              <th>Category</th>
              <th>Status</th>
              <th>Views</th>
              <th>Likes</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.map(blog => (
              <tr key={blog.id}>
                <td>
                  <div className="blog-admin-title-cell">
                    {blog.featured_image && <img src={blog.featured_image} alt="" className="blog-admin-thumb" />}
                    <span className="blog-admin-title-text">{blog.title}</span>
                  </div>
                </td>
                <td>{blog.category}</td>
                <td>
                  <span className={`blog-admin-badge ${blog.is_published ? 'published' : 'draft'}`}>
                    {blog.is_published ? 'Published' : 'Draft'}
                  </span>
                  {!blog.is_approved && <span className="blog-admin-badge pending" style={{ marginLeft: 4 }}>Pending</span>}
                  {blog.is_featured && <span className="blog-admin-badge featured" style={{ marginLeft: 4 }}>Featured</span>}
                </td>
                <td>{blog.views_count}</td>
                <td>{blog.likes_count}</td>
                <td>{new Date(blog.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="blog-admin-actions">
                    <button className="blog-admin-action-btn" onClick={() => handleOpenModal(blog)} title="Edit"><Edit2 size={14} /></button>
                    {!blog.is_approved && (
                      <button className="blog-admin-action-btn approve" onClick={() => handleApprove(blog.id, true)} title="Approve"><Check size={14} /></button>
                    )}
                    <button className={`blog-admin-action-btn ${blog.is_featured ? 'feature' : ''}`} onClick={() => handleToggleFeatured(blog.id, !blog.is_featured)} title="Toggle Featured">
                      <Star size={14} fill={blog.is_featured ? 'currentColor' : 'none'} />
                    </button>
                    <button className="blog-admin-action-btn delete" onClick={() => handleDelete(blog.id)} title="Delete"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="blogs-admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="blogs-admin-modal" onClick={e => e.stopPropagation()}>
            <div className="blogs-admin-modal-header">
              <h2>{editingId ? 'Edit Blog' : 'New Blog'}</h2>
              <button className="blogs-admin-modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="blogs-admin-form">
              <div className="blogs-admin-form-row">
                <div className="blogs-admin-form-group">
                  <label>Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="blogs-admin-form-input" required />
                </div>
                <div className="blogs-admin-form-group">
                  <label>Author Name</label>
                  <input value={form.author_name} onChange={e => setForm({ ...form, author_name: e.target.value })} className="blogs-admin-form-input" />
                </div>
              </div>

              <div className="blogs-admin-form-row">
                <div className="blogs-admin-form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="blogs-admin-form-select">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="blogs-admin-form-group">
                  <label>Slug (auto-generated)</label>
                  <input value={form.slug || generateSlug(form.title)} onChange={e => setForm({ ...form, slug: e.target.value })} className="blogs-admin-form-input" />
                </div>
              </div>

              <div className="blogs-admin-form-row">
                <div className="blogs-admin-form-group">
                  <label>Featured Image</label>
                  <div className="media-input-group">
                    <input value={form.featured_image} onChange={e => setForm({ ...form, featured_image: e.target.value })} className="blogs-admin-form-input" placeholder="https://..." />
                    <label className="upload-btn-label">
                      <input type="file" onChange={e => handleFileUpload(e, 'featured_image')} accept="image/*" hidden />
                      {uploading === 'featured_image' ? '...' : <Upload size={16} />}
                    </label>
                  </div>
                  {form.featured_image && (
                    <div className="media-preview mini">
                      <img src={form.featured_image} alt="Preview" />
                      <button type="button" className="remove-media" onClick={() => setForm({ ...form, featured_image: '' })}>×</button>
                    </div>
                  )}
                </div>
                <div className="blogs-admin-form-group">
                  <label>Video or Audio URL / Upload</label>
                  <div className="media-input-group">
                    <input value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} className="blogs-admin-form-input" placeholder="https://youtube.com/... or upload" />
                    <label className="upload-btn-label">
                      <input type="file" onChange={e => handleFileUpload(e, 'video_url')} accept="video/*,audio/*" hidden />
                      {uploading === 'video_url' ? '...' : <Upload size={16} />}
                    </label>
                  </div>
                  {form.video_url && (
                    <div className="media-preview-container">
                      <VideoPlayer url={form.video_url} />
                      <button type="button" className="remove-media-overlay" onClick={() => setForm({ ...form, video_url: '' })}>Remove</button>
                    </div>
                  )}
                </div>
              </div>


              <div className="blogs-admin-form-group">
                <label>Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="blogs-admin-form-textarea" rows={2} placeholder="Brief summary..." />
              </div>

              <div className="blogs-admin-form-group">
                <label>Content *</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="blogs-admin-form-textarea" style={{ minHeight: 200 }} required placeholder="Write blog content (supports markdown)..." />
              </div>

              <div className="blogs-admin-form-group">
                <label>Tags (comma-separated)</label>
                <input value={typeof form.tags === 'string' && form.tags.startsWith('[') ? JSON.parse(form.tags).join(', ') : form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="blogs-admin-form-input" placeholder="react, web, tutorial" />
              </div>

              <div className="blogs-admin-form-row">
                <label className="blogs-admin-form-checkbox">
                  <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} /> Published
                </label>
                <label className="blogs-admin-form-checkbox">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} /> Featured
                </label>
                <label className="blogs-admin-form-checkbox">
                  <input type="checkbox" checked={form.is_approved} onChange={e => setForm({ ...form, is_approved: e.target.checked })} /> Approved
                </label>
              </div>

              <div className="blogs-admin-form-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="blogs-admin-cancel-btn">Cancel</button>
                <button type="submit" className="blogs-admin-save-btn">{editingId ? 'Save Changes' : 'Create Blog'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
