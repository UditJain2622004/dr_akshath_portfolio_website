import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useReveal } from "../hooks/useReveal";
import { getClinics, getSlotsByClinic, getSlotsByTime, bookAppointment } from "../services/publicApi";

const reasons = ["General Consultation", "Follow-up Visit", "Second Opinion", "Preventive Check", "Other"];

function toDateStr(d) { return d.toLocaleDateString("en-CA"); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function norm(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function fmtShort(d) { return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); }

function groupSlots(slots) {
  const morning = slots.filter(s => s.time < "12:00");
  const evening = slots.filter(s => s.time >= "12:00");
  return { morning, evening };
}

const formatTime12 = (t) => {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${((h % 12) || 12)}:${String(m).padStart(2, "0")} ${ampm}`;
};

/* ── Status popup ── */
function BookingStatusModal({ status, onClose }) {
  if (!status) return null;
  const isSuccess = status.type === "success";
  const color = isSuccess ? "#16a34a" : "#dc2626";
  const bg = isSuccess ? "#f0fdf4" : "#fef2f2";
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[360px] rounded-[28px] bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold" style={{ background: bg, color }}>
          {isSuccess ? "✓" : "!"}
        </div>
        <h3 className="font-display text-xl font-bold text-navy">{status.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-navy/55">{status.message}</p>
        <button type="button" onClick={onClose} className="mt-6 w-full rounded-2xl py-3 text-sm font-semibold text-white transition active:scale-95" style={{ background: color }}>OK</button>
      </div>
    </div>
  );
}

/* ── Completed-step summary pill ── */
function StepSummary({ label, value, onEdit }) {
  return (
    <button type="button" onClick={onEdit}
      className="w-full flex items-center justify-between rounded-2xl border border-teal/20 bg-teal/[0.04] px-5 py-3.5 text-left transition hover:border-teal/40">
      <div>
        <div className="text-[10px] font-semibold tracking-[0.12em] uppercase text-navy/40">{label}</div>
        <div className="text-[13px] font-semibold text-navy mt-0.5">{value}</div>
      </div>
      <span className="text-[11px] font-semibold" style={{ color: "#0f8c7a" }}>Change</span>
    </button>
  );
}

/* ── Patient form bottom sheet ── */
function PatientSheet({ open, onClose, onSubmit, submitting, selectedDate, selectedTime, timeInput, mode, clinicName }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState(reasons[0]);
  const [notes, setNotes] = useState("");
  const sheetRef = useRef(null);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSubmit = () => {
    onSubmit({ fullName, email, phone, reason, notes }, () => {
      setFullName(""); setEmail(""); setPhone(""); setNotes("");
    });
  };

  if (!open) return null;

  const time = mode === "clinic" ? selectedTime : timeInput;

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div ref={sheetRef}
        className="relative w-full max-w-[480px] max-h-[90dvh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-white shadow-2xl p-6 sm:p-8">
        <div className="mx-auto mb-5 w-10 h-1 rounded-full bg-navy/10 sm:hidden" />

        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h3 className="text-[17px] font-semibold text-navy">Patient Details</h3>
            <p className="text-[11px] text-navy/45 mt-0.5">Dr. Akshath Ramesh Acharya · MBBS</p>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-navy/40 hover:bg-navy/5 transition text-lg">✕</button>
        </div>

        <div className="rounded-xl border border-navy/10 bg-[#f7faf9] p-3.5 mb-5">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-[9px] tracking-[0.12em] uppercase text-navy/40">Date</div>
              <div className="text-[12px] font-semibold text-navy mt-0.5">{fmtShort(selectedDate)}</div>
            </div>
            <div>
              <div className="text-[9px] tracking-[0.12em] uppercase text-navy/40">Time</div>
              <div className="text-[12px] font-semibold text-navy mt-0.5">{time ? formatTime12(time) : "—"}</div>
            </div>
            <div>
              <div className="text-[9px] tracking-[0.12em] uppercase text-navy/40">Clinic</div>
              <div className="text-[12px] font-semibold text-navy mt-0.5 truncate">{clinicName || "—"}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Full Name *</label>
            <input className="form-input" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Email</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Phone *</label>
              <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Reason for Visit</label>
            <select className="form-input" value={reason} onChange={e => setReason(e.target.value)}>
              {reasons.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Additional Notes</label>
            <textarea className="form-input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Describe symptoms or concerns..." />
          </div>

          <button type="button" disabled={submitting} onClick={handleSubmit}
            className="w-full rounded-xl py-3.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#0b3b52,#07192e)", boxShadow: "0 10px 26px rgba(7,25,46,0.22)" }}>
            {submitting ? "Booking..." : "Confirm Appointment"}
          </button>
          <p className="text-center text-[11px] text-navy/40 leading-[1.6]">
            By confirming, you agree to our clinic terms. A confirmation message will be sent shortly.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */

export default function Booking() {
  const ref = useReveal();
  const [mode, setMode] = useState("clinic");
  const [step, setStep] = useState(2);
  const [clinicCollapsed, setClinicCollapsed] = useState(false);
  const [timeCollapsed, setTimeCollapsed] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const calRef = useRef(null);

  const [selectedDate, setSelectedDate] = useState(() => norm(new Date()));
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [clinicResults, setClinicResults] = useState([]);
  const [timeInput, setTimeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusModal, setStatusModal] = useState(null);

  const today = norm(new Date());
  const quickDays = Array.from({ length: 5 }).map((_, i) => addDays(today, i));
  const dateStr = toDateStr(selectedDate);

  useEffect(() => {
    getClinics().then(r => {
      const cl = r.clinics || [];
      setClinics(cl);
      if (cl.length > 0) setSelectedClinic(cl[0].id);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (mode !== "clinic" || !selectedClinic || !dateStr) return;
    setLoading(true);
    setSelectedTime("");
    getSlotsByClinic(dateStr, selectedClinic)
      .then(r => { const cd = (r.clinics || [])[0]; setSlots(cd?.slots || []); })
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [mode, selectedClinic, dateStr]);

  const fetchClinicsForTime = useCallback(() => {
    if (mode !== "time" || !timeInput || !dateStr) return;
    setLoading(true);
    setSelectedClinic(null);
    getSlotsByTime(dateStr, timeInput)
      .then(r => setClinicResults(r.clinics || []))
      .catch(() => setClinicResults([]))
      .finally(() => setLoading(false));
  }, [mode, timeInput, dateStr]);

  useEffect(() => { fetchClinicsForTime(); }, [fetchClinicsForTime]);

  const timeOptions = useMemo(() => {
    const now = new Date();
    const isSelectedDateToday = selectedDate.getTime() === today.getTime();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const options = [];
    for (let m = 7 * 60; m < 22 * 60; m += 10) {
      if (isSelectedDateToday && m <= currentMinutes) continue;
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }
    return options;
  }, [selectedDate, today]);

  useEffect(() => {
    if (mode !== "time" || !timeInput) return;
    if (!timeOptions.includes(timeInput)) {
      setTimeInput("");
      setSelectedClinic(null);
      setClinicCollapsed(false);
    }
  }, [mode, timeInput, timeOptions]);

  const handleSubmit = async ({ fullName, email, phone }, resetForm) => {
    if (!fullName || !phone) {
      setStatusModal({ type: "error", title: "Missing details", message: "Name and phone are required to book an appointment." });
      return;
    }
    const clinicId = selectedClinic;
    const time = mode === "clinic" ? selectedTime : timeInput;
    if (!clinicId || !time) {
      setStatusModal({ type: "error", title: "Select a slot", message: "Please select a clinic and time slot before confirming." });
      return;
    }
    setSubmitting(true);
    try {
      const r = await bookAppointment({ clinicId, date: dateStr, time, patientName: fullName, patientPhone: phone, patientEmail: email || undefined });
      setStatusModal({ type: "success", title: "Appointment requested", message: r.message || "Appointment booked successfully!" });
      resetForm();
      setSelectedTime("");
      setShowSheet(false);
    } catch (err) {
      setStatusModal({ type: "error", title: "Could not book", message: err.message || "This slot is not available. Please select another option." });
    } finally { setSubmitting(false); }
  };

  const selectedClinicObj = clinics.find(c => c.id === selectedClinic);
  const clinicName = selectedClinicObj?.name || clinicResults.find(c => c.clinicId === selectedClinic)?.clinicName || "";
  const { morning, evening } = groupSlots(slots.filter(s => !s.booked));
  const bookedSlots = slots.filter(s => s.booked);
  const totalAvailable = morning.length + evening.length;

  const hasSlotSelection = mode === "clinic" ? !!selectedTime : (!!timeInput && !!selectedClinic);
  const isQuickDate = quickDays.some(d => norm(d).getTime() === selectedDate.getTime());

  const goStep = (n) => setStep(n);

  const handleDatePick = (d) => {
    setSelectedDate(norm(d));
    setShowCalendar(false);
    if (mode === "clinic" && selectedClinic) {
      setClinicCollapsed(true);
    } else {
      setClinicCollapsed(false);
    }
    setTimeCollapsed(false);
    if (step < 2) goStep(2);
  };

  return (
    <section id="booking" className="relative overflow-hidden bg-white">
      <div className="max-w-[700px] lg:max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[60px] py-16 sm:py-20 lg:py-[110px]" ref={ref}>
        {/* Header */}
        <div className="reveal flex flex-col items-center text-center mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#0f8c7a" }}>Schedule Excellence</span>
            <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
          </div>
          <h2 className="font-display text-[clamp(26px,4vw,48px)] text-navy leading-[1.1] font-bold mb-3">
            Book Your Clinical <em className="italic" style={{ color: "#0f8c7a" }}>Consultation</em>
          </h2>
          <p className="text-[14px] font-light text-navy/50 leading-[1.8] max-w-[680px]">
            Select a clinic or pick a time — we'll show you the best options.
          </p>
        </div>

        

        {/* Mode toggle */}
        <div className="reveal max-w-md mx-auto mb-8">
          <div className="booking-mode-toggle">
            <button className={mode === "clinic" ? "active" : ""} onClick={() => { setMode("clinic"); setSelectedTime(""); setStep(2); setClinicCollapsed(false); setTimeCollapsed(false); }}>
              Choose Clinic First
            </button>
            <button className={mode === "time" ? "active" : ""} onClick={() => { setMode("time"); setSelectedClinic(null); setSelectedTime(""); setTimeInput(""); setStep(2); setClinicCollapsed(false); setTimeCollapsed(false); }}>
              Choose Time First
            </button>
          </div>
        </div>

        <div className="reveal flex flex-col gap-4 max-w-[600px] lg:max-w-none mx-auto">

          {/* ═══ STEP 1 — Date ═══ */}
          <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-5 sm:p-7">
            <span className="text-[15px] font-semibold text-navy block mb-4">1. Select Date</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {quickDays.map(d => {
                const ts = norm(d).getTime(), isSel = ts === selectedDate.getTime(), isToday = ts === today.getTime();
                return (
                  <button key={d.toISOString()} type="button"
                    onClick={() => handleDatePick(d)}
                    className="flex-shrink-0 rounded-xl px-4 py-3 text-center transition border"
                    style={{
                      borderColor: isSel ? "rgba(15,140,122,0.35)" : "rgba(7,25,46,0.08)",
                      background: isSel ? "rgba(15,140,122,0.08)" : "#fff",
                    }}>
                    <div className="text-[10px] tracking-[0.12em] uppercase" style={{ color: "rgba(7,25,46,0.45)" }}>{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                    <div className="text-[15px] font-semibold text-navy mt-0.5">{d.getDate()}</div>
                    {isToday && <div className="text-[9px] mt-0.5" style={{ color: "#0f8c7a" }}>Today</div>}
                  </button>
                );
              })}
              <button type="button"
                onClick={() => setShowCalendar(true)}
                className="flex-shrink-0 rounded-xl px-4 py-3 text-center transition border border-navy/10 hover:border-teal/30 hover:bg-teal/[0.04]">
                <div className="text-[10px] tracking-[0.12em] uppercase" style={{ color: "rgba(7,25,46,0.45)" }}>More</div>
                <div className="text-[15px] font-semibold text-navy mt-0.5">📅</div>
                <div className="text-[9px] mt-0.5 text-navy/40">Pick date</div>
              </button>
            </div>
            {!isQuickDate && (
              <div className="mt-3 text-[12px] font-semibold text-teal">{fmtShort(selectedDate)}</div>
            )}
          </div>


          

          {/* ═══ STEP 2 — Clinic or Time (depends on mode) ═══ */}
          {step >= 2 && (mode === "clinic" ? (
            clinicCollapsed ? (
              <StepSummary label="Clinic" value={selectedClinicObj?.name || "—"} onEdit={() => { setClinicCollapsed(false); setTimeCollapsed(false); }} />
            ) : (
              <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-5 sm:p-7">
                <span className="text-[15px] font-semibold text-navy block mb-4">2. Select Clinic</span>
                <div className="flex flex-col gap-3">
                  {clinics.map(c => (
                    <button key={c.id} type="button"
                      className={`clinic-card text-left ${selectedClinic === c.id ? "selected" : ""} ${!c.weeklySchedule ? "unavailable" : ""}`}
                      onClick={() => { if (c.weeklySchedule) { setSelectedClinic(c.id); setClinicCollapsed(true); goStep(3); } }}>
                      <div className="text-[13px] font-semibold text-navy">{c.name}</div>
                      <div className="text-[11px] text-navy/45 mt-1 leading-snug">{c.address}</div>
                      {c.specialty && <div className="text-[10px] mt-1.5 font-semibold" style={{ color: "#0f8c7a" }}>{c.specialty}</div>}
                      {!c.weeklySchedule && <div className="text-[10px] mt-1 text-amber-600 font-semibold">By appointment only — call to book</div>}
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-5 sm:p-7">
              <span className="text-[15px] font-semibold text-navy block mb-4">2. Pick a Time</span>
              <select className="form-input" value={timeInput} onChange={e => { setTimeInput(e.target.value); setSelectedClinic(null); setClinicCollapsed(false); if (e.target.value) goStep(3); }}>
                <option value="">Select a time…</option>
                {timeOptions.map(t => <option key={t} value={t}>{formatTime12(t)}</option>)}
              </select>
            </div>
          ))}

          {/* ═══ STEP 3 — Slots (clinic mode) or Clinic results (time mode) ═══ */}
          {step >= 3 && (mode === "clinic" ? (
            timeCollapsed && selectedTime ? (
              <StepSummary label="Time" value={formatTime12(selectedTime)} onEdit={() => setTimeCollapsed(false)} />
            ) : (
              <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-5 sm:p-7">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[15px] font-semibold text-navy">3. Select Time</span>
                  <span className="text-[11px] text-navy/40">{totalAvailable} available</span>
                </div>
                {loading ? (
                  <div className="grid grid-cols-4 gap-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="slot-skeleton" />)}</div>
                ) : slots.length === 0 ? (
                  <p className="text-[13px] text-navy/40 text-center py-8">No slots available for this date at this clinic.</p>
                ) : (
                  <>
                    {morning.length > 0 && (
                      <>
                        <div className="session-label">Morning</div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {morning.map(s => (
                            <button key={s.time} type="button"
                              className={`time-slot ${selectedTime === s.time ? "selected" : ""}`}
                              onClick={() => { setSelectedTime(s.time); setTimeCollapsed(true); }}>
                              {formatTime12(s.time)}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {evening.length > 0 && (
                      <>
                        <div className="session-label">Evening</div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {evening.map(s => (
                            <button key={s.time} type="button"
                              className={`time-slot ${selectedTime === s.time ? "selected" : ""}`}
                              onClick={() => { setSelectedTime(s.time); setTimeCollapsed(true); }}>
                              {formatTime12(s.time)}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {bookedSlots.length > 0 && (
                      <p className="text-[10px] text-navy/30 mt-3 text-center">
                        {bookedSlots.length} slot{bookedSlots.length !== 1 ? "s" : ""} already taken
                      </p>
                    )}
                  </>
                )}
              </div>
            )
          ) : timeInput ? (
            clinicCollapsed && selectedClinic ? (
              <StepSummary label="Clinic" value={clinicResults.find(c => c.clinicId === selectedClinic)?.clinicName || "—"} onEdit={() => setClinicCollapsed(false)} />
            ) : (
              <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-5 sm:p-7">
                <span className="text-[15px] font-semibold text-navy block mb-4">3. Available Clinics</span>
                {loading ? (
                  <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="slot-skeleton" style={{ height: 70 }} />)}</div>
                ) : clinicResults.length === 0 ? (
                  <p className="text-[13px] text-navy/40 text-center py-6">No clinics are available for this time.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {clinicResults.map(cr => {
                      const avail = cr.available;
                      return (
                        <button key={cr.clinicId} type="button"
                          className={`clinic-card text-left ${selectedClinic === cr.clinicId ? "selected" : ""} ${!avail ? "unavailable" : ""}`}
                          onClick={() => { if (avail) { setSelectedClinic(cr.clinicId); setClinicCollapsed(true); } }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-[13px] font-semibold text-navy">{cr.clinicName}</div>
                              <div className="text-[11px] text-navy/45 mt-1">{cr.address}</div>
                            </div>
                            {avail ? (
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(15,140,122,0.1)", color: "#0f8c7a" }}>Available</span>
                            ) : (
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#fef2f2", color: "#dc2626" }}>Not available</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          ) : null)}

          {/* ═══ Sticky CTA ═══ */}
          {hasSlotSelection && (
            <div className="sticky bottom-4 z-20 pt-2">
              <button type="button" onClick={() => setShowSheet(true)}
                className="w-full rounded-2xl py-4 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 active:scale-[0.98] shadow-xl"
                style={{ background: "linear-gradient(135deg,#0f8c7a,#1bbfa8)", boxShadow: "0 12px 32px rgba(15,140,122,0.35)" }}>
                Continue — Fill Your Details
              </button>
            </div>
          )}

          {/* ═══ Help card (at end) ═══ */}
          <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-5 sm:p-7 mt-2">
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-[12px] font-semibold tracking-[0.12em] uppercase" style={{ color: "#0f8c7a" }}>Need help booking?</div>
                <div className="text-[15px] font-semibold text-navy mt-2">Call / WhatsApp</div>
                <div className="text-[13px] text-navy/60 mt-1">+91 95381 07758</div>
                <div className="text-[12px] text-navy/45 mt-3 leading-[1.7] max-w-[360px]">
                  If you're unsure about the right slot, message us and we'll help confirm the best option.
                </div>
              </div>
              <div className="hidden sm:flex flex-shrink-0 items-center justify-center rounded-2xl"
                style={{ width: 86, height: 86, background: "linear-gradient(135deg,rgba(15,140,122,0.12),rgba(7,25,46,0.06))", border: "1px solid rgba(7,25,46,0.08)" }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0f8c7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.19 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar overlay */}
      {showCalendar && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setShowCalendar(false)} />
          <div ref={calRef} className="relative bg-white rounded-[28px] p-6 shadow-2xl w-full max-w-[340px]">
            <h3 className="text-[15px] font-semibold text-navy mb-4 text-center">Pick a Date</h3>
            <input type="date"
              min={toDateStr(today)}
              value={toDateStr(selectedDate)}
              onChange={e => {
                if (e.target.value) handleDatePick(new Date(e.target.value + "T00:00:00"));
              }}
              className="form-input text-center text-[15px] font-semibold"
            />
            <button type="button" onClick={() => setShowCalendar(false)}
              className="w-full mt-4 rounded-xl py-2.5 text-[13px] font-semibold text-navy/50 hover:bg-navy/5 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Patient details bottom sheet */}
      <PatientSheet
        open={showSheet}
        onClose={() => setShowSheet(false)}
        onSubmit={handleSubmit}
        submitting={submitting}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        timeInput={timeInput}
        mode={mode}
        clinicName={clinicName}
      />

      <BookingStatusModal status={statusModal} onClose={() => setStatusModal(null)} />
    </section>
  );
}
