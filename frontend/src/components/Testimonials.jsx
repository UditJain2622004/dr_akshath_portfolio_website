import { useReveal } from "../hooks/useReveal";

const reviews = [
    {
        id: 1,
        name: "Venkatesh Kumar",
        init: "VK",
        location: "Bengaluru, India",
        age: "58",
        rating: 5,
        platform: "Google",
        text: "Dr. Mehta performed my angioplasty with absolute precision. What amazed me most was how clearly he explained every step beforehand — I was nervous, but he made me feel completely safe. I was back home in three days and feel like a new person.",
        featured: true,
    },
    {
        id: 2,
        name: "Fatima Al-Shaikh",
        init: "FS",
        location: "Dubai, UAE",
        rating: 5,
        platform: "Practo",
        text: "I consulted Dr. Mehta via video from Dubai for a second opinion on my father's heart failure diagnosis. He reviewed all the reports overnight and called us personally the next morning. That level of care is rare anywhere in the world.",
        featured: false,
    },
    {
        id: 3,
        name: "Suresh Nair",
        init: "SN",
        location: "Kochi, India",
        age: "64",
        rating: 5,
        platform: "Google",
        text: "After years of dealing with chronic heart failure, I finally found a doctor who truly listens. Dr. Mehta redesigned my entire treatment plan and within 3 months my ejection fraction had improved significantly. Exceptional physician.",
        featured: false,
    },
    // {
    //     id: 4,
    //     name: "Priya Menon",
    //     init: "PM",
    //     location: "Chennai, India",
    //     age: "45",
    //     rating: 5,
    //     platform: "Practo",
    //     text: "Dr. Mehta caught a structural defect that two other cardiologists had missed. His attention to detail during the echocardiography was thorough and he explained everything with patience. The only cardiologist I'd refer my family to.",
    //     featured: false,
    // },
    // {
    //     id: 5,
    //     name: "Khalid Rahman",
    //     init: "KR",
    //     location: "Abu Dhabi, UAE",
    //     rating: 5,
    //     platform: "Google",
    //     text: "I flew to Bengaluru specifically for Dr. Mehta's consultation. The TAVR procedure went flawlessly and the post-operative follow-up via video has been seamless. For Gulf patients seeking world-class cardiac care, look no further.",
    //     featured: false,
    // },
];

const platforms = [
    {
        name: "Google Reviews",
        rating: "4.9",
        count: "340+",
        icon: (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
        ),
    },
    {
        name: "Practo",
        rating: "4.8",
        count: "180+",
        icon: (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                <rect width="24" height="24" rx="6" fill="#2997D8" />
                <path d="M7 17V7h4.5a3 3 0 010 6H7m0-6h4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
];

const praiseItems = [
    "Outstanding cardiac care", "Life-saving expertise", "Compassionate physician",
    "World-class procedures", "Trusted by thousands", "Exceptional outcomes",
    "Patient-first approach", "Award-winning cardiologist", "Gulf region specialist",
    "Outstanding cardiac care", "Life-saving expertise", "Compassionate physician",
    "World-class procedures", "Trusted by thousands", "Exceptional outcomes",
];

function StarRow({ count = 5 }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: count }).map((_, i) => (
                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f5a623" aria-hidden="true">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
}

function TestimonialCard({ review }) {
    const { name, init, location, age, rating, platform, text } = review;
    return (
        <div
            className="group relative bg-white rounded-2xl p-7 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1.5 h-full"
            style={{
                border: "1px solid rgba(7,25,46,0.07)",
                boxShadow: "0 2px 20px rgba(7,25,46,0.06)",
            }}
        >
            {/* Accent top bar on hover */}
            <div
                className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "#0f8c7a" }}
            />

            {/* Quote mark */}
            <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(15,140,122,0.08)" }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0f8c7a" opacity="0.8" aria-hidden="true">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                </svg>
            </div>

            {/* Review text */}
            <p className="text-[13.5px] font-light text-navy/60 leading-[1.8] flex-1 italic">
                "{text}"
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(7,25,46,0.06)" }}>
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-display text-[13px] font-semibold flex-shrink-0"
                        style={{ background: "rgba(15,140,122,0.1)", color: "#0f8c7a", border: "1.5px solid rgba(15,140,122,0.2)" }}
                    >
                        {init}
                    </div>
                    <div>
                        <div className="text-[13px] font-semibold text-navy leading-none">{name}</div>
                        <div className="text-[11px] text-navy/40 mt-0.5">{age ? `Age ${age} · ` : ""}{location}</div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <StarRow count={rating} />
                    <span className="text-[10px] font-medium" style={{ color: "rgba(7,25,46,0.3)" }}>{platform}</span>
                </div>
            </div>
        </div>
    );
}

