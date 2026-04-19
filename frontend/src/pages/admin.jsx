import React, { useState } from 'react';
import Navbar from '../components/admin/navbar';
import BottomBar from '../components/admin/bottomTabs';
import HomePage from '../components/admin/home';
import SchedulePage from './admin/schedule';
import PendingPage from './admin/pending';
import { T, I } from '../components/admin/theme';
import { PENDING_DATA } from '../components/admin/data';

const Placeholder = ({ title, icon }) => (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20" style={{ background: "white" }}>
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: T.hero }}>
            <span style={{ color: T.teal }}><I n={icon} s={28} /></span>
        </div>
        <p style={{ color: T.navy, fontFamily: "DM Serif Display, serif", fontSize: 18, fontWeight: 700 }}>{title}</p>
        <p style={{ color: "#9ca3af", fontFamily: "Outfit", fontSize: 12 }}>Not yet shown in this prototype</p>
    </div>
);

const SidebarItem = ({ id, icon, label, active, onClick }) => (
    <button onClick={() => onClick(id)} 
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-mint font-bold' : 'hover:bg-mintFaint'}`}
        style={{ color: active ? T.teal : T.navy }}>
        <I n={icon} s={20} />
        <span className="text-sm font-outfit">{label}</span>
        {active && <div className="ml-auto w-1.5 h-6 rounded-full" style={{ background: T.teal }} />}
    </button>
);

export default function Admin() {
    const [page, setPage] = useState("home");

    const renderPage = () => {
        switch (page) {
            case "home": return <HomePage setPage={setPage} />;
            case "schedule": return <SchedulePage />;
            case "pending": return <PendingPage />;
            case "history": return <Placeholder title="History" icon="history" />;
            case "create": return <Placeholder title="Create Booking" icon="plus" />;
            case "manage": return <Placeholder title="Manage Slots" icon="sliders" />;
            case "delay": return <Placeholder title="Add Delay" icon="delay" />;
            default: return <HomePage setPage={setPage} />;
        }
    };

    const tabs = [
        { id: "home", icon: "home", label: "Dashboard" },
        { id: "schedule", icon: "calendar", label: "Schedule" },
        { id: "pending", icon: "bell", label: "Requests" },
        { id: "history", icon: "history", label: "History" },
        { id: "manage", icon: "sliders", label: "Settings" },
    ];

    return (
        <div className="h-[100dvh] flex overflow-hidden font-outfit" style={{ background: "#f8fafc" }}>
            
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-[#e2e8f0] p-6 shrink-0 relative">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" 
                        style={{ background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`, boxShadow: `0 8px 16px ${T.glow}` }}>
                        <span className="text-white font-bold text-xl" style={{ fontFamily: "DM Serif Display" }}>A</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-navy leading-tight" style={{ color: T.navy }}>Dr. Akshath</h2>
                        <p className="text-[10px] tracking-widest text-teal-600 font-bold uppercase" style={{ color: T.tealLight }}>Cardiologist</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 tracking-widest px-4 mb-4 uppercase">Main Menu</p>
                    {tabs.map(tab => (
                        <SidebarItem key={tab.id} {...tab} active={page === tab.id} onClick={setPage} />
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all">
                        <I n="x" s={20} />
                        <span className="text-sm font-bold">Log out</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Layout Wrapper ── */}
            <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden md:max-w-none max-w-md mx-auto shadow-2xl md:shadow-none">
                
                {/* Fixed Top Header (Mobile only or simplified for desktop) */}
                <div className="md:hidden">
                    <Navbar page={page} setPage={setPage} pendingCount={PENDING_DATA.length} />
                </div>
                
                {/* Desktop Header Enhancement */}
                <header className="hidden md:flex items-center justify-between px-10 py-6 border-b border-slate-100 bg-white">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.navy, fontFamily: "DM Serif Display" }}>
                            {tabs.find(t => t.id === page)?.label || "Dashboard"}
                        </h1>
                        <p className="text-sm text-slate-400">Welcome back to your healthcare cockpit.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-3 rounded-2xl bg-slate-50 relative hover:bg-slate-100 transition-all">
                            <I n="bell" s={20} />
                            {PENDING_DATA.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />}
                        </button>
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-100 p-0.5">
                            <div className="w-full h-full bg-slate-200 rounded-[14px]" />
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto relative no-scrollbar md:bg-slate-50/50" style={{ background: page === 'home' ? 'white' : '' }}>
                    <div className="h-full w-full max-w-5xl mx-auto md:px-8 md:py-8">
                        {renderPage()}
                    </div>

                    {/* Centralized FAB */}
                    {(page === "schedule" || page === "home") && (
                        <div className="fixed bottom-24 right-4 md:bottom-12 md:right-12 z-10">
                            <button onClick={() => setPage("create")}
                                className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                style={{ 
                                    background: `linear-gradient(135deg, ${T.teal}, ${T.tealLight})`, 
                                    boxShadow: `0 12px 32px ${T.glow}` 
                                }}>
                                <span style={{ color: "white" }}><I n="plus" s={28} /></span>
                            </button>
                        </div>
                    )}
                </main>

                {/* Mobile Bottom Footer */}
                <div className="md:hidden">
                    <BottomBar page={page} setPage={setPage} />
                </div>
            </div>
        </div>
    );
}
