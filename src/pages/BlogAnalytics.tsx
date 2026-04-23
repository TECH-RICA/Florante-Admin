import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { fetchApi } from '../api';
import './BlogAnalytics.css';

interface BlogAnalyticsData {
  totalBlogs: number;
  publishedBlogs: number;
  featuredBlogs: number;
  pendingApproval: number;
  totalViews: number;
  totalLikes: number;
  totalSaves: number;
  totalComments: number;
  mostPopular: any[];
  recentBlogs: any[];
}

export function BlogAnalytics() {
  const [data, setData] = useState<BlogAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const analytics = await fetchApi('/blogs/analytics/dashboard');
        setData(analytics);
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="blogs-admin-loading-spinner" />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="analytics-admin">
      <div className="analytics-admin-header">
        <h1>Blog Insights & Analytics</h1>
      </div>

      <div className="summary-stats-grid">
        <div className="summary-stat-box">
          <span className="summary-stat-value">{data.totalViews.toLocaleString()}</span>
          <span className="summary-stat-label">Total Views</span>
        </div>
        <div className="summary-stat-box">
          <span className="summary-stat-value">{data.totalLikes.toLocaleString()}</span>
          <span className="summary-stat-label">Total Likes</span>
        </div>
        <div className="summary-stat-box">
          <span className="summary-stat-value">{data.totalSaves.toLocaleString()}</span>
          <span className="summary-stat-label">Total Saves</span>
        </div>
        <div className="summary-stat-box">
          <span className="summary-stat-value">{data.totalComments.toLocaleString()}</span>
          <span className="summary-stat-label">Total Comments</span>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Most Popular */}
        <div className="analytics-card">
          <h3><TrendingUp size={18} /> Most Popular Blogs</h3>
          <div className="popular-blogs-list">
            {data.mostPopular.map((blog) => (
              <div key={blog.id} className="popular-blog-item">
                <div className="popular-blog-info">
                  <div className="popular-blog-title">{blog.title}</div>
                  <div className="popular-blog-date">{new Date(blog.published_at || blog.created_at).toLocaleDateString()}</div>
                </div>
                <div className="popular-blog-stat">
                  <span className="popular-blog-value">{blog.views_count}</span>
                  <span className="popular-blog-label">Views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Breakdown */}
        <div className="analytics-card">
          <h3><BarChart3 size={18} /> Content Distribution</h3>
          <div className="engagement-bars">
            <div className="engagement-bar-item">
              <div className="engagement-bar-label">
                <span>Published</span>
                <span>{Math.round((data.publishedBlogs / data.totalBlogs) * 100)}%</span>
              </div>
              <div className="engagement-bar-bg">
                <div className="engagement-bar-fill" style={{ width: `${(data.publishedBlogs / data.totalBlogs) * 100}%` }} />
              </div>
            </div>
            <div className="engagement-bar-item">
              <div className="engagement-bar-label">
                <span>Featured</span>
                <span>{Math.round((data.featuredBlogs / data.totalBlogs) * 100)}%</span>
              </div>
              <div className="engagement-bar-bg">
                <div className="engagement-bar-fill" style={{ width: `${(data.featuredBlogs / data.totalBlogs) * 100}%`, background: '#f59e0b' }} />
              </div>
            </div>
            <div className="engagement-bar-item">
              <div className="engagement-bar-label">
                <span>Pending Approval</span>
                <span>{Math.round((data.pendingApproval / data.totalBlogs) * 100)}%</span>
              </div>
              <div className="engagement-bar-bg">
                <div className="engagement-bar-fill" style={{ width: `${(data.pendingApproval / data.totalBlogs) * 100}%`, background: '#ef4444' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
