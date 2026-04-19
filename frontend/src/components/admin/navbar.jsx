import React from 'react';
import { T, I } from './theme.jsx';

const Navbar = ({ setPage, pendingCount }) => (
    <nav className="flex items-center justify-between px-5 py-3" style={{ background: T.white, borderBottom: `1px solid ${T.mint}` }}>
        <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "white", border: `1.5px solid ${T.tealLight}` }}>
                <span style={{ color: T.teal, fontSize: 14, fontWeight: 700, fontFamily: "DM Serif Display, serif" }}>A</span>
            </div>
            <div>
                <p style={{ color: T.navy, fontFamily: "Outfit", fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>Dr. Arjun Mehta</p>
                <p style={{ color: T.tealLight, fontSize: 9, fontFamily: "Outfit", letterSpacing: "0.08em" }}>ADMIN PANEL</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setPage("pending")} className="relative p-2 rounded-xl"
                style={{ background: pendingCount > 0 ? T.hero : "white", border: `1px solid ${pendingCount > 0 ? T.tealLight : T.mint}` }}>
                <span style={{ color: pendingCount > 0 ? T.teal : "#9ca3af" }}><I n="bell" s={18} /></span>
                {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: "#ef4444", fontSize: 9, color: "white", fontWeight: 700, fontFamily: "Outfit" }}>
                        {pendingCount}
                    </span>
                )}
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "white", border: `1.5px solid ${T.teal}` }}>
                <span style={{ color: T.teal }}><I n="user" s={14} /></span>
            </div>
        </div>
    </nav>
);

export default Navbar;