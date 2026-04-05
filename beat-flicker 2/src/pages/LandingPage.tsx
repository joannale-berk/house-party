interface Props { onStart: () => void }

const DOTS = [
  { top: "8%",  left: "6%",  size: 18, color: "#a29bfe", blur: 18 },
  { top: "5%",  left: "85%", size: 14, color: "#69d2e7", blur: 14 },
  { top: "22%", left: "4%",  size: 8,  color: "#fd79a8", blur: 8  },
  { top: "35%", left: "92%", size: 10, color: "#f7b731", blur: 10 },
  { top: "55%", left: "3%",  size: 7,  color: "#55efc4", blur: 8  },
  { top: "70%", left: "88%", size: 9,  color: "#ff6b9d", blur: 9  },
  { top: "80%", left: "15%", size: 6,  color: "#74b9ff", blur: 7  },
  { top: "88%", left: "75%", size: 8,  color: "#fdcb6e", blur: 8  },
  { top: "14%", left: "50%", size: 5,  color: "#fff",    blur: 4  },
  { top: "45%", left: "8%",  size: 4,  color: "#fff",    blur: 4  },
  { top: "60%", left: "91%", size: 4,  color: "#fff",    blur: 3  },
];

const CORNER_GLOBS = [
  { top: "-6%", left: "-6%",  size: 220, color: "#7c3aed" },
  { top: "-4%", right: "-4%", size: 200, color: "#4f46e5" },
  { bottom: "-4%", left: "-3%", size: 180, color: "#7c3aed" },
  { bottom: "-5%", right: "-5%", size: 190, color: "#6d28d9" },
];

