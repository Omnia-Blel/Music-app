import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import Track from "./Track";

// ============================================================
// HELPERS
// ============================================================
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRank(r) {
  if (!r) return "—";
  if (r >= 1_000_000) return (r / 1_000_000).toFixed(1) + "M";
  if (r >= 1_000) return Math.round(r / 1_000) + "K";
  return r;
}

// ============================================================
// QUERIES & MUTATIONS
// ============================================================
const LIKED_TRACKS = gql`
  query likedTracks {
    likedTracks {
      id
      createdAt
      track {
        id
        title
        duration
        rank
        explicit_lyrics
        artist { name }
        album { title cover_medium }
      }
    }
  }
`;

const UNLIKE_TRACK = gql`
  mutation UnlikeTrack($trackId: ID!) {
    unlikeTrack(trackId: $trackId) {
      success
      message
    }
  }
`;

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Circular+Std:wght@400;700&display=swap');

  .sp-root {
    font-family: 'Circular Std', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #121212;
    color: #fff;
    min-height: 100vh;
  }

  /* HEADER */
  .sp-header {
    background: linear-gradient(180deg, #450af5 0%, #8e44ad 60%, #121212 100%);
    padding: 40px 32px 24px;
  }
  .sp-header-top {
    display: flex;
    align-items: flex-end;
    gap: 24px;
    margin-bottom: 24px;
  }
  .sp-cover {
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, #450af5, #c400f9);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
    font-size: 80px;
  }
  .sp-header-label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .sp-header-title {
    font-size: 52px;
    font-weight: 700;
    line-height: 1.1;
    margin-bottom: 16px;
    letter-spacing: -1px;
  }
  .sp-header-meta {
    font-size: 14px;
    color: #b3b3b3;
  }
  .sp-header-meta strong { color: #fff; }

  /* CONTROLS */
  .sp-controls {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px 32px;
    background: #121212;
  }
  .sp-btn-play {
    width: 56px;
    height: 56px;
    background: #1db954;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: #000;
    transition: transform 0.1s, background 0.15s;
  }
  .sp-btn-play:hover { background: #1ed760; transform: scale(1.06); }
  .sp-btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    color: #b3b3b3;
    font-size: 20px;
    padding: 4px;
    transition: color 0.15s;
  }
  .sp-btn-icon:hover { color: #fff; }

  /* SEARCH */
  .sp-search {
    margin-left: auto;
    position: relative;
  }
  .sp-search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 13px;
    pointer-events: none;
  }
  .sp-search input {
    background: #282828;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px;
    color: #fff;
    padding: 8px 12px 8px 34px;
    font-size: 13px;
    width: 220px;
    outline: none;
    transition: border 0.15s;
  }
  .sp-search input:focus { border-color: #b3b3b3; }

  /* TABLE HEADER */
  .sp-table-header {
    display: grid;
    grid-template-columns: 40px 1fr 1fr 100px 60px 80px;
    gap: 0;
    padding: 0 40px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    margin: 0 0 4px;
  }
  .sp-table-header span {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #b3b3b3;
    font-weight: 500;
  }

  /* TRACKS */
  .sp-tracks { padding: 0 24px 24px; }
  .sp-track-row {
    display: grid;
    grid-template-columns: 40px 1fr 1fr 100px 60px 80px;
    gap: 0;
    align-items: center;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    min-height: 56px;
    transition: background 0.1s;
    position: relative;
  }
  .sp-track-row:hover { background: #282828; }
  .sp-track-row:hover .sp-unlike-btn { opacity: 1; }

  .sp-track-num {
    font-size: 15px;
    color: #b3b3b3;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
  .sp-track-info { display: flex; align-items: center; gap: 12px; overflow: hidden; }
  .sp-track-thumb {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    object-fit: cover;
    flex-shrink: 0;
    background: #535353;
  }
  .sp-track-thumb-ph {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    background: #535353;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }
  .sp-track-text { overflow: hidden; }
  .sp-track-title {
    font-size: 15px;
    font-weight: 500;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sp-track-artist {
    font-size: 13px;
    color: #b3b3b3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sp-explicit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #535353;
    color: #121212;
    font-size: 9px;
    font-weight: 700;
    width: 16px;
    height: 16px;
    border-radius: 2px;
    flex-shrink: 0;
    letter-spacing: 0;
  }
  .sp-track-album {
    font-size: 13px;
    color: #b3b3b3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 16px;
  }
  .sp-track-date {
    font-size: 13px;
    color: #b3b3b3;
    text-align: center;
  }
  .sp-track-rank {
    font-size: 12px;
    color: #b3b3b3;
    text-align: center;
  }
  .sp-track-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }
  .sp-track-duration {
    font-size: 13px;
    color: #b3b3b3;
    font-variant-numeric: tabular-nums;
  }
  .sp-unlike-btn {
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0;
    color: #e91429;
    font-size: 18px;
    padding: 4px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.15s, transform 0.1s;
    line-height: 1;
  }
  .sp-unlike-btn:hover { transform: scale(1.2); }

  /* EMPTY / LOADING / ERROR */
  .sp-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 32px;
    gap: 12px;
    color: #b3b3b3;
  }
  .sp-state-icon { font-size: 48px; opacity: 0.4; }
  .sp-state-title { font-size: 20px; font-weight: 700; color: #fff; }
  .sp-state-sub { font-size: 14px; text-align: center; }
`;

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function LikedTracks({ token, userId }) {
  const [search, setSearch] = useState("");

  const authHeaders = {
    context: { headers: { authorization: `Bearer ${token}` } },
  };

  const { data, loading, error, refetch } = useQuery(LIKED_TRACKS, authHeaders);

  const [unlikeTrack] = useMutation(UNLIKE_TRACK, {
    ...authHeaders,
    onCompleted: () => refetch(),
  });

  if (!token)
    return (
      <div className="sp-root">
        <style>{styles}</style>
        <div className="sp-state">
          <div className="sp-state-icon">🔐</div>
          <div className="sp-state-title">Connexion requise</div>
          <div className="sp-state-sub">Connecte-toi pour voir tes titres likés.</div>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="sp-root">
        <style>{styles}</style>
        <div className="sp-state">
          <div className="sp-state-icon">⏳</div>
          <div className="sp-state-sub">Chargement en cours...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="sp-root">
        <style>{styles}</style>
        <div className="sp-state">
          <div className="sp-state-icon">⚠️</div>
          <div className="sp-state-title">Erreur</div>
          <div className="sp-state-sub">{error.message}</div>
        </div>
      </div>
    );

  const allTracks = data?.likedTracks || [];
  const filtered = search
    ? allTracks.filter(
        (l) =>
          l.track.title.toLowerCase().includes(search.toLowerCase()) ||
          l.track.artist?.name?.toLowerCase().includes(search.toLowerCase()) ||
          l.track.album?.title?.toLowerCase().includes(search.toLowerCase())
      )
    : allTracks;

  return (
    <div className="sp-root">
      <style>{styles}</style>

      {/* HEADER */}
      <div className="sp-header">
        <div className="sp-header-top">
          <div className="sp-cover">❤️</div>
          <div>
            <div className="sp-header-label">Playlist</div>
            <div className="sp-header-title">Titres likés</div>
            <div className="sp-header-meta">
              <strong>{allTracks.length}</strong> titres
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="sp-controls">
        <button className="sp-btn-play" title="Lecture">▶</button>
        <button className="sp-btn-icon" title="Aléatoire">⇄</button>
        <button className="sp-btn-icon" title="Plus">•••</button>
        <div className="sp-search">
          <span className="sp-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher dans les titres likés"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE HEADER */}
      <div className="sp-table-header">
        <span>#</span>
        <span>Titre</span>
        <span>Album</span>
        <span style={{ textAlign: "center" }}>Ajouté le</span>
        <span style={{ textAlign: "center" }}>Rang</span>
        <span style={{ textAlign: "right" }}>Durée</span>
      </div>

      {/* TRACKS */}
      <div className="sp-tracks">
        {filtered.length === 0 && (
          <div className="sp-state">
            <div className="sp-state-icon">💔</div>
            <div className="sp-state-title">
              {search ? "Aucun résultat" : "Aucun titre liké"}
            </div>
            <div className="sp-state-sub">
              {search
                ? `Aucun titre ne correspond à "${search}"`
                : "Les titres que vous aimez apparaîtront ici."}
            </div>
          </div>
        )}

        {filtered.map((l, i) => {
          const t = l.track;
          return (
            <div key={l.id} className="sp-track-row">
              <div className="sp-track-num">{i + 1}</div>

              <div className="sp-track-info">
                {t.album?.cover_medium ? (
                  <img
                    className="sp-track-thumb"
                    src={t.album.cover_medium}
                    alt={t.title}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                ) : (
                  <div className="sp-track-thumb-ph">🎵</div>
                )}
                <div className="sp-track-text">
                  <div className="sp-track-title">
                    {t.explicit_lyrics && (
                      <span className="sp-explicit">E</span>
                    )}
                    {t.title}
                  </div>
                  <div className="sp-track-artist">{t.artist?.name}</div>
                </div>
              </div>

              <div className="sp-track-album">{t.album?.title || "—"}</div>
              <div className="sp-track-date">{formatDate(l.createdAt)}</div>
              <div className="sp-track-rank">{formatRank(t.rank)}</div>

              <div className="sp-track-actions">
                <span className="sp-track-duration">
                  {formatDuration(t.duration)}
                </span>
                <button
                  className="sp-unlike-btn"
                  title="Retirer des likés"
                  onClick={() =>
                    unlikeTrack({ variables: { trackId: t.id } })
                  }
                >
                  ♥
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}