import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/home';
import Admin from './pages/admin';
import LoginPage from './pages/Login';

function AdminRoute() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-[100dvh] flex items-center justify-center" style={{ background: '#edfaf7' }}>
      <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#0f8c7a', borderTopColor: 'transparent' }} />
    </div>
  );
  if (!user) return <LoginPage />;
  return <Admin />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/*" element={<AdminRoute />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}