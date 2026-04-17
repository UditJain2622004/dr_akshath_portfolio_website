export default function Navbar() {
    return (
        <nav className="anim-nav absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-[60px] py-7">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 no-underline">
                <div className="w-10 h-10 rounded-lg bg-white/10 border border-navy/20 flex items-center justify-center font-display text-[19px] text-navy backdrop-blur-sm">
                    A
                </div>
                <div className="flex flex-col">
                    <strong className="text-[14px] font-semibold text-navy tracking-tight">Dr. Arjun Mehta</strong>
                    <span className="text-[10px] text-navy/50 tracking-[0.12em] uppercase">Cardiologist</span>
                </div>
            </a>

            {/* Links */}
            <div className="flex items-center gap-2 bg-white/10 border border-navy/20 rounded-full px-2 py-1.5 backdrop-blur-md">
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
                <a href="#" className="text-[13px] px-[17px] py-[7px] rounded-full text-navy/75 hover:text-navy hover:bg-white/20 transition-all no-underline">
                    Contact
                </a>
            </div>

            {/* Right */}
            <button className="bg-white text-navy border-0 px-5 py-2.5 rounded-full font-sans text-[13px] font-semibold cursor-pointer tracking-tight transition-all hover:-translate-y-px hover:bg-white/90 shadow-sm">
                → Patient Login
            </button>
        </nav>
    );
}