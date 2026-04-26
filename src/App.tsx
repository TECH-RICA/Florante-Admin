
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Projects } from './pages/Projects';
import { Hackathons } from './pages/Hackathons';
import { HackathonDetails } from './pages/HackathonDetails';
import { Universities } from './pages/Universities';
import { Testimonials } from './pages/Testimonials';
import { Messages } from './pages/Messages';
import { Blogs } from './pages/Blogs';
import { Comments } from './pages/Comments';
import { BlogAnalytics } from './pages/BlogAnalytics';
import { Services } from './pages/Services';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Projects />} />
            <Route path="hackathons" element={<Hackathons />} />
            <Route path="hackathons/:id" element={<HackathonDetails />} />
            <Route path="universities" element={<Universities />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="messages" element={<Messages />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="comments" element={<Comments />} />
            <Route path="analytics" element={<BlogAnalytics />} />
            <Route path="services" element={<Services />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
