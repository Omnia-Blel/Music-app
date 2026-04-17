import React from "react";
import { gql, useQuery } from "@apollo/client";

// ================= STYLE =================
const styles = `
.sp-track-root {
  background: #121212;
  color: white;
  padding: 2rem;
  border-radius: 12px;
  min-height: 500px;
  font-family: Arial;
}

.sp-back-btn {
  background: none;
  border: none;
  color: #A7A7A7;
  cursor: pointer;
  margin-bottom: 20px;
}
.sp-back-btn:hover {
  color: white;
}

.sp-track-hero {
  display: flex;
  gap: 30px;
  align-items: flex-end;
}

.sp-track-cover {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  background: #282828;
}

.sp-track-info h2 {
  font-size: 32px;
  margin: 10px 0;
}

.sp-track-artist {
  color: #A7A7A7;
  font-size: 14px;
}

.sp-meta {
  margin-top: 10px;
  color: #A7A7A7;
}

.sp-play-btn {
  margin-top: 20px;
  background: #1DB954;
  border: none;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
}

.sp-audio {
  margin-top: 25px;
  width: 100%;
}
`;

// ================= QUERY =================
const TRACK_QUERY = gql`
  query Track($id: ID!) {
    track(id: $id) {
      id
      title
      duration
      explicit_lyrics
      preview
      artist {
        name
      }
      album {
        title
        cover_medium
      }
    }
  }
`;

// ================= HELPERS =================
function formatDuration(seconds) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ================= COMPONENT =================
export default function Track({ trackId, token, onBack }) {
  const { data, loading, error } = useQuery(TRACK_QUERY, {
    variables: { id: trackId },
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  if (loading) return <div className="sp-track-root">Chargement...</div>;
  if (error) return <div className="sp-track-root">Erreur: {error.message}</div>;

  const track = data.track;

  return (
    <>
      <style>{styles}</style>

      <div className="sp-track-root">
        <button className="sp-back-btn" onClick={onBack}>
          ← Retour
        </button>

        <div className="sp-track-hero">
          <img
            src={track.album?.cover_medium}
            alt={track.title}
            className="sp-track-cover"
          />

          <div className="sp-track-info">
            <div style={{ fontSize: 12, color: "#A7A7A7" }}>Titre</div>
            <h2>{track.title}</h2>

            <div className="sp-track-artist">
              {track.artist?.name}
            </div>

            <div className="sp-meta">
              {formatDuration(track.duration)}
              {track.explicit_lyrics && " • EXPLICIT"}
            </div>

            <button className="sp-play-btn">▶</button>
          </div>
        </div>

        {track.preview && (
          <audio controls className="sp-audio">
            <source src={track.preview} type="audio/mpeg" />
          </audio>
        )}
      </div>
    </>
  );
}