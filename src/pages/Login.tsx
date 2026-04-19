import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Shield, Sparkles } from 'lucide-react';
import './Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load saved email if remember me was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.token);
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated background elements */}
      <div className="bg-gradient"></div>
      <div className="bg-shape bg-shape-1"></div>
      <div className="bg-shape bg-shape-2"></div>
      <div className="bg-shape bg-shape-3"></div>
      
      <div className="login-wrapper">
        <div className="login-card">
          {/* Decorative top bar */}
          <div className="card-decoration">
            <div className="decoration-line"></div>
            <div className="decoration-dots"></div>
          </div>

          {/* Header with icon */}
          <div className="login-header">
            <div className="logo-wrapper">
              <div className="logo-icon">
                <Shield size={32} />
              </div>
              <Sparkles className="sparkle-icon" size={16} />
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to your admin portal</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="error-message">
              <span className="error-text">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">
                {/* <Mail size={16} /> */}
                Email Address
              </label>
              <div className="input-wrapper">
                {/* <Mail className="input-icon" size={18} /> */}
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">
                {/* <Lock size={16} /> */}
                Password
              </label>
              <div className="input-wrapper">
                {/* <Lock className="input-icon" size={18} /> */}
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-text">Remember me</span>
              </label>
              <button type="button" className="forgot-link">
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Demo credentials hint */}
            <div className="demo-hint">
              <p>Demo: admin@example.com / admin123</p>
            </div>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p>Secure admin portal v2.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}