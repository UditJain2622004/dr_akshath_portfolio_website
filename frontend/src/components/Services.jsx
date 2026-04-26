import { useReveal } from "../hooks/useReveal";

const services = [
    {
        id: "angioplasty",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
        title: "Coronary Angioplasty",
        subtitle: "& Stenting",
        desc: "Minimally invasive procedures to open blocked coronary arteries, restore blood flow, and significantly reduce risk of heart attack.",
        tags: ["Balloon Angioplasty", "Drug-Eluting Stents"],
        accent: "#0f8c7a",
    },
    {
        id: "heartfailure",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
        ),
        title: "Heart Failure",
        subtitle: "Management",
        desc: "Evidence-based, personalised care plans for acute and chronic heart failure — optimising medication, lifestyle modifications and monitoring.",
        tags: ["Echocardiography", "Device Therapy"],
        accent: "#c0392b",
    },
    {
        id: "preventive",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "Preventive",
        subtitle: "Cardiology",
        desc: "Comprehensive cardiovascular risk assessment and lifestyle intervention programmes to prevent heart disease before it starts.",
        tags: ["Lipid Management", "Risk Stratification"],
        accent: "#2980b9",
    },
    // {
    //     id: "structural",
    //     icon: (
    //         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    //             <circle cx="12" cy="12" r="10" />
    //             <path d="M8 12h8M12 8v8" />
    //         </svg>
    //     ),
    //     title: "Structural Heart",
    //     subtitle: "Interventions",
    //     desc: "Advanced transcatheter procedures for valve disease, atrial septal defects, and other structural cardiac conditions without open surgery.",
    //     tags: ["TAVR / TAVI", "MitraClip", "ASD Closure"],
    //     accent: "#8e44ad",
    // },
    // {
    //     id: "electrophysiology",
    //     icon: (
    //         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    //             <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    //         </svg>
    //     ),
    //     title: "Cardiac",
    //     subtitle: "Electrophysiology",
    //     desc: "Diagnosis and treatment of heart rhythm disorders including atrial fibrillation, ventricular tachycardia, and pacemaker implantation.",
    //     tags: ["Ablation Therapy", "Pacemakers", "ICD Implant"],
    //     accent: "#d89f16",
    // },
    // {
    //     id: "imaging",
    //     icon: (
    //         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    //             <rect x="3" y="3" width="18" height="18" rx="3" />
    //             <circle cx="9" cy="10" r="2.5" />
    //             <path d="M14 10h4M14 14h4M9 14h.01" />
    //         </svg>
    //     ),
    //     title: "Advanced Cardiac",
    //     subtitle: "Imaging",
    //     desc: "State-of-the-art echocardiography, cardiac CT, and MRI for precise diagnosis and treatment planning of complex cardiac conditions.",
    //     tags: ["2D / 3D Echo", "Cardiac CT", "Cardiac MRI"],
    //     accent: "#0f8c7a",
    // },
];

/* Dot cluster illustration */
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

/* Subtle ECG line */
function EcgStrip() {
    return (
        <svg viewBox="0 0 800 50" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 50, opacity: 0.06 }} aria-hidden="true">
            <polyline
                points="0,25 100,25 120,25 140,5 160,45 180,10 200,38 230,38 300,38 330,5 360,45 390,38 800,38"
                stroke="#0f8c7a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
            />
        </svg>
    );
}

/* Individual service card */
function ServiceCard({ service, index }) {
    const { id, icon, title, subtitle, desc, tags, accent } = service;
    return (
        <div
            key={id}
            className="reveal group relative bg-white rounded-2xl p-7 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1.5 cursor-default"
            style={{
                border: "1px solid rgba(7,25,46,0.08)",
                boxShadow: "0 2px 16px rgba(7,25,46,0.05)",
                transitionDelay: `${index * 0.05}s`,
            }}
        >
            {/* Hover left border accent */}
            <div
                className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: accent }}
            />

            {/* Icon box */}
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                style={{
                    background: `${accent}14`,
                    color: accent,
                }}
            >
                <div className="w-6 h-6">{icon}</div>
            </div>

            {/* Title */}
            <div>
                <h3 className="font-display text-[20px] text-navy font-bold leading-tight">
                    {title}
                </h3>
                <span
                    className="text-[13px] font-medium italic"
                    style={{ color: accent, fontFamily: "DM Serif Display, serif", opacity: 0.9 }}
                >
                    {subtitle}
                </span>
            </div>

            {/* Description */}
            <p className="text-[13.5px] text-navy/55 leading-[1.75] font-light flex-1">
                {desc}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                    <span
                        key={t}
                        className="text-[11px] font-medium rounded-full px-2.5 py-1 leading-none"
                        style={{
                            background: `${accent}10`,
                            color: accent,
                            border: `1px solid ${accent}22`,
                        }}
                    >
                        {t}
                    </span>
                ))}
            </div>

            {/* Learn more */}
            <div className="flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                <span className="text-[12px] font-semibold" style={{ color: accent }}>Learn more</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
}

export default function Services() {
    const ref = useReveal();

    return (
        <section id="services" className="relative overflow-hidden py-16 sm:py-20 lg:py-[110px]" style={{ background: "#f4f9f8" }}>

            {/* ── Background decorations ── */}
            <div className="absolute top-0 left-0 right-0 pointer-events-none">
                <EcgStrip />
            </div>
            <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ transform: "scaleX(-1)" }}>
                <EcgStrip />
            </div>
            <div className="absolute top-20 right-16 pointer-events-none opacity-70">
                <Dots rows={5} cols={6} gap={13} color="rgba(15,140,122,0.18)" />
            </div>
            <div className="absolute bottom-24 left-14 pointer-events-none opacity-70">
                <Dots rows={4} cols={5} gap={13} color="rgba(7,25,46,0.07)" />
            </div>
            {/* Glow accent */}
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: 500,
                    height: 500,
                    background: "radial-gradient(circle, rgba(15,140,122,0.07) 0%, transparent 65%)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                }}
            />

            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[60px]">
                {/* ── Header ── */}
                <div className="reveal flex flex-col items-center text-center mb-[64px]" ref={ref}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                        <span
                            className="text-[11px] font-semibold tracking-[0.18em] uppercase"
                            style={{ color: "#0f8c7a" }}
                        >
                            What I Offer
                        </span>
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                    </div>

                    <h2 className="font-display text-[clamp(32px,4vw,50px)] text-navy leading-[1.1] font-bold mb-5">
                        Clinical{" "}
                        <em className="italic" style={{ color: "#0f8c7a" }}>
                            Services
                        </em>
                    </h2>

                    <p className="text-[15px] font-light text-navy/55 leading-[1.8] max-w-[520px]">
                        From advanced interventional procedures to preventive programmes —
                        every service is designed around your long-term cardiac health.
                    </p>
                </div>

                {/* ── Cards grid ── */}
                <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {services.map((svc, i) => (
                        <ServiceCard key={svc.id} service={svc} index={i} />
                    ))}
                </div>

                {/* ── Bottom CTA strip ── */}
                <div
                    className="reveal mt-10 sm:mt-12 lg:mt-14 rounded-2xl px-6 sm:px-10 py-7 sm:py-8 flex items-center justify-between gap-6 flex-wrap"
                    style={{
                        background: "linear-gradient(135deg, #07192e 0%, #0a2540 100%)",
                        boxShadow: "0 20px 60px rgba(7,25,46,0.2)",
                    }}
                >
                    <div>
                        <p className="text-[11px] font-semibold tracking-[0.15em] uppercase mb-1" style={{ color: "#1bbfa8" }}>
                            Ready to take the next step?
                        </p>
                        <h3 className="font-display text-[22px] text-white font-bold leading-snug">
                            Schedule a Consultation with Dr. Akshath
                        </h3>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            className="font-sans text-[13px] font-semibold text-white cursor-pointer transition-all hover:-translate-y-0.5"
                            style={{
                                background: "#0f8c7a",
                                border: "none",
                                padding: "13px 28px",
                                borderRadius: "100px",
                                boxShadow: "0 6px 20px rgba(15,140,122,0.4)",
                            }}
                            onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                            type="button"
                        >
                            Book Appointment
                        </button>
                        <button
                            className="font-sans text-[13px] font-medium text-white/80 cursor-pointer transition-all hover:text-white"
                            style={{
                                background: "rgba(255,255,255,0.08)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                padding: "12px 24px",
                                borderRadius: "100px",
                            }}
                        >
                            Call Clinic
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}