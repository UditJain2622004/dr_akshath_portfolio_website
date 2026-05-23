import React, { useState } from 'react';
import { T, I } from './theme';

const PRESETS = [10, 15, 20, 30, 45, 60];

/**
 * DelayModal — used in two modes:
 *
 * 1. Clinic-level: sets a delay for all upcoming appointments at a clinic today.
 *    Props: mode="clinic", clinicName, currentDelay
 *
 * 2. Per-appointment: overrides the delay for a single appointment.
 *    Props: mode="appointment", patientName, currentDelay
 */
export default function DelayModal({
  isOpen,
  onClose,
  onConfirm,
  mode = 'appointment',   // 'clinic' | 'appointment'
  clinicName = '',
  patientName = '',
  currentDelay = null,    // Currently active delay minutes (null = none)
}) {
  const [selected, setSelected] = useState(currentDelay || null);
  const [custom, setCustom] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  if (!isOpen) return null;

  const effectiveMinutes = useCustom ? parseInt(custom, 10) : selected;
  const isValid = effectiveMinutes && effectiveMinutes > 0 && effectiveMinutes <= 180;

  const title = mode === 'clinic'
    ? `Running Late at ${clinicName}?`
    : `Delay ${patientName}'s Appointment`;

  const subtitle = mode === 'clinic'
    ? 'All upcoming patients at this clinic today will be notified.'
    : 'Only this patient will be notified about the delay.';

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(effectiveMinutes);
    onClose();
  };

  const handleClear = () => {
    onConfirm(null);  // null = clear delay
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-[360px] bg-white rounded-[28px] p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: '#fff7ed', color: '#d97706' }}>
            <I n="delay" s={24} />
          </div>

          <h3 className="text-lg font-bold mb-1" style={{ color: T.navy, fontFamily: 'DM Serif Display' }}>
            {title}
          </h3>
          <p className="text-[12px] text-slate-400 mb-5 leading-relaxed" style={{ fontFamily: 'Outfit' }}>
            {subtitle}
          </p>

          {/* Preset Buttons */}
          <div className="grid grid-cols-3 gap-2 w-full mb-3">
            {PRESETS.map(mins => {
              const isActive = !useCustom && selected === mins;
              return (
                <button
                  key={mins}
                  onClick={() => { setSelected(mins); setUseCustom(false); }}
                  className="rounded-2xl py-3 text-center transition-all active:scale-95"
                  style={{
                    background: isActive ? '#d97706' : 'white',
                    color: isActive ? 'white' : T.navy,
                    border: isActive ? '1.5px solid #d97706' : `1.5px solid ${T.mint}`,
                    fontFamily: 'Outfit',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                  }}
                >
                  {mins} min
                </button>
              );
            })}
          </div>

          {/* Custom Input */}
          <div className="w-full mb-5">
            <button
              onClick={() => setUseCustom(v => !v)}
              className="text-[11px] font-semibold mb-2"
              style={{ color: useCustom ? '#d97706' : '#9ca3af', fontFamily: 'Outfit' }}
            >
              {useCustom ? '← Back to presets' : 'Custom duration →'}
            </button>
            {useCustom && (
              <div className="flex items-center gap-2 rounded-2xl px-4 py-3"
                style={{ background: 'white', border: `1.5px solid ${T.mint}` }}>
                <input
                  type="number"
                  min="1"
                  max="180"
                  placeholder="Minutes"
                  value={custom}
                  onChange={e => setCustom(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: T.navy, fontFamily: 'Outfit' }}
                  autoFocus
                />
                <span className="text-[11px]" style={{ color: '#9ca3af', fontFamily: 'Outfit' }}>minutes</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col w-full gap-2">
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all active:scale-95 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: '#d97706',
                boxShadow: isValid ? '0 8px 20px rgba(217,119,6,0.25)' : 'none',
                fontFamily: 'Outfit',
              }}
            >
              {mode === 'clinic'
                ? `Notify All Patients — ${effectiveMinutes || '?'} min delay`
                : `Set ${effectiveMinutes || '?'} min delay`}
            </button>

            {currentDelay && (
              <button
                onClick={handleClear}
                className="w-full py-3 rounded-2xl font-bold text-sm transition-all hover:bg-green-50"
                style={{ color: '#16a34a', border: '1.5px solid #bbf7d0', fontFamily: 'Outfit' }}
              >
                {mode === 'clinic' ? '✓ Clear Delay — Back on Schedule' : '✓ Clear Delay'}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl text-slate-400 font-bold text-sm hover:bg-slate-50 transition-all"
              style={{ fontFamily: 'Outfit' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
