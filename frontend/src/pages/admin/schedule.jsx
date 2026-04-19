import React, { useState } from 'react';
import { T, I } from '../../components/admin/theme';
import { SCHEDULE_DATA } from '../../components/admin/data';
import ScheduleCard from '../../components/admin/statusCard';

const SchedulePage = () => {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [dateOffset, setDateOffset] = useState(0);
    const [expandedId, setExpandedId] = useState(null);

    const base = new Date();
    base.setDate(base.getDate() + dateOffset);
    const dateStr = base.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    const fullDate = base.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const isToday = dateOffset === 0;

    const FILTERS = [
        { id: "all", label: "All", activeBg: T.teal },
        { id: "upcoming", label: "Upcoming", activeBg: "#3b82f6" },
        { id: "completed", label: "Done", activeBg: "#16a34a" },
        { id: "delayed", label: "Delayed", activeBg: "#d97706" },
        { id: "cancelled", label: "Cancelled", activeBg: "#dc2626" },
    ];

    const counts = Object.fromEntries(
        ["all", "upcoming", "completed", "delayed", "cancelled"].map(k => [
            k, k === "all" ? SCHEDULE_DATA.length : SCHEDULE_DATA.filter(a => a.status === k).length
        ])
    );

    const filtered = SCHEDULE_DATA.filter(a =>
        (filter === "all" || a.status === filter) &&
        (!search || a.name.toLowerCase().includes(search.toLowerCase()) || a.concern.toLowerCase().includes(search.toLowerCase()))
    );

    const completedCount = SCHEDULE_DATA.filter(a => a.status === "completed").length;

    return (
        <div className="flex flex-col">
            {/* ── Sticky Header ── */}
            <div style={{ background: T.white, borderBottom: `1px solid ${T.mint}` }}>
                {/* Date nav */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                    <button onClick={() => setDateOffset(d => d - 1)} className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: T.mintFaint, border: `1px solid ${T.mint}`, color: T.navy }}>
                        <I n="chevL" s={16} />
                    </button>
                    <div className="text-center">
                        <p style={{ color: T.navy, fontFamily: "Outfit", fontWeight: 700, fontSize: 14 }}>
                            {isToday ? "Today" : dateStr}
                        </p>
                        <p style={{ color: "#9ca3af", fontSize: 10, fontFamily: "Outfit" }}>{fullDate}</p>
                    </div>
                    <button onClick={() => setDateOffset(d => d + 1)} className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: T.mintFaint, border: `1px solid ${T.mint}`, color: T.navy }}>
                        <I n="chevR" s={16} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="px-4 pb-3">
                    <div className="flex justify-between mb-1.5">
                        <span style={{ fontSize: 10, color: "#9ca3af", fontFamily: "Outfit" }}>Day progress</span>
                        <span style={{ fontSize: 10, color: T.teal, fontFamily: "Outfit", fontWeight: 700 }}>{completedCount}/{SCHEDULE_DATA.length} completed</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.hero }}>
                        <div className="h-full rounded-full" style={{ width: `${(completedCount / SCHEDULE_DATA.length) * 100}%`, background: `linear-gradient(90deg, ${T.teal}, ${T.tealLight})` }} />
                    </div>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 mx-4 mb-3 rounded-xl px-3 py-2.5"
                    style={{ background: "white", border: `1.5px solid ${T.hero}` }}>
                    <span style={{ color: T.tealLight }}><I n="search" s={15} /></span>
                    <input type="text" placeholder="Search patient or concern…" value={search}
                        onChange={e => setSearch(e.target.value)} className="flex-1 bg-transparent outline-none"
                        style={{ color: T.navy, fontFamily: "Outfit", fontSize: 12 }} />
                    {search && <button onClick={() => setSearch("")} style={{ color: "#9ca3af" }}><I n="x" s={14} /></button>}
                </div>

                {/* Filter chips */}
                <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto no-scrollbar">
                    {FILTERS.map(f => {
                        const active = filter === f.id;
                        return (
                            <button key={f.id} onClick={() => setFilter(f.id)}
                                className="flex-shrink-0 rounded-full px-3 py-1.5 flex items-center gap-1.5"
                                style={{
                                    background: active ? f.activeBg : "white",
                                    border: active ? "none" : `1px solid ${T.mint}`,
                                    color: active ? "white" : T.navy,
                                    fontFamily: "Outfit", fontSize: 11, fontWeight: active ? 700 : 400,
                                }}>
                                {f.label}
                                <span className="rounded-full px-1.5 py-0.5"
                                    style={{ background: active ? "rgba(255,255,255,0.25)" : T.mint, color: active ? "white" : T.teal, fontSize: 9, fontWeight: 700 }}>
                                    {counts[f.id]}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Appointment List ── */}
            <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-4 pb-32">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 md:col-span-2">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: T.hero }}>
                            <span style={{ color: T.teal }}><I n="calendar" s={26} /></span>
                        </div>
                        <p style={{ color: "#9ca3af", fontFamily: "Outfit", fontSize: 13 }}>No appointments found</p>
                    </div>
                ) : filtered.map(appt => (
                    <ScheduleCard key={appt.id} appt={appt}
                        expanded={expandedId === appt.id}
                        onToggle={() => setExpandedId(expandedId === appt.id ? null : appt.id)} />
                ))}
            </div>
        </div>
    );
};

export default SchedulePage;
