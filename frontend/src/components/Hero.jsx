const tags = [
    { label: "Healthcare", color: "teal" },
    { label: "Research", color: "gold" },
    { label: "Education", color: "blue" },
];

const dotColor = { teal: "#0f8c7a", gold: "#d89f16", blue: "#3b82f6" };

const specs = [
    {
        icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
        label: "Cardiac Surgery",
    },
    {
        icon: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></>,
        label: "Heart Failure",
    },
    {
        icon: <path d="M4.5 9.5V5a2 2 0 012-2h11a2 2 0 012 2v14a2 2 0 01-2 2h-11a2 2 0 01-2-2v-4.5" />,
        label: "Preventive Cardiology",
    },
    {
        icon: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
        label: "Clinical Research",
    },
];

/* Small floating badge */
function Badge({ icon, value, sub, style }) {
    return (
        <div
            className="absolute flex items-center gap-2.5 bg-white rounded-2xl px-4 py-3 shadow-xl border border-gray-100/80 backdrop-blur-sm"
            style={{ zIndex: 10, ...style }}
        >
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(15,140,122,0.12)" }}
            >
                {icon}
            </div>
            <div>
                <div className="text-[15px] font-bold text-navy leading-none">{value}</div>
                <div className="text-[10px] text-navy/50 font-medium mt-0.5">{sub}</div>
            </div>
        </div>
    );
}

/* Medical cross SVG icon */
function CrossIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f8c7a" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 2v20M2 12h20" />
        </svg>
    );
}

/* Heart rate icon */
function HeartRateIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f8c7a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}

/* Award icon */
function AwardIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f8c7a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M8.56 14.19L7 22l5-3 5 3-1.56-7.81" />
        </svg>
    );
}

