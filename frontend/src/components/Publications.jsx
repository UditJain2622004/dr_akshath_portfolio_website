import { useReveal } from "../hooks/useReveal";

const publications = [
    {
        title: "Improvement in care and maintenance of Port-A-Cath following the introduction of care bundle",
        source: "PubMed",
        href: "https://pubmed.ncbi.nlm.nih.gov/36530803/",
    },
    {
        title: "Improvement in care and maintenance of Port-A-Cath following the introduction of care bundle",
        source: "Europe PMC",
        href: "https://europepmc.org/article/med/36530803",
    },
    {
        title: "Researcher profile publication page",
        source: "Researcher",
        href: "https://researcher.manipal.edu/en/publications/improvement-in-care-and-maintenance-of-port-a-cath-following-the-",
    },
];

function LinkIcon() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
            <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
        </svg>
    );
}

export default function Publications() {
    const ref = useReveal();

    return (
        <section id="publications" className="relative overflow-hidden" style={{ background: "#f4f9f8" }}>
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[60px] py-16 sm:py-20 lg:py-[110px]">
                <div className="reveal flex flex-col items-center text-center mb-14" ref={ref}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                        <span className="text-[11px] font-semibold tracking-[0.18em] uppercase" style={{ color: "#0f8c7a" }}>
                            Publications
                        </span>
                        <div className="w-8 h-px" style={{ background: "#0f8c7a" }} />
                    </div>
                    <h2 className="font-display text-[clamp(30px,4vw,48px)] text-navy leading-[1.1] font-bold">
                        Selected{" "}
                        <em className="italic" style={{ color: "#0f8c7a" }}>
                            Work
                        </em>
                    </h2>
                    <p className="text-[15px] font-light text-navy/55 leading-[1.85] mt-4 max-w-[720px]">
                        A few links to published work and indexed records.
                    </p>
                </div>

                <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {publications.map((p) => (
                        <a
                            key={p.href}
                            href={p.href}
                            target="_blank"
                            rel="noreferrer"
                            className="reveal group bg-white rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5 no-underline"
                            style={{
                                border: "1px solid rgba(7,25,46,0.08)",
                                boxShadow: "0 2px 18px rgba(7,25,46,0.06)",
                            }}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "rgba(7,25,46,0.45)" }}>
                                    {p.source}
                                </span>
                                <span className="text-teal opacity-80 group-hover:opacity-100 transition-opacity">
                                    <LinkIcon />
                                </span>
                            </div>
                            <div className="text-[15px] font-semibold text-navy leading-[1.5] mt-3">
                                {p.title}
                            </div>
                            <div className="text-[12px] text-navy/45 mt-3">
                                Open link →
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

