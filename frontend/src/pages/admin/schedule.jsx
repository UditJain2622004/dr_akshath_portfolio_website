import React, { useState, useEffect, useMemo } from 'react';
import { T, I } from '../../components/admin/theme';
import { useAuth } from '../../context/AuthContext';
import { getSchedule, getClinics, updateBooking } from '../../services/adminApi';
import ScheduleCard from '../../components/admin/appointmentCard';
import ClinicFilterBar from '../../components/admin/ClinicFilterBar';
import { toLocalDateStr } from '../../utils/dateUtils';

const CLINIC_COLORS = ['#0f8c7a', '#6366f1', '#ec4899', '#f97316', '#3b82f6', '#16a34a'];

const STATUS_FILTERS = [
  { id: 'confirmed', label: 'Confirmed', activeBg: '#3b82f6' },
  { id: 'completed', label: 'Done', activeBg: '#16a34a' },
  { id: 'pending', label: 'Pending', activeBg: '#d97706' },
  { id: 'cancelled', label: 'Cancelled', activeBg: '#dc2626' },
  { id: 'all', label: 'All', activeBg: T.teal },
];

function toYMD(date) {
  return toLocalDateStr(date);
}

function offsetDate(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

export default function SchedulePage() {
  const { token } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedClinic, setSelectedClinic] = useState(null); // null = all
  const [statusFilter, setStatusFilter] = useState('confirmed');
  const [dateOffset, setDateOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const today = new Date();
  const currentDate = offsetDate(today, dateOffset);
  const dateStr = toYMD(currentDate);
  const isToday = dateOffset === 0;
  const displayDate = isToday ? 'Today' : currentDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const fullDate = currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // Fetch clinics once
  useEffect(() => {
    if (!token) return;
    getClinics(token).then(r => setClinics(r.clinics || [])).catch(console.error);
  }, [token]);

  // Fetch schedule whenever date or clinic changes
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    getSchedule(token, {
      dateFrom: dateStr,
      dateTo: dateStr,
      clinicId: selectedClinic || undefined,
    })
      .then(r => setAppointments(r.schedule || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, dateStr, selectedClinic]);

  // Client-side status + search filter
  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchStatus = statusFilter === 'all' || a.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || (a.patientName || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [appointments, statusFilter, search]);

  const counts = useMemo(() => ({
    all: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => ['cancelled', 'rejected'].includes(a.status)).length,
  }), [appointments]);

  const completedCount = counts.completed;
  const activeCount = appointments.filter(a => !['cancelled', 'rejected'].includes(a.status)).length;

  // Group by clinic when "All Clinics" selected
  const grouped = useMemo(() => {
    if (selectedClinic) return null; // flat list
    const map = {};
    filtered.forEach(a => {
      const key = a.clinicId || 'unknown';
      if (!map[key]) map[key] = [];
      map[key].push(a);
    });
    return map;
  }, [filtered, selectedClinic]);

  const handleAction = async (appointmentId, action) => {
    try {
      await updateBooking(token, { appointmentId, action });
      // Re-fetch
      const r = await getSchedule(token, { dateFrom: dateStr, dateTo: dateStr, clinicId: selectedClinic || undefined });
      setAppointments(r.schedule || []);
      setExpandedId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const renderCard = (appt) => (
    <ScheduleCard
      key={appt.id}
      appt={appt}
      clinics={clinics}
      showClinicBadge={!selectedClinic}
      expanded={expandedId === appt.id}
      onToggle={() => setExpandedId(expandedId === appt.id ? null : appt.id)}
      onAction={handleAction}
    />
  );

  return (
    <div className="flex flex-col">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10" style={{ background: T.white, borderBottom: `1px solid ${T.mint}` }}>
        {/* Date nav */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button onClick={() => setDateOffset(d => d - 1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: T.mintFaint, border: `1px solid ${T.mint}`, color: T.navy }}>
            <I n="chevL" s={16} />
          </button>
          <div className="text-center">
            <p className="font-bold" style={{ color: T.navy, fontFamily: 'Outfit', fontSize: 14 }}>{displayDate}</p>
            <p className="text-[10px]" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>{fullDate}</p>
          </div>
          <button onClick={() => setDateOffset(d => d + 1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: T.mintFaint, border: `1px solid ${T.mint}`, color: T.navy }}>
            <I n="chevR" s={16} />
          </button>
        </div>

        {/* Progress bar */}
        {/* <div className="px-4 pb-3">
          <div className="flex justify-between mb-1.5">
            <span className="text-[10px]" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>Day progress</span>
            <span className="text-[10px] font-bold" style={{ color: T.teal, fontFamily: 'Outfit' }}>
              {completedCount}/{activeCount} completed
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.hero }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: activeCount > 0 ? `${(completedCount / activeCount) * 100}%` : '0%',
                background: `linear-gradient(90deg, ${T.teal}, ${T.tealLight})`
              }} />
          </div>
        </div> */}

        {/* Clinic Filter */}
        {clinics.length > 0 && (
          <div className="pb-3">
            <ClinicFilterBar clinics={clinics} selected={selectedClinic} onChange={setSelectedClinic} />
          </div>
        )}

        {/* Status Filter chips */}
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
          {STATUS_FILTERS.map(f => {
            const active = statusFilter === f.id;
            return (
              <button key={f.id} onClick={() => setStatusFilter(f.id)}
                className="flex-shrink-0 rounded-full px-3 py-1.5 flex items-center gap-1.5"
                style={{
                  background: active ? f.activeBg : 'white',
                  border: active ? 'none' : `1px solid ${T.mint}`,
                  color: active ? 'white' : T.navy,
                  fontFamily: 'Outfit', fontSize: 11, fontWeight: active ? 700 : 400,
                }}>
                {f.label}
                <span className="rounded-full px-1.5 py-0.5"
                  style={{ background: active ? 'rgba(255,255,255,0.25)' : T.mint, color: active ? 'white' : T.teal, fontSize: 9, fontWeight: 700 }}>
                  {counts[f.id] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 mx-4 mb-3 rounded-xl px-3 py-2.5"
          style={{ background: 'white', border: `0.8px solid ${T.hero}` }}>
          <span style={{ color: T.tealLight }}><I n="search" s={15} /></span>
          <input type="text" placeholder="Search patient…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: T.navy, fontFamily: 'Outfit' }} />
          {search && <button onClick={() => setSearch('')} style={{ color: '#9ca3af' }}><I n="x" s={14} /></button>}
        </div>


      </div>

      {/* ── Content ── */}
      <div className="px-4 py-3 pb-32 md:px-0">
        {loading && (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ height: 80, background: '#f1f5f9' }} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-sm text-red-500" style={{ fontFamily: 'Outfit' }}>{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.hero }}>
              <span style={{ color: T.teal }}><I n="calendar" s={26} /></span>
            </div>
            <p className="text-sm" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>No appointments found</p>
          </div>
        )}

        {/* Grouped by clinic (All Clinics selected) */}
        {!loading && !error && grouped && (
          <div className="flex flex-col gap-6">
            {Object.entries(grouped).map(([clinicId, appts], idx) => {
              const clinic = clinics.find(c => c.id === clinicId);
              const color = CLINIC_COLORS[idx % CLINIC_COLORS.length];
              return (
                <div key={clinicId}>
                  {/* Clinic section header */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <p className="text-xs font-bold truncate" style={{ color: T.navy, fontFamily: 'Outfit' }}>
                      {clinic?.name || clinicId}
                    </p>
                    <span className="text-[10px] rounded-full px-2 py-0.5 font-bold"
                      style={{ background: color + '18', color, border: `1px solid ${color}44`, fontFamily: 'Outfit' }}>
                      {appts.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {appts.map(renderCard)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Flat list (specific clinic selected) */}
        {!loading && !error && !grouped && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(renderCard)}
          </div>
        )}
      </div>
    </div>
  );
}
