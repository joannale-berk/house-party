import { useEffect, useRef } from "react";
import type { HouseTrack } from "../lib/houseTracks";

interface Props {
  track: HouseTrack | null;
  playing: boolean;
}

export function MusicPlayer({ track, playing }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!track) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (!playing) return;

    const audio = new Audio(track.url);
    audio.volume = 0.7;
    audio.loop = true;
    audio.play().catch(() => {});
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [track?.id, playing]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [playing]);

  return null;
}
