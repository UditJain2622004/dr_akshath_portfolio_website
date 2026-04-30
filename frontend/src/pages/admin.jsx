import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from '../components/admin/navbar';
import BottomBar from '../components/admin/bottomTabs';
import HomePage from './admin/home';
import SchedulePage from './admin/schedule';
import PendingPage from './admin/pending';
import HistoryPage from './admin/history';
import ProfilePage from './admin/profile';
import CreateBookingPage from './admin/createBooking';
import ManageSlotsPage from './admin/manageSlots';
import AddLeavePage from './admin/addLeave';
import { T, I } from '../components/admin/theme';
import { useAuth } from '../context/AuthContext';
import { getBookings } from '../services/adminApi';

const SidebarItem = ({ id, icon, label, badge, active, onClick }) => (
  <button onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all`}
    style={{ color: active ? T.teal : T.navy, background: active ? T.hero : 'transparent' }}>
    <I n={icon} s={20} />
    <span className="flex-1 text-left text-sm" style={{ fontFamily: 'Outfit', fontWeight: active ? 700 : 400 }}>{label}</span>
    {badge > 0 && (
      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white animate-pulse"
        style={{ background: '#ef4444' }}>
        {badge}
      </span>
    )}
    {active && <div className="w-1.5 h-6 rounded-full" style={{ background: T.teal }} />}
  </button>
);

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const { token, user, logout } = useAuth();

  // Extract current page from URL: /admin/schedule -> schedule
  const currentPath = location.pathname.split('/').pop() || 'home';

  // Poll pending count every 90 seconds
  useEffect(() => {
    if (!token) return;
    const fetchPending = () => {
      getBookings(token, { status: 'pending' })
        .then(r => setPendingCount((r.bookings || []).length))
        .catch(() => {});
    };
    fetchPending();
    const interval = setInterval(fetchPending, 90_000);
    return () => clearInterval(interval);
  }, [token]);

  const tabs = [
    { id: 'home',     icon: 'home',     label: 'Dashboard' },
    { id: 'schedule', icon: 'calendar', label: 'Schedule' },
    { id: 'pending',  icon: 'bell',     label: 'Requests',  badge: pendingCount },
    { id: 'profile',  icon: 'user',     label: 'Profile' },
  ];

  const handleNavigate = (id) => {
    navigate(`/admin/${id}`);
  };

  const pageLabel = tabs.find(t => t.id === currentPath)?.label || 'Dashboard';

  return (
    <div className="h-[100dvh] flex overflow-hidden" style={{ background: '#f8fafc' }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-100 p-6 shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`, boxShadow: `0 8px 16px ${T.glow}` }}>
            <span className="text-white text-xl font-bold" style={{ fontFamily: 'DM Serif Display' }}>A</span>
          </div>
          <div>
            <h2 className="font-bold leading-tight" style={{ color: T.navy, fontFamily: 'Outfit' }}>Dr. Akshath</h2>
            <p className="text-[10px] tracking-widest font-bold uppercase" style={{ color: T.tealLight, fontFamily: 'Outfit' }}>
              {user?.email?.split('@')[0] || 'Admin'}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 tracking-widest px-4 mb-4 uppercase">Main Menu</p>
          {tabs.map(tab => (
            <SidebarItem key={tab.id} {...tab} active={currentPath === tab.id} onClick={handleNavigate} />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all">
            <I n="x" s={20} />
            <span className="text-sm font-bold" style={{ fontFamily: 'Outfit' }}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content Wrapper ── */}
      <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden md:max-w-none max-w-md mx-auto shadow-2xl md:shadow-none">

        {/* Mobile header */}
        <div className="md:hidden">
          <Navbar setPage={handleNavigate} pendingCount={pendingCount} />
        </div>

        {/* Desktop header */}
        <header className="hidden md:flex items-center justify-between px-10 py-5 border-b border-slate-100 bg-white">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.navy, fontFamily: 'DM Serif Display' }}>
              {pageLabel}
            </h1>
            <p className="text-sm text-slate-400" style={{ fontFamily: 'Outfit' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => handleNavigate('pending')}
              className="p-3 rounded-2xl bg-slate-50 relative hover:bg-slate-100 transition-all">
              <I n="bell" s={20} />
              {pendingCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white animate-pulse" />
              )}
            </button>
            <button onClick={logout}
              className="text-xs font-bold px-4 py-2 rounded-xl border hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all"
              style={{ borderColor: T.mint, color: T.navy, fontFamily: 'Outfit' }}>
              Sign Out
            </button>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto relative no-scrollbar" style={{ background: '#f8fafc' }}>
          <div className="h-full w-full max-w-5xl mx-auto md:px-8 md:py-6 bg-white md:bg-transparent">
            <Routes>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<HomePage setPage={handleNavigate} />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="pending" element={<PendingPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="profile" element={<ProfilePage setPage={handleNavigate} />} />
              <Route path="create" element={<CreateBookingPage setPage={handleNavigate} />} />
              <Route path="manage" element={<ManageSlotsPage setPage={handleNavigate} />} />
              <Route path="delay" element={<AddLeavePage setPage={handleNavigate} />} />
              <Route path="*" element={<Navigate to="home" replace />} />
            </Routes>
          </div>

          {/* FAB */}
          {(currentPath === 'schedule' || currentPath === 'home') && (
            <div className="fixed bottom-24 right-4 md:bottom-10 md:right-10 z-20">
              <button onClick={() => handleNavigate('create')}
                className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                style={{ background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`, boxShadow: `0 12px 32px ${T.glow}` }}>
                <span style={{ color: 'white' }}><I n="plus" s={26} /></span>
              </button>
            </div>
          )}
        </main>

        {/* Mobile bottom bar */}
        <div className="md:hidden">
          <BottomBar page={currentPath} setPage={handleNavigate} />
        </div>
      </div>
    </div>
  );
}
