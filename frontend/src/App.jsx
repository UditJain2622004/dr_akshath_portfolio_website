import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function NotFound() {
  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center p-6 text-center" style={{ background: '#f8fafc' }}>
      <h1 className="text-4xl font-bold text-slate-800">404</h1>
      <p className="text-slate-500 mt-2">Page not found</p>
      <a href="/" className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-xl text-sm font-semibold">Back to Home</a>
    </div>
  );
}

export default function App() {
  const hostname = window.location.hostname.toLowerCase();
  const isAdminSubdomain = hostname.startsWith('admin.') || import.meta.env.VITE_IS_ADMIN_SITE === 'true';

  if (isAdminSubdomain) {
    return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/*" element={<AdminRoute />} />
          </Routes>
        </Router>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          {import.meta.env.DEV ? (
            <Route path="/admin/*" element={<AdminRoute />} />
          ) : (
            <Route path="/admin/*" element={<NotFound />} />
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}