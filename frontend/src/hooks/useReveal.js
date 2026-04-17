import { useEffect, useRef } from "react";

export function useReveal() {
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        // Reveal the element and all .reveal children inside it
                        e.target.querySelectorAll(".reveal").forEach((el) => {
                            el.classList.add("visible");
                        });
                        // Also add visible to the element itself if it has .reveal
                        e.target.classList.add("visible");
                        observer.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.08 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return ref;
}