export default function LandingPage({ onStart }: Props) {
  return (
    <div
      onClick={onStart}
      style={{
        position: "fixed", inset: 0, cursor: "pointer", overflow: "hidden",
        background: "#0d0d1a",
        fontFamily: "'Press Start 2P', monospace",
        userSelect: "none",
      }}
    >
      {/* Grid background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(100,80,200,0.18) 1px, transparent 1px),
          linear-gradient(90deg, rgba(100,80,200,0.18) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />

      {/* Corner glow blobs */}
      {CORNER_GLOBS.map((g, i) => (
        <div key={i} style={{
          position: "absolute", borderRadius: "50%",
          width: g.size, height: g.size,
          background: g.color,
          filter: "blur(80px)",
          opacity: 0.45,
          zIndex: 1,
          top: (g as Record<string, unknown>).top as string | undefined,
          bottom: (g as Record<string, unknown>).bottom as string | undefined,
          left: (g as Record<string, unknown>).left as string | undefined,
          right: (g as Record<string, unknown>).right as string | undefined,
        }} />
      ))}

      {/* Scattered dots */}
      {DOTS.map((d, i) => (
        <div key={i} style={{
          position: "absolute",
          top: d.top, left: d.left,
          width: d.size, height: d.size,
          borderRadius: "50%",
          background: d.color,
          boxShadow: `0 0 ${d.blur}px ${d.color}`,
          zIndex: 2,
          animation: `dotPulse ${1.5 + (i % 3) * 0.4}s ease-in-out ${(i * 0.2) % 1.5}s infinite alternate`,
        }} />
      ))}

      {/* Main content */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "100%",
        gap: 0,
      }}>
        {/* Disco ball */}
        <div style={{ position: "relative", marginBottom: 8 }}>
          {/* String */}
          <div style={{
            position: "absolute", top: "-80px", left: "50%",
            width: 2, height: 80,
            background: "linear-gradient(to bottom, rgba(150,150,200,0.4), rgba(200,200,240,0.7))",
            transform: "translateX(-50%)",
          }} />
          <div style={{
            width: 110, height: 110,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #ffffff 4%, #e0e0e8 20%, #b0b0c0 45%, #707080 75%, #303040 100%)",
            boxShadow: "0 0 40px rgba(150,150,255,0.3), inset 0 0 20px rgba(255,255,255,0.5)",
            animation: "spinBall 6s linear infinite",
          }}>
            {/* Disco ball tiles — small shiny squares */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute",
                width: 6, height: 6,
                background: "rgba(255,255,255,0.9)",
                borderRadius: 1,
                top: `${10 + Math.random() * 75}%`,
                left: `${10 + Math.random() * 75}%`,
                transform: `rotate(${Math.random() * 45}deg)`,
                opacity: 0.6 + Math.random() * 0.4,
              }} />
            ))}
          </div>
        </div>

        {/* HOUSE */}
        <div style={{
          fontSize: "clamp(36px, 7vw, 72px)",
          color: "#ffffff",
          textShadow: "0 0 20px rgba(150,100,255,0.8), 0 0 60px rgba(120,60,255,0.4)",
          letterSpacing: "0.08em",
          marginTop: 16,
          lineHeight: 1,
        }}>
          HOUSE
        </div>

        {/* CLICK TO START button */}
        <button
          style={{
            marginTop: 20,
            padding: "14px 32px",
            borderRadius: 50,
            border: "none",
            background: "linear-gradient(135deg, #7c3aed, #e040fb)",
            color: "#ffffff",
            fontSize: "clamp(10px, 2vw, 14px)",
            fontFamily: "'Press Start 2P', monospace",
            letterSpacing: "0.1em",
            cursor: "pointer",
            boxShadow: "0 0 30px rgba(180,60,255,0.5), 0 4px 20px rgba(0,0,0,0.4)",
            animation: "btnPulse 2s ease-in-out infinite",
          }}
        >
          <span style={{ color: "#fff" }}>CLICK </span>
          <span style={{ color: "#ffd700" }}>TO START</span>
        </button>

        {/* PARTY! with reflection */}
        <div style={{ position: "relative", marginTop: 12 }}>
          <div style={{
            fontSize: "clamp(36px, 7vw, 72px)",
            color: "#ffffff",
            textShadow: "0 0 20px rgba(150,100,255,0.8), 0 0 60px rgba(120,60,255,0.4)",
            letterSpacing: "0.08em",
            lineHeight: 1,
          }}>
            PARTY!
          </div>
          {/* Reflection */}
          <div style={{
            fontSize: "clamp(36px, 7vw, 72px)",
            color: "#ffffff",
            letterSpacing: "0.08em",
            lineHeight: 1,
            transform: "scaleY(-1)",
            maskImage: "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, transparent 60%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, transparent 60%)",
            marginTop: 2,
            pointerEvents: "none",
          }}>
            PARTY!
          </div>
        </div>

        {/* Subtitle */}
        <p style={{
          color: "rgba(200,180,255,0.55)",
          fontSize: "clamp(7px, 1.1vw, 10px)",
          fontFamily: "'Press Start 2P', monospace",
          letterSpacing: "0.12em",
          marginTop: 8,
        }}>
          Let your body create the beat!
        </p>

        {/* Bottom label */}
        <p style={{
          position: "absolute", bottom: 24,
          color: "rgba(200,180,255,0.35)",
          fontSize: "clamp(7px, 0.9vw, 9px)",
          fontFamily: "'Press Start 2P', monospace",
          letterSpacing: "0.15em",
        }}>
          Mood-Based Music
        </p>
      </div>

      <style>{`
        @keyframes dotPulse { from{opacity:0.5} to{opacity:1} }
        @keyframes spinBall  { to{transform:rotate(360deg)} }
        @keyframes btnPulse  {
          0%,100%{box-shadow:0 0 30px rgba(180,60,255,0.5),0 4px 20px rgba(0,0,0,0.4)}
          50%    {box-shadow:0 0 50px rgba(220,60,255,0.8),0 4px 30px rgba(0,0,0,0.5)}
        }
      `}</style>
    </div>
  );
}
