import React, { useState, useEffect } from 'react';
import { T, I } from '../../components/admin/theme';
import { useAuth } from '../../context/AuthContext';
import { getDashboard, getClinics } from '../../services/adminApi';
import { toLocalDateStr } from '../../utils/dateUtils';

const today = toLocalDateStr();

// Clinic colour palette
const CLINIC_COLORS = ['#0f8c7a', '#6366f1', '#ec4899', '#f97316', '#3b82f6', '#16a34a'];

const StatCard = ({ label, value, sub, bg, color, border, onClick }) => (
  <button type="button" onClick={onClick}
    className="rounded-2xl md:rounded-3xl p-3 md:p-6 text-center transition-all hover:shadow-lg hover:-translate-y-0.5"
    style={{ background: bg, border: `1.5px solid ${border}` }}>
    <p className="text-2xl md:text-4xl font-bold" style={{ color, fontFamily: 'Outfit' }}>{value}</p>
    <p className="mt-1 text-[11px] md:text-sm font-semibold" style={{ color: T.navy, fontFamily: 'Outfit' }}>{label}</p>
    <p className="text-[9px] md:text-xs" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>{sub}</p>
  </button>
);

export default function HomePage({ setPage, pendingCount }) {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    Promise.all([getDashboard(token, today), getClinics(token)])
      .then(([dash, cl]) => {
        if (cancelled) return;
        setDashboard(dash);
        setClinics(cl.clinics || []);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const totals = dashboard?.totals || {};
  const backlog = dashboard?.backlog || {};
  const byClinic = dashboard?.byClinic || [];
  const livePendingCount = pendingCount ?? backlog.pending;

  // Build per-clinic stat lookup
  const clinicMap = Object.fromEntries((clinics || []).map(c => [c.id, c]));

  const leftCount = (totals.confirmed ?? 0);

  const stats = [
    { label: 'Left Today', value: totals.total != null ? leftCount : '—', sub: 'left today', bg: "white", color: T.teal, border: T.tealLight + '44', status: 'all' },
    { label: 'Completed', value: totals.completed ?? '—', sub: 'done today', bg: "white", color: '#16a34a', border: '#86efac66', status: 'completed' },
    { label: 'Cancelled', value: totals.cancelled ?? '—', sub: 'no-show / cancelled', bg: "white", color: '#dc2626', border: '#fecaca66', status: 'cancelled' },
  ];

  const quickNav = [
    { id: 'schedule', icon: 'calendar', label: 'Schedule', desc: "Today's list", accent: T.teal, bg: T.hero },
    { id: 'pending', icon: 'bell', label: 'Pending Requests', desc: `${livePendingCount ?? '…'} awaiting`, accent: '#d97706', bg: '#fff7ed', badge: livePendingCount },
    { id: 'create', icon: 'plus', label: 'New Booking', desc: 'Manual booking', accent: '#6366f1', bg: '#f5f3ff' },
    { id: 'manage', icon: 'sliders', label: 'Manage Slots', desc: 'Block / free slots', accent: '#ec4899', bg: '#fdf2f8' },
    { id: 'delay', icon: 'delay', label: 'Add Leave', desc: 'Mark unavailable', accent: '#f97316', bg: '#fff7ed' },
    { id: 'history', icon: 'history', label: 'History', desc: 'Past records', accent: T.tealLight, bg: T.mint },
  ];

  return (
    <div className="flex flex-col pb-32">
      {/* ── Hero ── */}
      <div className="px-5 pt-5 pb-5 md:px-0 bg-white">
        <p className="md:hidden text-[10px] font-semibold tracking-widest" style={{ color: T.tealLight }}>
          {todayLabel.toUpperCase()}
        </p>
        <h1 className="text-2xl md:text-4xl font-bold mt-0.5" style={{ fontFamily: 'DM Serif Display, serif', color: T.navy }}>
          Good morning, <span style={{ color: T.teal }}>Doctor</span> 👋
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-4 mt-4 md:mt-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl md:rounded-3xl p-3 md:p-6 animate-pulse" style={{ background: '#f1f5f9', minHeight: 80 }} />
            ))
            : stats.map(s => (
              <StatCard
                key={s.label}
                {...s}
                onClick={() => setPage('schedule', { status: s.status })}
              />
            ))
          }
        </div>
      </div>

      {/* ── Pending Alert ── */}
      {!loading && (livePendingCount > 0) && (
        <div className="mx-4 mt-4 md:mx-0">
          <button onClick={() => setPage('pending')} className="w-full rounded-2xl p-3.5 flex items-center justify-between hover:opacity-90 transition-opacity"
            style={{ background: '#fffbeb', border: '1.5px solid #fcd34d' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#fef3c7' }}>
                <span style={{ color: '#d97706' }}><I n="bell" s={18} /></span>
              </div>
              <div className="text-left">
                <p className="font-bold text-[13px]" style={{ color: T.navy, fontFamily: 'Outfit' }}>
                  {livePendingCount} Pending Request{livePendingCount !== 1 ? 's' : ''}
                </p>
                <p className="text-[11px]" style={{ color: '#92400e', fontFamily: 'Outfit' }}>Tap to review & confirm</p>
              </div>
            </div>
            <span style={{ color: '#d97706' }}><I n="chevR" s={16} /></span>
          </button>
        </div>
      )}

      {/* ── Per-clinic Breakdown ── */}
      {!loading && byClinic.length > 0 && (
        <div className="px-4 mt-6 md:px-0">
          <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: T.navy, opacity: 0.45 }}>
            By Clinic — Today
          </p>
          <div className="flex flex-col gap-2">
            {byClinic.map((c, idx) => {
              const clinic = clinicMap[c.clinicId];
              const color = CLINIC_COLORS[idx % CLINIC_COLORS.length];
              return (
                <button key={c.clinicId} type="button"
                  onClick={() => setPage('schedule', { status: 'all', clinicId: c.clinicId })}
                  className="rounded-2xl p-3.5 flex items-center gap-3 text-left transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ background: 'white', border: `1px solid ${T.mint}`, boxShadow: '0 2px 8px rgba(7,25,46,0.04)' }}>
                  <div className="w-2.5 h-10 rounded-full flex-shrink-0" style={{ background: color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px] truncate" style={{ color: T.navy, fontFamily: 'Outfit' }}>
                      {clinic?.name || c.clinicId}
                    </p>
                    <p className="text-[10px]" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>
                      {clinic?.address || ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-right flex-shrink-0">
                    <div>
                      <p className="text-lg font-bold" style={{ color, fontFamily: 'Outfit' }}>{c.total}</p>
                      <p className="text-[9px]" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>total</p>
                    </div>
                    {c.pending > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fff7ed', color: '#d97706', border: '1px solid #fcd34d' }}>
                        {c.pending} pending
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick Nav ── */}
      <div className="px-4 mt-6 md:px-0">
        <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: T.navy, opacity: 0.45 }}>
          Quick Actions
        </p>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 md:gap-4">
          {quickNav.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              className="rounded-2xl p-3.5 md:p-5 text-left relative transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ background: T.white, border: `1px solid ${T.mint}`, boxShadow: '0 2px 8px rgba(7,25,46,0.05)' }}>
              {n.badge > 0 && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center animate-pulse"
                  style={{ background: '#ef4444', fontSize: 8, color: 'white', fontWeight: 700 }}>
                  {n.badge}
                </span>
              )}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: n.bg }}>
                <span style={{ color: n.accent }}><I n={n.icon} s={17} /></span>
              </div>
              <p className="text-[11px] font-semibold" style={{ color: T.navy, fontFamily: 'Outfit' }}>{n.label}</p>
              <p className="text-[9px]" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>{n.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}