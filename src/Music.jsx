import { createContext, useContext, useEffect, useRef, useState } from "react";

const TRACK = "spotify:track:5F1De2l58dlYfCaQr0e18J";
const API_SRC = "https://open.spotify.com/embed/iframe-api/v1";
const MusicContext = createContext(null);

export function BackgroundMusic({ children }) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const pendingRef = useRef(false);
  const playRef = useRef(() => {
    pendingRef.current = true;
  });
  const [playing, setPlaying] = useState(false);

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
        setPlaying(true);
      } catch {
        pendingRef.current = true;
      }
    };

    playRef.current = startFromPiano;

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
          controller.addListener("playback_started", () => setPlaying(true));
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

    return () => {
      disposed = true;
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, []);

  return (
    <MusicContext.Provider value={{ playing, play: () => playRef.current() }}>
      {children}
      <div className="music-host" aria-hidden="true">
        <div ref={hostRef} />
      </div>
    </MusicContext.Provider>
  );
}

export function PlayCue() {
  const music = useContext(MusicContext);
  if (!music || music.playing) return null;

  return (
    <button type="button" className="play-cue" onClick={music.play}>
      Toca aquí
    </button>
  );
}