export default function Testimonials() {
    const ref = useReveal();
    const featured = reviews.find((r) => r.featured);
    const rest = reviews.filter((r) => !r.featured);

    return (
        <section id="testimonials" className="relative overflow-hidden" style={{ background: "#f4f9f8" }}>

            {/* Dot cluster */}
            <div className="absolute bottom-32 right-16 pointer-events-none opacity-50">
                <svg width={6 * 13} height={5 * 13} viewBox={`0 0 ${6 * 13} ${5 * 13}`} aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, r) =>
                        Array.from({ length: 6 }).map((_, c) => (
                            <circle key={`${r}-${c}`} cx={c * 13 + 6.5} cy={r * 13 + 6.5} r="1.8" fill="rgba(15,140,122,0.22)" />
                        ))
                    )}
                </svg>
            </div>

            <div className="max-w-[1280px] mx-auto px-[60px] pt-[110px] pb-0">

                {/* ── Header ── */}
                <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14" ref={ref}>
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#0f8c7a" }}>
                                Patient Stories
                            </span>
                        </div>
                        <h2 className="font-display text-[clamp(30px,4vw,48px)] text-navy leading-[1.1] font-bold">
                            Trusted by{" "}
                            <em className="not-italic italic" style={{ color: "#0f8c7a" }}>hundreds</em>
                            {" "}of patients
                        </h2>
                    </div>

                    {/* Platform ratings */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {platforms.map(({ name, rating, count, icon }) => (
                            <div
                                key={name}
                                className="flex items-center gap-3 rounded-xl px-4 py-3"
                                style={{ background: "white", border: "1px solid rgba(7,25,46,0.08)", boxShadow: "0 2px 12px rgba(7,25,46,0.06)" }}
                            >
                                {icon}
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-display text-[20px] font-bold text-navy leading-none">{rating}</span>
                                        <span className="text-[#f5a623] text-[12px]">★★★★★</span>
                                    </div>
                                    <div className="text-[10px] text-navy/40 mt-0.5">{count} reviews · {name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Featured + grid ── */}
                <div className="reveal reveal-d1 grid gap-5" style={{ gridTemplateColumns: "1.1fr 1fr 1fr" }}>

                    {/* Featured — tall card */}
                    <div
                        className="row-span-2 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden"
                        style={{
                            background: "linear-gradient(160deg, #07192e 0%, #0a2d45 100%)",
                            boxShadow: "0 20px 60px rgba(7,25,46,0.2)",
                        }}
                    >
                        {/* Glow */}
                        <div
                            className="absolute rounded-full pointer-events-none"
                            style={{
                                width: 260,
                                height: 260,
                                background: "radial-gradient(circle, rgba(15,140,122,0.2) 0%, transparent 70%)",
                                bottom: -60,
                                right: -60,
                            }}
                        />

                        <div>
                            {/* Quote icon */}
                            {/* <div
                                className="w-11 h-11 rounded-xl flex items-center justify-center mb-6"
                                style={{ background: "rgba(27,191,168,0.15)" }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1bbfa8" aria-hidden="true">
                                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                                </svg>
                            </div> */}

                            <p className="text-[13px] font-semibold mb-4" style={{ color: "#1bbfa8" }}>
                                "{featured.highlight}"
                            </p>

                            <p className="text-[16px] font-light text-white/80 leading-[1.9]">
                                {featured.text}
                            </p>
                        </div>

                        <div>
                            <div className="flex gap-0.5 mb-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f5a623" aria-hidden="true">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                ))}
                            </div>
                            <div className="flex items-center gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
                                <div
                                    className="w-11 h-11 rounded-full flex items-center justify-center font-display text-[14px] font-semibold flex-shrink-0"
                                    style={{ background: "rgba(15,140,122,0.2)", color: "#1bbfa8", border: "1.5px solid rgba(27,191,168,0.3)" }}
                                >
                                    {featured.init}
                                </div>
                                <div>
                                    <div className="text-[14px] font-semibold text-white">{featured.name}</div>
                                    <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>Age {featured.age} · {featured.location}</div>
                                </div>
                                <div className="ml-auto text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
                                    {featured.platform}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right grid — 4 cards */}
                    {rest.map((review) => (
                        <TestimonialCard key={review.id} review={review} />
                    ))}
                </div>
            </div>

            {/* ── Praise ticker ── */}
            <div className="mt-16 py-5 overflow-hidden" style={{ borderTop: "1px solid rgba(15,140,122,0.1)", borderBottom: "1px solid rgba(15,140,122,0.1)" }}>
                <div className="ticker-track">
                    {praiseItems.map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-6">
                            <span className="text-[13.5px] text-navy/50 tracking-[0.04em] whitespace-nowrap font-light">{item}</span>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#0f8c7a", opacity: 0.4 }} />
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}