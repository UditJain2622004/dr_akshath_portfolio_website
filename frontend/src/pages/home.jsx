import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Experience from "../components/Experience";
import Services from "../components/Services";
import Clinics from "../components/Clinics";
import Booking from "../components/Booking";
import Publications from "../components/Publications";
import Testimonials from "../components/Testimonials";
import Footer from "../components/Footer";

export default function Home() {
  // Global reveal observer for standalone .reveal elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="font-sans">
      <Navbar />
      <Hero />
      <About />
      <Experience />
      <Services />
      <Clinics />
      <Booking />
      <Publications />
      {/* <Testimonials /> */}
      <Footer />
    </div>
  );
}
