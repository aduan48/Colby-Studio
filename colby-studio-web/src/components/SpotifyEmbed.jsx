// SpotifyEmbed.jsx
export default function SpotifyEmbed({ trackId, height = 152 }) {
  return (
    <iframe
      data-testid="embed-iframe"
      title="Spotify player"
      style={{ borderRadius: "12px", border: 0 }}
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
      width="100%"
      height={height}
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
    />
  );
}