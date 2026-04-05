import { useEffect, useRef } from "react";

const COLORS = ["#ff6b9d","#69d2e7","#f7b731","#a29bfe","#fd79a8","#55efc4","#fdcb6e","#74b9ff"];

interface Props {
  active: boolean;
  flickPulse: number;
}

export function LEDLights({ active, flickPulse }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const beamsRef = useRef<HTMLDivElement[]>([]);
  const dotsRef  = useRef<HTMLDivElement[]>([]);
  const ballRef  = useRef<HTMLDivElement>(null);
  const strobeRef = useRef<HTMLDivElement>(null);
  const builtRef  = useRef(false);
  const beatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build beams + dots once on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el || builtRef.current) return;
    builtRef.current = true;

    // Beams
    for (let i = 0; i < 12; i++) {
      const b = document.createElement("div");
      const c = COLORS[i % COLORS.length];
      const dur  = 2.4 + (i % 3) * 0.5;
      const delay = (i * 0.25) % 3;
      const dir  = i % 2 === 0 ? "alternate" : "alternate-reverse";
      b.style.cssText = `
        position:absolute; top:-10%; width:4px; height:115%;
        border-radius:2px; transform-origin:top center;
        left:${4 + (i / 11) * 92}%;
        background:linear-gradient(to bottom,${c}bb,${c}44,transparent);
        box-shadow:0 0 10px ${c};
        opacity:0.45; filter:blur(2px);
        animation:beamSweep ${dur}s ease-in-out ${delay}s infinite ${dir};
        pointer-events:none;
      `;
      el.appendChild(b);
      beamsRef.current.push(b);
    }

    // Disco dots
    for (let i = 0; i < 18; i++) {
      const d = document.createElement("div");
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      const tx = ((Math.random() - 0.5) * 28).toFixed(1);
      const ty = ((Math.random() - 0.5) * 28).toFixed(1);
      const ts = (0.6 + Math.random() * 0.8).toFixed(2);
      const dur  = (1.2 + Math.random() * 2).toFixed(2);
      const delay = (Math.random() * 2).toFixed(2);
      d.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        width:${5 + Math.random() * 7}px; height:${5 + Math.random() * 7}px;
        top:${5 + Math.random() * 85}%; left:${5 + Math.random() * 85}%;
        background:${c}; box-shadow:0 0 12px ${c};
        opacity:0.5;
        animation:dotFloat ${dur}s ease-in-out ${delay}s infinite alternate;
        --tx:${tx}px; --ty:${ty}px; --ts:${ts};
      `;
      el.appendChild(d);
      dotsRef.current.push(d);
    }
  }, []);

  // Toggle visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.opacity = active ? "1" : "0";
    el.style.pointerEvents = "none";

    const ball = ballRef.current;
    if (ball) ball.style.opacity = active ? "1" : "0";
  }, [active]);

  // Update beam colors on every flick beat
  useEffect(() => {
    if (!active) return;
    beamsRef.current.forEach((b, i) => {
      const c = COLORS[(i + Math.floor(Date.now() / 450)) % COLORS.length];
      b.style.background = `linear-gradient(to bottom,${c}bb,${c}44,transparent)`;
      b.style.boxShadow  = `0 0 10px ${c}`;
    });

    // Occasional strobe flash
    const s = strobeRef.current;
    if (s && Math.random() < 0.4) {
      s.classList.remove("strobe-flash");
      void (s as HTMLElement).offsetWidth;
      s.classList.add("strobe-flash");
    }
  }, [flickPulse, active]);

  // Slow beat color cycle
  useEffect(() => {
    if (!active) return;
    beatTimerRef.current = setInterval(() => {
      beamsRef.current.forEach((b, i) => {
        const c = COLORS[(i + Math.floor(Date.now() / 450)) % COLORS.length];
        b.style.background = `linear-gradient(to bottom,${c}bb,${c}44,transparent)`;
        b.style.boxShadow  = `0 0 10px ${c}`;
      });
    }, 900);
    return () => { if (beatTimerRef.current) clearInterval(beatTimerRef.current); };
  }, [active]);

  return (
    <>
      <style>{`
        @keyframes beamSweep {
          0%   { transform:rotate(-30deg); opacity:0.3; }
          50%  { opacity:0.6; }
          100% { transform:rotate(30deg);  opacity:0.3; }
        }
        @keyframes dotFloat {
          0%   { transform:translate(0,0) scale(1); }
          100% { transform:translate(var(--tx),var(--ty)) scale(var(--ts)); }
        }
        @keyframes spinBall { to { transform:translateX(-50%) rotate(360deg); } }
        @keyframes strobeFlash { 0%,100%{opacity:0} 50%{opacity:0.45} }
        .strobe-flash { animation:strobeFlash 0.12s steps(1) forwards; }
      `}</style>

      {/* Disco ball */}
      <div ref={ballRef} style={{
        position:"absolute", top:14, left:"50%",
        width:50, height:50,
        background:"radial-gradient(circle at 35% 35%,#fff 4%,#e8e8e8 18%,#bbb 45%,#777 80%,#333)",
        borderRadius:"50%",
        boxShadow:"0 0 20px rgba(0,0,0,0.18),inset 0 0 8px rgba(255,255,255,0.4)",
        animation:"spinBall 4s linear infinite",
        opacity:0, transition:"opacity 1s ease",
        zIndex:25, pointerEvents:"none",
      }} />

      {/* LED beams + dots layer */}
      <div ref={containerRef} style={{
        position:"absolute", inset:0, overflow:"hidden",
        opacity:0, transition:"opacity 1.2s ease",
        mixBlendMode:"screen", zIndex:15,
      }}>
        {/* Strobe */}
        <div ref={strobeRef} style={{
          position:"absolute", inset:0,
          background:"white", opacity:0,
          mixBlendMode:"screen", pointerEvents:"none",
        }} />
      </div>
    </>
  );
}
