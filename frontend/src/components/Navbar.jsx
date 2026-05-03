import { useState } from "react";

export default function Navbar() {
    const [open, setOpen] = useState(false);

    const close = () => setOpen(false);
    const scrollTo = (id) => {
        close();
        if (!id) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <nav className="anim-nav absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-[80px] py-5 sm:py-6 lg:py-6">
            {/* Logo */}
            <button type="button" onClick={() => scrollTo("")} className="flex items-center gap-3 no-underline text-left">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-navy/20 flex items-center justify-center font-display text-[22px] text-navy backdrop-blur-sm">
                    A
                </div>
                <div className="flex flex-col">
                    <strong className="text-[15.5px] font-semibold text-navy tracking-tight">Dr. Akshath Ramesh Acharya</strong>
                    <span className="text-[11px] text-navy/50 tracking-[0.12em] uppercase">MBBS · Cardiac Critical Care</span>
                </div>
            </button>

            {/* Centered glassy nav pill — desktop */}
            <div
                className="hidden md:flex items-center gap-1.5 rounded-full px-2 py-1.5 absolute left-1/2 -translate-x-1/2"
                style={{
                    background: "rgba(255,255,255,0.45)",
                    backdropFilter: "blur(16px) saturate(180%)",
                    WebkitBackdropFilter: "blur(16px) saturate(180%)",
                    border: "1px solid rgba(255,255,255,0.55)",
                    boxShadow: "0 4px 24px rgba(7,25,46,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
                }}
            >
                {["Home", "About", "Services"].map((l) => (
                    <button key={l} type="button"
                        onClick={() => scrollTo(l === "Home" ? "" : l.toLowerCase())}
                        className="text-[14px] px-[19px] py-[8px] rounded-full transition-all no-underline font-medium text-navy/70 hover:text-navy hover:bg-white/30">
                        {l}
                    </button>
                ))}
                <button type="button" onClick={() => scrollTo("booking")}
                    className="text-[14px] px-[19px] py-[8px] rounded-full bg-teal text-white font-medium transition-all hover:bg-teal-light no-underline shadow-sm">
                    ● Book Now
                </button>
                <button type="button" onClick={() => scrollTo("contact")} 
                    className="text-[14px] px-[19px] py-[8px] rounded-full text-navy/70 hover:text-navy hover:bg-white/30 transition-all no-underline font-medium">
                    Contact
                </button>
                <div className="w-[1px] h-4 bg-navy/10 mx-1" />
                <a href="/admin" className="text-[12px] px-3 py-2 rounded-full text-navy/40 hover:text-navy transition-all no-underline font-semibold uppercase tracking-wider">
                    Portal
                </a>
            </div>

            {/* Hamburger button — mobile */}
            <button
                type="button"
                className="md:hidden w-11 h-11 rounded-xl flex items-center justify-center transition hover:bg-white/50"
                style={{
                    background: "rgba(255,255,255,0.45)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    boxShadow: "0 2px 12px rgba(7,25,46,0.08)",
                }}
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? "Close menu" : "Open menu"}
            >
                <div className="relative w-[18px] h-[14px]">
                    <span
                        className="absolute left-0 w-full h-[2px] rounded-full bg-navy transition-all duration-300"
                        style={{
                            top: open ? "6px" : "0px",
                            transform: open ? "rotate(45deg)" : "rotate(0deg)",
                        }}
                    />
                    <span
                        className="absolute left-0 top-[6px] w-full h-[2px] rounded-full bg-navy transition-all duration-300"
                        style={{
                            opacity: open ? 0 : 1,
                        }}
                    />
                    <span
                        className="absolute left-0 w-full h-[2px] rounded-full bg-navy transition-all duration-300"
                        style={{
                            top: open ? "6px" : "12px",
                            transform: open ? "rotate(-45deg)" : "rotate(0deg)",
                        }}
                    />
                </div>
            </button>

            {/* Mobile menu */}
            {open && (
                <div
                    id="mobile-nav"
                    className="md:hidden absolute top-[74px] left-4 right-4 sm:left-6 sm:right-6 rounded-2xl p-3"
                    role="dialog"
                    aria-label="Navigation"
                    style={{
                        background: "rgba(255,255,255,0.75)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        border: "1px solid rgba(255,255,255,0.5)",
                        boxShadow: "0 18px 55px rgba(7,25,46,0.14), inset 0 1px 0 rgba(255,255,255,0.6)",
                    }}
                >
                    {[
                        { label: "Home", id: "" },
                        { label: "About", id: "about" },
                        { label: "Services", id: "services" },
                        { label: "Book Now", id: "booking" },
                        { label: "Publications", id: "publications" },
                        { label: "Contact", id: "contact" },
                    ].map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            className="w-full text-left px-4 py-3 rounded-xl text-[14px] font-semibold text-navy/80 hover:bg-white/50 transition"
                            onClick={() => scrollTo(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                    <div className="h-px bg-navy/5 my-2 mx-4" />
                    <a
                        href="/admin"
                        className="block w-full text-left px-4 py-3 rounded-xl text-[14px] font-semibold text-navy/80 hover:bg-white/50 transition no-underline"
                    >
                        Admin Portal
                    </a>
                </div>
            )}

        </nav>
    );
}