export default function Hero() {
    return (
        <section
            className="relative w-full min-h-screen flex items-center overflow-hidden"
            style={{ background: "linear-gradient(105deg, #ffffff 0%, #edf9f6 50%, #d6f3ee 100%)" }}
        >
            {/* Dot grid */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(7,25,46,0.07) 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                }}
            />



            {/* ── Main layout ── */}
            <div className="relative z-10 w-full max-w-[1280px] mx-auto px-[60px] pt-[140px] pb-[100px] flex items-center justify-between gap-16">

                {/* ── LEFT: Text content ── */}
                <div className="max-w-[580px] flex-shrink-0">
                    {/* Tags */}
                    <div className="flex gap-2 flex-wrap mb-7 anim-up-1">
                        {tags.map(({ label, color }) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-2 bg-white/60 border border-navy/10 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-navy tracking-[0.05em] uppercase backdrop-blur-sm"
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full anim-pulse"
                                    style={{
                                        background: dotColor[color],
                                        boxShadow: `0 0 6px ${dotColor[color]}66`,
                                    }}
                                />
                                {label}
                            </span>
                        ))}
                    </div>

                    <p className="anim-up-2 text-[11px] font-medium text-navy tracking-[0.15em] uppercase mb-4">
                        Interventional Cardiologist
                    </p>

                    <h1 className="anim-up-3 font-display text-[clamp(44px,5.5vw,72px)] leading-[1.05] text-navy mb-1">
                        <span className="block">Dr. Arjun</span>
                        <em className="block not-italic" style={{ fontStyle: "italic" }}>
                            Mehta
                        </em>
                    </h1>

                    <div className="anim-up-4 inline-flex items-center gap-2.5 my-5">
                        {["MBBS", "MD Cardiology", "FACC"].map((b, i) => (
                            <>
                                {i > 0 && (
                                    <span key={`sep-${i}`} className="text-navy/30 text-lg">·</span>
                                )}
                                <span
                                    key={b}
                                    className="bg-teal-light border border-teal/30 rounded px-3 py-1.5 text-[11px] font-semibold text-white tracking-[0.06em]"
                                >
                                    {b}
                                </span>
                            </>
                        ))}
                    </div>

                    <p className="anim-up-5 text-[15px] font-light text-navy leading-[1.78] max-w-[490px] mb-10">
                        Delivering <strong className="font-bold text-navy">world-class cardiac care</strong> with 14+ years
                        of expertise in interventional procedures, heart failure management,
                        and preventive cardiology across India and the Gulf.
                    </p>

                    <div className="anim-up-6 flex items-center gap-4 flex-wrap">
                        <button className="bg-teal text-white border-0 px-8 py-3.5 rounded-full font-sans text-[13px] font-semibold cursor-pointer tracking-wide transition-all hover:bg-teal-light hover:-translate-y-0.5 shadow-teal">
                            Book Consultation
                        </button>
                        <button className="bg-transparent text-navy border border-navy/40 px-8 py-3.5 rounded-full font-sans text-[13px] font-medium cursor-pointer transition-all hover:border-navy hover:bg-navy/5 hover:-translate-y-0.5">
                            View Publications
                        </button>
                        <div className="flex items-center gap-2 text-navy/55 text-[12px] font-medium">
                            <span
                                className="w-2 h-2 rounded-full anim-pulse"
                                style={{
                                    background: "#4ade80",
                                    boxShadow: "0 0 8px rgba(74,222,128,0.7)",
                                }}
                            />
                            Available today
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Doctor image frame ── */}
                <div className="anim-left relative flex-shrink-0" style={{ width: 420, height: 520 }}>

                    {/* Outer decorative ring */}
                    <div
                        className="absolute rounded-[2rem]"
                        style={{
                            inset: -14,
                            border: "1.5px dashed rgba(15,140,122,0.25)",
                            borderRadius: "2.5rem",
                            animation: "slowSpin 30s linear infinite",
                            zIndex: 0,
                        }}
                    />

                    {/* Mid teal ring */}
                    <div
                        className="absolute rounded-[2rem]"
                        style={{
                            inset: -7,
                            border: "1.5px solid rgba(15,140,122,0.14)",
                            borderRadius: "2.2rem",
                            zIndex: 0,
                        }}
                    />

                    {/* Image card */}
                    <div
                        className="relative w-full h-full overflow-hidden"
                        style={{
                            borderRadius: "2rem",
                            border: "3px solid rgba(255,255,255,0.9)",
                            boxShadow: "0 32px 80px rgba(7,25,46,0.18), 0 0 0 1px rgba(15,140,122,0.1), inset 0 1px 0 rgba(255,255,255,0.8)",
                            background: "#ffffff",
                            zIndex: 1,
                        }}
                    >
                        {/* Doctor photo */}
                        <img
                            src="/download.png"
                            alt="Dr. Arjun Mehta"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                objectPosition: "center top",
                                display: "block",
                            }}
                        />

                        {/* Bottom gradient fade */}
                        <div
                            className="absolute bottom-0 left-0 right-0"
                            style={{
                                height: "30%",
                                background: "linear-gradient(to top, rgba(255,255,255,0.5) 0%, transparent 100%)",
                            }}
                        />

                        {/* Top hospital badge */}
                        <div
                            className="absolute top-4 left-4 flex items-center gap-2 rounded-xl px-3 py-2 backdrop-blur-md"
                            style={{
                                background: "rgba(255,255,255,0.88)",
                                border: "1px solid rgba(15,140,122,0.15)",
                                boxShadow: "0 4px 16px rgba(7,25,46,0.1)",
                            }}
                        >
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: "rgba(15,140,122,0.12)" }}
                            >
                                <CrossIcon />
                            </div>
                            <div>
                                <div className="text-[11px] font-bold text-navy leading-none">Apollo Hospitals</div>
                                <div className="text-[9px] text-navy/50 mt-0.5">Senior Consultant</div>
                            </div>
                        </div>
                    </div>

                    {/* Floating badge — Experience */}
                    <Badge
                        icon={<AwardIcon />}
                        value="14+"
                        sub="Years Experience"
                        style={{ bottom: 80, left: -60 }}
                    />

                    {/* Floating badge — Surgeries */}
                    <Badge
                        icon={<HeartRateIcon />}
                        value="1.4K"
                        sub="Surgeries Done"
                        style={{ top: 100, right: -60 }}
                    />

                    {/* Decorative corner dots */}
                    <div
                        className="absolute"
                        style={{
                            bottom: -30,
                            right: -20,
                            width: 90,
                            height: 90,
                            backgroundImage: "radial-gradient(circle, rgba(15,140,122,0.35) 1.5px, transparent 1.5px)",
                            backgroundSize: "12px 12px",
                        }}
                    />
                    <div
                        className="absolute"
                        style={{
                            top: -30,
                            left: -20,
                            width: 70,
                            height: 70,
                            backgroundImage: "radial-gradient(circle, rgba(15,140,122,0.25) 1.5px, transparent 1.5px)",
                            backgroundSize: "12px 12px",
                        }}
                    />

                    {/* Small teal accent circle */}
                    <div
                        className="absolute rounded-full anim-pulse"
                        style={{
                            width: 14,
                            height: 14,
                            background: "#0f8c7a",
                            boxShadow: "0 0 0 4px rgba(15,140,122,0.2)",
                            bottom: 50,
                            right: -30,
                            zIndex: 5,
                        }}
                    />
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: 10,
                            height: 10,
                            background: "#d89f16",
                            boxShadow: "0 0 0 3px rgba(216,159,22,0.2)",
                            top: 60,
                            left: -20,
                            zIndex: 5,
                        }}
                    />
                </div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="anim-bottom absolute bottom-0 left-0 right-0 z-10 px-[60px] pb-10 flex items-end justify-between">
                <div className="flex gap-2 flex-wrap">
                    {specs.map(({ icon, label }) => (
                        <div
                            key={label}
                            className="flex items-center gap-1.5 rounded-full px-4 py-[7px] text-[12px] text-navy/80 backdrop-blur-sm cursor-default transition-all hover:bg-white/30"
                            style={{ background: "rgba(255,255,255,0.35)", border: "1px solid rgba(7,25,46,0.12)" }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 opacity-60">
                                {icon}
                            </svg>
                            {label}
                        </div>
                    ))}
                </div>

                <div
                    className="flex flex-col items-center gap-1.5 text-navy/50 text-[10px] tracking-[0.12em] uppercase cursor-pointer"
                    onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
                >
                    <div className="anim-bounce w-7 h-7 border border-navy/20 rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>
                    Scroll
                </div>
            </div>

            <style>{`
                @keyframes slowSpin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </section>
    );
}