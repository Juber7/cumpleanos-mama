import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const COLORS = ["#ffffff", "#e7f1ff", "#b9d4ff", "#7eb0ea", "#d6e6ff", "#4f86cf"];

export default function Fireworks({ active }) {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduce(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!active || reduce) return undefined;

    const canvas = document.createElement("canvas");
    canvas.className = "fireworks";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    const context = canvas.getContext("2d");
    const bursts = [];
    let frame = 0;
    let last = 0;
    let wait = 0;
    let visible = !document.hidden;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.clientWidth * ratio);
      canvas.height = Math.floor(canvas.clientHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const spawn = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const x = width * (0.18 + Math.random() * 0.64);
      const y = height * (0.08 + Math.random() * 0.32);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const count = 42 + Math.floor(Math.random() * 16);
      const particles = [];
      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + Math.random() * 0.2;
        const speed = 1.4 + Math.random() * 2.8;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.008 + Math.random() * 0.008,
          size: 1.8 + Math.random() * 2.2,
          color,
        });
      }
      bursts.push(particles);
      if (bursts.length > 4) bursts.shift();
    };

    const draw = (time) => {
      frame = requestAnimationFrame(draw);
      if (!visible) return;
      const delta = Math.min(32, time - last || 16);
      last = time;
      wait += delta;
      if (wait > 820) {
        wait = 0;
        spawn();
      }

      context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      bursts.forEach((particles) => {
        particles.forEach((particle) => {
          if (particle.life <= 0) return;
          particle.vy += 0.016 * (delta / 16);
          particle.x += particle.vx * (delta / 16);
          particle.y += particle.vy * (delta / 16);
          particle.vx *= 0.992;
          particle.life -= particle.decay * (delta / 16);
          if (particle.life <= 0) return;
          context.globalAlpha = Math.max(particle.life, 0);
          context.fillStyle = particle.color;
          context.beginPath();
          context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          context.fill();
        });
      });
      context.globalAlpha = 1;
    };

    const onResize = () => resize();
    const onHide = () => {
      visible = !document.hidden;
    };

    resize();
    requestAnimationFrame(() => {
      resize();
      spawn();
    });
    window.setTimeout(spawn, 280);
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onHide);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onHide);
      canvas.remove();
    };
  }, [active, reduce]);

  return reduce && active
    ? createPortal(<div className="fireworks-still" aria-hidden="true" />, document.body)
    : null;
}
