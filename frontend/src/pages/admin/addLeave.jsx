import React, { useState, useEffect } from 'react';
import { T, I } from '../../components/admin/theme';
import { useAuth } from '../../context/AuthContext';
import { getClinics, getLeaves, createLeave, deleteLeave } from '../../services/adminApi';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { toLocalDateStr } from '../../utils/dateUtils';

const CLINIC_COLORS = ['#0f8c7a', '#6366f1', '#ec4899', '#f97316', '#3b82f6', '#16a34a'];

export default function AddLeavePage({ setPage }) {
  const { token } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState(null); // leave id to confirm delete
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    startDate: toLocalDateStr(),
    endDate: toLocalDateStr(),
    reason: '',
    scope: 'global',
    clinicId: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cl, lv] = await Promise.all([
        getClinics(token),
        getLeaves(token),
      ]);
      setClinics(cl.clinics || []);
      setLeaves(lv.leaves || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const update = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) {
      setError('Start and End dates are required');
      return;
    }
    if (form.startDate > form.endDate) {
      setError('End date must be after start date');
      return;
    }
    if (form.scope === 'clinic' && !form.clinicId) {
      setError('Please select a clinic for clinic-specific leave');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createLeave(token, {
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason || undefined,
        scope: form.scope,
        clinicId: form.scope === 'clinic' ? form.clinicId : undefined,
      });
      setSuccess('Leave added successfully');
      setShowForm(false);
      setForm(f => ({ ...f, reason: '', scope: 'global', clinicId: '' }));
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLeave(token, id);
      setLeaves(prev => prev.filter(l => l.id !== id));
      setSuccess('Leave removed');
    } catch (err) {
      alert(err.message);
    }
  };

  // Separate future/active vs past leaves
  const todayStr = toLocalDateStr();
  const activeLeaves = leaves.filter(l => l.endDate >= todayStr);
  const pastLeaves = leaves.filter(l => l.endDate < todayStr);

  const getClinicName = (clinicId) => clinics.find(c => c.id === clinicId)?.name || clinicId;
  const getClinicColor = (clinicId) => {
    const idx = clinics.findIndex(c => c.id === clinicId);
    return idx >= 0 ? CLINIC_COLORS[idx % CLINIC_COLORS.length] : '#9ca3af';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const LeaveCard = ({ leave }) => {
    const isActive = leave.endDate >= todayStr;
    const isGlobal = (leave.scope || 'global') === 'global';
    const clinicColor = isGlobal ? T.teal : getClinicColor(leave.clinicId);
    const isSingleDay = leave.startDate === leave.endDate;

    return (
      <div className="rounded-2xl p-4 hover:shadow-md transition-shadow"
        style={{ background: 'white', border: `1px solid ${T.mint}`, boxShadow: '0 2px 10px rgba(7,25,46,0.05)' }}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[13px]" style={{ color: T.navy, fontFamily: 'Outfit' }}>
              {isSingleDay ? formatDate(leave.startDate) : `${formatDate(leave.startDate)} — ${formatDate(leave.endDate)}`}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>
              {leave.reason || 'No reason specified'}
            </p>
          </div>
          {isActive && (
            <button onClick={() => setDeleting(leave.id)}
              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-red-50 transition-all flex-shrink-0 ml-2"
              style={{ border: '1px solid #fecaca' }}>
              <span style={{ color: '#dc2626' }}><I n="x" s={14} /></span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{
              background: isGlobal ? T.hero : 'white',
              color: clinicColor,
              border: `1px solid ${clinicColor}44`,
              fontFamily: 'Outfit',
            }}>
            {isGlobal ? '🌐 All Clinics' : getClinicName(leave.clinicId)}
          </span>
          {isActive && (
            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
              style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontFamily: 'Outfit' }}>
              Active
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col pb-32">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 md:px-0 bg-white">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <button onClick={() => setPage('home')} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all"
              style={{ border: `1px solid ${T.mint}` }}>
              <I n="chevL" s={16} />
            </button>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.tealLight, fontFamily: 'Outfit' }}>Availability</p>
              <h1 className="text-xl font-bold" style={{ fontFamily: 'DM Serif Display, serif', color: T.navy }}>Leave Manager</h1>
            </div>
          </div>
          <button onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-90"
            style={{
              background: showForm ? '#fef2f2' : `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`,
              boxShadow: showForm ? 'none' : `0 4px 12px ${T.glow}`,
            }}>
            <span style={{ color: showForm ? '#dc2626' : 'white' }}>
              <I n={showForm ? 'x' : 'plus'} s={20} />
            </span>
          </button>
        </div>
      </div>

      <div className="px-4 md:px-0 mt-2 flex flex-col gap-5">
        {/* Success / Error banners */}
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

        {/* Add Leave Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: 'white', border: `1px solid ${T.mint}`, boxShadow: '0 4px 20px rgba(7,25,46,0.06)' }}>
            <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: T.navy, opacity: 0.45, fontFamily: 'Outfit' }}>
              Add New Leave
            </p>

            {/* Scope */}
            <div className="flex gap-2">
              {['global', 'clinic'].map(s => (
                <button key={s} type="button" onClick={() => update('scope', s)}
                  className="flex-1 rounded-xl py-2.5 text-xs font-bold transition-all"
                  style={{
                    background: form.scope === s ? T.teal : 'white',
                    color: form.scope === s ? 'white' : T.navy,
                    border: form.scope === s ? 'none' : `1px solid ${T.mint}`,
                    fontFamily: 'Outfit',
                  }}>
                  {s === 'global' ? '🌐 All Clinics' : '🏥 Specific Clinic'}
                </button>
              ))}
            </div>

            {/* Clinic selector (if clinic scope) */}
            {form.scope === 'clinic' && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {clinics.map((clinic, idx) => {
                  const color = CLINIC_COLORS[idx % CLINIC_COLORS.length];
                  const active = form.clinicId === clinic.id;
                  return (
                    <button key={clinic.id} type="button" onClick={() => update('clinicId', clinic.id)}
                      className="flex-shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-all flex items-center gap-1.5"
                      style={{
                        background: active ? color : 'white',
                        color: active ? 'white' : T.navy,
                        border: active ? 'none' : `1px solid ${T.mint}`,
                        fontFamily: 'Outfit',
                      }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: active ? 'rgba(255,255,255,0.7)' : color }} />
                      {clinic.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block" style={{ fontFamily: 'Outfit' }}>Start Date</label>
                <input type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ border: `1px solid ${T.mint}`, fontFamily: 'Outfit', color: T.navy }}
                  min={toLocalDateStr()}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block" style={{ fontFamily: 'Outfit' }}>End Date</label>
                <input type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ border: `1px solid ${T.mint}`, fontFamily: 'Outfit', color: T.navy }}
                  min={form.startDate}
                />
              </div>
            </div>

            {/* Reason */}
            <input type="text" value={form.reason} placeholder="Reason (optional)"
              onChange={e => update('reason', e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ border: `1px solid ${T.mint}`, fontFamily: 'Outfit', color: T.navy }}
            />

            {/* Submit */}
            <button type="submit" disabled={submitting}
              className="w-full rounded-2xl py-3.5 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`,
                boxShadow: `0 8px 24px ${T.glow}`,
                fontFamily: 'Outfit',
              }}>
              {submitting ? 'Adding…' : 'Add Leave'}
            </button>
          </form>
        )}

        {/* Leaves List */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse" style={{ height: 90, background: '#f1f5f9' }} />
            ))}
          </div>
        ) : leaves.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.hero }}>
              <span style={{ color: T.teal }}><I n="check" s={24} /></span>
            </div>
            <p className="font-semibold" style={{ color: T.navy, fontFamily: 'DM Serif Display', fontSize: 16 }}>No Leaves Scheduled</p>
            <p className="text-sm text-slate-400 text-center" style={{ fontFamily: 'Outfit' }}>
              The doctor is available every day. Tap + to add a leave.
            </p>
          </div>
        ) : (
          <>
            {activeLeaves.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: T.navy, opacity: 0.45, fontFamily: 'Outfit' }}>
                  Active & Upcoming ({activeLeaves.length})
                </p>
                <div className="flex flex-col gap-2">
                  {activeLeaves.map(l => <LeaveCard key={l.id} leave={l} />)}
                </div>
              </div>
            )}
            {pastLeaves.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>
                  Past Leaves ({pastLeaves.length})
                </p>
                <div className="flex flex-col gap-2 opacity-60">
                  {pastLeaves.slice(0, 10).map(l => <LeaveCard key={l.id} leave={l} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => { handleDelete(deleting); setDeleting(null); }}
        title="Remove Leave?"
        message="This will re-open the doctor's availability for those dates. Are you sure?"
        confirmText="Yes, Remove"
        confirmColor="#dc2626"
        icon="x"
      />
    </div>
  );
}
