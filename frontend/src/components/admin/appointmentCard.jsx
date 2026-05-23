import React, { useState } from 'react';
import { T, I } from './theme';
import ConfirmModal from './ConfirmModal';
import DelayModal from './DelayModal';

const CLINIC_COLORS = ['#0f8c7a', '#6366f1', '#ec4899', '#f97316', '#3b82f6', '#16a34a'];

const STATUS_CONFIG = {
  confirmed: { bg: 'white', color: '#3b82f6', border: '#bfdbfe', dot: '#3b82f6', label: 'Confirmed', barColor: '#3b82f6' },
  completed: { bg: 'white', color: '#16a34a', border: '#bbf7d0', dot: '#16a34a', label: 'Done', barColor: '#16a34a' },
  delayed: { bg: 'white', color: '#d97706', border: '#fed7aa', dot: '#f97316', label: 'Delayed', barColor: '#f97316' },
  cancelled: { bg: 'white', color: '#dc2626', border: '#fecaca', dot: '#ef4444', label: 'Cancelled', barColor: '#ef4444' },
  pending: { bg: 'white', color: '#d97706', border: '#fed7aa', dot: '#f97316', label: 'Pending', barColor: '#f97316' },
  rejected: { bg: 'white', color: '#dc2626', border: '#fecaca', dot: '#ef4444', label: 'Rejected', barColor: '#ef4444' },
};

export function getClinicColor(clinics = [], clinicId) {
  const idx = clinics.findIndex(c => c.id === clinicId);
  return idx >= 0 ? CLINIC_COLORS[idx % CLINIC_COLORS.length] : '#9ca3af';
}

