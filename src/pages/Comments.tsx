import { useEffect, useState } from 'react';
import { Trash2, MessageSquare, ExternalLink, Calendar } from 'lucide-react';
import { fetchApi } from '../api';
import './Comments.css';

interface Comment {
  id: string;
  blog_id: string;
  user_name: string;
  content: string;
  created_at: string;
  blogs?: {
    title: string;
    slug: string;
  };
}

export function Comments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadComments(); }, []);

  const loadComments = async () => {
    try {
      const data = await fetchApi('/blogs/admin/comments');
      setComments(data || []);
    } catch (error) {
      console.error('Failed to load comments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await fetchApi(`/blogs/comments/${id}`, { method: 'DELETE' });
        loadComments();
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  return (
    <div className="comments-admin">
      <div className="comments-admin-header">
        <h1>Comments Moderation</h1>
        <p>Review and manage comments across all blog posts</p>
      </div>

      {loading ? (
        <div className="comments-loading">
          <div className="blogs-admin-loading-spinner" />
          <p>Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="comments-empty">
          <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>No comments found</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="comment-main">
                <div className="comment-user-info">
                  <div className="comment-avatar">
                    {comment.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="comment-username">{comment.user_name}</span>
                  <span className="comment-date">
                    <Calendar size={12} style={{ marginRight: 4 }} />
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="comment-text">{comment.content}</p>
                {comment.blogs && (
                  <a 
                    href={`${import.meta.env.VITE_WEBSITE_URL || ''}/blogs/${comment.blogs.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="comment-target"
                  >
                    On: {comment.blogs.title} <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <div className="comment-actions">
                <button 
                  className="comment-action-btn" 
                  onClick={() => handleDelete(comment.id)} 
                  title="Delete Comment"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
