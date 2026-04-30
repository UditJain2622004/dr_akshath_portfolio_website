import React, { useState, useEffect, useMemo } from 'react';
import { T, I } from '../../components/admin/theme';
import { useAuth } from '../../context/AuthContext';
import { getClinics, getSlots, manageSlot } from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';

const CLINIC_COLORS = ['#0f8c7a', '#6366f1', '#ec4899', '#f97316', '#3b82f6', '#16a34a'];

export default function ManageSlotsPage({ setPage }) {
  const { token } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotsData, setSlotsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actioning, setActioning] = useState(null); // { time, action }
  const [confirming, setConfirming] = useState(null); // { time, action }

  // Load clinics on mount
  useEffect(() => {
    if (!token) return;
    getClinics(token)
      .then(r => {
        const cl = r.clinics || [];
        setClinics(cl);
        if (cl.length > 0) setSelectedClinic(cl[0].id);
      })
      .catch(console.error);
  }, [token]);

  // Fetch slots when clinic or date changes
  const fetchSlots = () => {
    if (!token || !selectedClinic || !date) return;
    setLoading(true);
    getSlots(token, { date, clinicId: selectedClinic })
      .then(r => {
        const clinicData = (r.clinics || [])[0];
        setSlotsData(clinicData?.slots || []);
      })
      .catch(() => setSlotsData([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSlots(); }, [token, selectedClinic, date]);

  const handleSlotAction = async (time, action) => {
    setActioning(time);
    try {
      await manageSlot(token, { clinicId: selectedClinic, date, time, action });
      fetchSlots();
    } catch (err) {
      alert(err.message);
    } finally {
      setActioning(null);
    }
  };

  const selectedClinicIdx = clinics.findIndex(c => c.id === selectedClinic);
  const clinicColor = selectedClinicIdx >= 0 ? CLINIC_COLORS[selectedClinicIdx % CLINIC_COLORS.length] : T.teal;

  // Group slots by status
  const available = slotsData.filter(s => !s.booked);
  const bookedByPatient = slotsData.filter(s => s.booked && s.appointmentId && s.appointmentId !== 'BLOCKED' && s.appointmentId !== 'LEAVE');
  const blocked = slotsData.filter(s => s.isBlocked && !s.isLeave);
  const onLeave = slotsData.filter(s => s.isLeave);

  const getConfirmProps = () => {
    if (!confirming) return {};
    if (confirming.action === 'block') return {
      title: "Block This Slot?",
      message: `Block ${confirming.time} on ${date}? Patients won't be able to book this time.`,
      confirmText: "Yes, Block",
      confirmColor: "#dc2626",
      icon: "x"
    };
    return {
      title: "Unblock This Slot?",
      message: `Re-open ${confirming.time} on ${date} for bookings?`,
      confirmText: "Yes, Unblock",
      confirmColor: T.teal,
      icon: "check"
    };
  };

  // Date navigation helpers
  const shiftDate = (days) => {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short'
  });

  return (
    <div className="flex flex-col pb-32">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 md:px-0 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setPage('home')} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all"
            style={{ border: `1px solid ${T.mint}` }}>
            <I n="chevL" s={16} />
          </button>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.tealLight, fontFamily: 'Outfit' }}>Availability</p>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'DM Serif Display, serif', color: T.navy }}>Manage Slots</h1>
          </div>
        </div>

        {/* Clinic pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {clinics.map((clinic, idx) => {
            const color = CLINIC_COLORS[idx % CLINIC_COLORS.length];
            const active = selectedClinic === clinic.id;
            return (
              <button key={clinic.id} onClick={() => setSelectedClinic(clinic.id)}
                className="flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5"
                style={{
                  background: active ? color : 'white',
                  color: active ? 'white' : T.navy,
                  border: active ? 'none' : `1px solid ${T.mint}`,
                  fontFamily: 'Outfit',
                  boxShadow: active ? `0 4px 12px ${color}44` : 'none',
                }}>
                <span className="w-2 h-2 rounded-full" style={{ background: active ? 'rgba(255,255,255,0.7)' : color }} />
                {clinic.name}
              </button>
            );
          })}
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3 mt-3">
          <button onClick={() => shiftDate(-1)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all"
            style={{ border: `1px solid ${T.mint}` }}>
            <I n="chevL" s={14} />
          </button>
          <div className="flex-1 text-center">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="text-sm font-bold text-center outline-none bg-transparent cursor-pointer"
              style={{ color: T.navy, fontFamily: 'Outfit' }}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-[10px] text-slate-400" style={{ fontFamily: 'Outfit' }}>{dateLabel}</p>
          </div>
          <button onClick={() => shiftDate(1)} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all"
            style={{ border: `1px solid ${T.mint}` }}>
            <I n="chevR" s={14} />
          </button>
        </div>
      </div>

      {/* Slots Content */}
      <div className="px-4 md:px-0 mt-4 flex flex-col gap-5">
        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl h-16 animate-pulse" style={{ background: '#f1f5f9' }} />
            ))}
          </div>
        ) : slotsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#fff7ed' }}>
              <span style={{ color: '#d97706' }}><I n="delay" s={24} /></span>
            </div>
            <p className="font-semibold" style={{ color: T.navy, fontFamily: 'DM Serif Display', fontSize: 16 }}>No Slots</p>
            <p className="text-sm text-slate-400 text-center" style={{ fontFamily: 'Outfit' }}>
              No schedule configured for this day, or the doctor is on leave.
            </p>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex gap-2">
              <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: 'white', border: `1px solid ${T.mint}` }}>
                <p className="text-lg font-bold" style={{ color: T.teal, fontFamily: 'Outfit' }}>{available.length}</p>
                <p className="text-[9px] text-slate-400" style={{ fontFamily: 'Outfit' }}>Available</p>
              </div>
              <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: 'white', border: '1px solid #bfdbfe' }}>
                <p className="text-lg font-bold" style={{ color: '#3b82f6', fontFamily: 'Outfit' }}>{bookedByPatient.length}</p>
                <p className="text-[9px] text-slate-400" style={{ fontFamily: 'Outfit' }}>Booked</p>
              </div>
              <div className="flex-1 rounded-2xl p-3 text-center" style={{ background: 'white', border: '1px solid #fecaca' }}>
                <p className="text-lg font-bold" style={{ color: '#dc2626', fontFamily: 'Outfit' }}>{blocked.length}</p>
                <p className="text-[9px] text-slate-400" style={{ fontFamily: 'Outfit' }}>Blocked</p>
              </div>
            </div>

            {/* Slot Grid */}
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: T.navy, opacity: 0.45, fontFamily: 'Outfit' }}>
                All Slots ({slotsData.length})
              </p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {slotsData.map(slot => {
                  const isBookedByPatient = slot.booked && slot.appointmentId && slot.appointmentId !== 'BLOCKED' && slot.appointmentId !== 'LEAVE';
                  const isBlocked = slot.isBlocked && !slot.isLeave;
                  const isAvailable = !slot.booked;
                  const isActioning = actioning === slot.time;

                  return (
                    <div key={slot.time} className="rounded-xl p-3 text-center relative transition-all"
                      style={{
                        background: isBlocked ? '#fef2f2' : isBookedByPatient ? '#eff6ff' : 'white',
                        border: `1px solid ${isBlocked ? '#fecaca' : isBookedByPatient ? '#bfdbfe' : T.mint}`,
                        opacity: isActioning ? 0.5 : 1,
                      }}>
                      <p className="text-xs font-bold mb-1" style={{
                        color: isBlocked ? '#dc2626' : isBookedByPatient ? '#3b82f6' : T.navy,
                        fontFamily: 'Outfit'
                      }}>
                        {slot.time}
                      </p>
                      {isBookedByPatient && (
                        <p className="text-[8px] text-blue-400 truncate" style={{ fontFamily: 'Outfit' }}>
                          {slot.patientName || 'Booked'}
                        </p>
                      )}
                      {isBlocked && (
                        <button onClick={() => setConfirming({ time: slot.time, action: 'unblock' })}
                          className="text-[8px] font-bold mt-1 px-2 py-0.5 rounded-full transition-all hover:opacity-80"
                          style={{ background: '#dcfce7', color: '#16a34a', fontFamily: 'Outfit' }}>
                          Unblock
                        </button>
                      )}
                      {isAvailable && (
                        <button onClick={() => setConfirming({ time: slot.time, action: 'block' })}
                          className="text-[8px] font-bold mt-1 px-2 py-0.5 rounded-full transition-all hover:opacity-80"
                          style={{ background: '#fef2f2', color: '#dc2626', fontFamily: 'Outfit' }}>
                          Block
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-2">
              {[
                { label: 'Available', color: T.teal, bg: 'white' },
                { label: 'Booked', color: '#3b82f6', bg: '#eff6ff' },
                { label: 'Blocked', color: '#dc2626', bg: '#fef2f2' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ background: l.bg, border: `1.5px solid ${l.color}` }} />
                  <span className="text-[10px] text-slate-400" style={{ fontFamily: 'Outfit' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={() => {
          handleSlotAction(confirming.time, confirming.action);
          setConfirming(null);
        }}
        {...getConfirmProps()}
      />
    </div>
  );
}
