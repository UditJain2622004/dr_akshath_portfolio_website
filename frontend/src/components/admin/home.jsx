import React from 'react';
import { T, I } from './theme.jsx';

const HomePage = ({ setPage }) => {
    const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
    const stats = [
        { label: "Today", value: 8, sub: "appointments", bg: T.hero, color: T.teal, border: T.tealLight + "44" },
        { label: "Pending", value: 3, sub: "requests", bg: "#fff7ed", color: "#d97706", border: "#fcd34d66" },
        { label: "Done", value: 2, sub: "completed", bg: "#f0fdf4", color: "#16a34a", border: "#86efac66" },
    ];
    const quickNav = [
        { id: "schedule", icon: "calendar", label: "Schedule", desc: "Today's list", accent: T.teal, bg: T.hero },
        { id: "pending", icon: "bell", label: "Pending", desc: "3 awaiting", accent: "#d97706", bg: "#fff7ed", badge: 3 },
        { id: "create", icon: "plus", label: "Create", desc: "New booking", accent: "#6366f1", bg: "#f5f3ff" },
        { id: "manage", icon: "sliders", label: "Manage Slots", desc: "Edit timings", accent: "#ec4899", bg: "#fdf2f8" },
        { id: "delay", icon: "delay", label: "Add Delay", desc: "Notify patients", accent: "#f97316", bg: "#fff7ed" },
        { id: "history", icon: "history", label: "History", desc: "Past records", accent: T.tealLight, bg: T.mint },
    ];

    return (
        <div className="flex flex-col pb-32">
            {/* Hero */}
            <div className="px-5 pt-5 pb-5 md:px-0" style={{ background: "white" }}>
                <p className="md:hidden" style={{ color: T.tealLight, fontSize: 10, fontFamily: "Outfit", letterSpacing: "0.1em", fontWeight: 600 }}>{today.toUpperCase()}</p>
                <h1 className="text-2xl md:text-4xl font-bold mt-0.5" style={{ fontFamily: "DM Serif Display, serif", color: T.navy }}>
                    Good morning, <span style={{ color: T.teal }}>Dr. Arjun</span> 👋
                </h1>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-4 mt-4 md:mt-8">
                    {stats.map(s => (
                        <div key={s.label} className="rounded-2xl md:rounded-3xl p-3 md:p-6 text-center md:col-span-2 transition-all hover:shadow-lg" 
                            style={{ background: s.bg, border: `1.5px solid ${s.border}` }}>
                            <p className="text-2xl md:text-5xl font-bold" style={{ color: s.color, fontFamily: "Outfit" }}>{s.value}</p>
                            <p className="mt-1" style={{ color: T.navy, fontFamily: "Outfit", fontWeight: 600, fontSize: 11, md: { fontSize: 14 } }}>{s.label}</p>
                            <p style={{ color: "#9ca3af", fontSize: 9, md: { fontSize: 11 }, fontFamily: "Outfit" }}>{s.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pending Alert */}
            <div className="mx-4 mt-4">
                <button onClick={() => setPage("pending")} className="w-full rounded-2xl p-3.5 flex items-center justify-between"
                    style={{ background: "#fffbeb", border: "1.5px solid #fcd34d" }}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fef3c7" }}>
                            <span style={{ color: "#d97706" }}><I n="bell" s={18} /></span>
                        </div>
                        <div className="text-left">
                            <p style={{ color: T.navy, fontFamily: "Outfit", fontWeight: 700, fontSize: 13 }}>3 Pending Requests</p>
                            <p style={{ color: "#92400e", fontSize: 11, fontFamily: "Outfit" }}>Tap to review & confirm</p>
                        </div>
                    </div>
                    <span style={{ color: "#d97706" }}><I n="chevR" s={16} /></span>
                </button>
            </div>

            {/* Quick Nav */}
            <div className="px-4 mt-5 md:px-0 md:mt-10">
                <p style={{ color: T.navy, fontSize: 10, fontFamily: "Outfit", letterSpacing: "0.08em", fontWeight: 700, opacity: 0.45 }} className="mb-3 uppercase tracking-widest">Quick Actions</p>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 md:gap-4">
                    {quickNav.map(n => (
                        <button key={n.id} onClick={() => setPage(n.id)} className="rounded-2xl p-3.5 md:p-6 text-left relative transition-all hover:shadow-md hover:-translate-y-1"
                            style={{ background: T.white, border: `1px solid ${T.mint}`, boxShadow: "0 2px 8px rgba(7,25,46,0.05)" }}>
                            {n.badge && (
                                <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center animate-pulse"
                                    style={{ background: "#ef4444", fontSize: 8, color: "white", fontWeight: 700 }}>{n.badge}</span>
                            )}
                            <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-2.5 md:mb-4" style={{ background: n.bg }}>
                                <span style={{ color: n.accent }}><I n={n.icon} s={17} /></span>
                            </div>
                            <p style={{ color: T.navy, fontFamily: "Outfit", fontWeight: 600, fontSize: 11, md: { fontSize: 14 } }}>{n.label}</p>
                            <p style={{ color: "#9ca3af", fontSize: 9, md: { fontSize: 11 }, fontFamily: "Outfit" }}>{n.desc}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
