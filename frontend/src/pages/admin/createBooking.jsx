import React, { useState, useEffect } from 'react';
import { T, I } from '../../components/admin/theme';
import { useAuth } from '../../context/AuthContext';
import { getClinics, getSlots, createBooking } from '../../services/adminApi';
import { toLocalDateStr } from '../../utils/dateUtils';

const CLINIC_COLORS = ['#0f8c7a', '#6366f1', '#ec4899', '#f97316', '#3b82f6', '#16a34a'];

export default function CreateBookingPage({ setPage }) {
  const { token } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [form, setForm] = useState({
    clinicId: '',
    date: toLocalDateStr(),
    time: '',
    patientName: '',
    patientPhone: '',
    patientEmail: '',
  });
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  // Load clinics on mount
  useEffect(() => {
    if (!token) return;
    getClinics(token)
      .then(r => {
        const cl = r.clinics || [];
        setClinics(cl);
        if (cl.length > 0 && !form.clinicId) {
          setForm(f => ({ ...f, clinicId: cl[0].id }));
        }
      })
      .catch(console.error);
  }, [token]);

  // Fetch slots when clinic or date changes
  useEffect(() => {
    if (!token || !form.clinicId || !form.date) return;
    setLoadingSlots(true);
    setForm(f => ({ ...f, time: '' }));
    getSlots(token, { date: form.date, clinicId: form.clinicId })
      .then(r => {
        const clinicData = (r.clinics || [])[0];
        setSlots(clinicData?.slots || []);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [token, form.clinicId, form.date]);

  const availableSlots = slots.filter(s => !s.booked);

  const update = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clinicId || !form.date || !form.time || !form.patientName || !form.patientPhone) {
      setError('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createBooking(token, {
        clinicId: form.clinicId,
        date: form.date,
        time: form.time,
        patientName: form.patientName,
        patientPhone: form.patientPhone,
        patientEmail: form.patientEmail || undefined,
      });
      setSuccess(`Booking created for ${form.patientName} at ${form.time}`);
      setForm(f => ({ ...f, time: '', patientName: '', patientPhone: '', patientEmail: '' }));
      // Re-fetch slots to update availability
      getSlots(token, { date: form.date, clinicId: form.clinicId })
        .then(r => {
          const clinicData = (r.clinics || [])[0];
          setSlots(clinicData?.slots || []);
        })
        .catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedClinicIdx = clinics.findIndex(c => c.id === form.clinicId);
  const clinicColor = selectedClinicIdx >= 0 ? CLINIC_COLORS[selectedClinicIdx % CLINIC_COLORS.length] : T.teal;

  return (
    <div className="flex flex-col pb-32">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 md:px-0 bg-white">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => setPage('home')} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all"
            style={{ border: `1px solid ${T.mint}` }}>
            <I n="chevL" s={16} />
          </button>
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.tealLight, fontFamily: 'Outfit' }}>Manual Entry</p>
            <h1 className="text-xl font-bold" style={{ fontFamily: 'DM Serif Display, serif', color: T.navy }}>New Booking</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 md:px-0 flex flex-col gap-5 mt-2">
        {/* Success / Error */}
        {success && (
          <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <I n="check" s={18} />
            <p className="text-sm font-semibold" style={{ color: '#16a34a', fontFamily: 'Outfit' }}>{success}</p>
          </div>
        )}
        {error && (
          <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <I n="pending" s={18} />
            <p className="text-sm font-semibold" style={{ color: '#dc2626', fontFamily: 'Outfit' }}>{error}</p>
          </div>
        )}

        {/* Clinic Selector */}
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase mb-2 block" style={{ color: T.navy, opacity: 0.45, fontFamily: 'Outfit' }}>
            Select Clinic *
          </label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {clinics.map((clinic, idx) => {
              const color = CLINIC_COLORS[idx % CLINIC_COLORS.length];
              const active = form.clinicId === clinic.id;
              return (
                <button key={clinic.id} type="button" onClick={() => update('clinicId', clinic.id)}
                  className="flex-shrink-0 rounded-2xl px-4 py-3 text-left transition-all"
                  style={{
                    background: active ? color : 'white',
                    color: active ? 'white' : T.navy,
                    border: active ? 'none' : `1px solid ${T.mint}`,
                    boxShadow: active ? `0 4px 16px ${color}33` : 'none',
                    minWidth: 120,
                  }}>
                  <p className="text-xs font-bold truncate" style={{ fontFamily: 'Outfit' }}>{clinic.name}</p>
                  {/* <p className="text-[9px] mt-0.5 truncate" style={{ opacity: 0.7, fontFamily: 'Outfit' }}>{clinic.address || 'Clinic'}</p> */}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase mb-2 block" style={{ color: T.navy, opacity: 0.45, fontFamily: 'Outfit' }}>
            Appointment Date *
          </label>
          <input type="date" value={form.date}
            onChange={e => update('date', e.target.value)}
            className="w-full rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-all focus:ring-2"
            style={{ border: `1px solid ${T.mint}`, fontFamily: 'Outfit', color: T.navy, '--tw-ring-color': T.teal }}
            min={toLocalDateStr()}
          />
        </div>

        {/* Slot Grid */}
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase mb-2 block" style={{ color: T.navy, opacity: 0.45, fontFamily: 'Outfit' }}>
            Select Time Slot * {!loadingSlots && `(${availableSlots.length} available)`}
          </label>
          {loadingSlots ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl h-10 animate-pulse" style={{ background: '#f1f5f9' }} />
              ))}
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: '#f8fafc', border: `1px dashed ${T.mint}` }}>
              <p className="text-sm text-slate-400" style={{ fontFamily: 'Outfit' }}>No slots available for this date</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {availableSlots.map(slot => {
                const active = form.time === slot.time;
                return (
                  <button key={slot.time} type="button" onClick={() => update('time', slot.time)}
                    className="rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95"
                    style={{
                      background: active ? clinicColor : 'white',
                      color: active ? 'white' : T.navy,
                      border: active ? 'none' : `1px solid ${T.mint}`,
                      fontFamily: 'Outfit',
                      boxShadow: active ? `0 4px 12px ${clinicColor}33` : 'none',
                    }}>
                    {slot.time}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Patient Info */}
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase mb-2 block" style={{ color: T.navy, opacity: 0.45, fontFamily: 'Outfit' }}>
            Patient Details
          </label>
          <div className="flex flex-col gap-3">
            <input type="text" value={form.patientName} placeholder="Patient Name *"
              onChange={e => update('patientName', e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
              style={{ border: `1px solid ${T.mint}`, fontFamily: 'Outfit', color: T.navy }}
            />
            <input type="tel" value={form.patientPhone} placeholder="Phone Number * (e.g. 9876543210)"
              onChange={e => update('patientPhone', e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
              style={{ border: `1px solid ${T.mint}`, fontFamily: 'Outfit', color: T.navy }}
            />
            <input type="email" value={form.patientEmail} placeholder="Email (optional)"
              onChange={e => update('patientEmail', e.target.value)}
              className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition-all focus:ring-2"
              style={{ border: `1px solid ${T.mint}`, fontFamily: 'Outfit', color: T.navy }}
            />
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={submitting}
          className="w-full rounded-2xl py-4 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`,
            boxShadow: `0 8px 24px ${T.glow}`,
            fontFamily: 'Outfit',
          }}>
          {submitting ? 'Creating…' : 'Create Booking'}
        </button>
      </form>
    </div>
  );
}
