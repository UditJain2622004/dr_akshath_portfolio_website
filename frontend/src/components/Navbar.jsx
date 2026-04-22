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
        <nav className="anim-nav absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-[60px] py-5 sm:py-6 lg:py-7">
            {/* Logo */}
            <button type="button" onClick={() => scrollTo("")} className="flex items-center gap-3 no-underline text-left">
                <div className="w-10 h-10 rounded-lg bg-white/10 border border-navy/20 flex items-center justify-center font-display text-[19px] text-navy backdrop-blur-sm">
                    A
                </div>
                <div className="flex flex-col">
                    <strong className="text-[14px] font-semibold text-navy tracking-tight">Dr. Akshath Ramesh Acharya</strong>
                    <span className="text-[10px] text-navy/50 tracking-[0.12em] uppercase">MBBS · Cardiac Critical Care</span>
                </div>
            </button>

            {/* Links */}
            <div className="hidden md:flex items-center gap-2 bg-white/10 border border-navy/20 rounded-full px-2 py-1.5 backdrop-blur-md">
                {["Home", "About", "Services"].map((l, i) => (
                    <a key={l} href={`#${l === "Home" ? "" : l.toLowerCase()}`}
                        className={`text-[13px] px-[17px] py-[7px] rounded-full transition-all no-underline font-medium ${i === 0
                            ? "bg-white text-navy font-medium"
                            : "text-navy/75 hover:text-navy hover:bg-white/20"
                            }`}>
                        {l}
                    </a>
                ))}
                <a href="#booking"
                    className="text-[13px] px-[17px] py-[7px] rounded-full bg-teal text-white font-medium transition-all hover:bg-teal-light no-underline">
                    ● Book Now
                </a>
                <a href="#contact" className="text-[13px] px-[17px] py-[7px] rounded-full text-navy/75 hover:text-navy hover:bg-white/20 transition-all no-underline">
                    Contact
                </a>
            </div>

            {/* Mobile menu button */}
            <button
                type="button"
                className="md:hidden bg-white/40 border border-navy/15 backdrop-blur-md text-navy rounded-full px-4 py-2.5 text-[13px] font-semibold transition hover:bg-white/60"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-nav"
            >
                Menu
            </button>

            {/* Mobile menu */}
            {open && (
                <div
                    id="mobile-nav"
                    className="md:hidden absolute top-[74px] left-4 right-4 sm:left-6 sm:right-6 rounded-2xl bg-white/90 backdrop-blur-xl border border-navy/10 shadow-[0_18px_55px_rgba(7,25,46,0.14)] p-3"
                    role="dialog"
                    aria-label="Navigation"
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
                            className="w-full text-left px-4 py-3 rounded-xl text-[14px] font-semibold text-navy/80 hover:bg-navy/5 transition"
                            onClick={() => scrollTo(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

        </nav>
    );
}