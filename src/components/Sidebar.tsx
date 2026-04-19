import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Quote, LogOut, Menu, X, Trophy, School } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import './Sidebar.css';

export function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
     
  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };    

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Projects' },
    { to: '/hackathons', icon: Trophy, label: 'Hackathons' },
    { to: '/universities', icon: School, label: 'Universities' },
    { to: '/testimonials', icon: Quote, label: 'Testimonials' },
    { to: '/messages', icon: MessageSquare, label: 'Messages' }
  ];

  const SidebarContent = () => (
    <>
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            <span className="logo-text">FA</span>
          </div>
          <h1 className="sidebar-title">
            Florante Admin
          </h1>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleMobileLinkClick}
            className={({ isActive }) =>
              `nav-items ${isActive ? 'nav-item-active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
                {isActive && <span className="nav-indicator" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobile ? 'sidebar-mobile' : 'sidebar-desktop'} ${isMobile && isMobileMenuOpen ? 'sidebar-open' : ''}`}>
        <SidebarContent />
      </aside>
    </>
  );
}