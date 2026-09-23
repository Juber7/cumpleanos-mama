import { useEffect, useRef } from "react";

const VIDEO_ID = "uVhP2-2MJ1k";
const PREVIEW_LOOKUP = "https://itunes.apple.com/lookup?id=254829074&country=mx";

const loadPreview = async () => {
  const response = await fetch(PREVIEW_LOOKUP);
  if (!response.ok) return null;
  const data = await response.json();
  const url = data.results?.[0]?.previewUrl;
  if (!url) return null;
  const audio = new Audio(url);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.9;
  return audio;
};

export function BackgroundMusic() {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const audioRef = useRef(null);
  const modeRef = useRef("video");
  const gestureRef = useRef(false);

  useEffect(() => {
    let disposed = false;
    let videoArmed = false;
    const host = hostRef.current;

    const playPreview = () => {
      const audio = audioRef.current;
      if (!audio) return;
      const pending = audio.play();
      if (pending) pending.catch(() => {});
    };

    const dropVideo = () => {
      const player = playerRef.current;
      playerRef.current = null;
      try {
        player?.stopVideo?.();
        player?.destroy?.();
      } catch {
        host?.replaceChildren();
      }
    };

    const usePreview = () => {
      if (modeRef.current === "audio") {
        playPreview();
        return;
      }
      modeRef.current = "audio";
      dropVideo();
      playPreview();
    };

    const playVideo = () => {
      const player = playerRef.current;
      if (!player || typeof player.unMute !== "function" || typeof player.playVideo !== "function") {
        return false;
      }
      player.unMute();
      player.setVolume(90);
      player.playVideo();
      return true;
    };

    const start = () => {
      gestureRef.current = true;
      if (modeRef.current === "audio") {
        playPreview();
        return;
      }
      if (videoArmed) return;
      if (!playVideo()) return;
      videoArmed = true;
      window.setTimeout(() => {
        if (disposed || modeRef.current === "audio") return;
        const player = playerRef.current;
        const state = player?.getPlayerState?.();
        const audible = player?.isMuted?.() === false && (state === 1 || state === 3);
        if (!audible) usePreview();
      }, 3500);
    };

    const createPlayer = () => {
      if (disposed || modeRef.current === "audio" || !host || playerRef.current || !window.YT?.Player) return;
      const slot = host.querySelector(".music-slot");
      if (!slot) return;
      playerRef.current = new window.YT.Player(slot, {
        width: 200,
        height: 200,
        videoId: VIDEO_ID,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          loop: 1,
          playlist: VIDEO_ID,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (disposed || modeRef.current === "audio") return;
            event.target.mute();
            event.target.playVideo();
            if (gestureRef.current) start();
          },
          onError: () => {
            if (!disposed) usePreview();
          },
        },
      });
    };

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousReady === "function") previousReady();
      createPlayer();
    };

    if (window.YT?.Player) createPlayer();
    else if (!document.querySelector('script[data-music="youtube"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.music = "youtube";
      document.head.appendChild(script);
    }

    loadPreview()
      .then((audio) => {
        if (disposed || !audio) return;
        audioRef.current = audio;
        if (gestureRef.current && modeRef.current === "audio") playPreview();
      })
      .catch(() => {});

    window.addEventListener("pointerdown", start, true);
    return () => {
      disposed = true;
      window.removeEventListener("pointerdown", start, true);
      dropVideo();
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <div ref={hostRef} className="music-host" aria-hidden="true">
      <div className="music-slot" />
    </div>
  );
}
