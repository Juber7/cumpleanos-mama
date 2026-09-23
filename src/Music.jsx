import { useEffect, useRef } from "react";

const TRACK = "spotify:track:5F1De2l58dlYfCaQr0e18J";
const API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

export function BackgroundMusic() {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const fromStartRef = useRef(false);

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;
    if (!host) return undefined;

    const startFromPiano = () => {
      const player = playerRef.current;
      if (!player) return;
      try {
        if (!fromStartRef.current) {
          if (typeof player.restart === "function") player.restart();
          else if (typeof player.loadUri === "function") player.loadUri(TRACK, false, 0);
          fromStartRef.current = true;
        }
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
          controller.addListener("ready", startFromPiano);
          startFromPiano();
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

    window.addEventListener("pointerdown", startFromPiano, true);
    window.addEventListener("touchstart", startFromPiano, { capture: true, passive: true });
    window.addEventListener("scroll", startFromPiano, { passive: true });

    return () => {
      disposed = true;
      window.removeEventListener("pointerdown", startFromPiano, true);
      window.removeEventListener("touchstart", startFromPiano, true);
      window.removeEventListener("scroll", startFromPiano);
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
