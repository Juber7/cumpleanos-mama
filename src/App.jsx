import { useEffect, useState } from "react";
import chapters from "./chapters.js";
import Fireworks from "./Fireworks.jsx";
import { BackgroundMusic, PlayCue } from "./Music.jsx";

export default function App() {
  const [night, setNight] = useState(false);
  const [finale, setFinale] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = document.querySelectorAll(".reveal");
    if (reduce || !("IntersectionObserver" in window)) {
      nodes.forEach((node) => node.classList.add("is-in"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -4% 0px" }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const wish = document.getElementById("deseos");
    if (!wish) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.62;
        setNight(visible);
        setFinale(visible);
      },
      { threshold: [0.62, 0.85] }
    );

    observer.observe(wish);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("is-night", night);
    const theme = document.querySelector('meta[name="theme-color"]');
    if (theme) theme.setAttribute("content", night ? "#071422" : "#f4f8fc");
  }, [night]);

  return (
    <BackgroundMusic>
      <header className="hero">
        <div className="hero-inner">
          <p className="kicker">Para mamá</p>
          <h1>El amor de una madre al pasar del tiempo se ve así…</h1>
        </div>
        <div className="hero-play">
          <PlayCue />
        </div>
      </header>

      <main id="historia" className="chapters">
        {chapters.map((chapter, index) => (
          <article className="chapter" key={chapter.id} aria-labelledby={chapter.id}>
            <figure className="frame reveal">
              <img
                src={chapter.src}
                alt={chapter.alt}
                width={chapter.width}
                height={chapter.height}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "auto"}
              />
            </figure>
            <h2 className="reveal" id={chapter.id}>
              {chapter.text}
            </h2>
          </article>
        ))}
      </main>

      <section className="farewell" id="cierre">
        <p className="letter reveal">Te amo, mamá, gracias por el esfuerzo que haces por nosotros.</p>
      </section>

      <footer className="finale" id="deseos">
        <div className="sky" aria-hidden="true" />
        <p className="wish reveal">
          <span>Feliz</span>
          <span>cumpleaños</span>
        </p>
      </footer>
      <Fireworks active={finale} />
    </BackgroundMusic>
  );
}
