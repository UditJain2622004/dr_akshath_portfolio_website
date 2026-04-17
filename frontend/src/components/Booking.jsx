import { useState } from "react";
import { useReveal } from "../hooks/useReveal";

const slots = [
    { time: "9:00 AM", avail: true },
    { time: "10:00 AM", avail: true },
    { time: "11:00 AM", avail: false },
    { time: "12:00 PM", avail: true },
    { time: "2:00 PM", avail: true },
    { time: "3:00 PM", avail: false },
    { time: "4:00 PM", avail: true },
    { time: "5:00 PM", avail: true },
];

const visitTypes = [
    {
        id: "inperson",
        label: "In-Person Visit",
        sub: "Apollo Hospitals, Bengaluru",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
        ),
    },
    {
        id: "video",
        label: "Video Consultation",
        sub: "Secure call, any device",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
        ),
    },
];

function InfoPill({ icon, label, value }) {
    return (
        <div className="flex items-start gap-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(27,191,168,0.15)" }}
            >
                <span style={{ color: "#1bbfa8" }}>{icon}</span>
            </div>
            <div>
                <div className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
                <div className="text-[14px] text-white font-medium leading-snug">{value}</div>
            </div>
        </div>
    );
}

export default function Booking() {
    const [selected, setSelected] = useState(null);
    const [visitType, setVisitType] = useState("inperson");
    const ref = useReveal();

    return (
        // <section id="booking" className="relative overflow-hidden" style={{ background: "#f4f9f8" }}>
        <section id="booking" className="relative overflow-hidden bg-white">

            {/* Dot cluster top right */}
            <div className="absolute top-16 right-16 pointer-events-none opacity-50">
                <svg width={6 * 13} height={5 * 13} viewBox={`0 0 ${6 * 13} ${5 * 13}`} aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, r) =>
                        Array.from({ length: 6 }).map((_, c) => (
                            <circle key={`${r}-${c}`} cx={c * 13 + 6.5} cy={r * 13 + 6.5} r="1.8" fill="rgba(15,140,122,0.25)" />
                        ))
                    )}
                </svg>
            </div>

            <div className="max-w-[1280px] mx-auto px-[60px] py-[110px]">

                {/* Section header */}
                <div className="reveal flex flex-col items-center text-center mb-14" ref={ref}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#0f8c7a" }}>
                            Schedule a visit
                        </span>
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                    </div>
                    <h2 className="font-display text-[clamp(30px,4vw,48px)] text-navy leading-[1.1] font-bold mb-4">
                        Book an{" "}
                        <em className="not-italic italic" style={{ color: "#0f8c7a" }}>Appointment</em>
                    </h2>
                    <p className="text-[15px] font-light text-navy/50 leading-[1.8] max-w-[480px]">
                        In-person consultations at Apollo Hospitals Bengaluru, or via secure video call
                        for patients across India and the Gulf.
                    </p>
                </div>

                {/* Main card */}
                <div
                    className="reveal grid overflow-hidden"
                    style={{
                        gridTemplateColumns: "1fr 1.5fr",
                        borderRadius: "24px",
                        boxShadow: "0 0px 30px rgba(7,25,46,0.3)",
                        border: "1px solid rgba(7,25,46,0.08)",
                    }}
                >
                    {/* ── LEFT: dark info panel ── */}
                    <div
                        className="flex flex-col p-10 relative overflow-hidden"
                        style={{ background: "linear-gradient(160deg, #07192e 0%, #0a2d45 100%)" }}
                    >
                        {/* Glow */}
                        <div
                            className="absolute pointer-events-none rounded-full"
                            style={{
                                width: 300,
                                height: 300,
                                background: "radial-gradient(circle, rgba(15,140,122,0.18) 0%, transparent 70%)",
                                bottom: -80,
                                right: -80,
                            }}
                        />

                        {/* Availability badge */}
                        <div
                            className="inline-flex items-center gap-2 self-start rounded-full px-3.5 py-2 mb-8"
                            style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}
                        >
                            <span className="w-2 h-2 rounded-full anim-pulse" style={{ background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.7)" }} />
                            <span className="text-[11px] font-semibold text-white/80 tracking-wide">Accepting new patients</span>
                        </div>

                        <h3 className="font-display text-[24px] text-white leading-snug font-bold mb-1">
                            Clinic &amp; Contact
                        </h3>
                        <p className="text-[13px] font-light mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
                            Same-week appointments usually available
                        </p>

                        {/* Google Map */}
                        <div
                            className="rounded-xl overflow-hidden mb-4 flex-shrink-0"
                            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15555.700147988358!2d77.58784650570078!3d12.893116527552254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae153e390c2a8f%3A0x6b4fb71dd6cf0e3b!2sApollo%20Hospitals%20Bannerghatta%20Road%20Bengaluru!5e0!3m2!1sen!2sus!4v1713180231500!5m2!1sen!2sus"
                                width="100%"
                                height="180"
                                style={{ border: 0, display: "block", filter: "grayscale(30%) contrast(1.05)" }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Apollo Hospitals Location"
                            />
                        </div>

                        <div className="flex flex-col">
                            <InfoPill
                                icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                                    </svg>
                                }
                                label="Location"
                                value={<>Apollo Hospitals, Bannerghatta Rd<br /><span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Bengaluru, Karnataka 560076</span></>}
                            />
                            <InfoPill
                                icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                }
                                label="Consultation Hours"
                                value={<>Mon – Sat · 9:00 AM – 5:00 PM<br /><span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Emergency calls: 24 × 7</span></>}
                            />
                            <InfoPill
                                icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                    </svg>
                                }
                                label="Video Consultation"
                                value={<>Available for Gulf &amp; international patients<br /><span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Secure, HD video · Any device</span></>}
                            />
                            <InfoPill
                                icon={
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.19 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                                    </svg>
                                }
                                label="Phone / WhatsApp"
                                value="+91 98765 43210"
                            />
                        </div>

                        {/* Trust row */}
                        <div className="mt-auto pt-8 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(27,191,168,0.15)" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1bbfa8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                            </div>
                            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                                All data is encrypted and never shared
                            </span>
                        </div>
                    </div>

                    {/* ── RIGHT: form ── */}
                    <div className="bg-white p-10 flex flex-col gap-6">
                        <div>
                            <h3 className="font-display text-[22px] text-navy font-bold mb-1">Request a Consultation</h3>
                            <p className="text-[13px] font-light" style={{ color: "#6b8aa0" }}>
                                We'll confirm your slot within 2 hours.
                            </p>
                        </div>

                        {/* Visit type toggle */}
                        <div className="flex gap-3">
                            {visitTypes.map(({ id, label, sub, icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setVisitType(id)}
                                    className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all cursor-pointer"
                                    style={{
                                        border: visitType === id ? "1.5px solid #0f8c7a" : "1.5px solid rgba(7,25,46,0.1)",
                                        background: visitType === id ? "rgba(15,140,122,0.05)" : "transparent",
                                    }}
                                >
                                    <span style={{ color: visitType === id ? "#0f8c7a" : "#9ab0bf" }}>{icon}</span>
                                    <div>
                                        <div className="text-[12.5px] font-semibold" style={{ color: visitType === id ? "#0e2237" : "#6b8aa0" }}>{label}</div>
                                        <div className="text-[11px]" style={{ color: "#9ab0bf" }}>{sub}</div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Name row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11.5px] font-semibold tracking-[0.05em] uppercase" style={{ color: "#3a5068" }}>First Name</label>
                                <input className="form-input" type="text" placeholder="Rahul" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11.5px] font-semibold tracking-[0.05em] uppercase" style={{ color: "#3a5068" }}>Last Name</label>
                                <input className="form-input" type="text" placeholder="Sharma" />
                            </div>
                        </div>

                        {/* Contact row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11.5px] font-semibold tracking-[0.05em] uppercase" style={{ color: "#3a5068" }}>Email Address</label>
                                <input className="form-input" type="email" placeholder="rahul@example.com" />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11.5px] font-semibold tracking-[0.05em] uppercase" style={{ color: "#3a5068" }}>Phone / WhatsApp</label>
                                <input className="form-input" type="tel" placeholder="+91 98765 43210" />
                            </div>
                        </div>

                        {/* Concern */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11.5px] font-semibold tracking-[0.05em] uppercase" style={{ color: "#3a5068" }}>Primary Concern <span style={{ color: "#9ab0bf", textTransform: "none", fontWeight: 400 }}>(optional)</span></label>
                            <input className="form-input" type="text" placeholder="e.g. chest pain, follow-up, second opinion…" />
                        </div>

                        {/* Time slot */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[11.5px] font-semibold tracking-[0.05em] uppercase" style={{ color: "#3a5068" }}>Preferred Time Slot</label>
                            <div className="grid grid-cols-4 gap-2">
                                {slots.map(({ time, avail }) => (
                                    <div
                                        key={time}
                                        className={`time-slot ${!avail ? "disabled" : ""} ${selected === time ? "selected" : ""}`}
                                        onClick={() => avail && setSelected(time)}
                                    >
                                        {time}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            className="w-full font-sans text-[14px] font-semibold text-white cursor-pointer transition-all hover:-translate-y-0.5 mt-1"
                            style={{
                                background: "linear-gradient(135deg, #0f8c7a 0%, #1bbfa8 100%)",
                                border: "none",
                                padding: "15px 24px",
                                borderRadius: "12px",
                                boxShadow: "0 8px 24px rgba(15,140,122,0.35)",
                                letterSpacing: "0.02em",
                            }}
                        >
                            Confirm Appointment Request →
                        </button>

                        <p className="flex items-center justify-center gap-1.5 text-[11px]" style={{ color: "#9ab0bf" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Your data is secure and confidential. We never share it.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}