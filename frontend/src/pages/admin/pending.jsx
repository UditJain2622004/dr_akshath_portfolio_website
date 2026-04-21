import React, { useState, useEffect, useMemo } from 'react';
import { T, I } from '../../components/admin/theme';
import { useAuth } from '../../context/AuthContext';
import { getBookings, getClinics, updateBooking } from '../../services/adminApi';
import ClinicFilterBar from '../../components/admin/ClinicFilterBar';

const CLINIC_COLORS = ['#0f8c7a', '#6366f1', '#ec4899', '#f97316', '#3b82f6', '#16a34a'];

function getClinicColor(clinics, clinicId) {
  const idx = clinics.findIndex(c => c.id === clinicId);
  return idx >= 0 ? CLINIC_COLORS[idx % CLINIC_COLORS.length] : '#9ca3af';
}

import ConfirmModal from '../../components/admin/ConfirmModal';

function PendingCard({ booking, clinics, onConfirm, onReject }) {
  const [confirming, setConfirming] = useState(null); // 'confirm' | 'reject'
  const clinicColor = getClinicColor(clinics, booking.clinicId);
  const clinicName = clinics.find(c => c.id === booking.clinicId)?.name || booking.clinicName || booking.clinicId;

  const date = booking.appointmentDate
    ? new Date(booking.appointmentDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const handleConfirmedAction = () => {
    if (confirming === 'confirm') onConfirm(booking.id);
    if (confirming === 'reject') onReject(booking.id);
    setConfirming(null);
  };

  const getConfirmProps = () => {
    if (confirming === 'confirm') return {
      title: "Approve Appointment?",
      message: `Do you want to confirm ${booking.patientName}'s request for ${booking.timeSlot}?`,
      confirmText: "Yes, Confirm",
      confirmColor: T.teal,
      icon: "check"
    };
    if (confirming === 'reject') return {
      title: "Decline Request?",
      message: `Are you sure you want to reject this appointment request? This cannot be undone.`,
      confirmText: "Yes, Decline",
      confirmColor: "#dc2626",
      icon: "x"
    };
    return {};
  };

  return (
    <>
      <div className="rounded-2xl p-4 hover:shadow-md transition-shadow relative"
        style={{ background: T.white, border: `1px solid ${T.mint}`, boxShadow: '0 2px 10px rgba(7,25,46,0.05)' }}>

        {/* Top row: name + time */}
        <div className="flex items-start justify-between mb-2.5">
          <div className="min-w-0">
            <p className="font-bold text-[13px] truncate" style={{ color: T.navy, fontFamily: 'Outfit' }}>
              {booking.patientName}
            </p>
            <p className="text-[10px]" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>
              {booking.patientPhone}
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <p className="font-bold text-[11px]" style={{ color: T.teal, fontFamily: 'Outfit' }}>
              {booking.timeSlot}
            </p>
            <p className="text-[9px]" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>
              {date}
            </p>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{ background: 'white', color: clinicColor, border: `1px solid ${clinicColor}44`, fontFamily: 'Outfit' }}>
            {clinicName}
          </span>
          {booking.type && (
            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
              style={{
                color: booking.type === 'followup' ? '#3b82f6' : '#16a34a',
                background: 'white',
                border: `1px solid ${booking.type === 'followup' ? '#bfdbfe' : '#bbf7d0'}`,
                fontFamily: 'Outfit',
              }}>
              {booking.type === 'followup' ? 'Follow-up' : 'New Patient'}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={() => setConfirming('confirm')}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`, color: 'white', fontFamily: 'Outfit' }}>
            <I n="check" s={13} /> Confirm
          </button>
          <button onClick={() => setConfirming('reject')}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
            style={{ background: 'white', color: '#dc2626', border: '1px solid #fecaca', fontFamily: 'Outfit' }}>
            <I n="x" s={13} /> Decline
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={handleConfirmedAction}
        {...getConfirmProps()}
      />
    </>
  );
}

export default function PendingPage() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [actioning, setActioning] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bk, cl] = await Promise.all([
        getBookings(token, { status: 'pending' }),
        getClinics(token),
      ]);
      setBookings(bk.bookings || []);
      setClinics(cl.clinics || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchAll();
  }, [token]);

  const filtered = useMemo(() => {
    const list = selectedClinic ? bookings.filter(b => b.clinicId === selectedClinic) : bookings;
    // Sort: today's appointments first (more urgent)
    const todayStr = new Date().toISOString().split('T')[0];
    return [...list].sort((a, b) => {
      const aToday = a.appointmentDate === todayStr ? 0 : 1;
      const bToday = b.appointmentDate === todayStr ? 0 : 1;
      if (aToday !== bToday) return aToday - bToday;
      return (a.appointmentDate || '').localeCompare(b.appointmentDate || '');
    });
  }, [bookings, selectedClinic]);

  const todayItems = filtered.filter(b => b.appointmentDate === new Date().toISOString().split('T')[0]);
  const laterItems = filtered.filter(b => b.appointmentDate !== new Date().toISOString().split('T')[0]);

  const handleAction = async (appointmentId, action) => {
    setActioning(appointmentId);
    try {
      await updateBooking(token, { appointmentId, action });
      setBookings(prev => prev.filter(b => b.id !== appointmentId));
    } catch (err) {
      alert(err.message);
    } finally {
      setActioning(null);
    }
  };

  const renderCard = (b) => (
    <PendingCard
      key={b.id}
      booking={b}
      clinics={clinics}
      onConfirm={(id) => handleAction(id, 'confirm')}
      onReject={(id) => handleAction(id, 'reject')}
    />
  );

  return (
    <div className="flex flex-col">
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3 md:px-0" style={{ background: 'white' }}>
        <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.tealLight, fontFamily: 'Outfit' }}>
          Action Required
        </p>
        <div className="flex items-end justify-between mt-0.5 mb-4">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'DM Serif Display, serif', color: T.navy }}>
              Pending Requests
            </h1>
            <p className="text-[11px]" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>
              {loading ? 'Loading…' : `${filtered.length} request${filtered.length !== 1 ? 's' : ''} awaiting confirmation`}
            </p>
          </div>
        </div>

        {/* Clinic filter */}
        {clinics.length > 0 && (
          <div className="mb-1">
            <ClinicFilterBar clinics={clinics} selected={selectedClinic} onChange={setSelectedClinic} />
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="px-4 py-4 pb-32 flex flex-col gap-6 md:px-0">
        {loading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ height: 130, background: '#f1f5f9' }} />
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
              <span style={{ color: T.teal }}><I n="check" s={26} /></span>
            </div>
            <p className="font-semibold" style={{ color: T.navy, fontFamily: 'DM Serif Display', fontSize: 16 }}>All caught up!</p>
            <p className="text-sm" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>No pending requests right now.</p>
          </div>
        )}

        {/* Today's requests — shown with urgency callout */}
        {!loading && !error && todayItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-xs font-bold" style={{ color: '#dc2626', fontFamily: 'Outfit' }}>
                Today — Needs Immediate Action
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {todayItems.map(renderCard)}
            </div>
          </div>
        )}

        {/* Future requests */}
        {!loading && !error && laterItems.length > 0 && (
          <div>
            {todayItems.length > 0 && (
              <p className="text-xs font-bold mb-3" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>
                Future Requests
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {laterItems.map(renderCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}