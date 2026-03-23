import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';
import CallModal from './components/CallModal';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/chat" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
        
        {/* Global Application Header */}
        <header style={{ 
          padding: '20px 5%', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          width: '100%',
          boxSizing: 'border-box',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <MessageCircle size={36} color="var(--accent)" />
          <h1 style={{ 
            color: 'var(--text)', 
            fontSize: '24px', 
            fontWeight: '600', 
            margin: 0,
            letterSpacing: '0.5px'
          }}>
            PingChat
          </h1>
        </header>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingBottom: '80px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          </Routes>
        </div>

        {/* Call Modal globally available */}
        {user && <CallModal />}

      </div>
    </Router>
  );
}

export default App;
