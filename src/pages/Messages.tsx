import { useEffect, useState } from 'react';
import { Mail, Calendar, Eye, Reply, Search, Filter, ChevronDown, Trash2 } from 'lucide-react';
import { fetchApi } from '../api';
import './Messages.css';

export interface Message {
  id: string | number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  created_at: string | Date;
  read?: boolean;
}

export function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMessages, setSelectedMessages] = useState<Set<string | number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadMessages();    
  }, []);

  const loadMessages = async () => {
    try {
      const data = await fetchApi('/contact');
      setMessages(data.map((msg: any) => ({ ...msg, read: false })));
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (msg: Message) => {
    const subject = encodeURIComponent(`Re: ${msg.subject || 'Your Message to Florante'}`);
    const body = encodeURIComponent(`\n\n--- Original Message from ${msg.name} ---\n${msg.message}`);
    window.location.href = `mailto:${msg.email}?subject=${subject}&body=${body}`;
  };

  const handleMarkAsRead = (msgId: string | number) => {
    setMessages(messages.map(msg => 
      msg.id === msgId ? { ...msg, read: true } : msg
    ));
  };

  const handleDelete = (msgId: string | number) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setMessages(messages.filter(msg => msg.id !== msgId));
      if (selectedMessage?.id === msgId) {
        setSelectedMessage(null);
      }
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedMessages.size} message(s)?`)) {
      setMessages(messages.filter(msg => !selectedMessages.has(msg.id)));
      setSelectedMessages(new Set());
    }
  };

  const toggleSelectMessage = (msgId: string | number) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(msgId)) {
      newSelected.delete(msgId);
    } else {
      newSelected.add(msgId);
    }
    setSelectedMessages(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedMessages.size === filteredMessages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(filteredMessages.map(msg => msg.id)));
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (msg.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'read' && msg.read) ||
                         (filterStatus === 'unread' && !msg.read);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="messages-container">
      {/* Header Section */}
      <div className="messages-header">
        <div>
          <h1 className="messages-title">Messages</h1>
          <p className="messages-subtitle">Contact form submissions from your website</p>
        </div>
        <div className="header-stats">
          <div className="stat-badge">
            <Mail size={16} />
            <span>{messages.length} Total</span>
          </div>
          <div className="stat-badge unread">
            <span>{messages.filter(m => !m.read).length} Unread</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="search-filters-bar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-wrapper">
          <button 
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Filter
            <ChevronDown size={16} className={`filter-chevron ${showFilters ? 'rotated' : ''}`} />
          </button>
          
          {showFilters && (
            <div className="filter-dropdown">
              <button 
                className={`filter-option ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All Messages
              </button>
              <button 
                className={`filter-option ${filterStatus === 'unread' ? 'active' : ''}`}
                onClick={() => setFilterStatus('unread')}
              >
                Unread
              </button>
              <button 
                className={`filter-option ${filterStatus === 'read' ? 'active' : ''}`}
                onClick={() => setFilterStatus('read')}
              >
                Read
              </button>
            </div>
          )}
        </div>

        {selectedMessages.size > 0 && (
          <button className="bulk-delete-btn" onClick={handleBulkDelete}>
            <Trash2 size={18} />
            Delete ({selectedMessages.size})
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="empty-state">
          <Mail size={48} className="empty-icon" />
          <h3>No messages found</h3>
          <p>When someone contacts you through the website, their messages will appear here.</p>
        </div>
      ) : (
        <>
          {/* Messages Table - Desktop */}
          <div className="messages-table-wrapper">
            <table className="messages-table">
              <thead>
                <tr>
                  <th className="checkbox-col">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedMessages.size === filteredMessages.length && filteredMessages.length > 0}
                        onChange={toggleSelectAll}
                        className="checkbox-input"
                      />
                      <span className="checkbox-custom"></span>
                    </label>
                  </th>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => (
                  <tr key={msg.id} className={`message-row ${!msg.read ? 'unread' : ''}`}>
                    <td className="checkbox-col">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedMessages.has(msg.id)}
                          onChange={() => toggleSelectMessage(msg.id)}
                          className="checkbox-input"
                        />
                        <span className="checkbox-custom"></span>
                      </label>
                    </td>
                    <td>
                      <div className="sender-info">
                        <div className="sender-avatar">
                          {msg.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="sender-name">{msg.name}</div>
                          <div className="sender-email">
                            <Mail size={12} /> {msg.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="subject-preview">
                        <div className="subject-text">{msg.subject || 'No Subject'}</div>
                        <div className="message-preview">{msg.message.substring(0, 60)}...</div>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <Calendar size={14} />
                        {new Date(msg.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${!msg.read ? 'unread' : 'read'}`}>
                        {!msg.read ? 'Unread' : 'Read'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => {
                            setSelectedMessage(msg);
                            handleMarkAsRead(msg.id);
                          }} 
                          className="action-btn view"
                          title="View message"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleReply(msg)} 
                          className="action-btn reply"
                          title="Reply via email"
                        >
                          <Reply size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(msg.id)} 
                          className="action-btn delete"
                          title="Delete message"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="messages-cards">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className={`message-card ${!msg.read ? 'unread' : ''}`}>
                <div className="card-header">
                  <div className="sender-avatar large">
                    {msg.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="card-header-info">
                    <div className="sender-name">{msg.name}</div>
                    <div className="sender-email">{msg.email}</div>
                  </div>
                  <span className={`status-badge ${!msg.read ? 'unread' : 'read'}`}>
                    {!msg.read ? 'Unread' : 'Read'}
                  </span>
                </div>
                <div className="card-subject">
                  <strong>{msg.subject || 'No Subject'}</strong>
                </div>
                <div className="card-message">
                  {msg.message.substring(0, 100)}...
                </div>
                <div className="card-footer">
                  <div className="date-info">
                    <Calendar size={14} />
                    {new Date(msg.created_at).toLocaleDateString()}
                  </div>
                  <div className="card-actions">
                    <button onClick={() => {
                      setSelectedMessage(msg);
                      handleMarkAsRead(msg.id);
                    }} className="action-btn view">View</button>
                    <button onClick={() => handleReply(msg)} className="action-btn reply">Reply</button>
                    <button onClick={() => handleDelete(msg.id)} className="action-btn delete">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal for Message Details */}
      {selectedMessage && (
        <div className="modal-overlay" onClick={() => setSelectedMessage(null)}>
          <div className="modal-container message-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Message Details</h2>
              <button className="modal-close" onClick={() => setSelectedMessage(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="message-detail-card">
                <div className="detail-header">
                  <div className="detail-sender">
                    <div className="sender-avatar large">
                      {selectedMessage.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{selectedMessage.name}</h3>
                      <a href={`mailto:${selectedMessage.email}`} className="detail-email">
                        <Mail size={14} /> {selectedMessage.email}
                      </a>
                    </div>
                  </div>
                  <div className="detail-date">
                    <Calendar size={14} />
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="detail-subject">
                  <label>Subject:</label>
                  <h4>{selectedMessage.subject || 'No Subject'}</h4>
                </div>
                <div className="detail-message">
                  <label>Message:</label>
                  <p>{selectedMessage.message}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedMessage(null)}>Close</button>
              <button className="btn-primary" onClick={() => handleReply(selectedMessage)}>
                <Reply size={16} /> Reply via Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}