import { useCallback, useEffect, useRef, useState } from "react";
import {
  initHandLandmarker,
  detectFlick,
  createFlickState,
} from "../lib/handDetection";
import type { HandLandmarkerResult, FlickState } from "../lib/handDetection";
import { fetchTracks, getRandomTrack } from "../lib/houseTracks";
import type { HouseTrack } from "../lib/houseTracks";
import { LEDLights } from "../components/LEDLights";
import { HandCanvas } from "../components/HandCanvas";
import { MusicPlayer } from "../components/MusicPlayer";

// Matches the Java ScreenLEDController palette
const LED_COLORS = [
  "#ff0000", // RED
  "#00ff00", // GREEN
  "#0000ff", // BLUE
  "#00ffff", // CYAN
  "#ff00ff", // MAGENTA
  "#ffff00", // YELLOW
  "#ff6400", // ORANGE
];

type LoadState = "loading" | "ready" | "denied";

interface Props { onExit?: () => void }

export default function PartyPage({ onExit }: Props) {
  const [loadState, setLoadState]             = useState<LoadState>("loading");
  const [handResult, setHandResult]           = useState<HandLandmarkerResult | null>(null);
  const [twoFingersReady, setTwoFingersReady] = useState(false);
  const [flickPulse, setFlickPulse]           = useState(0);
  const [ledActive, setLedActive]             = useState(false);
  const [currentTrack, setCurrentTrack]       = useState<HouseTrack | null>(null);
  const [musicPlaying, setMusicPlaying]       = useState(false);
  const [flashColor, setFlashColor]           = useState<string | null>(null);
  const [flashKey, setFlashKey]               = useState(0);

  const videoRef         = useRef<HTMLVideoElement>(null);
  const flickStateRef    = useRef<FlickState>(createFlickState());
  const animFrameRef     = useRef<number>(0);
  const silenceTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flickCooldownRef = useRef(false);
  const colorIdxRef      = useRef(0);
  const trackRef         = useRef<HouseTrack | null>(null);
  const tracksRef        = useRef<HouseTrack[]>([]);
  const musicPlayingRef  = useRef(false);

  useEffect(() => { musicPlayingRef.current = musicPlaying; }, [musicPlaying]);

  useEffect(() => {
    fetchTracks().then(t => { tracksRef.current = t; });
  }, []);

  // Start camera
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 1280, height: 720 }, audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setLoadState("denied");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onFlick = useCallback(() => {
    if (flickCooldownRef.current) return;
    flickCooldownRef.current = true;
    setTimeout(() => { flickCooldownRef.current = false; }, 700);

    // Advance LED color (cycle through the 7 colors like the Java controller)
    const color = LED_COLORS[colorIdxRef.current % LED_COLORS.length];
    colorIdxRef.current += 1;
    setFlashColor(color);
    setFlashKey(k => k + 1);

    setFlickPulse(p => p + 1);
    setLedActive(true);

    // Reset silence timer — resets every flick
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    // Start music on first flick of a session
    if (!musicPlayingRef.current) {
      const t = getRandomTrack(tracksRef.current, trackRef.current?.id);
      if (t) {
        trackRef.current = t;
        setCurrentTrack(t);
        setMusicPlaying(true);
        musicPlayingRef.current = true;
      }
    }

    // 2.5 s of silence → stop music + turn off LEDs
    silenceTimerRef.current = setTimeout(() => {
      setMusicPlaying(false);
      musicPlayingRef.current = false;
      setLedActive(false);
      setFlashColor(null);
      const prevId = trackRef.current?.id;
      setTimeout(() => {
        const next = getRandomTrack(tracksRef.current, prevId);
        if (next) { trackRef.current = next; setCurrentTrack(next); }
      }, 600);
    }, 2500);
  }, []);

  // Init hand landmarker
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;

    (async () => {
      const landmarker = await initHandLandmarker();
      if (cancelled) return;
      setLoadState("ready");

      const loop = () => {
        if (cancelled) return;
        if (video.readyState >= 2) {
          const result = landmarker.detectForVideo(video, performance.now());
          setHandResult(result);

          if (result.landmarks?.length) {
            const lm = result.landmarks[0];
            const { flickDetected, newState } = detectFlick(lm, flickStateRef.current);
            flickStateRef.current = newState;
            setTwoFingersReady(newState.twoFingersReady);
            if (flickDetected) onFlick();
          } else {
            flickStateRef.current = createFlickState();
            setTwoFingersReady(false);
          }
        }
        animFrameRef.current = requestAnimationFrame(loop);
      };
      animFrameRef.current = requestAnimationFrame(loop);
    })();

    return () => { cancelled = true; cancelAnimationFrame(animFrameRef.current); };
  }, [onFlick]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", overflow: "hidden", userSelect: "none" }}>
      <MusicPlayer track={currentTrack} playing={musicPlaying} />

      {/* Full-screen camera */}
      <video
        ref={videoRef}
        muted
        playsInline
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%", objectFit: "cover",
          transform: "scaleX(-1)",
          filter: "saturate(0.9) brightness(1.02)",
        }}
      />

      {/* ── LED COLOR FLASH (cycles through 7 colors on each flick) ── */}
      {flashColor && (
        <div
          key={flashKey}
          style={{
            position: "absolute", inset: 0, zIndex: 16,
            background: flashColor,
            mixBlendMode: "screen",
            pointerEvents: "none",
            animation: "ledFlash 0.55s ease-out forwards",
          }}
        />
      )}

      {/* Ambient color tint while LEDs are on (subtle steady glow of current color) */}
      {ledActive && flashColor && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 14,
          background: flashColor,
          mixBlendMode: "screen",
          opacity: 0.12,
          pointerEvents: "none",
          transition: "background 0.4s ease, opacity 0.6s ease",
        }} />
      )}

      {/* Beam + disco dot effects */}
      <LEDLights active={ledActive} flickPulse={flickPulse} />

      {/* Hand skeleton */}
      {loadState === "ready" && (
        <HandCanvas result={handResult} twoFingersReady={twoFingersReady} />
      )}

      {/* HUD corners */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 30 }}>
        {[
          { top: 16,    left: 16,  borderWidth: "1px 0 0 1px" },
          { top: 16,    right: 16, borderWidth: "1px 1px 0 0" },
          { bottom: 16, left: 16,  borderWidth: "0 0 1px 1px" },
          { bottom: 16, right: 16, borderWidth: "0 1px 1px 0" },
        ].map((s, i) => (
          <div key={i} style={{
            position: "absolute", width: 20, height: 20,
            borderStyle: "solid", borderColor: "rgba(255,255,255,0.2)", ...s,
          }} />
        ))}
      </div>

      {/* Track label */}
      {currentTrack && (
        <div style={{
          position: "absolute", bottom: 24, left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'Inter', sans-serif",
          fontSize: 11, fontWeight: 500,
          letterSpacing: "0.35em", textTransform: "uppercase",
          color: "#1a1a1a",
          background: "rgba(245,243,239,0.88)",
          padding: "4px 16px",
          opacity: musicPlaying ? 1 : 0,
          transition: "opacity 0.4s",
          zIndex: 31, whiteSpace: "nowrap",
        }}>
          {currentTrack.title.toUpperCase()}
        </div>
      )}

      {/* Hand status */}
      {loadState === "ready" && twoFingersReady && (
        <div style={{
          position: "absolute", top: 20, left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'Inter', sans-serif",
          fontSize: 10, letterSpacing: "0.35em", fontWeight: 500,
          textTransform: "uppercase", color: "#00c853",
          background: "rgba(245,243,239,0.9)",
          border: "1px solid #00c853",
          padding: "3px 12px",
          zIndex: 31, whiteSpace: "nowrap",
        }}>
          FLICK NOW!
        </div>
      )}

      {/* Loading */}
      {loadState === "loading" && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50, background: "#0d0d1a",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Press Start 2P', monospace", fontSize: 11,
          letterSpacing: "0.45em", color: "rgba(200,180,255,0.6)",
          animation: "blink 1.4s ease-in-out infinite",
        }}>
          LOADING...
        </div>
      )}

      {/* Denied */}
      {loadState === "denied" && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50, background: "#0d0d1a",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
          fontFamily: "'Press Start 2P', monospace",
        }}>
          <p style={{ color: "#ff6b9d", fontSize: 11, letterSpacing: "0.3em" }}>CAMERA UNAVAILABLE</p>
          {onExit && (
            <button onClick={onExit} style={{
              padding: "10px 24px", border: "none",
              background: "linear-gradient(135deg,#7c3aed,#e040fb)",
              color: "#fff", borderRadius: 24, cursor: "pointer",
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
            }}>BACK</button>
          )}
        </div>
      )}

      {/* Exit */}
      {onExit && (
        <button onClick={onExit} style={{
          position: "absolute", top: 16, right: 60,
          background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.5)", borderRadius: 20,
          padding: "4px 12px", cursor: "pointer",
          fontFamily: "'Inter', sans-serif", fontSize: 10,
          letterSpacing: "0.2em", textTransform: "uppercase",
          zIndex: 33,
        }}>
          EXIT
        </button>
      )}

      <style>{`
        @keyframes blink    { 0%,100%{opacity:0.25} 50%{opacity:1} }
        @keyframes ledFlash {
          0%   { opacity: 0.72; }
          20%  { opacity: 0.65; }
          100% { opacity: 0;    }
        }
      `}</style>
    </div>
  );
}
