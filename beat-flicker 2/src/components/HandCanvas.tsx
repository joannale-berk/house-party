import { useEffect, useRef } from "react";
import type { HandLandmarkerResult } from "../lib/handDetection";

const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];

const TIPS = [4, 8, 12, 16, 20];

interface Props {
  result: HandLandmarkerResult | null;
  twoFingersReady: boolean;
}

export function HandCanvas({ result, twoFingersReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    if (!W || !H) return;
    canvas.width  = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);

    if (!result?.landmarks?.length) return;

    for (const lm of result.landmarks) {
      // Mirror X because the video is already flipped
      const mx = (p: { x: number }) => (1 - p.x) * W;
      const my = (p: { y: number }) => p.y * H;

      const green   = "#00c853";
      const greenDim = "rgba(0,200,83,0.5)";

      // ── Bounding box ──────────────────────────────────────────────
      let minX = 1, maxX = 0, minY = 1, maxY = 0;
      for (const p of lm) {
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      }
      const pad = 0.03;
      const bx = (1 - maxX - pad) * W;
      const by = (minY - pad) * H;
      const bw = (maxX - minX + pad * 2) * W;
      const bh = (maxY - minY + pad * 2) * H;

      ctx.save();
      ctx.strokeStyle = twoFingersReady ? green : greenDim;
      ctx.lineWidth   = twoFingersReady ? 2.5 : 1.5;
      ctx.setLineDash(twoFingersReady ? [] : [6, 4]);
      ctx.strokeRect(bx, by, bw, bh);

      // Corner accents
      const cs = 12;
      ctx.setLineDash([]);
      ctx.lineWidth   = 3;
      ctx.strokeStyle = twoFingersReady ? green : greenDim;

      ctx.beginPath(); ctx.moveTo(bx, by + cs); ctx.lineTo(bx, by); ctx.lineTo(bx + cs, by); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw - cs, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cs); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by + bh - cs); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + cs, by + bh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx + bw - cs, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cs); ctx.stroke();

      // Label
      ctx.fillStyle = twoFingersReady ? green : "rgba(0,200,83,0.7)";
      ctx.font = "500 9px Inter, sans-serif";
      ctx.fillText(twoFingersReady ? "READY" : "HAND", bx + 6, by + bh + 14);
      ctx.restore();

      // ── Skeleton ──────────────────────────────────────────────────
      for (const [a, b] of CONNECTIONS) {
        const active = twoFingersReady && (
          [5,6,7,8,9,10,11,12].includes(a) || [5,6,7,8,9,10,11,12].includes(b)
        );
        ctx.beginPath();
        ctx.moveTo(mx(lm[a]), my(lm[a]));
        ctx.lineTo(mx(lm[b]), my(lm[b]));
        ctx.strokeStyle = active ? "rgba(0,200,83,0.7)" : "rgba(255,255,255,0.18)";
        ctx.lineWidth   = active ? 1.8 : 1;
        ctx.stroke();
      }

      // ── Landmarks ─────────────────────────────────────────────────
      for (let i = 0; i < lm.length; i++) {
        const p = lm[i];
        const isTip       = TIPS.includes(i);
        const isFlickTip  = twoFingersReady && [8, 12].includes(i);

        ctx.beginPath();
        ctx.arc(mx(p), my(p), isFlickTip ? 5 : isTip ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fillStyle = isFlickTip ? green
          : isTip ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.28)";
        ctx.fill();

        if (isFlickTip) {
          ctx.beginPath();
          ctx.arc(mx(p), my(p), 8, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(0,200,83,0.35)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }
  });

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
    />
  );
}
