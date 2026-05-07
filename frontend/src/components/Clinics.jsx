import { useReveal } from "../hooks/useReveal";

const clinics = [
    {
        id: "vijay-polyclinic",
        name: "Vijay Polyclinic & Diagnostic Centre",
        address: "1st Abish Business Centre, Above Vijay Medicals, Surathkal, 575014",
        timings: [
            { label: "Morning", time: "7:00 AM to 9:00 AM" },
            { label: "Evening", time: "6:00 PM to 8:00 PM" },
        ],
        notes: ["Availability only based on appointments"],
        accent: "#0f8c7a",
    },
    {
        id: "ishaanvi-polyclinic",
        name: "Ishaanvi Polyclinic & Diagnostic Centre",
        address: "Near Kana bus stand, MRPL Road, opposite Kana Masjid, Surathkal, 575014",
        timings: [
            { label: "Morning", time: "7:00 AM to 9:00 AM" },
            { label: "Evening", time: "6:00 PM to 10:00 PM" },
        ],
        notes: ["Availability only based on appointments"],
        accent: "#e8956d",
    },
    {
        id: "nexus-enliven",
        name: "NEXUS ENLIVEN HEALTH CENTRE",
        address: "Door No.4-57/A, VIJAYA MAHAL, Surathkal, Iddya, Mangaluru Taluk, Dakshina Kannada District, Karnataka- 575014",
        timings: [
            { label: "Morning", time: "8:00 AM to 9:00 AM" },
            { label: "Evening", time: "6:00 PM to 10:00 PM" },
        ],
        notes: ["Availability only based on appointments"],
        accent: "#2980b9",
    },
    {
        id: "bodycraft",
        name: "BODYCRAFT Clinic",
        address: "Sai Arya, D.No: 1-15/5(2) & 1-15/5(3), Pumpwell circle, opposite Ganesh Medicals, Mangaluru, Karnataka- 575002",
        timings: [],
        notes: ["Aesthetic medicine/cosmetology procedures", "Only on appointments"],
        accent: "#8e44ad",
    },
];

function PinIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0 1 18 0Z" />
            <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6l4 2" />
        </svg>
    );
}

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

function ClinicCard({ clinic, index }) {
    const { id, name, address, timings, notes, accent } = clinic;
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

            {/* Header */}
            <div className="flex items-start gap-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${accent}14`, color: accent }}
                >
                    <div className="w-6 h-6">
                        <PinIcon />
                    </div>
                </div>
                <div className="min-w-0">
                    <h3 className="font-display text-[20px] text-navy font-bold leading-tight">
                        {name}
                    </h3>
                    <div className="text-[12.5px] text-navy/55 leading-[1.6] mt-1">
                        {address}
                    </div>
                </div>
            </div>

            {/* Timings */}
            {timings.length > 0 && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: accent }}>
                        <span className="w-4 h-4" style={{ color: accent }}><ClockIcon /></span>
                        Timings
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {timings.map((t) => (
                            <span
                                key={`${id}-${t.label}`}
                                className="text-[11px] font-medium rounded-full px-2.5 py-1 leading-none"
                                style={{
                                    background: `${accent}10`,
                                    color: accent,
                                    border: `1px solid ${accent}22`,
                                }}
                            >
                                {t.label}: {t.time}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes */}
            <div className="flex flex-wrap gap-1.5 mt-1">
                {notes.map((n) => (
                    <span
                        key={`${id}-${n}`}
                        className="text-[11px] font-medium rounded-full px-2.5 py-1 leading-none"
                        style={{
                            background: "rgba(7,25,46,0.04)",
                            color: "rgba(7,25,46,0.65)",
                            border: "1px solid rgba(7,25,46,0.08)",
                        }}
                    >
                        {n}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function Clinics() {
    const ref = useReveal();

    return (
        <section id="clinics" className="relative overflow-hidden py-16 sm:py-20 lg:py-[110px]" style={{ background: "#f4f9f8" }}>
            {/* Background decorations (same vibe as Services) */}
            <div className="absolute top-20 right-16 pointer-events-none opacity-70">
                <Dots rows={5} cols={6} gap={13} color="rgba(15,140,122,0.18)" />
            </div>
            <div className="absolute bottom-24 left-14 pointer-events-none opacity-70">
                <Dots rows={4} cols={5} gap={13} color="rgba(7,25,46,0.07)" />
            </div>
            <div
                className="absolute pointer-events-none rounded-full"
                style={{
                    width: 520,
                    height: 520,
                    background: "radial-gradient(circle, rgba(15,140,122,0.07) 0%, transparent 65%)",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                }}
            />

            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[60px]">
                <div className="reveal flex flex-col items-center text-center mb-[64px]" ref={ref}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#0f8c7a" }}>
                            Clinics
                        </span>
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                    </div>

                    <h2 className="font-display text-[clamp(32px,4vw,50px)] text-navy leading-[1.1] font-bold mb-5">
                        Where I’m{" "}
                        <em className="italic" style={{ color: "#0f8c7a" }}>
                            Available
                        </em>
                    </h2>

                    <p className="text-[15px] font-light text-navy/55 leading-[1.8] max-w-[720px]">
                        Availability is <strong className="font-semibold text-navy">appointment-based</strong>. Please book an appointment before visiting.
                    </p>
                </div>

                <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                    {clinics.map((c, i) => (
                        <ClinicCard key={c.id} clinic={c} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

