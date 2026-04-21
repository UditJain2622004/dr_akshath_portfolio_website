import React from 'react';
import { T, I } from '../../components/admin/theme';
import { useAuth } from '../../context/AuthContext';

const ProfileOption = ({ icon, label, sublabel, onClick, danger }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white hover:shadow-md transition-all border border-slate-50 group mb-3"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${danger ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600'}`}>
      <I n={icon} s={22} />
    </div>
    <div className="flex-1 text-left">
      <p className={`font-bold text-sm ${danger ? 'text-red-500' : 'text-slate-800'}`} style={{ fontFamily: 'Outfit' }}>{label}</p>
      <p className="text-[11px] text-slate-400" style={{ fontFamily: 'Outfit' }}>{sublabel}</p>
    </div>
    <div className="text-slate-300">
      <I n="chevR" s={18} />
    </div>
  </button>
);

export default function ProfilePage({ setPage }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col p-4 md:p-0">
      {/* ── User Header ── */}
      <div className="flex flex-col items-center py-8 mb-4">
        <div className="w-24 h-24 rounded-3xl mb-4 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`, boxShadow: `0 12px 32px ${T.glow}` }}>
          <span className="text-white text-4xl font-bold" style={{ fontFamily: 'DM Serif Display' }}>
            {user?.email?.[0].toUpperCase() || 'A'}
          </span>
        </div>
        <h2 className="text-xl font-bold" style={{ color: T.navy, fontFamily: 'DM Serif Display' }}>
          Dr. Akshath
        </h2>
        <p className="text-sm text-slate-400" style={{ fontFamily: 'Outfit' }}>
          {user?.email || 'admin@drakshath.com'}
        </p>
      </div>

      {/* ── Menu Section ── */}
      <div className="flex flex-col">
        <p className="text-[10px] font-bold text-slate-400 tracking-widest px-1 mb-3 uppercase">Account & Management</p>

        <ProfileOption
          icon="sliders"
          label="Manage Slots"
          sublabel="Open or block appointment times"
          onClick={() => setPage('manage')}
        />

        <ProfileOption
          icon="history"
          label="Appointment History"
          sublabel="View all past completed appointments"
          onClick={() => setPage('history')}
        />

        {/* <ProfileOption
          icon="bell"
          label="Notification Settings"
          sublabel="Brevo and Firebase alerts"
          onClick={() => {}}
        /> */}

        <p className="text-[10px] font-bold text-slate-400 tracking-widest px-1 mt-6 mb-3 uppercase">Danger Zone</p>

        <ProfileOption
          danger
          icon="x"
          label="Sign Out"
          sublabel="Logout from the admin panel"
          onClick={logout}
        />
      </div>

      <div className="mt-10 py-6 border-t border-slate-100 text-center">
        <p className="text-[10px] text-slate-300" style={{ fontFamily: 'Outfit' }}>
          Portfolio Admin v1.0.4 • Built for Dr. Akshath
        </p>
      </div>
    </div>
  );
}
