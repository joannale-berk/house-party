import {
  HandLandmarker,
  FilesetResolver,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";

export type { HandLandmarkerResult };

let handLandmarker: HandLandmarker | null = null;
let isInitializing = false;

export async function initHandLandmarker(): Promise<HandLandmarker> {
  if (handLandmarker) return handLandmarker;
  if (isInitializing) {
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (handLandmarker) { clearInterval(check); resolve(); }
      }, 100);
    });
    return handLandmarker!;
  }
  isInitializing = true;
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: 0.6,
    minHandPresenceConfidence: 0.6,
    minTrackingConfidence: 0.5,
  });
  isInitializing = false;
  return handLandmarker;
}

export type Landmark = { x: number; y: number; z: number };

// ─── Detection constants (from reference implementation) ──────────────────────
const HISTORY_FRAMES = 10;
const UP_THRESH      = 0.055; // min upward travel (normalized) for a flick
const SYNC_RATIO     = 0.4;   // min ratio of the two fingertip movements
const MAX_SIDE_RATIO = 1.4;   // how much horizontal vs vertical is allowed
const COOLDOWN_MS    = 700;

export type FlickFrame = { i8: { x: number; y: number }; i12: { x: number; y: number }; wrist: { x: number; y: number } };

export interface FlickState {
  history: FlickFrame[];
  lastFlickTime: number;
  twoFingersReady: boolean;
}

export function createFlickState(): FlickState {
  return { history: [], lastFlickTime: 0, twoFingersReady: false };
}

/** Index + middle extended, ring + pinky curled */
function twoFingersUp(lm: Landmark[]): boolean {
  const indexUp  = lm[8].y < lm[7].y && lm[7].y < lm[6].y && lm[6].y < lm[5].y;
  const middleUp = lm[12].y < lm[11].y && lm[11].y < lm[10].y && lm[10].y < lm[9].y;
  const ringCurl  = lm[16].y > lm[15].y;
  const pinkyCurl = lm[20].y > lm[19].y;
  return indexUp && middleUp && ringCurl && pinkyCurl;
}

/** Detect synchronized upward flick from rolling history */
function detectUpwardFlick(history: FlickFrame[]): boolean {
  if (history.length < 4) return false;
  const old = history[0];
  const now = history[history.length - 1];

  const dy8  = old.i8.y  - now.i8.y;
  const dy12 = old.i12.y - now.i12.y;

  if (dy8 < UP_THRESH || dy12 < UP_THRESH) return false;

  const syncR = Math.min(dy8, dy12) / Math.max(dy8, dy12);
  if (syncR < SYNC_RATIO) return false;

  const dx8  = Math.abs(old.i8.x  - now.i8.x);
  const dx12 = Math.abs(old.i12.x - now.i12.x);
  const avgDx = (dx8 + dx12) / 2;
  const avgDy = (dy8 + dy12) / 2;
  if (avgDx > avgDy * MAX_SIDE_RATIO) return false;

  const wristDy = Math.abs(old.wrist.y - now.wrist.y);
  if (wristDy > avgDy * 0.65) return false;

  return true;
}

export function detectFlick(
  lm: Landmark[],
  state: FlickState
): { flickDetected: boolean; newState: FlickState } {
  const now = performance.now();
  const ready = twoFingersUp(lm);

  const frame: FlickFrame = {
    i8:    { x: lm[8].x,  y: lm[8].y  },
    i12:   { x: lm[12].x, y: lm[12].y },
    wrist: { x: lm[0].x,  y: lm[0].y  },
  };

  let newHistory = [...state.history, frame];
  if (newHistory.length > HISTORY_FRAMES) newHistory = newHistory.slice(-HISTORY_FRAMES);

  let flickDetected = false;
  if (ready && now - state.lastFlickTime > COOLDOWN_MS) {
    if (detectUpwardFlick(newHistory)) {
      flickDetected = true;
      newHistory = []; // reset history after flick
    }
  }

  return {
    flickDetected,
    newState: {
      history: newHistory,
      lastFlickTime: flickDetected ? now : state.lastFlickTime,
      twoFingersReady: ready,
    },
  };
}
