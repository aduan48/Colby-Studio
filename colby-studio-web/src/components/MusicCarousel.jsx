import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import tracks from "./tracks.json"; //the track information
import "../styles/MusicCarousel.css";
import vinylImage from "../assets/a_side_vinyl.webp";

/**
 * Shared wrapper for small inline SVG icons (play, pause, arrows, etc.).
 *
 * Sets up the outer <svg> once so each icon only needs its own <path>/<rect>
 * shapes as children. Icons are 18×18 on a 24×24 grid, drawn as 1.75px
 * rounded outlines, and use `currentColor`, so they automatically match
 * the text color of the button they sit in (including hover states).
 *
 * @param {React.ReactNode} children - The shapes that make up the icon.
 * @param {string} [fill="none"] - Fill color. Leave as "none" for outline
 *   icons, or pass "currentColor" for solid ones (e.g. a filled play button).
 *
 * @example
 * <Icon><path d="M6 9l6 6 6-6" /></Icon>                       // outline chevron
 * <Icon fill="currentColor"><path d="M8 5v14l11-7z" /></Icon>  // solid play
 */
const Icon = ({ children, fill = "none" }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill={fill}
       stroke="currentColor" strokeWidth="1.75"
       strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

/**
 * 
 * @returns a stage with scrolling covers behind, spinning vinyl, glass panel on top
 */
function MusicCarousel() {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const track = tracks[index]; //index of the track

  const stripRef = useRef(null);
  const groupRef = useRef(null);
  const [copies, setCopies] = useState(2);

  /** Render enough copies of the covers to fill the screen, plus one to slide in */
  useLayoutEffect(() => {
    const update = () => {
      const stripW = stripRef.current?.offsetWidth;
      const groupW = groupRef.current?.offsetWidth;
      if (!stripW || !groupW) return;
      setCopies(Math.max(2, Math.ceil(stripW / groupW) + 1));
    };
    update();
    const ro = new ResizeObserver(update); // also fires as cover images load in
    ro.observe(stripRef.current);
    ro.observe(groupRef.current);
    return () => ro.disconnect();
  }, []);

  /** Keep the <audio> element in sync with isPlaying (and restart playback when the track changes) */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return; // audio element not on the page yet
    if (isPlaying) audio.play().catch(() => setIsPlaying(false)); // start playing; if the browser blocks it, reset the button
    else audio.pause(); // pause when isPlaying is false
  }, [index, isPlaying]);// re-run on play/pause and when switching tracks

  /**
   * it will update the current audio ref to muted or not muted
   */
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  /**
   * this handles changing of the track, 
   * @param {*} i 
   */
  const goTo = (i) => {
    setIndex((i + tracks.length) % tracks.length); //loops bacl to beginning if it goes over index
    setProgress(0); //sets the progress of the song to 0
  };

  /** Runs as the song plays: converts the playback position into a 0–100% value for the progress bar */
  const handleTime = (e) => {
    const { currentTime, duration } = e.currentTarget; // seconds played, total seconds
    if (duration) setProgress((currentTime / duration) * 100); // skip until the song's length has loaded
  };

  return (
    <section className="mc" id="our-work">

      {/* Stage: scrolling covers behind, spinning vinyl, glass panel on top */}
      <div className="mc-stage">
        <div className="mc-strip" ref={stripRef}>
          {Array.from({ length: copies }, (_, c) => (
            <div
              key={c}
              ref={c === 0 ? groupRef : undefined}
              className="mc-strip-group"
              aria-hidden={c > 0 || undefined} // screen readers only hear the first copy
            >
              {tracks.map((t, i) => (
                <img
                  key={i}
                  className="mc-strip-cover"
                  src={t.image}
                  alt={c === 0 ? `${t.Title} cover art` : ""}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          ))}
        </div>

       <div className={`mc-vinyl ${isPlaying ? "is-spinning" : ""}`}>
        <div className="mc-vinyl-swap" key={index}>
          <div className="mc-vinyl-disc">
            <img className="mc-vinyl-img" src={vinylImage} alt="" />
            <img className="mc-vinyl-label" src={track.image} alt="" />
          </div>
        </div>
      </div>

        <div className="mc-panel">
          <div className="mc-progress">
            <div className="mc-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="mc-player">
            <button className="mc-nav" onClick={() => goTo(index - 1)} aria-label="Previous track">
              <Icon><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" /></Icon>
            </button>

            <div className="mc-info">
              <div className="mc-title-row">
                <h2  className="mc-title mc-swap-text" key={`title-${index}`}>{track.Title}</h2>
                <button className="mc-mute" onClick={() => setIsMuted((m) => !m)}
                        aria-label={isMuted ? "Unmute" : "Mute"}>
                  {isMuted
                    ? <Icon><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></Icon>
                    : <Icon><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></Icon>}
                </button>
              </div>

              <p className="mc-artist mc-swap-text" key={`artist-${index}`}>{track.Artist}</p>

              <div className="mc-sub">
                <span className="mc-count">
                  {String(index + 1).padStart(2, "0")} / {String(tracks.length).padStart(2, "0")}
                </span>
                <span aria-hidden="true">·</span>
                <a className="mc-link" href={track["Spotify-Link"]}
                   target="_blank" rel="noopener noreferrer">
                  Spotify ↗
                </a>
              </div>

              <button className="mc-play" onClick={() => setIsPlaying((p) => !p)}
                      aria-label={isPlaying ? "Pause" : "Play"}>
                {isPlaying
                  ? <Icon fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></Icon>
                  : <Icon fill="currentColor"><polygon points="6 3 20 12 6 21 6 3" /></Icon>}
              </button>
            </div>

            <button className="mc-nav" onClick={() => goTo(index + 1)} aria-label="Next track">
              <Icon><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" /></Icon>
            </button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={track.audio} preload="none"
             onTimeUpdate={handleTime} onEnded={() => goTo(index + 1)} />
    </section>
  );
}

export default MusicCarousel;