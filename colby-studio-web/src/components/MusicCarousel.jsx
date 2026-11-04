import React, { useState, useRef, useEffect } from "react";
import tracks from "./tracks.json";
import "../styles/MusicCarousel.css";
import vinylImage from "../assets/a_side_vinyl.webp";

const Icon = ({ children, fill = "none" }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill={fill}
       stroke="currentColor" strokeWidth="1.75"
       strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

function MusicCarousel() {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const track = tracks[index];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, [index, isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  const goTo = (i) => {
    setIndex((i + tracks.length) % tracks.length);
    setProgress(0);
  };

  const handleTime = (e) => {
    const { currentTime, duration } = e.currentTarget;
    if (duration) setProgress((currentTime / duration) * 100);
  };

  return (
    <section className="mc">

      {/* Stage: scrolling covers behind, spinning vinyl, glass panel on top */}
      <div className="mc-stage">
        <div className="mc-strip">
          <div className="mc-strip-inner">
            {/* list is doubled so the loop is seamless */}
            {[...tracks, ...tracks].map((t, i) => (
              <img
                key={i}
                className="mc-strip-cover"
                src={t.image}
                alt={i < tracks.length ? `${t.Title} cover art` : ""}
                onClick={() => goTo(i % tracks.length)}
              />
            ))}
          </div>
        </div>

        <div className={`mc-vinyl ${isPlaying ? "is-spinning" : ""}`}>
          <div className="mc-vinyl-disc">
            <img className="mc-vinyl-img" src={vinylImage} alt="" />
            <img className="mc-vinyl-label" src={track.image} alt="" />
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
                <h2 className="mc-title">{track.Title}</h2>
                <button className="mc-mute" onClick={() => setIsMuted((m) => !m)}
                        aria-label={isMuted ? "Unmute" : "Mute"}>
                  {isMuted
                    ? <Icon><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></Icon>
                    : <Icon><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></Icon>}
                </button>
              </div>

              <p className="mc-artist">{track.Artist}</p>

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