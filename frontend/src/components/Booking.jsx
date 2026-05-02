import { useState, useEffect, useCallback } from "react";
import { useReveal } from "../hooks/useReveal";
import { getClinics, getSlotsByClinic, getSlotsByTime, bookAppointment } from "../services/publicApi";

const reasons = ["General Consultation", "Follow-up Visit", "Second Opinion", "Preventive Check", "Other"];

function toDateStr(d) { return d.toLocaleDateString("en-CA"); }
function addDays(d,n) { const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function norm(d) { const x=new Date(d); x.setHours(0,0,0,0); return x; }
function fmtShort(d) { return d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"}); }

/** Classify slot time as Morning (<12:00) or Evening */
function groupSlots(slots) {
  const morning = slots.filter(s => s.time < "12:00");
  const evening = slots.filter(s => s.time >= "12:00");
  return { morning, evening };
}

function BookingStatusModal({ status, onClose }) {
  if (!status) return null;

  const isSuccess = status.type === "success";
  const color = isSuccess ? "#16a34a" : "#dc2626";
  const bg = isSuccess ? "#f0fdf4" : "#fef2f2";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[360px] rounded-[28px] bg-white p-6 text-center shadow-2xl">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold"
          style={{ background: bg, color }}
        >
          {isSuccess ? "✓" : "!"}
        </div>
        <h3 className="font-display text-xl font-bold text-navy">{status.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-navy/55">{status.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl py-3 text-sm font-semibold text-white transition active:scale-95"
          style={{ background: color }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default function Booking() {
  const ref = useReveal();
  const [mode, setMode] = useState("clinic"); // "clinic" | "time"
  const [weekStart, setWeekStart] = useState(() => norm(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => norm(new Date()));
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [clinicResults, setClinicResults] = useState([]); // Mode 2 results
  const [timeInput, setTimeInput] = useState(""); // Mode 2 user input time
  const [loading, setLoading] = useState(false);

  // Patient form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState(reasons[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusModal, setStatusModal] = useState(null);

  const days = Array.from({length:7}).map((_,i)=>addDays(weekStart,i));
  const today = norm(new Date()).getTime();
  const isAtTodayStart = norm(weekStart).getTime() <= today;
  const dateStr = toDateStr(selectedDate);

  // Load clinics once
  useEffect(() => {
    getClinics().then(r => {
      const cl = r.clinics || [];
      setClinics(cl);
      if (cl.length > 0) setSelectedClinic(cl[0].id);
    }).catch(console.error);
  }, []);

  // Mode 1: fetch slots when clinic/date changes
  useEffect(() => {
    if (mode !== "clinic" || !selectedClinic || !dateStr) return;
    setLoading(true);
    setSelectedTime("");
    getSlotsByClinic(dateStr, selectedClinic)
      .then(r => {
        const cd = (r.clinics || [])[0];
        setSlots(cd?.slots || []);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [mode, selectedClinic, dateStr]);

  // Mode 2: fetch available clinics when time changes
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

  // Generate browsable time options for Mode 2 (every 10 min from 07:00-22:00)
  const timeOptions = [];
  for (let m = 7*60; m < 22*60; m += 10) {
    const hh = String(Math.floor(m/60)).padStart(2,"0");
    const mm = String(m%60).padStart(2,"0");
    timeOptions.push(`${hh}:${mm}`);
  }

  const handleSubmit = async () => {
    if (!fullName || !phone) {
      setStatusModal({ type: "error", title: "Missing details", message: "Name and phone are required to book an appointment." });
      return;
    }
    const clinicId = mode === "clinic" ? selectedClinic : selectedClinic;
    const time = mode === "clinic" ? selectedTime : timeInput;
    if (!clinicId || !time) {
      setStatusModal({ type: "error", title: "Select a slot", message: "Please select a clinic and time slot before confirming." });
      return;
    }

    setSubmitting(true);
    try {
      const r = await bookAppointment({
        clinicId, date: dateStr, time, patientName: fullName,
        patientPhone: phone, patientEmail: email || undefined,
      });
      setStatusModal({
        type: "success",
        title: "Appointment requested",
        message: r.message || "Appointment booked successfully!",
      });
      setFullName(""); setEmail(""); setPhone(""); setNotes(""); setSelectedTime("");
    } catch (err) {
      setStatusModal({
        type: "error",
        title: "Could not book",
        message: err.message || "This slot is not available. Please select another option.",
      });
    }
    finally { setSubmitting(false); }
  };

  // Helpers
  const selectedClinicObj = clinics.find(c => c.id === selectedClinic);
  const { morning, evening } = groupSlots(slots.filter(s => !s.booked));
  const bookedSlots = slots.filter(s => s.booked);
  const totalAvailable = morning.length + evening.length;

  const formatTime12 = (t) => {
    const [h,m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    return `${((h%12)||12)}:${String(m).padStart(2,"0")} ${ampm}`;
  };

  return (
    <section id="booking" className="relative overflow-hidden bg-white">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[60px] py-16 sm:py-20 lg:py-[110px]" ref={ref}>
        {/* Header */}
        <div className="reveal flex flex-col items-center text-center mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-px" style={{background:"#0f8c7a"}}/>
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{color:"#0f8c7a"}}>Schedule Excellence</span>
            <div className="w-8 h-px" style={{background:"#0f8c7a"}}/>
          </div>
          <h2 className="font-display text-[clamp(30px,4vw,48px)] text-navy leading-[1.1] font-bold mb-4">
            Book Your Clinical <em className="italic" style={{color:"#0f8c7a"}}>Consultation</em>
          </h2>
          <p className="text-[15px] font-light text-navy/50 leading-[1.8] max-w-[680px]">
            Select a clinic or pick a time — we'll show you the best options.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="reveal max-w-md mx-auto mb-8">
          <div className="booking-mode-toggle">
            <button className={mode==="clinic"?"active":""} onClick={()=>{setMode("clinic");setSelectedTime("");}}>
              Choose Clinic First
            </button>
            <button className={mode==="time"?"active":""} onClick={()=>{setMode("time");setSelectedClinic(null);}}>
              Choose Time First
            </button>
          </div>
        </div>

        <div className="reveal grid gap-6 items-start grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-5 self-start lg:sticky lg:top-24">
            {/* Date Picker */}
            <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-7">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-[15px] font-semibold text-navy">1. Select Date</span>
                  <span className="text-[11px] text-navy/40">{weekStart.toLocaleDateString(undefined,{month:"long",year:"numeric"})}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isAtTodayStart}
                    className="w-9 h-9 rounded-lg border border-navy/10 bg-white hover:bg-navy/5 transition disabled:opacity-35 disabled:cursor-not-allowed"
                    onClick={()=>!isAtTodayStart && setWeekStart(addDays(weekStart,-7))}
                  >‹</button>
                  <button type="button" className="w-9 h-9 rounded-lg border border-navy/10 bg-white hover:bg-navy/5 transition" onClick={()=>setWeekStart(addDays(weekStart,7))}>›</button>
                </div>
              </div>
              <div className="overflow-x-auto -mx-2 px-2">
                <div className="grid grid-cols-7 gap-2 min-w-[520px] sm:min-w-0">
                  {days.map(d => {
                    const ts=norm(d).getTime(), isSel=ts===selectedDate.getTime(), isToday=ts===today, isPast=ts<today;
                    return (
                      <button key={d.toISOString()} type="button" disabled={isPast}
                        onClick={()=>setSelectedDate(norm(d))}
                        className="rounded-xl px-2 py-3 text-center transition border"
                        style={{
                          borderColor: isSel?"rgba(15,140,122,0.35)":"rgba(7,25,46,0.08)",
                          background: isSel?"rgba(15,140,122,0.08)":"#fff",
                          opacity: isPast?0.35:1,
                        }}>
                        <div className="text-[10px] tracking-[0.12em] uppercase" style={{color:"rgba(7,25,46,0.45)"}}>{d.toLocaleDateString(undefined,{weekday:"short"})}</div>
                        <div className="text-[14px] font-semibold text-navy mt-1">{d.getDate()}</div>
                        {isToday && !isSel && <div className="text-[10px] mt-1" style={{color:"#0f8c7a"}}>Today</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 2: depends on mode */}
            {mode === "clinic" ? (
              <>
                {/* Clinic selector */}
                <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-7">
                  <span className="text-[15px] font-semibold text-navy block mb-4">2. Select Clinic</span>
                  <div className="flex flex-col gap-3">
                    {clinics.map(c => (
                      <button key={c.id} type="button"
                        className={`clinic-card text-left ${selectedClinic===c.id?"selected":""} ${!c.weeklySchedule?"unavailable":""}`}
                        onClick={()=>c.weeklySchedule && setSelectedClinic(c.id)}>
                        <div className="text-[13px] font-semibold text-navy">{c.name}</div>
                        <div className="text-[11px] text-navy/45 mt-1 leading-snug">{c.address}</div>
                        {c.specialty && <div className="text-[10px] mt-1.5 font-semibold" style={{color:"#0f8c7a"}}>{c.specialty}</div>}
                        {!c.weeklySchedule && <div className="text-[10px] mt-1 text-amber-600 font-semibold">By appointment only — call to book</div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time slots */}
                <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-7">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[15px] font-semibold text-navy">3. Select Time</span>
                    <span className="text-[11px] text-navy/40">{totalAvailable} available</span>
                  </div>
                  {loading ? (
                    <div className="grid grid-cols-4 gap-3">{Array.from({length:8}).map((_,i)=><div key={i} className="slot-skeleton"/>)}</div>
                  ) : slots.length === 0 ? (
                    <p className="text-[13px] text-navy/40 text-center py-8">No slots available for this date at this clinic.</p>
                  ) : (
                    <>
                      {morning.length > 0 && (
                        <>
                          <div className="session-label">🌅 Morning Session</div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {morning.map(s => (
                              <button key={s.time} type="button"
                                className={`time-slot ${selectedTime===s.time?"selected":""}`}
                                onClick={()=>setSelectedTime(s.time)}>
                                {formatTime12(s.time)}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                      {evening.length > 0 && (
                        <>
                          <div className="session-label">🌆 Evening Session</div>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {evening.map(s => (
                              <button key={s.time} type="button"
                                className={`time-slot ${selectedTime===s.time?"selected":""}`}
                                onClick={()=>setSelectedTime(s.time)}>
                                {formatTime12(s.time)}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                      {bookedSlots.length > 0 && (
                        <p className="text-[10px] text-navy/30 mt-3 text-center">
                          {bookedSlots.length} slot{bookedSlots.length!==1?"s":""} already taken
                        </p>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Mode 2: Time selector */}
                <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-7">
                  <span className="text-[15px] font-semibold text-navy block mb-4">2. Pick a Time</span>
                  <select className="form-input" value={timeInput} onChange={e=>{setTimeInput(e.target.value);setSelectedClinic(null);}}>
                    <option value="">Select a time…</option>
                    {timeOptions.map(t => <option key={t} value={t}>{formatTime12(t)}</option>)}
                  </select>
                </div>

                {/* Available clinics at that time */}
                {timeInput && (
                  <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-7">
                    <span className="text-[15px] font-semibold text-navy block mb-4">3. Available Clinics</span>
                    {loading ? (
                      <div className="flex flex-col gap-3">{Array.from({length:3}).map((_,i)=><div key={i} className="slot-skeleton" style={{height:70}}/>)}</div>
                    ) : clinicResults.length === 0 ? (
                      <p className="text-[13px] text-navy/40 text-center py-6">No clinics are available for this time.</p>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {clinicResults.map(cr => {
                          const avail = cr.available;
                          return (
                            <button key={cr.clinicId} type="button"
                              className={`clinic-card text-left ${selectedClinic===cr.clinicId?"selected":""} ${!avail?"unavailable":""}`}
                              onClick={()=>avail && setSelectedClinic(cr.clinicId)}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-[13px] font-semibold text-navy">{cr.clinicName}</div>
                                  <div className="text-[11px] text-navy/45 mt-1">{cr.address}</div>
                                </div>
                                {avail ? (
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{background:"rgba(15,140,122,0.1)",color:"#0f8c7a"}}>Available</span>
                                ) : (
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{background:"#fef2f2",color:"#dc2626"}}>
                                    Not available
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Help card */}
            <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-7">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-[12px] font-semibold tracking-[0.12em] uppercase" style={{color:"#0f8c7a"}}>Need help booking?</div>
                  <div className="text-[15px] font-semibold text-navy mt-2">Call / WhatsApp</div>
                  <div className="text-[13px] text-navy/60 mt-1">+91 95381 07758</div>
                  <div className="text-[12px] text-navy/45 mt-3 leading-[1.7] max-w-[360px]">
                    If you're unsure about the right slot, message us and we'll help confirm the best option.
                  </div>
                </div>
                <div className="hidden sm:flex flex-shrink-0 items-center justify-center rounded-2xl"
                  style={{width:86,height:86,background:"linear-gradient(135deg,rgba(15,140,122,0.12),rgba(7,25,46,0.06))",border:"1px solid rgba(7,25,46,0.08)"}}>
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#0f8c7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.01 2.19 2 2 0 012 .01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Patient Details ── */}
          <div className="bg-white rounded-2xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.08)] p-7">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-[15px] font-semibold text-navy">{mode==="clinic"?"4":"4"}. Patient Details</div>
                <div className="text-[12px] text-navy/45 mt-1">Dr. Akshath Ramesh Acharya · MBBS</div>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-4 rounded-xl border border-navy/10 bg-[#f7faf9] p-4">
              <img src="/dr.akshath.jpeg" alt="Dr. Akshath" className="w-[68px] h-[68px] rounded-xl object-cover border border-navy/10"/>
              <div>
                <div className="text-[12px] font-semibold text-navy leading-snug">Consultation with Dr. Akshath</div>
                <div className="text-[11px] text-navy/45 mt-1">Kindly share accurate details to confirm your slot.</div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Full Name *</label>
                <input className="form-input" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Your full name"/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Email</label>
                  <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Phone *</label>
                  <input className="form-input" type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX"/>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Reason for Visit</label>
                <select className="form-input" value={reason} onChange={e=>setReason(e.target.value)}>
                  {reasons.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-navy/60">Additional Notes</label>
                <textarea className="form-input" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Describe symptoms or concerns..."/>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-navy/10 bg-[#f7faf9] p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="text-[10px] tracking-[0.12em] uppercase text-navy/45">Date</div>
                    <div className="text-[12px] font-semibold text-navy mt-1">{fmtShort(selectedDate)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.12em] uppercase text-navy/45">Time</div>
                    <div className="text-[12px] font-semibold text-navy mt-1">
                      {(mode==="clinic"?selectedTime:timeInput) ? formatTime12(mode==="clinic"?selectedTime:timeInput) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.12em] uppercase text-navy/45">Clinic</div>
                    <div className="text-[12px] font-semibold text-navy mt-1 truncate">
                      {selectedClinicObj?.name || clinicResults.find(c=>c.clinicId===selectedClinic)?.clinicName || "—"}
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" disabled={submitting}
                className="w-full rounded-xl py-3.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{background:"linear-gradient(135deg,#0b3b52,#07192e)",boxShadow:"0 10px 26px rgba(7,25,46,0.22)"}}
                onClick={handleSubmit}>
                {submitting ? "Booking..." : "Confirm Appointment"}
              </button>

              <p className="text-center text-[11px] text-navy/40 leading-[1.6]">
                By confirming, you agree to our clinic terms. A confirmation message will be sent shortly.
              </p>
            </div>
          </div>
        </div>
      </div>
      <BookingStatusModal status={statusModal} onClose={() => setStatusModal(null)} />
    </section>
  );
}