import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Booking from "./components/Booking";
import Testimonials from "./components/Testimonials";
import Footer from "./components/Footer";

export default function App() {
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
      <Services />
      <Booking />
      <Testimonials />
      <Footer />
    </div>
  );
}