import { useEffect, useRef } from "react";

const TRACK = "spotify:track:5F1De2l58dlYfCaQr0e18J";
const API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

export function BackgroundMusic({ children }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const pendingRef = useRef(false);

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;
    if (!host) return undefined;

    const startFromPiano = () => {
      const player = playerRef.current;
      if (!player) {
        pendingRef.current = true;
        return;
      }
      try {
        if (typeof player.restart === "function") player.restart();
        else if (typeof player.loadUri === "function") player.loadUri(TRACK, false, 0);
        player.play();
      } catch {
        pendingRef.current = true;
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
          controller.addListener("ready", () => {
            if (pendingRef.current) startFromPiano();
          });
          if (pendingRef.current) startFromPiano();
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

    window.addEventListener("pointerdown", startFromPiano, { once: true, capture: true });
    window.addEventListener("touchstart", startFromPiano, { once: true, capture: true, passive: true });

    return () => {
      disposed = true;
      window.removeEventListener("pointerdown", startFromPiano, true);
      window.removeEventListener("touchstart", startFromPiano, true);
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, []);

  return (
    <>
      {children}
      <div className="music-host" aria-hidden="true">
        <div ref={hostRef} />
      </div>
    </>
  );
}
