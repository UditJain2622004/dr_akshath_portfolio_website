import { useState } from "react";
import { useReveal } from "../hooks/useReveal";

/* ── Data ── */

const kmcHighlights = [
    "Conducting physical examinations, developing treatment plans considering patient preferences, clinical data, and risk‑benefit analysis",
    "Analyzing reports and test results for diagnosis; advising on diet, hygiene, and disease prevention",
    "In‑charge of Day Care Clinic and Executive Health Check",
    "Identifying at‑risk groups for preventable diseases and evaluating prescribed risk‑reduction measures",
    "Treating injuries and illnesses; referring complex cases to specialists",
    "Prescribing and administering treatment, therapy, medication, vaccination, and specialised medical care",
    "Improved methods of service delivery and patient experience in the clinic",
    "Pre‑employment and periodical medical assessments per Factory Act 1948 norms",
    "BLS & ACLS certified provider",
    "Resident in Cardio Thoracic & Vascular Surgery — assisted CABG, valve replacements/repair, myxoma excision, ASD closure",
    "Emergency Department CMO",
    "Senior Resident — adult and pediatric oncology, hematology, and immunology (lumbar puncture, intrathecal/intraventricular chemo, bone marrow aspiration & biopsy, ascitic & pleural tapping)",
    "Tutor & Mentor for MBBS students",
];

const otherAssignments = [
    { role: "Medical Officer (Evening)", place: "Health Care Center, NIT Karnataka", period: "2014 – 2025" },
    { role: "Visiting Medical Officer", place: "Suzlon Energy, Padubidri", period: "Apr – Dec 2012" },
    { role: "Visiting Medical Officer", place: "L&T (MRPL Phase‑III), Surathkal", period: "Apr – Dec 2012" },
    { role: "Visiting Medical Officer", place: "Life Style Corporation (Connect & Heal)", period: null },
    { role: "Visiting Medical Officer", place: "Sulzer India (MRPL Phase‑III)", period: null },
    { role: "Visiting Medical Officer", place: "Big Bags International Pvt Ltd, Ganjimutt", period: null },
    { role: "Visiting Medical Officer", place: "Adani Wilmar Ltd, Mangalore", period: null },
    { role: "Visiting Medical Officer", place: "Patanjali Foods Pvt Ltd, Mangalore", period: null },
    { role: "Visiting Medical Officer", place: "Chowgule SBD Pvt Ltd, Mangalore", period: null },
    { role: "Casualty Medical Officer (Night)", place: "Padmavathi Hospital, Surathkal", period: "2012 – 2013" },
    { role: "Casualty Medical Officer (Night)", place: "Yenepoya Multi‑Specialty Hospital, Mangalore", period: "2013 – 2014" },
    { role: "Consultant Doctor & Aesthetic Physician", place: "VLCC Health Care Ltd, Mangalore & BodyCraft", period: null },
    { role: "Bank Medical Officer", place: "BIRD (NABARD), Mangalore", period: null },
];

/* ── Sub‑components ── */

function Dots({ rows = 5, cols = 6, gap = 13, color = "rgba(15,140,122,0.18)" }) {
    return (
        <svg width={cols * gap} height={rows * gap} viewBox={`0 0 ${cols * gap} ${rows * gap}`} aria-hidden="true">
            {Array.from({ length: rows }).map((_, r) =>
                Array.from({ length: cols }).map((_, c) => (
                    <circle key={`${r}-${c}`} cx={c * gap + gap / 2} cy={r * gap + gap / 2} r="1.8" fill={color} />
                ))
            )}
        </svg>
    );
}

