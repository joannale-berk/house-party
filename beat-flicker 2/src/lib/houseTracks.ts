export interface HouseTrack {
  id: number;
  title: string;
  artist: string;
  url: string;
}

// Fetches tracks from /sounds.json — a static manifest in /public.
// To add songs:
//   1. Put your MP3s in  public/sound for someone/
//   2. Run:  node generate-manifest.js
//      (this writes public/sounds.json automatically)
//   3. Commit + push — Vercel redeploys with your songs.
export async function fetchTracks(): Promise<HouseTrack[]> {
  try {
    const res = await fetch("/sounds.json");
    if (!res.ok) return [];
    const data = (await res.json()) as HouseTrack[];
    if (Array.isArray(data) && data.length > 0) return data;
  } catch {
    // ignore
  }
  return [];
}

export function getRandomTrack(
  tracks: HouseTrack[],
  excludeId?: number
): HouseTrack | null {
  if (tracks.length === 0) return null;
  const available =
    excludeId !== undefined && tracks.length > 1
      ? tracks.filter((t) => t.id !== excludeId)
      : tracks;
  return available[Math.floor(Math.random() * available.length)];
}
