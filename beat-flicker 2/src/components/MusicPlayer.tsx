import { useEffect, useRef } from "react";
import type { HouseTrack } from "../lib/houseTracks";

interface Props {
  track: HouseTrack | null;
  playing: boolean;
}

export function MusicPlayer({ track, playing }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (!track || !playing) return;

    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.volume = 0.8;
    audio.loop = true;
    audio.preload = "auto";
    audio.src = track.url;
    audioRef.current = audio;

    audio.play().catch((err) => {
      console.warn("Audio play failed:", err);
    });

    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [track?.id, playing]);

  return null;
}
