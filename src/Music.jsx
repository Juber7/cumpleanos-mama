import { useEffect, useRef } from "react";

const LOOKUP = "https://itunes.apple.com/lookup?id=254829074&country=mx";
const PREVIEW =
  "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b7/15/49/b71549b6-4962-d40d-6d18-2c8998d286d4/mzaf_18273908599779331095.plus.aac.p.m4a";

export function BackgroundMusic() {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(PREVIEW);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.85;
    audioRef.current = audio;

    fetch(LOOKUP)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const url = data?.results?.[0]?.previewUrl;
        if (!url || audio.src === url) return;
        const wasPlaying = !audio.paused;
        audio.src = url;
        if (wasPlaying) audio.play().catch(() => {});
      })
      .catch(() => {});

    const start = () => {
      audio.play().catch(() => {});
    };

    window.addEventListener("pointerdown", start, { once: true, capture: true });
    window.addEventListener("touchstart", start, { once: true, capture: true, passive: true });
    window.addEventListener("scroll", start, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", start, true);
      window.removeEventListener("touchstart", start, true);
      window.removeEventListener("scroll", start);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  return null;
}
