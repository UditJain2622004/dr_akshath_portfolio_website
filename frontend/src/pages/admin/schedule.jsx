import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { T, I } from '../../components/admin/theme';
import { useAuth } from '../../context/AuthContext';
import { getSchedule, getClinics, updateBooking } from '../../services/adminApi';

import ScheduleCard from '../../components/admin/appointmentCard';
import ClinicFilterBar from '../../components/admin/ClinicFilterBar';
import { toLocalDateStr } from '../../utils/dateUtils';

const CLINIC_COLORS = ['#0f8c7a', '#6366f1', '#ec4899', '#f97316', '#3b82f6', '#16a34a'];

const STATUS_FILTERS = [
  { id: 'confirmed', label: 'Left Today', activeBg: '#3b82f6' },
  { id: 'completed', label: 'Done', activeBg: '#16a34a' },
  { id: 'pending', label: 'Pending Requests', activeBg: '#d97706' },
  { id: 'cancelled', label: 'Cancelled', activeBg: '#dc2626' },
  { id: 'all', label: 'All', activeBg: T.teal },
];

export default function SchedulePage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedClinic, setSelectedClinic] = useState(null); // null = all
  const [statusFilter, setStatusFilter] = useState('confirmed');
  const [selectedDateStr, setSelectedDateStr] = useState(() => toLocalDateStr());
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const dateInputRef = useRef(null);

  const todayStr = toLocalDateStr();
  const dateStr = selectedDateStr;
  const currentDate = new Date(selectedDateStr + 'T00:00:00');
  const isToday = selectedDateStr === todayStr;
  const displayDate = isToday ? 'Today' : currentDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const fullDate = currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const openDatePicker = () => {
    if (dateInputRef.current) {
      if (dateInputRef.current.showPicker) {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  useEffect(() => {
    const status = searchParams.get('status');
    const clinicId = searchParams.get('clinicId');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatusFilter(STATUS_FILTERS.some(f => f.id === status) ? status : 'confirmed');
    setSelectedClinic(clinicId || null);
  }, [searchParams]);

  const fetchSchedule = useCallback(() => {
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

  // Fetch clinics once
  useEffect(() => {
    if (!token) return;
    getClinics(token).then(r => setClinics(r.clinics || [])).catch(console.error);
  }, [token]);

  // Fetch schedule whenever date or clinic changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSchedule();
  }, [fetchSchedule]);

  // Client-side status + search filter
  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchStatus = statusFilter === 'all'
        || (statusFilter === 'cancelled' ? ['cancelled', 'rejected'].includes(a.status) : a.status === statusFilter);
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
      fetchSchedule();
      setExpandedId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // Per-appointment delay handler
  const handleDelay = async (appointmentId, delayMinutes) => {
    try {
      await updateBooking(token, { appointmentId, delayMinutes });
      fetchSchedule();
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
      onDelay={handleDelay}
    />
  );


  return (
    <div className="flex flex-col">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10" style={{ background: T.white, borderBottom: `1px solid ${T.mint}` }}>
        {/* Date nav */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button onClick={() => {
            const prev = new Date(currentDate);
            prev.setDate(prev.getDate() - 1);
            setSelectedDateStr(toLocalDateStr(prev));
          }}
            aria-label="Previous day"
            title="Previous day"
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-slate-100"
            style={{ background: T.mintFaint, border: `1px solid ${T.mint}`, color: T.navy }}>
            <I n="chevL" s={16} />
          </button>

          <div className="relative text-center cursor-pointer group px-3 py-1 rounded-xl hover:bg-slate-50 transition-all"
            onClick={openDatePicker}
            title="Click to pick a date">
            <div className="flex items-center justify-center gap-1.5">
              <p className="font-bold text-sm" style={{ color: T.navy, fontFamily: 'Outfit' }}>{displayDate}</p>
              <span className="text-slate-400 group-hover:text-teal-600 transition-colors">
                <I n="calendar" s={14} />
              </span>
            </div>
            <p className="text-[10px]" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>{fullDate}</p>
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDateStr}
              onChange={(e) => {
                if (e.target.value) setSelectedDateStr(e.target.value);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer pointer-events-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {!isToday && (
              <button onClick={() => setSelectedDateStr(todayStr)}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all hover:bg-teal-50"
                style={{ background: T.hero, color: T.teal, border: `1px solid ${T.mint}`, fontFamily: 'Outfit' }}
                title="Jump to Today">
                Today
              </button>
            )}
            <button onClick={openDatePicker}
              aria-label="Pick date"
              title="Pick date"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-slate-100"
              style={{ background: T.mintFaint, border: `1px solid ${T.mint}`, color: T.teal, fontFamily: 'Outfit' }}>
              <I n="calendar" s={15} />
            </button>
            <button onClick={fetchSchedule}
              disabled={loading}
              aria-label="Refresh schedule"
              title="Refresh schedule"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-60 hover:bg-slate-100"
              style={{ background: T.mintFaint, border: `1px solid ${T.mint}`, color: T.teal, fontFamily: 'Outfit' }}>
              <span className={loading ? 'animate-spin' : ''}><I n="refresh" s={15} /></span>
            </button>
            <button onClick={() => {
              const next = new Date(currentDate);
              next.setDate(next.getDate() + 1);
              setSelectedDateStr(toLocalDateStr(next));
            }}
              aria-label="Next day"
              title="Next day"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-slate-100"
              style={{ background: T.mintFaint, border: `1px solid ${T.mint}`, color: T.navy }}>
              <I n="chevR" s={16} />
            </button>
          </div>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                    {appts.map(a => renderCard(a))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Flat list (specific clinic selected) */}
        {!loading && !error && !grouped && (
          <>
            {/* Clinic sub-header with Late? action */}
            {selectedClinic && (
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.navy, opacity: 0.45 }}>
                  {clinics.find(c => c.id === selectedClinic)?.name || 'Clinic'}
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
              {filtered.map(a => renderCard(a))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
