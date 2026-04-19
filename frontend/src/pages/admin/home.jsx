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
            {/* <div className="px-5 pt-5 pb-5" style={{ background: `linear-gradient(155deg, ${T.hero} 0%, #dff9f5 55%, ${T.mintFaint} 100%)` }}> */}
            <div className="px-5 pt-5 pb-5" style={{ background: "white" }}>
                <p style={{ color: T.tealLight, fontSize: 10, fontFamily: "Outfit", letterSpacing: "0.1em", fontWeight: 600 }}>{today.toUpperCase()}</p>
                <h1 className="text-2xl font-bold mt-0.5" style={{ fontFamily: "DM Serif Display, serif", color: T.navy }}>
                    Good morning, <span style={{ color: T.teal }}>Dr. Arjun</span> 👋
                </h1>
                <div className="grid grid-cols-3 gap-2.5 mt-4">
                    {stats.map(s => (
                        <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: s.bg, border: `1.5px solid ${s.border}` }}>
                            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: "Outfit" }}>{s.value}</p>
                            <p style={{ color: T.navy, fontFamily: "Outfit", fontWeight: 600, fontSize: 11 }}>{s.label}</p>
                            <p style={{ color: "#9ca3af", fontSize: 9, fontFamily: "Outfit" }}>{s.sub}</p>
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
            <div className="px-4 mt-5">
                <p style={{ color: T.navy, fontSize: 10, fontFamily: "Outfit", letterSpacing: "0.08em", fontWeight: 700, opacity: 0.45 }} className="mb-3">QUICK ACTIONS</p>
                <div className="grid grid-cols-3 gap-2.5">
                    {quickNav.map(n => (
                        <button key={n.id} onClick={() => setPage(n.id)} className="rounded-2xl p-3.5 text-left relative"
                            style={{ background: T.white, border: `1px solid ${T.mint}`, boxShadow: "0 2px 8px rgba(7,25,46,0.05)" }}>
                            {n.badge && (
                                <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                                    style={{ background: "#ef4444", fontSize: 8, color: "white", fontWeight: 700 }}>{n.badge}</span>
                            )}
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5" style={{ background: n.bg }}>
                                <span style={{ color: n.accent }}><I n={n.icon} s={17} /></span>
                            </div>
                            <p style={{ color: T.navy, fontFamily: "Outfit", fontWeight: 600, fontSize: 11 }}>{n.label}</p>
                            <p style={{ color: "#9ca3af", fontSize: 9, fontFamily: "Outfit" }}>{n.desc}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Today's Upcoming */}
            {/* <div className="px-4 mt-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <p style={{ color: T.navy, fontSize: 10, fontFamily: "Outfit", letterSpacing: "0.08em", fontWeight: 700, opacity: 0.45 }}>TODAY'S UPCOMING</p>
                    <button onClick={() => setPage("schedule")} style={{ color: T.teal, fontSize: 11, fontFamily: "Outfit", fontWeight: 700 }}>See All →</button>
                </div>
                <div className="flex flex-col gap-2">
                    {SCHEDULE_DATA.filter(s => s.status === "upcoming").slice(0, 3).map(a => (
                        <div key={a.id} className="flex items-center gap-3 rounded-2xl p-3"
                            style={{ background: T.white, border: `1px solid ${T.mint}` }}>
                            <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: T.hero }}>
                                <span style={{ color: T.teal }}>{a.type === "Video" ? <I n="video" s={15} /> : <I n="user" s={15} />}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p style={{ color: T.navy, fontFamily: "Outfit", fontWeight: 600, fontSize: 13 }} className="truncate">{a.name}</p>
                                <p style={{ color: "#9ca3af", fontSize: 10, fontFamily: "Outfit" }}>{a.concern}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p style={{ color: T.teal, fontFamily: "Outfit", fontWeight: 700, fontSize: 11 }}>{a.time}</p>
                                <p style={{ color: "#9ca3af", fontSize: 9, fontFamily: "Outfit" }}>{a.type}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div> */}
        </div>
    );
};