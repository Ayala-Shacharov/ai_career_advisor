import { useEffect, useRef } from "react";

const COLORS = ["#7c3aed","#06b6d4","#f59e0b","#ec4899","#22c55e","#c4b5fd","#38bdf8"];
const TOTAL = 80;
const DURATION = 2800;

export default function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const pieces = Array.from({ length: TOTAL }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 80,
      w: 6 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: 2.5 + Math.random() * 3,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.18,
      drift: (Math.random() - 0.5) * 1.2,
      opacity: 1,
    }));

    const start = performance.now();
    let raf;

    const draw = (now) => {
      const elapsed = now - start;
      const fade = Math.max(0, 1 - (elapsed - DURATION * 0.6) / (DURATION * 0.4));
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pieces.forEach(p => {
        p.y     += p.speed;
        p.x     += p.drift;
        p.angle += p.spin;
        ctx.save();
        ctx.globalAlpha = fade * p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < DURATION) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 20,
        borderRadius: "inherit",
      }}
    />
  );
}
