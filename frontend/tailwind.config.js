/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                navy: {
                    DEFAULT: "#07192e",
                    50: "rgba(7,25,46,0.5)",
                    80: "rgba(7,25,46,0.8)",
                    900: "#040e1a",
                },
                teal: {
                    DEFAULT: "#0f8c7a",
                    light: "#1bbfa8",
                    hero: "#c6f4ee",
                    glow: "rgba(27,191,168,0.18)",
                },
                mint: "#d6f3ee",
            },
            fontFamily: {
                display: ['"DM Serif Display"', "serif"],
                sans: ["Outfit", "system-ui", "sans-serif"],
            },
            animation: {
                fadeDown: "fadeDown 0.8s ease both",
                fadeUp: "fadeUp 0.7s ease both",
                fadeLeft: "fadeLeft 0.8s ease both",
                slowZoom: "slowZoom 18s ease-out both",
                pulse2: "pulse2 2s infinite",
                bounce2: "bounce2 2s infinite",
                ticker: "tickerScroll 25s linear infinite",
            },
            keyframes: {
                fadeDown: {
                    from: { opacity: 0, transform: "translateY(-20px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                },
                fadeUp: {
                    from: { opacity: 0, transform: "translateY(24px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                },
                fadeLeft: {
                    from: { opacity: 0, transform: "translateX(24px)" },
                    to: { opacity: 1, transform: "translateX(0)" },
                },
                slowZoom: {
                    from: { transform: "scale(1.08)" },
                    to: { transform: "scale(1.02)" },
                },
                pulse2: {
                    "0%,100%": { opacity: 1, transform: "scale(1)" },
                    "50%": { opacity: 0.6, transform: "scale(0.85)" },
                },
                bounce2: {
                    "0%,100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(5px)" },
                },
                tickerScroll: {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-50%)" },
                },
            },
            boxShadow: {
                teal: "0 8px 28px rgba(15,140,122,0.4)",
                "teal-lg": "0 12px 36px rgba(27,191,168,0.5)",
                card: "0 2px 12px rgba(7,25,46,0.06)",
                "card-lg": "0 12px 48px rgba(7,25,46,0.1)",
            },
        },
    },
    plugins: [],
};