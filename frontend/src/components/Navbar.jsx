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

  const navItems = [
    { label: "Home", id: "" },
    { label: "About", id: "about" },
    { label: "Experience", id: "experience" },
    { label: "Services", id: "services" },
    { label: "Clinics", id: "clinics" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <nav className="anim-nav absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-[80px] py-5 sm:py-6 lg:py-6">
      {/* Brand / Logo */}
      <button
        type="button"
        onClick={() => scrollTo("")}
        className="group flex items-center gap-3.5 no-underline text-left transition-transform duration-200 hover:scale-[1.01]"
      >
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center font-display text-[20px] text-white shadow-md transition-all duration-300 group-hover:shadow-teal/20"
          style={{
            background: "linear-gradient(135deg, #07192e 0%, #0f8c7a 100%)",
            boxShadow: "0 4px 14px rgba(7, 25, 46, 0.15)",
          }}
        >
          A
        </div>
        <div className="flex flex-col">
          <strong className="text-[16px] font-bold text-navy tracking-tight group-hover:text-teal transition-colors">
            Dr. Akshath Ramesh Acharya
          </strong>
        </div>
      </button>

      {/* Centered glassy nav pill — desktop */}
      <div
        className="hidden md:flex items-center gap-1 rounded-full px-2.5 py-1.5 absolute left-1/2 -translate-x-1/2"
        style={{
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(20px) saturate(190%)",
          WebkitBackdropFilter: "blur(20px) saturate(190%)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 8px 32px rgba(7, 25, 46, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
        }}
      >
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => scrollTo(item.id)}
            className="text-[13.5px] px-[16px] py-[7px] rounded-full transition-all duration-200 no-underline font-medium text-navy/70 hover:text-navy hover:bg-white/60"
          >
            {item.label}
          </button>
        ))}

        {/* Book Now primary CTA */}
        <button
          type="button"
          onClick={() => scrollTo("booking")}
          className="group relative text-[13.5px] px-[20px] py-[7.5px] rounded-full text-white font-semibold transition-all duration-300 no-underline shadow-md hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] mx-1 flex items-center gap-2 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0f8c7a 0%, #15ab95 100%)",
            boxShadow: "0 4px 16px rgba(15, 140, 122, 0.3)",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
          <span>Book Now</span>
        </button>

        <button
          type="button"
          onClick={() => scrollTo("contact")}
          className="text-[13.5px] px-[16px] py-[7px] rounded-full text-navy/70 hover:text-navy hover:bg-white/60 transition-all duration-200 no-underline font-medium"
        >
          Contact
        </button>
        <div className="w-[1px] h-4 bg-navy/15 mx-1" />
        <a
          href="/admin"
          className="text-[12px] px-3 py-1.5 rounded-full text-navy/50 hover:text-teal transition-all duration-200 no-underline font-semibold uppercase tracking-wider"
        >
          Portal
        </a>
      </div>

      {/* Hamburger button — mobile */}
      <button
        type="button"
        className="md:hidden w-11 h-11 rounded-2xl flex items-center justify-center transition active:scale-95"
        style={{
          background: "rgba(255, 255, 255, 0.65)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 4px 14px rgba(7, 25, 46, 0.06)",
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

      {/* Mobile drawer */}
      {open && (
        <div
          id="mobile-nav"
          className="md:hidden absolute top-[76px] left-4 right-4 sm:left-6 sm:right-6 rounded-3xl p-3 flex flex-col gap-1 z-50"
          role="dialog"
          aria-label="Navigation"
          style={{
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(24px) saturate(190%)",
            WebkitBackdropFilter: "blur(24px) saturate(190%)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 20px 60px rgba(7, 25, 46, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className="w-full text-left px-4 py-3 rounded-2xl text-[14px] font-semibold text-navy/80 hover:bg-teal/10 hover:text-teal transition"
              onClick={() => scrollTo(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            className="w-full text-center mt-2 px-4 py-3.5 rounded-2xl text-[14px] font-semibold text-white shadow-lg flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #0f8c7a 0%, #15ab95 100%)",
              boxShadow: "0 8px 24px rgba(15, 140, 122, 0.3)",
            }}
            onClick={() => scrollTo("booking")}
          >
            <span className="w-2 h-2 rounded-full bg-white/90 animate-pulse" />
            <span>Book Now</span>
          </button>
          <div className="h-px bg-navy/10 my-1 mx-3" />
          <a
            href="/admin"
            className="block w-full text-left px-4 py-2.5 rounded-2xl text-[14px] font-semibold text-navy/60 hover:text-teal hover:bg-teal/10 transition no-underline"
          >
            Portal
          </a>
        </div>
      )}
    </nav>
  );
}