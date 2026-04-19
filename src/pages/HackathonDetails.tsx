import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Folder, MessageCircle, GitBranch, Video, Send,  } from 'lucide-react';
import { fetchApi } from '../api';
import './HackathonDetails.css';

interface Submission {
  id: string | number;
  project_title: string;
  description: string;
  github_link?: string;
  video_link?: string;
  answers?: any;
  feedback?: string;
  created_at: string;
  teams?: {
    team_name: string;
  };
}

interface Registration {
  id: string;
  leader_name: string;
  university_name: string;
  project_name: string;
  created_at: string;
}

interface Hackathon {
  id: string | number;
  title: string;
  description: string;
  start_date: string;
  deadline: string;
  status: string;
}

export function HackathonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'submissions' | 'participants' | 'registrations'>('submissions');
  const [feedbackText, setFeedbackText] = useState<{ [key: string]: string }>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hData, sData, rData] = await Promise.all([
        fetchApi(`/hackathons/${id}`),
        fetchApi(`/submissions/hackathon/${id}`),
        fetchApi(`/hackathons/${id}/registrations`)
      ]);
      setHackathon(hData);
      setSubmissions(sData);
      setRegistrations(rData);
      
      // Initialize feedback text state
      const initialFeedback: { [key: string]: string } = {};
      sData.forEach((s: Submission) => {
        initialFeedback[s.id] = s.feedback || '';
      });
      setFeedbackText(initialFeedback);
    } catch (error) {
      console.error('Failed to load hackathon details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (submissionId: string | number) => {
    setSubmittingFeedback(prev => ({ ...prev, [submissionId]: true }));
    try {
      await fetchApi(`/submissions/${submissionId}/feedback`, {
        method: 'PUT',
        body: JSON.stringify({ feedback: feedbackText[submissionId] }),
      });
      // Show success state or just keep the text
      alert('Feedback submitted successfully!');
    } catch (error) {
      console.error('Failed to submit feedback', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingFeedback(prev => ({ ...prev, [submissionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading hackathon details...</p>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="error-container">
        <h3>Hackathon not found</h3>
        <button onClick={() => navigate('/hackathons')} className="back-link">
          <ArrowLeft size={18} /> Back to Hackathons
        </button>
      </div>
    );
  }

  return (
    <div className="hackathon-details-container">
      <button onClick={() => navigate('/hackathons')} className="back-button">
        <ArrowLeft size={18} />
        Back to Hackathons
      </button>

      <div className="hackathon-details-header">
        <div className="header-info">
          <h1 className="details-title">{hackathon.title}</h1>
          <div className="details-meta">
            <span className={`status-badge ${hackathon.status}`}>{hackathon.status}</span>
            <span className="meta-item">Deadline: {new Date(hackathon.deadline).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('submissions')}
        >
          <Folder size={18} />
          Projects ({submissions.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          <Users size={18} />
          Submissions ({submissions.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          <Send size={18} />
          Registered ({registrations.length})
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'submissions' ? (
          <div className="submissions-list">
            {submissions.length === 0 ? (
              <div className="empty-submissions">
                <p>No projects submitted yet.</p>
              </div>
            ) : (
              submissions.map(submission => (
                <div key={submission.id} className="submission-card">
                  <div className="submission-main">
                    <div className="submission-header">
                      <h3 className="project-title">{submission.project_title}</h3>
                      <span className="team-name">by {submission.teams?.team_name || 'Individual'}</span>
                    </div>
                    <p className="project-desc">{submission.description}</p>
                    
                    <div className="project-links">
                      {submission.github_link && (
                        <a href={submission.github_link} target="_blank" rel="noopener noreferrer" className="link-item">
                          <GitBranch size={16} /> GitHub
                        </a>
                      )}
                      {submission.video_link && (
                        <a href={submission.video_link} target="_blank" rel="noopener noreferrer" className="link-item">
                          <Video size={16} /> Demo Video
                        </a>
                      )}
                    </div>

                    {submission.answers && (
                      <div className="project-answers">
                        <h4 className="answers-title">Submission Details</h4>
                        <div className="answers-grid">
                          {Object.entries(submission.answers).map(([key, value]) => (
                            <div key={key} className="answer-item">
                              <span className="answer-key">{key.replace(/_/g, ' ')}:</span>
                              <p className="answer-value">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="submission-feedback">
                    <h4 className="feedback-title">
                      <MessageCircle size={16} />
                      Feedback
                    </h4>
                    <textarea 
                      className="feedback-textarea"
                      placeholder="Write your feedback for the participants..."
                      value={feedbackText[submission.id] || ''}
                      onChange={(e) => setFeedbackText({ ...feedbackText, [submission.id]: e.target.value })}
                    />
                    <button 
                      className="submit-feedback-btn"
                      onClick={() => handleFeedbackSubmit(submission.id)}
                      disabled={submittingFeedback[submission.id]}
                    >
                      {submittingFeedback[submission.id] ? 'Sending...' : (
                        <>
                          <Send size={16} />
                          Send Feedback
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'participants' ? (
          <div className="participants-list">
            <div className="participants-table-wrapper">
              <table className="participants-table">
                <thead>
                  <tr>
                    <th>Team/User</th>
                    <th>Project</th>
                    <th>Submitted At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map(submission => (
                    <tr key={submission.id}>
                      <td className="participant-name">
                        <Users size={16} />
                        {submission.teams?.team_name || 'Individual'}
                      </td>
                      <td>{submission.project_title}</td>
                      <td>{new Date(submission.created_at).toLocaleString()}</td>
                      <td>
                        <button 
                          className="table-view-btn"
                          onClick={() => setActiveTab('submissions')}
                        >
                          View Project
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="participants-list">
            <div className="participants-table-wrapper">
              <table className="participants-table">
                <thead>
                  <tr>
                    <th>Leader/Project</th>
                    <th>University</th>
                    <th>Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.length === 0 ? (
                    <tr><td colSpan={3} className="text-center">No registrations yet.</td></tr>
                  ) : (
                    registrations.map(reg => (
                      <tr key={reg.id}>
                        <td>
                          <div className="leader-cell">
                            <strong>{reg.leader_name}</strong>
                            <span>{reg.project_name}</span>
                          </div>
                        </td>
                        <td>{reg.university_name}</td>
                        <td>{new Date(reg.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HackathonDetails;
