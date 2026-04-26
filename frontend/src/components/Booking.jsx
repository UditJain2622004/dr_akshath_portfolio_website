import { useState } from "react";
import { useReveal } from "../hooks/useReveal";

const slots = [
    { time: "09:00 AM", avail: true },
    { time: "10:30 AM", avail: true },
    { time: "11:00 AM", avail: true },
    { time: "01:30 PM", avail: true },
    { time: "02:00 PM", avail: true },
    { time: "03:30 PM", avail: true },
    { time: "04:00 PM", avail: false },
    { time: "05:00 PM", avail: true },
];

const reasons = [
    "General Clinical Consultation",
    "Follow-up Visit",
    "Second Opinion",
    "Preventive Health Check",
    "Other",
];

function startOfWeek(d) {
    const date = new Date(d);
    const day = date.getDay(); // 0 Sun ... 6 Sat
    const mondayIndex = (day + 6) % 7;
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - mondayIndex);
    return date;
}

function addDays(d, n) {
    const date = new Date(d);
    date.setDate(date.getDate() + n);
    return date;
}

function normalizeDate(d) {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    return date;
}

function fmtShort(d) {
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function fmtLong(d) {
    return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export default function Booking() {
    const ref = useReveal();

    const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
    const [selectedDate, setSelectedDate] = useState(() => normalizeDate(new Date()));
    const [selectedTime, setSelectedTime] = useState("11:00 AM");

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [reason, setReason] = useState(reasons[0]);
    const [notes, setNotes] = useState("");

    const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
    const today = normalizeDate(new Date()).getTime();

    return (
        <section id="booking" className="relative overflow-hidden bg-white">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[60px] py-16 sm:py-20 lg:py-[110px]">
                {/* Section header */}
                <div className="reveal flex flex-col items-center text-center mb-14" ref={ref}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#0f8c7a" }}>
                            Schedule Excellence
                        </span>
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                    </div>
                    <h2 className="font-display text-[clamp(30px,4vw,48px)] text-navy leading-[1.1] font-bold mb-4">
                        Book Your Clinical{" "}
                        <em className="italic" style={{ color: "#0f8c7a" }}>Consultation</em>
                    </h2>
                    <p className="text-[15px] font-light text-navy/50 leading-[1.8] max-w-[680px]">
                        Select a time that suits your schedule. Each consultation is intentionally curated to provide focused clinical attention.
                    </p>
                </div>

                {/* Main booking UI */}
                <div className="reveal grid gap-6 items-start grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
                    {/* ── LEFT: Date + Time ── */}
                    <div className="flex flex-col gap-5 self-start lg:sticky lg:top-24">
                        {/* Select date */}
                        <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-[15px] font-semibold text-navy">1. Select Date</span>
                                    <span className="text-[11px] text-navy/40">
                                        {weekStart.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="w-9 h-9 rounded-lg border border-navy/10 bg-white hover:bg-navy/5 transition"
                                        onClick={() => setWeekStart(addDays(weekStart, -7))}
                                        aria-label="Previous week"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        type="button"
                                        className="w-9 h-9 rounded-lg border border-navy/10 bg-white hover:bg-navy/5 transition"
                                        onClick={() => setWeekStart(addDays(weekStart, 7))}
                                        aria-label="Next week"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto -mx-2 px-2">
                                <div className="grid grid-cols-7 gap-2 min-w-[520px] sm:min-w-0">
                                    {days.map((d) => {
                                    const ts = normalizeDate(d).getTime();
                                    const isSelected = ts === selectedDate.getTime();
                                    const isToday = ts === today;
                                    return (
                                        <button
                                            key={d.toISOString()}
                                            type="button"
                                            onClick={() => setSelectedDate(normalizeDate(d))}
                                            className="rounded-xl px-2 py-3 text-center transition border"
                                            style={{
                                                borderColor: isSelected ? "rgba(15,140,122,0.35)" : "rgba(7,25,46,0.08)",
                                                background: isSelected ? "rgba(15,140,122,0.08)" : "#fff",
                                            }}
                                        >
                                            <div className="text-[10px] tracking-[0.12em] uppercase" style={{ color: "rgba(7,25,46,0.45)" }}>
                                                {d.toLocaleDateString(undefined, { weekday: "short" })}
                                            </div>
                                            <div className="text-[14px] font-semibold text-navy mt-1">{d.getDate()}</div>
                                            {isToday && !isSelected && (
                                                <div className="text-[10px] mt-1" style={{ color: "#0f8c7a" }}>Today</div>
                                            )}
                                        </button>
                                    );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Select time */}
                        <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-7">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[15px] font-semibold text-navy">2. Select Time</span>
                                <span className="text-[11px] text-navy/40">{fmtShort(selectedDate)}</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {slots.map(({ time, avail }) => (
                                    <button
                                        key={time}
                                        type="button"
                                        disabled={!avail}
                                        className={`time-slot ${!avail ? "disabled" : ""} ${selectedTime === time ? "selected" : ""}`}
                                        onClick={() => avail && setSelectedTime(time)}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Help card (fills empty space) */}
                        <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-7">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <div className="text-[12px] font-semibold tracking-[0.12em] uppercase" style={{ color: "#0f8c7a" }}>
                                        Need help booking?
                                    </div>
                                    <div className="text-[15px] font-semibold text-navy mt-2">
                                        Call / WhatsApp
                                    </div>
                                    <div className="text-[13px] text-navy/60 mt-1">
                                        +91 95381 07758
                                    </div>
                                    <div className="text-[12px] text-navy/45 mt-3 leading-[1.7] max-w-[360px]">
                                        If you’re unsure about the right slot or visit reason, message us and we’ll help confirm the best option.
                                    </div>
                                </div>

                                <div
                                    className="hidden sm:flex flex-shrink-0 items-center justify-center rounded-2xl"
                                    style={{
                                        width: 86,
                                        height: 86,
                                        background: "linear-gradient(135deg, rgba(15,140,122,0.12) 0%, rgba(7,25,46,0.06) 100%)",
                                        border: "1px solid rgba(7,25,46,0.08)",
                                    }}
                                >
                                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0f8c7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.19 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── RIGHT: Patient details ── */}
                    <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-7">
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <div>
                                <div className="text-[15px] font-semibold text-navy">3. Patient Details</div>
                                <div className="text-[12px] text-navy/45 mt-1">Dr. Akshath Ramesh Acharya · MBBS</div>
                            </div>
                        </div>

                        <div className="mb-6 flex items-center gap-4 rounded-xl border border-navy/10 bg-[#f7faf9] p-4">
                            <img
                                src="/dr.akshath.jpeg"
                                alt="Dr. Akshath Ramesh Acharya"
                                className="w-[68px] h-[68px] rounded-xl object-cover border border-navy/10"
                            />
                            <div>
                                <div className="text-[12px] font-semibold text-navy leading-snug">Consultation with Dr. Akshath</div>
                                <div className="text-[11px] text-navy/45 mt-1">Kindly share accurate details to confirm your slot.</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Full Name</label>
                                <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
                            </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Contact Email</label>
                                    <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Phone Number</label>
                                    <input className="form-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Reason for Visit</label>
                                <select className="form-input" value={reason} onChange={(e) => setReason(e.target.value)}>
                                    {reasons.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Additional Context</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Briefly describe your symptoms or specific concerns..."
                                />
                            </div>

                            {/* Summary */}
                            <div className="rounded-xl border border-navy/10 bg-[#f7faf9] p-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="text-[10px] tracking-[0.12em] uppercase text-navy/45">Appointment Date</div>
                                        <div className="text-[13px] font-semibold text-navy mt-1">{fmtLong(selectedDate)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] tracking-[0.12em] uppercase text-navy/45">Consultation Time</div>
                                        <div className="text-[13px] font-semibold text-navy mt-1">{selectedTime}</div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="w-full rounded-xl py-3.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
                                style={{
                                    background: "linear-gradient(135deg, #0b3b52 0%, #07192e 100%)",
                                    boxShadow: "0 10px 26px rgba(7,25,46,0.22)",
                                }}
                                onClick={() => {
                                    // UI demo only; backend can be wired later.
                                    // Keeping this intentionally side-effect light.
                                    void fullName;
                                    void email;
                                    void phone;
                                    void reason;
                                    void notes;
                                }}
                            >
                                Confirm Appointment
                            </button>

                            <p className="text-center text-[11px] text-navy/40 leading-[1.6]">
                                By confirming, you agree to our clinic terms. A confirmation message will be sent shortly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}