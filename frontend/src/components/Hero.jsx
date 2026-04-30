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
            {/* Mobile layout (matches requested phone design) */}
            <div className="relative z-10 w-full max-w-[680px] mx-auto px-4 pt-24 pb-10 flex flex-col items-center text-center lg:hidden">
                {/* Image card area with decorative elements */}
                <div className="relative w-full max-w-[300px] sm:max-w-[340px] mx-auto mb-10">
                    {/* Decorative rings (mobile version) */}
                    {/* <div
                        className="absolute rounded-[2.5rem]"
                        style={{
                            inset: -12,
                            border: "1.5px dashed rgba(15,140,122,0.25)",
                            animation: "slowSpin 30s linear infinite",
                            zIndex: 0,
                        }}
                    /> */}
                    <div
                        className="absolute rounded-[2.2rem]"
                        style={{
                            inset: -6,
                            border: "1.5px solid rgba(15,140,122,0.14)",
                            zIndex: 0,
                        }}
                    />

                    {/* Soft backdrop block */}
                    {/* <div
                        className="absolute inset-0 rounded-[34px]"
                        style={{
                            background: "linear-gradient(135deg, rgba(15,140,122,0.12) 0%, rgba(7,25,46,0.06) 100%)",
                            transform: "translateY(16px)",
                        }}
                    /> */}

                    {/* Main image container */}
                    <div
                        className="relative rounded-[34px] overflow-hidden bg-white"
                        style={{
                            border: "3px solid rgba(255,255,255,0.9)",
                            boxShadow: "0 28px 70px rgba(7,25,46,0.18)",
                            zIndex: 1,
                        }}
                    >
                        <img
                            src="/dr.akshath.jpeg"
                            alt="Dr. Akshath Ramesh Acharya"
                            className="w-full h-[270px] xs:h-[310px] sm:h-[340px] object-cover object-top"
                        />

                        {/* Hospital badge (mobile) */}
                        {/* <div
                            className="absolute top-3 left-3 flex items-center gap-1.5 rounded-lg px-2 py-1.5 backdrop-blur-md"
                            style={{
                                background: "rgba(255,255,255,0.88)",
                                border: "1px solid rgba(15,140,122,0.15)",
                                boxShadow: "0 4px 12px rgba(7,25,46,0.08)",
                            }}
                        >
                            <div
                                className="w-5 h-5 rounded flex items-center justify-center"
                                style={{ background: "rgba(15,140,122,0.12)" }}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f8c7a" strokeWidth="2.5" strokeLinecap="round">
                                    <path d="M12 2v20M2 12h20" />
                                </svg>
                            </div>
                            <div className="text-[10px] font-bold text-navy leading-none">KMC Hospital</div>
                        </div> */}
                    </div>

                    {/* Floating badges (mobile) */}
                    {/* <div className="z-10">
                        <Badge
                            icon={<AwardIcon />}
                            value="13+"
                            sub="Years"
                            style={{ bottom: -10, left: -25, scale: "0.85", transformOrigin: "bottom left" }}
                        />
                        <Badge
                            icon={<HeartRateIcon />}
                            value="1.4K"
                            sub="Surgeries"
                            style={{ top: 20, right: -30, scale: "0.85", transformOrigin: "top right" }}
                        />
                    </div> */}

                    {/* Decorative corner dots (mobile) */}
                    <div
                        className="absolute -bottom-6 -right-4 w-16 h-16 opacity-40"
                        style={{
                            backgroundImage: "radial-gradient(circle, rgba(15,140,122,0.35) 1.5px, transparent 1.5px)",
                            backgroundSize: "10px 10px",
                        }}
                    />
                    <div
                        className="absolute -top-6 -left-4 w-12 h-12 opacity-30"
                        style={{
                            backgroundImage: "radial-gradient(circle, rgba(15,140,122,0.25) 1.5px, transparent 1.5px)",
                            backgroundSize: "10px 10px",
                        }}
                    />

                    {/* Accent circles (mobile) */}
                    <div
                        className="absolute rounded-full anim-pulse"
                        style={{
                            width: 10,
                            height: 10,
                            background: "#0f8c7a",
                            boxShadow: "0 0 0 3px rgba(15,140,122,0.2)",
                            bottom: 40,
                            left: -20,
                            zIndex: 5,
                        }}
                    />
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: 8,
                            height: 8,
                            background: "#d89f16",
                            boxShadow: "0 0 0 2px rgba(216,159,22,0.2)",
                            top: 60,
                            right: -15,
                            zIndex: 5,
                        }}
                    />
                </div>

                {/* Text area */}
                <div className="mt-0">
                    {/* Tags (mobile) */}
                    <div className="flex gap-2 justify-center flex-wrap mb-5">
                        {tags.map(({ label, color }) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-1.5 bg-white/60 border border-navy/10 rounded-full px-3 py-1 text-[10px] font-semibold text-navy tracking-[0.03em] uppercase backdrop-blur-sm"
                            >
                                <span
                                    className="w-1 h-1 rounded-full anim-pulse"
                                    style={{
                                        background: dotColor[color],
                                        boxShadow: `0 0 4px ${dotColor[color]}66`,
                                    }}
                                />
                                {label}
                            </span>
                        ))}
                    </div>

                    {/* <div className="text-[12px] tracking-[0.18em] uppercase text-navy/55 font-semibold">
                        Resident Doctor · MBBS
                    </div> */}
                    <div className="mt-3 font-display text-[24px] leading-[1.08] text-navy font-bold">
                        DR. AKSHATH RAMESH ACHARYA
                    </div>
                    <div className="mt-2 text-[11px] text-navy/55">
                        {["MBBS", "FICCC", "FECHO", "FECMO"].join(" · ")}
                    </div>
                    <p className="mt-4 text-[13px] leading-[1.7] text-navy/60 font-light max-w-[520px] mx-auto">
                        Dedicated clinician passionate about heart health and specialized care. Committed to prevention, diagnosis,
                        and evidence-based management for better outcomes.
                    </p>

                    <div className="mt-6 flex flex-col sm:flex-row items-stretch justify-center gap-3">
                        <button
                            type="button"
                            className="bg-teal text-white border-0 px-6 py-2.5 rounded-full text-[13px] font-semibold transition hover:bg-teal-light shadow-teal"
                            onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                        >
                            Book Appointment →
                        </button>
                        <button
                            type="button"
                            className="bg-white text-navy border border-navy/25 px-6 py-2.5 rounded-full text-[13px] font-semibold transition hover:bg-navy/5"
                            onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop / large layout */}
            <div className="relative z-10 hidden lg:flex w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[80px] pt-28 sm:pt-32 lg:pt-[150px] pb-14 sm:pb-20 lg:pb-[110px] items-center justify-between gap-12 lg:gap-20">

                {/* ── LEFT: Text content ── */}
                <div className="max-w-[640px] w-full flex-shrink-0">
                    {/* Tags */}
                    <div className="flex gap-2 flex-wrap mb-7 anim-up-1">
                        {tags.map(({ label, color }) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-2 bg-white/60 border border-navy/10 rounded-full px-4 py-2 text-[12px] font-semibold text-navy tracking-[0.05em] uppercase backdrop-blur-sm"
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

                    {/* <p className="anim-up-2 text-[12px] font-semibold text-navy tracking-[0.15em] uppercase mb-4">
                        Resident Doctor · MBBS
                    </p> */}

                    <h1 className="anim-up-3 font-display text-[clamp(48px,6vw,80px)] leading-[1.05] text-navy mb-1">
                        <span className="block">Dr. Akshath</span>
                        <em className="block not-italic" style={{ fontStyle: "italic" }}>
                            Ramesh Acharya
                        </em>
                    </h1>

                    <div className="anim-up-4 inline-flex items-center gap-2.5 my-5">
                        {["MBBS", "FICCC", "FECHO", "FECMO"].map((b, i) => (
                            <>
                                {i > 0 && (
                                    <span key={`sep-${i}`} className="text-navy/30 text-lg">·</span>
                                )}
                                <span
                                    key={b}
                                    className="bg-teal-light border border-teal/30 rounded px-3.5 py-2 text-[12px] font-semibold text-white tracking-[0.06em]"
                                >
                                    {b}
                                </span>
                            </>
                        ))}
                    </div>

                    <p className="anim-up-5 text-[16.5px] font-light text-navy leading-[1.78] max-w-[520px] mb-10">
                        An enthusiastic and high-energy <strong className="font-bold text-navy">MBBS doctor</strong> with 13+
                        years of experience in medical consultation, counseling, treatment, and clinical practice — with a focus on
                        cardiac critical care, ECHO, and ECMO.
                    </p>

                    <div className="anim-up-6 flex items-center gap-4 flex-wrap">
                        <button
                            className="bg-teal text-white border-0 px-8 py-3.5 rounded-full font-sans text-[13px] font-semibold cursor-pointer tracking-wide transition-all hover:bg-teal-light hover:-translate-y-0.5 shadow-teal"
                            onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                            type="button"
                        >
                            Book Consultation
                        </button>
                        <button
                            className="bg-transparent text-navy border border-navy/40 px-8 py-3.5 rounded-full font-sans text-[13px] font-medium cursor-pointer transition-all hover:border-navy hover:bg-navy/5 hover:-translate-y-0.5"
                            onClick={() => document.getElementById("publications")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                            type="button"
                        >
                            View Publications
                        </button>
                        <div className="flex items-center gap-2.5 text-navy/55 text-[13px] font-medium">
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
                <div className="anim-left relative flex-shrink-0 w-full max-w-[460px] mx-auto lg:mx-0" style={{ height: "clamp(400px, 60vw, 560px)" }}>

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
                        className="relative w-full overflow-hidden"
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
                            src="/dr.akshath.jpeg"
                            alt="Dr. Akshath Ramesh Acharya"
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
                                <div className="text-[11px] font-bold text-navy leading-none">KMC Hospital</div>
                                <div className="text-[9px] text-navy/50 mt-0.5">Resident Doctor</div>
                            </div>
                        </div>
                    </div>

                    {/* Floating badge — Experience */}
                    <div className="hidden lg:block">
                        <Badge
                            icon={<AwardIcon />}
                            value="13+"
                            sub="Years Experience"
                            style={{ bottom: 90, left: -70 }}
                        />
                    </div>

                    {/* Floating badge — Surgeries */}
                    <div className="hidden lg:block">
                        <Badge
                            icon={<HeartRateIcon />}
                            value="1.4K"
                            sub="Surgeries Done"
                            style={{ top: 110, right: -70 }}
                        />
                    </div>

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
            <div className="anim-bottom hidden lg:flex absolute bottom-0 left-0 right-0 z-10 px-4 sm:px-6 lg:px-[80px] pb-10 items-end justify-between">
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