import React from 'react';
import { T, I } from '../../components/admin/theme';
import { PENDING_DATA } from '../../components/admin/data';

const PendingPage = () => (
    <div className="flex flex-col">
        <div className="px-4 pt-5 pb-4" style={{ background: "white" }}>
            <p style={{ color: T.tealLight, fontSize: 10, fontFamily: "Outfit", letterSpacing: "0.1em", fontWeight: 600 }}>ACTION REQUIRED</p>
            <h1 className="text-xl font-bold mt-0.5" style={{ fontFamily: "DM Serif Display, serif", color: T.navy }}>Pending Requests</h1>
            <p style={{ color: "#9ca3af", fontSize: 11, fontFamily: "Outfit" }}>{PENDING_DATA.length} requests awaiting confirmation</p>
        </div>
        <div className="px-4 py-4 flex flex-col gap-3 pb-32">
            {PENDING_DATA.map(p => (
                <div key={p.id} className="rounded-2xl p-4"
                    style={{ background: T.white, border: `1px solid ${T.mint}`, boxShadow: "0 2px 10px rgba(7,25,46,0.05)" }}>
                    <div className="flex items-start justify-between mb-2.5">
                        <div>
                            <p style={{ color: T.navy, fontFamily: "Outfit", fontWeight: 700, fontSize: 13 }}>{p.name}</p>
                            <p style={{ color: "#9ca3af", fontSize: 10, fontFamily: "Outfit" }}>Age {p.age} · {p.type}</p>
                        </div>
                        <div className="text-right">
                            <p style={{ color: T.teal, fontFamily: "Outfit", fontWeight: 700, fontSize: 11 }}>{p.time}</p>
                            <p style={{ color: "#9ca3af", fontSize: 9, fontFamily: "Outfit" }}>{p.date}</p>
                        </div>
                    </div>
                    <p className="text-xs mb-3 px-3 py-2 rounded-xl"
                        style={{ color: "#374151", fontFamily: "Outfit", background: "white", border: `1px solid ${T.mint}` }}>
                        {p.concern}
                    </p>
                    <div className="flex gap-2">
                        <button className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                            style={{ background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`, color: "white", fontFamily: "Outfit" }}>
                            <I n="check" s={13} /> Confirm
                        </button>
                        <button className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                            style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontFamily: "Outfit" }}>
                            <I n="x" s={13} /> Decline
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default PendingPage;