import React from 'react';
import { T, I } from './theme.jsx';

const STATUS = {
    upcoming: { bg: "#eff6ff", color: "#3b82f6", border: "#bfdbfe", dot: "#3b82f6", label: "Upcoming", barColor: "#3b82f6" },
    completed: { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0", dot: "#16a34a", label: "Done", barColor: "#16a34a" },
    delayed: { bg: "#fff7ed", color: "#d97706", border: "#fed7aa", dot: "#f97316", label: "Delayed", barColor: "#f97316" },
    cancelled: { bg: "#fef2f2", color: "#dc2626", border: "#fecaca", dot: "#ef4444", label: "Cancelled", barColor: "#ef4444" },
};

const ScheduleCard = ({ appt, expanded, onToggle }) => {
    const s = STATUS[appt.status];
    const canComplete = appt.status !== "completed" && appt.status !== "cancelled";
    const canCancel = appt.status !== "completed" && appt.status !== "cancelled";

    return (
        <div className="rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
            style={{ background: T.white, border: `1px solid ${T.mint}`, boxShadow: "0 2px 10px rgba(7,25,46,0.05)" }}>

            {/* ── Main Row ── */}
            <div className="flex items-stretch">
                {/* Status colour bar */}
                <div className="w-1 flex-shrink-0" style={{ background: s.barColor, borderRadius: "16px 0 0 0" }} />

                {/* Time block */}
                <div className="flex flex-col items-center justify-center px-3 flex-shrink-0"
                    style={{ minWidth: 50, borderRight: `1px solid ${T.mint}`, paddingTop: 14, paddingBottom: 14 }}>
                    <span style={{ color: T.teal, fontFamily: "Outfit", fontWeight: 700, fontSize: 12, lineHeight: 1.1 }}>
                        {appt.time.split(" ")[0]}
                    </span>
                    <span style={{ color: "#9ca3af", fontSize: 9, fontFamily: "Outfit", marginTop: 2 }}>
                        {appt.time.split(" ")[1]}
                    </span>
                </div>

                {/* Patient info — tappable to expand */}
                <button className="flex-1 text-left px-3 py-3 min-w-0" onClick={onToggle}>
                    <div className="flex items-center gap-1 mb-0.5">
                        <span style={{ color: T.navy, fontFamily: "Outfit", fontWeight: 600, fontSize: 13 }}>{appt.name}</span>
                        <span style={{ color: "#9ca3af", fontSize: 9, fontFamily: "Outfit" }}>· {appt.age}y</span>
                    </div>
                    <p style={{ color: "#6b7280", fontSize: 10, fontFamily: "Outfit" }} className="truncate">{appt.concern}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {/* Status pill */}
                        <span className="flex items-center gap-1 rounded-full px-2 py-0.5"
                            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                            <span style={{ color: s.color, fontSize: 9, fontFamily: "Outfit", fontWeight: 700 }}>{s.label}</span>
                        </span>
                        {/* Type pill */}
                        <span className="flex items-center gap-1 rounded-full px-2 py-0.5"
                            style={{ background: T.hero, border: `1px solid ${T.mint}` }}>
                            <span style={{ color: T.teal }}>{appt.type === "Video" ? <I n="video" s={9} /> : <I n="pin" s={9} />}</span>
                            <span style={{ color: T.teal, fontSize: 9, fontFamily: "Outfit", fontWeight: 600 }}>{appt.type}</span>
                        </span>
                    </div>
                </button>

                {/* Right: Done CTA + More toggle — always visible */}
                <div className="flex flex-col items-center justify-center gap-1.5 pr-3 pl-1 py-3 flex-shrink-0">
                    {canComplete ? (
                        <button
                            className="flex items-center gap-1 rounded-xl px-2.5 py-2 transition-all active:scale-90"
                            style={{ background: "#dcfce7", border: "1px solid #86efac" }}
                            title="Mark as done">
                            <span style={{ color: "#16a34a" }}><I n="check" s={14} /></span>
                            <span style={{ color: "#16a34a", fontSize: 10, fontFamily: "Outfit", fontWeight: 700 }}>Done</span>
                        </button>
                    ) : appt.status === "completed" ? (
                        <div className="flex items-center gap-1 rounded-xl px-2.5 py-2"
                            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                            <span style={{ color: "#86efac" }}><I n="check" s={14} /></span>
                            <span style={{ color: "#86efac", fontSize: 10, fontFamily: "Outfit", fontWeight: 700 }}>Done</span>
                        </div>
                    ) : (
                        <div className="w-8 h-8" />
                    )}
                    <button onClick={onToggle}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: expanded ? T.hero : T.mintFaint, border: `1px solid ${expanded ? T.tealLight : T.mint}` }}>
                        <span style={{ color: expanded ? T.teal : "#9ca3af" }}><I n="more" s={14} /></span>
                    </button>
                </div>
            </div>

            {/* ── Expanded extra actions ── */}
            {expanded && (
                <div className="px-3.5 pb-3.5" style={{ borderTop: `1px solid ${T.mint}` }}>
                    <div className="flex gap-2 pt-3">
                        <button className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-1.5"
                            style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                            <span style={{ color: "#d97706" }}><I n="delay" s={13} /></span>
                            <span style={{ color: "#d97706", fontSize: 10, fontFamily: "Outfit", fontWeight: 600 }}>Add Delay</span>
                        </button>
                        {canCancel && (
                            <button className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-1.5"
                                style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                                <span style={{ color: "#dc2626" }}><I n="x" s={13} /></span>
                                <span style={{ color: "#dc2626", fontSize: 10, fontFamily: "Outfit", fontWeight: 600 }}>Cancel</span>
                            </button>
                        )}
                        <button className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-1.5"
                            style={{ background: T.hero, border: `1px solid ${T.mint}` }}>
                            <span style={{ color: T.teal }}><I n="user" s={13} /></span>
                            <span style={{ color: T.teal, fontSize: 10, fontFamily: "Outfit", fontWeight: 600 }}>Profile</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleCard;