function ChevronIcon({ open }) {
    return (
        <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{
                transition: "transform 0.3s ease",
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
            }}
        >
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

/* Collapsible section */
function Collapsible({ title, icon, accent = "#0f8c7a", defaultOpen = false, children }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div
            className="rounded-xl overflow-hidden transition-all duration-300"
            style={{
                background: open ? "rgba(15,140,122,0.03)" : "transparent",
                border: `1px solid ${open ? "rgba(15,140,122,0.15)" : "rgba(7,25,46,0.08)"}`,
            }}
        >
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer transition-colors hover:bg-[rgba(15,140,122,0.04)]"
                style={{ background: "transparent", border: "none", fontFamily: "inherit" }}
            >
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${accent}14`, color: accent }}
                >
                    {icon}
                </div>
                <span className="text-[13.5px] font-semibold text-navy flex-1">{title}</span>
                <span className="text-navy/40">
                    <ChevronIcon open={open} />
                </span>
            </button>
            <div
                style={{
                    maxHeight: open ? 2000 : 0,
                    opacity: open ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.4s ease, opacity 0.3s ease",
                }}
            >
                <div className="px-5 pb-5 pt-0">{children}</div>
            </div>
        </div>
    );
}

/* ── Main Component ── */

export default function Experience() {
    const ref = useReveal();

    return (
        <section
            id="experience"
            className="relative overflow-hidden py-16 sm:py-20 lg:py-[110px]"
            style={{ background: "#f4f9f8" }}
        >
            {/* Background decorations */}
            <div className="absolute top-20 right-16 pointer-events-none opacity-70">
                <Dots rows={5} cols={6} gap={13} color="rgba(15,140,122,0.18)" />
            </div>
            <div className="absolute bottom-24 left-14 pointer-events-none opacity-70">
                <Dots rows={4} cols={5} gap={13} color="rgba(7,25,46,0.07)" />
            </div>
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: 500,
                    height: 500,
                    background: "radial-gradient(circle, rgba(15,140,122,0.06) 0%, transparent 65%)",
                    top: "30%",
                    right: "-10%",
                }}
            />

            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[60px]">
                {/* ── Header ── */}
                <div className="reveal flex flex-col items-center text-center mb-14" ref={ref}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#0f8c7a" }}>
                            Professional Journey
                        </span>
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                    </div>
                    <h2 className="font-display text-[clamp(32px,4vw,50px)] text-navy leading-[1.1] font-bold mb-5">
                        Clinical{" "}
                        <em className="italic" style={{ color: "#0f8c7a" }}>
                            Experience
                        </em>
                    </h2>
                    <p className="text-[15px] font-light text-navy/55 leading-[1.8] max-w-[620px]">
                        Over 13 years across hospital wards, emergency departments, polyclinics, and corporate health settings —
                        a journey of continuous learning and compassionate care.
                    </p>
                </div>

                {/* ── Timeline ── */}
                <div className="relative max-w-[860px] mx-auto">
                    {/* Vertical line */}
                    <div
                        className="hidden md:block absolute left-[23px] top-0 bottom-0 w-px"
                        style={{ background: "rgba(15,140,122,0.2)" }}
                    />

                    {/* ── KMC Hospital ── */}
                    <div className="reveal relative flex gap-6 md:gap-8 mb-8">
                        {/* Timeline dot */}
                        <div className="hidden md:flex flex-col items-center flex-shrink-0">
                            <div
                                className="w-[14px] h-[14px] rounded-full border-[3px] flex-shrink-0 z-10"
                                style={{ borderColor: "#0f8c7a", background: "#fff" }}
                            />
                        </div>

                        {/* Card */}
                        <div
                            className="flex-1 bg-white rounded-2xl p-6 sm:p-7 transition-all hover:-translate-y-0.5"
                            style={{
                                border: "1px solid rgba(7,25,46,0.08)",
                                boxShadow: "0 4px 24px rgba(7,25,46,0.06)",
                            }}
                        >
                            {/* Header */}
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                <div>
                                    <h3 className="font-display text-[20px] text-navy font-bold leading-tight">
                                        Resident Doctor
                                    </h3>
                                    <div className="text-[13px] text-navy/55 mt-1">KMC Hospital, Mangalore</div>
                                </div>
                                <span
                                    className="text-[11px] font-bold rounded-md px-3 py-1.5 leading-none flex-shrink-0"
                                    style={{
                                        background: "rgba(15,140,122,0.1)",
                                        color: "#0f8c7a",
                                    }}
                                >
                                    Nov 2012 – Apr 2025
                                </span>
                            </div>

                            {/* Collapsible KRAs */}
                            <Collapsible
                                title="Key Result Areas"
                                defaultOpen={false}
                                icon={
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <path d="M9 11l3 3L22 4" />
                                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                                    </svg>
                                }
                            >
                                <ul className="flex flex-col gap-2.5">
                                    {kmcHighlights.map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-[12.5px] text-navy/65 leading-[1.65]">
                                            <span
                                                className="w-1.5 h-1.5 rounded-full mt-[6px] flex-shrink-0"
                                                style={{ background: "#0f8c7a" }}
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Collapsible>
                        </div>
                    </div>

                    {/* ── NITK ── */}
                    <div className="reveal relative flex gap-6 md:gap-8 mb-8">
                        <div className="hidden md:flex flex-col items-center flex-shrink-0">
                            <div
                                className="w-[14px] h-[14px] rounded-full border-[3px] flex-shrink-0 z-10"
                                style={{ borderColor: "#e8956d", background: "#fff" }}
                            />
                        </div>
                        <div
                            className="flex-1 bg-white rounded-2xl p-6 sm:p-7 transition-all hover:-translate-y-0.5"
                            style={{
                                border: "1px solid rgba(7,25,46,0.08)",
                                boxShadow: "0 4px 24px rgba(7,25,46,0.06)",
                            }}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-display text-[20px] text-navy font-bold leading-tight">
                                        Medical Officer (Evening)
                                    </h3>
                                    <div className="text-[13px] text-navy/55 mt-1">Health Care Center, National Institute of Technology Karnataka</div>
                                </div>
                                <span
                                    className="text-[11px] font-bold rounded-md px-3 py-1.5 leading-none flex-shrink-0"
                                    style={{
                                        background: "rgba(232,149,109,0.12)",
                                        color: "#d4845a",
                                    }}
                                >
                                    2014 – 2025
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Other Assignments ── */}
                    <div className="reveal relative flex gap-6 md:gap-8">
                        <div className="hidden md:flex flex-col items-center flex-shrink-0">
                            <div
                                className="w-[14px] h-[14px] rounded-full border-[3px] flex-shrink-0 z-10"
                                style={{ borderColor: "#2980b9", background: "#fff" }}
                            />
                        </div>
                        <div
                            className="flex-1 bg-white rounded-2xl p-6 sm:p-7 transition-all hover:-translate-y-0.5"
                            style={{
                                border: "1px solid rgba(7,25,46,0.08)",
                                boxShadow: "0 4px 24px rgba(7,25,46,0.06)",
                            }}
                        >
                            <Collapsible
                                title="Other Assignments & Visiting Roles"
                                accent="#2980b9"
                                defaultOpen={false}
                                icon={
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" />
                                        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                                    </svg>
                                }
                            >
                                <div className="grid gap-2.5">
                                    {otherAssignments.map(({ role, place, period }) => (
                                        <div
                                            key={`${role}-${place}`}
                                            className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/60"
                                            style={{ background: "rgba(7,25,46,0.02)" }}
                                        >
                                            <span
                                                className="w-1.5 h-1.5 rounded-full mt-[6px] flex-shrink-0"
                                                style={{ background: "#2980b9" }}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-[12.5px] font-semibold text-navy leading-tight">{role}</div>
                                                <div className="text-[11.5px] text-navy/45 mt-0.5">{place}</div>
                                            </div>
                                            {period && (
                                                <span className="text-[10px] font-medium text-navy/35 flex-shrink-0 mt-0.5">
                                                    {period}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Collapsible>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
