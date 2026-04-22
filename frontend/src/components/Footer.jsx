const socials = [
    {
        title: "LinkedIn",
        href: "#contact",
        icon: (
            <>
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
            </>
        ),
    },
    {
        title: "Instagram",
        href: "#contact",
        icon: (
            <>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </>
        ),
    },
    {
        title: "Twitter / X",
        href: "#contact",
        icon: (
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
        ),
    },
    {
        title: "YouTube",
        href: "#contact",
        icon: (
            <>
                <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
            </>
        ),
    },
];

const contact = [
    {
        icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>,
        text: "Surathkal / Mangalore (by appointment), Karnataka",
        href: "#contact",
    },
    {
        icon: <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 1.2 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />,
        text: "+91 95381 07758",
        href: "tel:+919538107758",
    },
    {
        icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
        text: "akshath_surathkal@yahoo.com",
        href: "mailto:akshath_surathkal@yahoo.com",
    },
    {
        icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
        text: "Mon – Sat · 9:00 AM – 5:00 PM IST",
        href: "#booking",
    },
];

const quickLinks = [
    { label: "Home", href: "#" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Book Appointment", href: "#booking" },
    { label: "Patient Stories", href: "#testimonials" },
    { label: "Publications", href: "#publications" },
    { label: "Contact", href: "#contact" },
];

const specialityLinks = [
    { label: "Interventional Cardiology", href: "#services" },
    { label: "Heart Failure Management", href: "#services" },
    { label: "Preventive Cardiology", href: "#services" },
    { label: "Medical Education", href: "#services" },
    { label: "Teleconsultation (Gulf)", href: "#booking" },
];

const legalLinks = [
    { label: "Privacy Policy", href: "#contact" },
    { label: "Terms of Use", href: "#contact" },
    { label: "Medical Disclaimer", href: "#contact" },
];

export default function Footer() {
    return (
        <footer id="contact" className="bg-[#040e1a] pt-14 sm:pt-16 lg:pt-[72px] relative overflow-hidden">
            {/* Top accent line */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(27,191,168,0.3), transparent)" }}
            />

            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-[60px]">
                <div className="grid pb-12 sm:pb-[60px] border-b border-white/7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
                    {/* Brand */}
                    <div>
                        <a href="#" className="flex items-center gap-3 mb-4 no-underline">
                            <div className="w-11 h-11 rounded-lg bg-teal/15 border border-teal/25 flex items-center justify-center font-display text-[19px] text-white">
                                A
                            </div>
                            <div>
                                <strong className="block text-[16px] font-semibold text-white">Dr. Akshath Ramesh Acharya</strong>
                                <span className="text-[10px] text-white/50 tracking-[0.1em] uppercase">MBBS · Cardiac Critical Care</span>
                            </div>
                        </a>
                        <p className="text-[14px] font-light text-white/40 leading-[1.75] mb-7 max-w-[280px]">
                            Medical consultation, counseling and treatment — with experience across inpatient care, emergency care, and cardiac critical care.
                        </p>
                        <div className="flex gap-2.5">
                            {socials.map(({ title, icon, href }) => (
                                <a
                                    key={title}
                                    href={href}
                                    title={title}
                                    className="w-9 h-9 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center transition-all hover:bg-teal/15 hover:border-teal/30 no-underline"
                                    style={{ background: "rgba(255,255,255,0.06)" }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" className="w-4 h-4">
                                        {icon}
                                    </svg>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <p className="text-[11px] font-semibold text-white tracking-[0.1em] uppercase mb-5">Quick Links</p>
                        <div className="flex flex-col gap-[11px]">
                            {quickLinks.map(({ label, href }) => (
                                <a key={label} href={href} className="text-[14px] font-light text-white/45 no-underline transition-colors hover:text-teal-light">
                                    {label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Specialities */}
                    <div>
                        <p className="text-[11px] font-semibold text-white tracking-[0.1em] uppercase mb-5">Specialities</p>
                        <div className="flex flex-col gap-[11px]">
                            {specialityLinks.map(({ label, href }) => (
                                <a key={label} href={href} className="text-[14px] font-light text-white/45 no-underline transition-colors hover:text-teal-light">
                                    {label}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <p className="text-[11px] font-semibold text-white tracking-[0.1em] uppercase mb-5">Contact</p>
                        <div className="flex flex-col gap-3.5">
                            {contact.map(({ icon, text, href }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    className="flex items-start gap-3 no-underline transition-colors hover:text-white/70"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="#1bbfa8" strokeWidth="2" className="w-3.5 h-3.5 flex-shrink-0 mt-[3px]">
                                        {icon}
                                    </svg>
                                    <span className="text-[13px] text-white/45 font-light leading-[1.5]">{text}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 gap-4 flex-wrap">
                    <p className="text-[12px] text-white/25">
                        © 2026 Dr. Akshath Ramesh Acharya. All rights reserved.&nbsp;·&nbsp;
                        Built with care for <a href="#services" className="text-teal/60 no-underline">cardiac health</a>.
                    </p>
                    <div className="flex gap-6">
                        {legalLinks.map(({ label, href }) => (
                            <a key={label} href={href} className="text-[12px] text-white/25 no-underline transition-colors hover:text-white/50">
                                {label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}