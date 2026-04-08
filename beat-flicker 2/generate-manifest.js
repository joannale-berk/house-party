// It scans  public/sound for someone/  and writes  public/sounds.json.
// Then commit both the MP3s and sounds.json and push to GitHub — Vercel
// will serve the updated tracks automatically.
// ─────────────────────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOUNDS_DIR = path.join(__dirname, "public", "sound for someone");
const OUT_FILE   = path.join(__dirname, "public", "sounds.json");
const AUDIO_EXTS = [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"];

if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
  console.log('Created folder: public/sound for someone/');
  console.log('Add your MP3 files there, then run this script again.');
  process.exit(0);
}

const files = fs.readdirSync(SOUNDS_DIR)
  .filter(f => AUDIO_EXTS.includes(path.extname(f).toLowerCase()))
  .sort();

if (files.length === 0) {
  console.log('No audio files found in public/sound for someone/');
  console.log('Add your MP3s there and run this script again.');
  process.exit(0);
}

const tracks = files.map((f, i) => ({
  id: i + 1,
  title: path.basename(f, path.extname(f)).replace(/[-_]/g, " "),
  artist: "Sound for Someone",
  url: `/sound for someone/${f}`,
}));

fs.writeFileSync(OUT_FILE, JSON.stringify(tracks, null, 2));

console.log(`✓ Written ${tracks.length} track(s) to public/sounds.json:`);
tracks.forEach(t => console.log(`  [${t.id}] ${t.title}  →  ${t.url}`));
