import React from 'react';
import { T, I } from '../../components/admin/theme';

export default function ManageSlotsPage({ setPage }) {
  return (
    <div className="flex flex-col pb-32">
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
      </div>

      <div className="px-4 md:px-0 mt-4">
        <div className="flex flex-col items-center justify-center rounded-[28px] border bg-white px-6 py-16 text-center"
          style={{ borderColor: T.mint, boxShadow: '0 2px 10px rgba(7,25,46,0.05)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: T.hero }}>
            <span style={{ color: T.teal }}><I n="delay" s={28} /></span>
          </div>
          <h2 className="font-bold" style={{ color: T.navy, fontFamily: 'DM Serif Display', fontSize: 22 }}>
            Not built yet
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400" style={{ fontFamily: 'Outfit' }}>
            Slot management is not available in this version of the admin panel.
          </p>
        </div>
      </div>
    </div>
  );
}