export default function ScheduleCard({ appt, expanded, onToggle, clinics = [], showClinicBadge = false, onAction, onDelay, activeClinicDelay = null }) {
  const [confirming, setConfirming] = useState(null); // 'complete' | 'cancel'
  const [showDelayModal, setShowDelayModal] = useState(false);
  const s = STATUS_CONFIG[appt.status] || STATUS_CONFIG.upcoming;
  const canComplete = !['completed', 'cancelled', 'rejected'].includes(appt.status);
  const canCancel = !['completed', 'cancelled', 'rejected'].includes(appt.status);
  const clinicColor = getClinicColor(clinics, appt.clinicId);
  const clinicName = clinics.find(c => c.id === appt.clinicId)?.name || appt.clinicName || appt.clinicId;

  const handleConfirmedAction = () => {
    if (onAction) onAction(appt.id, confirming);
    setConfirming(null);
  };

  const getConfirmProps = () => {
    if (confirming === 'complete') return {
      title: "Mark as Completed?",
      message: `Are you sure you want to mark ${appt.patientName}'s appointment as finished?`,
      confirmText: "Yes, Mark Done",
      confirmColor: "#16a34a",
      icon: "check"
    };
    if (confirming === 'cancel') return {
      title: "Cancel Appointment?",
      message: `Caution: This will cancel ${appt.patientName}'s booking at ${appt.timeSlot}.`,
      confirmText: "Yes, Cancel It",
      confirmColor: "#dc2626",
      icon: "x"
    };
    return {};
  };

  // Resolve effective delay: use the larger of per-appointment vs clinic-level
  const effectiveDelay = Math.max(appt.delayMinutes || 0, activeClinicDelay || 0) || null;

  // Compute estimated delayed time
  const addMinutes = (timeStr, mins) => {
    if (!timeStr || !mins) return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    const total = h * 60 + m + mins;
    const nh = Math.floor(total / 60) % 24;
    const nm = total % 60;
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
  };
  const estimatedTime = effectiveDelay > 0 ? addMinutes((appt.timeSlot || '').split(' ')[0], effectiveDelay) : null;

  // Override status bar color to amber when delayed
  const barColor = effectiveDelay > 0 ? '#f97316' : s.barColor;

  return (
    <>
      <div className="rounded-2xl overflow-hidden hover:shadow-md transition-shadow relative"
        style={{ background: T.white, border: `1px solid ${effectiveDelay > 0 ? '#fed7aa' : T.mint}`, boxShadow: '0 2px 10px rgba(7,25,46,0.05)' }}>

        {/* ── Main Row ── */}
        <div className="flex items-stretch">
          {/* Status colour bar */}
          <div className="w-0.5 flex-shrink-0" style={{ background: barColor, borderRadius: '16px 0 0 0' }} />

          {/* Time block */}
          <div className="flex flex-col items-center justify-center px-3 flex-shrink-0"
            style={{ minWidth: 58, borderRight: `1px solid ${T.mint}`, paddingTop: 14, paddingBottom: 14 }}>
            {effectiveDelay > 0 ? (
              <>
                {/* Original time — struck out */}
                <span className="leading-none appointment-time" style={{
                  color: '#9ca3af', fontFamily: 'Outfit', fontSize: 11,
                  textDecoration: 'line-through', textDecorationColor: '#d97706',
                }}>
                  {(appt.timeSlot || '').split(' ')[0]}
                </span>
                {/* Estimated new time */}
                <span className="font-bold leading-none mt-1" style={{ color: '#d97706', fontFamily: 'Outfit', fontSize: 15 }}>
                  ~{estimatedTime}
                </span>
                <span className="text-[8px] mt-0.5 font-semibold" style={{ color: '#d97706', fontFamily: 'Outfit' }}>
                  +{effectiveDelay}m late
                </span>
              </>
            ) : (
              <>
                <span className="font-bold leading-none appointment-time" style={{ color: T.teal, fontFamily: 'Outfit', fontSize: 15 }}>
                  {(appt.timeSlot || '').split(' ')[0]}
                </span>
                <span className="text-[9px] mt-0.5" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>
                  {(appt.timeSlot || '').split(' ')[1]}
                </span>
              </>
            )}
          </div>

          {/* Patient info */}
          <button className="flex-1 text-left px-3 py-3 min-w-0" onClick={onToggle}>
            <div className="flex items-center gap-1 mb-0.5">
              <span className="font-semibold truncate" style={{ color: T.navy, fontFamily: 'Outfit', fontSize: 13 }}>
                {appt.patientName}
              </span>
              {appt.patientAge && (
                <span className="text-[9px] flex-shrink-0" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>· {appt.patientAge}y</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="flex items-center gap-1 rounded-full px-2 py-0.5"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                <span className="text-[9px] font-bold" style={{ color: s.color, fontFamily: 'Outfit' }}>{s.label}</span>
              </span>

              {appt.type && (
                <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                  style={{
                    background: 'white',
                    color: appt.type === 'followup' ? '#3b82f6' : '#16a34a',
                    border: `1px solid ${appt.type === 'followup' ? '#bfdbfe' : '#bbf7d0'}`,
                    fontFamily: 'Outfit',
                  }}>
                  {appt.type === 'followup' ? 'Follow-up' : 'New Patient'}
                </span>
              )}
            </div>
          </button>

          {/* Right: Done CTA + expand */}
          <div className="flex flex-col items-center justify-center gap-1.5 pr-3 pl-1 py-3 flex-shrink-0">
            {canComplete ? (
              <button
                className="flex items-center gap-1 rounded-xl px-2.5 py-2 transition-all active:scale-90"
                style={{ background: 'white', border: '1px solid #86efac' }}
                onClick={() => setConfirming('complete')}>
                <span style={{ color: '#16a34a' }}><I n="check" s={14} /></span>
                <span className="text-[10px] font-bold" style={{ color: '#16a34a', fontFamily: 'Outfit' }}>Done</span>
              </button>
            ) : appt.status === 'completed' ? (
              <div className="flex items-center gap-1 rounded-xl px-2.5 py-2"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <span style={{ color: '#86efac' }}><I n="check" s={14} /></span>
                <span className="text-[10px] font-bold" style={{ color: '#86efac', fontFamily: 'Outfit' }}>Done</span>
              </div>
            ) : null}

            <button onClick={onToggle}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: expanded ? T.hero : T.mintFaint, border: `1px solid ${expanded ? T.tealLight : T.mint}` }}>
              <span style={{ color: expanded ? T.teal : '#9ca3af' }}><I n="more" s={14} /></span>
            </button>
          </div>
        </div>

        {/* ── Expanded Detail ── */}
        {expanded && (
          <div className="px-3.5 pb-3.5" style={{ borderTop: `1px solid ${T.mint}` }}>
            {(appt.patientPhone || appt.patientEmail) && (
              <div className="flex flex-wrap gap-3 pt-3 pb-2 border-b mb-3" style={{ borderColor: T.mint }}>
                {appt.patientPhone && (
                  <a href={`tel:${appt.patientPhone}`} className="flex items-center gap-1.5 text-[11px]" style={{ color: T.teal, fontFamily: 'Outfit' }}>
                    <I n="user" s={12} /> {appt.patientPhone}
                  </a>
                )}
                {appt.patientEmail && (
                  <span className="text-[11px]" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>{appt.patientEmail}</span>
                )}
                {showClinicBadge && clinicName && (
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: clinicColor, fontFamily: 'Outfit' }}>
                    <I n="pin" s={11} /> {clinicName}
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-1.5"
                style={{ background: 'white', border: '1px solid #fed7aa' }}
                onClick={() => setShowDelayModal(true)}>
                <span style={{ color: '#d97706' }}><I n="delay" s={13} /></span>
                <span className="text-[10px] font-semibold" style={{ color: '#d97706', fontFamily: 'Outfit' }}>
                  {effectiveDelay > 0 ? `Delay (+${effectiveDelay}m)` : 'Delay'}
                </span>
              </button>
              {canCancel && (
                <button className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-1.5"
                  style={{ background: 'white', border: '1px solid #fecaca' }}
                  onClick={() => setConfirming('cancel')}>
                  <span style={{ color: '#dc2626' }}><I n="x" s={13} /></span>
                  <span className="text-[10px] font-semibold" style={{ color: '#dc2626', fontFamily: 'Outfit' }}>Cancel</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirming}
        onClose={() => setConfirming(null)}
        onConfirm={handleConfirmedAction}
        {...getConfirmProps()}
      />

      <DelayModal
        isOpen={showDelayModal}
        onClose={() => setShowDelayModal(false)}
        onConfirm={(minutes) => {
          if (onDelay) onDelay(appt.id, minutes);
        }}
        mode="appointment"
        patientName={appt.patientName}
        currentDelay={appt.delayMinutes || null}
      />
    </>
  );
}
