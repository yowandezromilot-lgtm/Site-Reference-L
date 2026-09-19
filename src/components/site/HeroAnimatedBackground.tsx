import { useEffect, useRef, useState } from "react";

/**
 * HeroAnimatedBackground
 *
 * Arrière-plan animé immersif pour la page d'accueil (Hero section) :
 * - Orbes lumineux dorés organiques en lévitation continue (floating aura)
 * - Canvas de micro-particules / poussières d'or interactives réagissant au curseur
 * - Lignes de perspective et courbes topographiques de route animées (thématique voyage & prestige dans le Nord)
 * - Halo interactif suivant la souris
 */
export function HeroAnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; isInside: boolean }>({
    x: -9999,
    y: -9999,
    isInside: false,
  });

  // Gestion du curseur pour le spotlight interactif
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isInside: true,
      });
    };

    const handleMouseLeave = () => {
      setMousePos((prev) => ({ ...prev, isInside: false }));
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Animation Canvas des particules d'or
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const updateDimensions = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width;
      height = canvas.height = rect.height;
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    // Initialisation des particules dorées
    const particleCount = Math.min(Math.floor(window.innerWidth / 30), 55);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * (width || 1200),
      y: Math.random() * (height || 700),
      size: Math.random() * 2.2 + 0.8,
      speedY: -(Math.random() * 0.45 + 0.15),
      speedX: (Math.random() - 0.5) * 0.35,
      wobbleSpeed: Math.random() * 0.02 + 0.01,
      wobbleAmp: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.55 + 0.2,
      baseAlpha: Math.random() * 0.5 + 0.25,
      hue: Math.random() > 0.3 ? "201, 169, 97" : "235, 195, 115", // Nuances or et ambre chaud
    }));

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(frame * p.wobbleSpeed + idx) * 0.3;

        // Interaction avec la souris si présente dans le Hero
        if (mousePos.isInside) {
          const dx = p.x - mousePos.x;
          const dy = p.y - mousePos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 140;

          if (dist < maxDist && dist > 0) {
            const force = (1 - dist / maxDist) * 1.8;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Recyclage lorsqu'une particule sort par le haut
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        // Scintillement doux
        const pulsingAlpha = p.baseAlpha + Math.sin(frame * 0.03 + idx) * 0.15;
        const clampedAlpha = Math.max(0.1, Math.min(0.85, pulsingAlpha));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue}, ${clampedAlpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(201, 169, 97, 0.6)";
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", updateDimensions);
      cancelAnimationFrame(animId);
    };
  }, [mousePos]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* ── 1. Orbes d'aura dorée en lévitation continue ── */}
      <div className="absolute -top-24 -left-20 w-[550px] sm:w-[700px] h-[550px] sm:h-[700px] rounded-full bg-primary/18 blur-[130px] sm:blur-[160px] anim-float-1" />
      <div className="absolute top-1/4 -right-28 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] rounded-full bg-amber-600/12 blur-[140px] sm:blur-[170px] anim-float-2" />
      <div className="absolute -bottom-36 left-1/3 w-[600px] h-[450px] rounded-full bg-primary/14 blur-[140px] anim-float-3" />

      {/* ── 2. Halo interactif doux suivant le curseur ── */}
      {mousePos.isInside && (
        <div
          className="absolute w-[600px] h-[600px] rounded-full blur-[110px] pointer-events-none transition-opacity duration-300 opacity-80"
          style={{
            left: mousePos.x - 300,
            top: mousePos.y - 300,
            background:
              "radial-gradient(circle, rgba(201, 169, 97, 0.16) 0%, rgba(201, 169, 97, 0.04) 50%, transparent 70%)",
          }}
        />
      )}

      {/* ── 3. Lignes de route & navigation stylisées (Prestige & Voyage dans le Nord) ── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.09] transition-opacity"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="gold-line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9A961" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#E6C987" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#C9A961" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="gold-center-flare" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#C9A961" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#C9A961" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Lignes courbes élégantes rappelant les routes côtières et la Baie de Diego */}
        <path
          d="M-100,500 C300,350 600,650 1100,420 C1300,320 1500,380 1600,360"
          fill="none"
          stroke="url(#gold-line-grad)"
          strokeWidth="1.5"
          className="anim-dash-flow"
        />
        <path
          d="M-80,560 C320,410 620,710 1120,480 C1320,380 1520,440 1620,420"
          fill="none"
          stroke="url(#gold-line-grad)"
          strokeWidth="1"
          opacity="0.6"
          className="anim-dash-flow"
          style={{ animationDuration: "35s" }}
        />
        <path
          d="M-50,200 C400,100 800,300 1500,120"
          fill="none"
          stroke="url(#gold-line-grad)"
          strokeWidth="1"
          opacity="0.4"
          className="anim-dash-flow"
          style={{ animationDuration: "40s" }}
        />

        {/* Trame de grille discrète en perspective */}
        <g stroke="#C9A961" strokeWidth="0.5" opacity="0.35">
          <line x1="0" y1="750" x2="1440" y2="750" />
          <line x1="0" y1="820" x2="1440" y2="820" />
          <line x1="200" y1="900" x2="400" y2="650" />
          <line x1="720" y1="900" x2="720" y2="650" />
          <line x1="1240" y1="900" x2="1040" y2="650" />
        </g>

        {/* Halo central */}
        <circle cx="720" cy="280" r="500" fill="url(#gold-center-flare)" />
      </svg>

      {/* ── 4. Canvas interactif de micro-poussières d'or ── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
