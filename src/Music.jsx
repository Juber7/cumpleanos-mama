import { useEffect, useRef } from "react";

const TRACK = "spotify:track:5F1De2l58dlYfCaQr0e18J";
const API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

export function BackgroundMusic() {
  const hostRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;
    if (!host) return undefined;

    const play = () => {
      const player = playerRef.current;
      if (!player) return;
      try {
        player.play();
      } catch {
        /* El navegador puede pedir un toque primero. */
      }
    };

    const attach = (IFrameAPI) => {
      if (disposed || playerRef.current || !host) return;
      IFrameAPI.createController(
        host,
        {
          uri: TRACK,
          width: 80,
          height: 80,
        },
        (controller) => {
          if (disposed) return;
          playerRef.current = controller;
          controller.addListener("ready", play);
          play();
        }
      );
    };

    const previous = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api) => {
      window.SpotifyIframeApi = api;
      if (typeof previous === "function") previous(api);
      attach(api);
    };

    if (window.SpotifyIframeApi) attach(window.SpotifyIframeApi);
    else if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = API_SRC;
      script.async = true;
      document.body.appendChild(script);
    }

    window.addEventListener("pointerdown", play, true);
    window.addEventListener("touchstart", play, { capture: true, passive: true });
    window.addEventListener("scroll", play, { passive: true });

    return () => {
      disposed = true;
      window.removeEventListener("pointerdown", play, true);
      window.removeEventListener("touchstart", play, true);
      window.removeEventListener("scroll", play);
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, []);

  return (
    <div className="music-host" aria-hidden="true">
      <div ref={hostRef} />
    </div>
  );
}
