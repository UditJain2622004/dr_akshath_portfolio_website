import React from 'react';
import { T } from './theme';

const CLINIC_COLORS = ['#0f8c7a', '#6366f1', '#ec4899', '#f97316', '#3b82f6', '#16a34a'];

export default function ClinicFilterBar({ clinics, selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-4 md:px-0">
      {/* All Clinics pill */}
      <button
        onClick={() => onChange(null)}
        className="flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all"
        style={{
          background: selected === null ? T.teal : 'white',
          color: selected === null ? 'white' : T.navy,
          border: selected === null ? 'none' : `1px solid ${T.mint}`,
          fontFamily: 'Outfit',
          boxShadow: selected === null ? `0 4px 12px ${T.glow}` : 'none',
        }}>
        All Clinics
      </button>

      {clinics.map((clinic, idx) => {
        const color = CLINIC_COLORS[idx % CLINIC_COLORS.length];
        const active = selected === clinic.id;
        return (
          <button
            key={clinic.id}
            onClick={() => onChange(clinic.id)}
            className="flex-shrink-0 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold transition-all"
            style={{
              background: active ? color : 'white',
              color: active ? 'white' : T.navy,
              border: active ? 'none' : `1px solid ${T.mint}`,
              fontFamily: 'Outfit',
              boxShadow: active ? `0 4px 12px ${color}44` : 'none',
            }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: active ? 'rgba(255,255,255,0.7)' : color }} />
            <span className="truncate max-w-[100px]">{clinic.name}</span>
          </button>
        );
      })}
    </div>
  );
}
