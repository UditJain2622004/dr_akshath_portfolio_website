import React from 'react';
import { T, I } from './theme.jsx';

const BottomBar = ({ page, setPage }) => {
    const tabs = [
        { id: "home", icon: "home", label: "Home" },
        { id: "schedule", icon: "calendar", label: "Schedule" },
        { id: "pending", icon: "pending", label: "Pending" },
        { id: "history", icon: "history", label: "History" },
    ];
    return (
        <div style={{ background: T.white, borderTop: `1px solid ${T.mint}` }}>
            <div className="flex justify-around py-2">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setPage(t.id)} className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl"
                        style={{ color: page === t.id ? T.teal : "#9ca3af" }}>
                        <I n={t.icon} s={20} />
                        <span style={{ fontSize: 9, fontFamily: "Outfit", fontWeight: page === t.id ? 700 : 400 }}>{t.label}</span>
                        {page === t.id && <span className="w-1 h-1 rounded-full" style={{ background: T.teal }} />}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomBar;