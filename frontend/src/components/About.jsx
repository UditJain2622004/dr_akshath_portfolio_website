import { useReveal } from "../hooks/useReveal";

const specializations = [
    { icon: "🫀", label: "Cardiac Critical Care" },
    { icon: "📈", label: "Echocardiography (ECHO)" },
    { icon: "🫁", label: "ECMO Support" },
    // { icon: "📋", label: "Clinical Research" },
];

const credentials = [
    { year: "2011", title: "MBBS", place: "A.J. Institute of Medical Sciences, Mangalore" },
    { year: "2012–2025", title: "Resident Doctor", place: "KMC Hospital, Mangalore" },
    { year: "2014–Present", title: "Medical Officer (Evening)", place: "Health Care Center, NITK Karnataka" },
];

/* Light ECG wave illustration */
function EcgLine({ opacity = 0.07 }) {
    return (
        <svg
            viewBox="0 0 600 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "auto", opacity }}
            aria-hidden="true"
        >
            <polyline
                points="0,40 60,40 80,40 95,10 110,70 125,20 140,55 160,55 220,55 240,10 260,70 280,55 600,55"
                stroke="#0f8c7a"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/* Medical cross illustration */
function CrossIllustration({ size = 32, color = "rgba(15,140,122,0.12)" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <rect x="12" y="2" width="8" height="28" rx="2" fill={color} />
            <rect x="2" y="12" width="28" height="8" rx="2" fill={color} />
        </svg>
    );
}

/* Dot cluster */
function DotCluster({ rows = 5, cols = 6, gap = 12, color = "rgba(15,140,122,0.25)" }) {
    return (
        <svg
            width={cols * gap}
            height={rows * gap}
            viewBox={`0 0 ${cols * gap} ${rows * gap}`}
            aria-hidden="true"
        >
            {Array.from({ length: rows }).map((_, r) =>
                Array.from({ length: cols }).map((_, c) => (
                    <circle
                        key={`${r}-${c}`}
                        cx={c * gap + gap / 2}
                        cy={r * gap + gap / 2}
                        r="1.8"
                        fill={color}
                    />
                ))
            )}
        </svg>
    );
}

export default function About() {
    const ref = useReveal();

    return (
        <section id="about" className="relative bg-white py-16 sm:py-20 lg:py-[110px] overflow-hidden">

            {/* ── Background decorations ── */}
            {/* ECG wave top */}
            <div className="absolute top-10 left-0 right-0 pointer-events-none">
                <EcgLine opacity={0.06} />
            </div>

            {/* Large cross illustration — top right */}
            <div className="absolute top-16 right-16 pointer-events-none opacity-40">
                <CrossIllustration2 />
            </div>

            {/* Dot cluster — bottom left */}
            <div className="absolute bottom-20 left-12 pointer-events-none">
                <DotCluster rows={6} cols={7} gap={14} color="rgba(15,140,122,0.18)" />
            </div>

            {/* Dot cluster — top right of content */}
            <div className="absolute top-24 right-[38%] pointer-events-none">
                <DotCluster rows={4} cols={5} gap={12} color="rgba(7,25,46,0.07)" />
            </div>

            {/* Subtle teal circle accent */}
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: 320,
                    height: 320,
                    background: "radial-gradient(circle, rgba(15,140,122,0.06) 0%, transparent 70%)",
                    bottom: -80,
                    right: "10%",
                }}
            />

            {/* ── Main grid ── */}
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[60px] grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-[80px] items-center">

                {/* ── LEFT: Stacked Image Frame ── */}
                <div className="hidden lg:block relative reveal mx-auto lg:mx-0 w-full max-w-[520px]" ref={ref} style={{ paddingBottom: 24, paddingRight: 16 }}>

                    {/* Back block — offset salmon/teal */}
                    {/* <div
                        className="absolute rounded-lg"
                        style={{
                            top: 28,
                            left: -20,
                            right: 20,
                            bottom: -20,
                            background: "linear-gradient(135deg, #e8956d 0%, #d4845a 100%)",
                            borderRadius: "12px",
                            zIndex: 0,
                        }}
                    /> */}

                    {/* Mid block — slightly lighter offset */}
                    <div
                        className="absolute"
                        style={{
                            top: 20,
                            left: -10,
                            right: 40,
                            bottom: 20,
                            background: "#eb915dff",
                            // background: "#edb99a",
                            // borderRadius: "10px",
                            zIndex: 1,
                            opacity: 0.6,
                        }}
                    />

                    {/* Main image card */}
                    <div
                        className="relative w-full overflow-hidden"
                        style={{
                            aspectRatio: "4/5",
                            borderRadius: "10px",
                            border: "3px solid #fff",
                            boxShadow: "0 20px 60px rgba(7,25,46,0.14), 0 4px 20px rgba(7,25,46,0.08)",
                            zIndex: 2,
                            background: "#d6f0ec",
                        }}
                    >
                        <img
                            src="/dr.akshath.jpeg"
                            alt="Dr. Akshath Ramesh Acharya"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = "none"; }}
                        />

                        {/* Experience badge — bottom left */}
                        <div
                            className="absolute bottom-5 left-5 flex items-center gap-3 rounded-xl px-4 py-3"
                            style={{
                                background: "rgba(255,255,255,0.94)",
                                backdropFilter: "blur(12px)",
                                boxShadow: "0 8px 32px rgba(7,25,46,0.12)",
                                border: "1px solid rgba(255,255,255,0.9)",
                            }}
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(15,140,122,0.1)" }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f8c7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[15px] font-bold text-navy leading-none">98%</div>
                                <div className="text-[10px] text-navy/50 font-medium mt-0.5">Success Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* Floating badge — top right corner of image */}
                    <div
                        className="absolute flex flex-col items-center justify-center rounded-2xl"
                        style={{
                            top: -18,
                            right: -4,
                            width: 88,
                            height: 88,
                            background: "#07192e",
                            boxShadow: "0 12px 32px rgba(7,25,46,0.25)",
                            zIndex: 10,
                            borderRadius: "20px",
                        }}
                    >
                        <span className="text-[28px] font-bold text-white leading-none">14</span>
                        <span className="text-teal-light text-[11px] font-semibold mt-0.5 tracking-wide">Years</span>
                        <span className="text-white/40 text-[9px] tracking-wider uppercase">of Care</span>
                    </div>

                    {/* Dot cluster decoration — bottom right */}
                    <div className="absolute" style={{ bottom: -10, right: -8, zIndex: 3 }}>
                        <DotCluster rows={4} cols={4} gap={11} color="rgba(232,149,109,0.45)" />
                    </div>
                </div>

                {/* ── RIGHT: Content ── */}
                <div>
                    {/* Eyebrow */}
                    <div className="reveal reveal-d1 flex items-center gap-3 mb-4">
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-teal">
                            About Dr. Akshath
                        </p>
                    </div>

                    {/* Heading */}
                    <h2 className="reveal reveal-d1 font-display text-[clamp(30px,3.5vw,46px)] text-navy leading-[1.1] font-bold mb-5">
                        Healing Hearts with{" "}
                        <em className="italic" style={{ color: "#0f8c7a" }}>
                            Precision
                        </em>{" "}
                        &amp; Compassion
                    </h2>

                    {/* Bio */}
                    <p className="reveal reveal-d2 text-[15px] font-light text-[#4a6275] leading-[1.85] mb-7" style={{ maxWidth: 500 }}>
                        A certified <strong className="font-semibold text-navy">MBBS doctor</strong> with over{" "}
                        <strong className="font-semibold text-navy">13 years</strong> of experience in medical consultation,
                        counseling, and treatment. Experienced in cardiac critical care with training in ECHO and ECMO, with strong
                        exposure across emergency and inpatient care.
                    </p>

                    {/* Specialization chips */}
                    <div className="reveal reveal-d2 flex flex-wrap gap-2.5 mb-8">
                        {specializations.map(({ icon, label }) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-2 rounded-full text-[12px] font-medium text-navy px-4 py-2 transition-all hover:-translate-y-0.5"
                                style={{
                                    background: "rgba(15,140,122,0.07)",
                                    border: "1px solid rgba(15,140,122,0.2)",
                                }}
                            >
                                <span>{icon}</span>
                                {label}
                            </span>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="reveal reveal-d2 w-full h-px mb-8" style={{ background: "rgba(7,25,46,0.08)" }} />

                    {/* Credentials timeline */}
                    <div className="reveal reveal-d2 flex flex-col gap-4 mb-9">
                        {credentials.map(({ year, title, place }) => (
                            <div key={title} className="flex items-start gap-4">
                                {/* Year pill */}
                                <div
                                    className="flex-shrink-0 text-[11px] font-bold rounded-md px-2.5 py-1.5 leading-none"
                                    style={{
                                        background: "rgba(15,140,122,0.1)",
                                        color: "#0f8c7a",
                                        minWidth: 44,
                                        textAlign: "center",
                                    }}
                                >
                                    {year}
                                </div>
                                <div>
                                    <div className="text-[13.5px] font-semibold text-navy leading-tight">{title}</div>
                                    <div className="text-[12px] text-navy/45 mt-0.5">{place}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats row */}
                    <div className="reveal reveal-d2 grid grid-cols-3 gap-4 mb-9">
                        {[
                            { val: "1.4K+", label: "Surgeries" },
                            { val: "35+", label: "Publications" },
                            { val: "12", label: "Awards" },
                        ].map(({ val, label }) => (
                            <div
                                key={label}
                                className="rounded-xl px-4 py-4 text-center transition-all hover:-translate-y-1"
                                style={{
                                    background: "rgba(7,25,46,0.03)",
                                    border: "1px solid rgba(7,25,46,0.07)",
                                }}
                            >
                                <div className="font-display text-[26px] font-bold text-navy leading-none">{val}</div>
                                <div className="text-[11px] text-navy/45 font-medium mt-1 tracking-wide">{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="reveal reveal-d3 flex items-center gap-4 flex-wrap">
                        <button
                            className="font-sans text-[13.5px] font-semibold text-white cursor-pointer tracking-wide transition-all hover:bg-teal-light hover:-translate-y-0.5"
                            style={{
                                background: "#0f8c7a",
                                border: "none",
                                padding: "14px 32px",
                                borderRadius: "100px",
                                boxShadow: "0 8px 24px rgba(15,140,122,0.3)",
                            }}
                            onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                            type="button"
                        >
                            Book an Appointment
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* Extra decorative cross — top right corner of section */
function CrossIllustration2() {
    return (
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <rect x="26" y="4" width="12" height="56" rx="4" fill="rgba(15,140,122,0.09)" />
            <rect x="4" y="26" width="56" height="12" rx="4" fill="rgba(15,140,122,0.09)" />
        </svg>
    );
}