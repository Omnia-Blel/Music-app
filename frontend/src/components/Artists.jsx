import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

// ============================================================
// STYLES
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  .sp-root {
    --sp-green: #1DB954;
    --sp-green-hover: #1ed760;
    --sp-black: #121212;
    --sp-surface: #181818;
    --sp-surface2: #282828;
    --sp-surface3: #333333;
    --sp-text: #FFFFFF;
    --sp-text-sub: #B3B3B3;
    --sp-text-muted: #6A6A6A;
    --sp-red: #F15E6C;
    --sp-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    background: var(--sp-black);
    color: var(--sp-text);
    min-height: 100vh;
    padding: 2rem;
  }

  .sp-heading {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.5px;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sp-alert {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: var(--sp-radius);
    font-size: 0.85rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }
  .sp-alert-error   { background: rgba(241,94,108,.15); border: 1px solid rgba(241,94,108,.4); color: #F15E6C; }
  .sp-alert-success { background: rgba(29,185,84,.12);  border: 1px solid rgba(29,185,84,.35); color: var(--sp-green); }

  .sp-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .sp-btn {
    border: none;
    border-radius: 500px;
    font-family: inherit;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    padding: 0.55rem 1.2rem;
    transition: transform 0.1s ease, background 0.15s ease, opacity 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .sp-btn:active { transform: scale(0.96); }
  .sp-btn:disabled { opacity: 0.35; cursor: default; }
  .sp-btn-primary { background: var(--sp-green); color: #000; }
  .sp-btn-primary:hover:not(:disabled) { background: var(--sp-green-hover); }
  .sp-btn-ghost { background: transparent; color: var(--sp-text); border: 1px solid var(--sp-surface3); }
  .sp-btn-ghost:hover:not(:disabled) { border-color: var(--sp-text); }
  .sp-btn-danger { background: transparent; color: var(--sp-red); border: 1px solid rgba(241,94,108,.4); font-size: 0.75rem; padding: 0.4rem 0.9rem; }
  .sp-btn-danger:hover:not(:disabled) { background: rgba(241,94,108,.1); }

  .sp-form-panel {
    background: var(--sp-surface);
    border: 1px solid var(--sp-surface3);
    border-radius: var(--sp-radius);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    animation: sp-fadein 0.2s ease;
  }
  .sp-form-panel h4 {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--sp-text-sub);
    margin: 0 0 1.25rem;
  }
  .sp-form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
  .sp-form-group { display: flex; flex-direction: column; gap: 0.4rem; }
  .sp-form-group label { font-size: 0.72rem; font-weight: 600; color: var(--sp-text-sub); text-transform: uppercase; letter-spacing: 0.08em; }
  .sp-form-group input,
  .sp-form-group select {
    background: var(--sp-surface2);
    border: 1px solid var(--sp-surface3);
    border-radius: 6px;
    color: var(--sp-text);
    font-family: inherit;
    font-size: 0.88rem;
    padding: 0.55rem 0.75rem;
    outline: none;
    transition: border-color 0.15s;
  }
  .sp-form-group input:focus { border-color: var(--sp-green); }
  .sp-form-group input::placeholder { color: var(--sp-text-muted); }

  .sp-checkbox-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; }
  .sp-checkbox-row input[type=checkbox] { accent-color: var(--sp-green); width: 16px; height: 16px; }
  .sp-checkbox-row label { font-size: 0.85rem; color: var(--sp-text-sub); }

  /* ---- Grid artistes ---- */
  .sp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .sp-card {
    background: var(--sp-surface);
    border-radius: var(--sp-radius);
    padding: 1rem;
    transition: background 0.2s ease, transform 0.2s ease;
    position: relative;
    overflow: hidden;
    cursor: pointer;
  }
  .sp-card:hover { background: var(--sp-surface2); transform: translateY(-2px); }
  .sp-card:hover .sp-card-play { opacity: 1; transform: translateY(0); }

  .sp-avatar-wrap { position: relative; margin-bottom: 1rem; }
  .sp-avatar {
    width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 50%;
    display: block; box-shadow: 0 8px 24px rgba(0,0,0,.5);
  }
  .sp-avatar-placeholder {
    width: 100%; aspect-ratio: 1; border-radius: 50%;
    background: var(--sp-surface3);
    display: flex; align-items: center; justify-content: center;
    font-size: 2.5rem; box-shadow: 0 8px 24px rgba(0,0,0,.5);
  }

  .sp-card-play {
    position: absolute; bottom: 6px; right: 6px;
    width: 40px; height: 40px;
    background: var(--sp-green); border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; opacity: 0; transform: translateY(6px);
    transition: opacity 0.2s ease, transform 0.2s ease, background 0.15s;
    box-shadow: 0 8px 16px rgba(0,0,0,.5);
    text-decoration: none; color: #000;
  }
  .sp-card-play:hover { background: var(--sp-green-hover); transform: translateY(0) scale(1.05); }

  .sp-card-name {
    font-size: 0.95rem; font-weight: 700;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 0.3rem; text-align: center;
  }
  .sp-card-type { font-size: 0.75rem; color: var(--sp-text-sub); text-align: center; margin-bottom: 0.75rem; text-transform: capitalize; }
  .sp-card-meta {
    display: flex; align-items: center; justify-content: center;
    gap: 0.75rem; font-size: 0.72rem; color: var(--sp-text-muted);
    margin-bottom: 0.75rem; flex-wrap: wrap;
  }
  .sp-card-meta span { display: flex; align-items: center; gap: 0.2rem; }
  .sp-deezer-link {
    display: flex; align-items: center; justify-content: center;
    gap: 0.3rem; font-size: 0.72rem; font-weight: 600;
    color: var(--sp-green); text-decoration: none;
    letter-spacing: 0.03em; margin-bottom: 0.5rem;
  }
  .sp-deezer-link:hover { text-decoration: underline; }
  .sp-card-actions { display: flex; justify-content: center; margin-top: 0.5rem; }

  /* ---- Vue détail artiste ---- */
  .sp-back-btn {
    background: transparent; border: none; color: var(--sp-text-sub);
    font-family: inherit; font-size: 0.85rem; font-weight: 600;
    cursor: pointer; display: inline-flex; align-items: center;
    gap: 0.5rem; padding: 0; margin-bottom: 2rem;
    transition: color 0.15s;
  }
  .sp-back-btn:hover { color: var(--sp-text); }

  .sp-artist-hero {
    display: flex; align-items: flex-end; gap: 2rem;
    margin-bottom: 2.5rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--sp-surface2);
  }
  .sp-artist-hero-avatar {
    width: 160px; height: 160px; flex-shrink: 0;
    border-radius: 50%; object-fit: cover;
    box-shadow: 0 16px 48px rgba(0,0,0,.6);
  }
  .sp-artist-hero-avatar-placeholder {
    width: 160px; height: 160px; flex-shrink: 0;
    border-radius: 50%; background: var(--sp-surface2);
    display: flex; align-items: center; justify-content: center;
    font-size: 4rem; box-shadow: 0 16px 48px rgba(0,0,0,.6);
  }
  .sp-artist-hero-info { flex: 1; min-width: 0; }
  .sp-artist-hero-label {
    font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--sp-text-sub); margin-bottom: 0.4rem;
  }
  .sp-artist-hero-name {
    font-size: clamp(1.8rem, 4vw, 3rem); font-weight: 700;
    letter-spacing: -1px; margin-bottom: 0.75rem;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .sp-artist-hero-meta {
    display: flex; gap: 1.25rem; flex-wrap: wrap;
    font-size: 0.82rem; color: var(--sp-text-sub);
  }
  .sp-artist-hero-meta span { display: flex; align-items: center; gap: 0.3rem; }

  .sp-big-play {
    width: 56px; height: 56px; border-radius: 50%;
    background: var(--sp-green); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1.75rem;
    transition: background 0.15s, transform 0.1s;
    box-shadow: 0 8px 24px rgba(29,185,84,.35);
  }
  .sp-big-play:hover { background: var(--sp-green-hover); transform: scale(1.05); }

  /* ---- Tracklist ---- */
  .sp-tracklist-header {
    display: grid;
    grid-template-columns: 40px 1fr 140px 80px;
    padding: 0 1rem 0.6rem;
    font-size: 0.7rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--sp-text-muted);
    border-bottom: 1px solid var(--sp-surface2);
    margin-bottom: 0.25rem;
  }
  .sp-track {
    display: grid;
    grid-template-columns: 40px 1fr 140px 80px;
    padding: 0.55rem 1rem;
    border-radius: 6px;
    align-items: center;
    transition: background 0.12s;
    cursor: pointer;
  }
  .sp-track:hover { background: var(--sp-surface2); }
  .sp-track-num { font-size: 0.85rem; color: var(--sp-text-muted); }
  .sp-track-name {
    font-size: 0.9rem; color: var(--sp-text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    display: flex; align-items: center; gap: 0.5rem;
  }
  .sp-track-album {
    font-size: 0.8rem; color: var(--sp-text-sub);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    padding-right: 1rem;
  }
  .sp-track-dur { font-size: 0.82rem; color: var(--sp-text-muted); text-align: right; }
  .sp-explicit {
    background: var(--sp-text-sub); color: var(--sp-black);
    font-size: 0.6rem; font-weight: 700;
    padding: 1px 4px; border-radius: 2px; flex-shrink: 0;
  }

  .sp-tracks-loading {
    display: flex; align-items: center; gap: 0.75rem;
    color: var(--sp-text-sub); font-size: 0.9rem;
    padding: 3rem 0;
  }

  /* ---- Pagination ---- */
  .sp-pagination {
    display: flex; align-items: center; justify-content: center;
    gap: 1rem; padding: 1rem 0;
  }
  .sp-pagination-info { font-size: 0.8rem; color: var(--sp-text-sub); font-variant-numeric: tabular-nums; }

  .sp-empty { text-align: center; color: var(--sp-text-muted); padding: 4rem 0; font-size: 1rem; }

  .sp-loading {
    display: flex; align-items: center; justify-content: center;
    height: 60vh; color: var(--sp-text-sub); font-size: 0.95rem; gap: 0.75rem;
  }
  .sp-spinner {
    width: 20px; height: 20px;
    border: 2px solid var(--sp-surface3);
    border-top-color: var(--sp-green);
    border-radius: 50%;
    animation: sp-spin 0.8s linear infinite;
  }

  @keyframes sp-fadein { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes sp-spin   { to { transform: rotate(360deg); } }
`;

// ============================================================
// HELPER
// ============================================================
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// ============================================================
// QUERIES & MUTATIONS
// ============================================================
const ARTISTS_QUERY = gql`
  query Artists($page: Int, $limit: Int, $filter: ArtistFilter, $sort: ArtistSort) {
    artists(page: $page, limit: $limit, filter: $filter, sort: $sort) {
      nodes {
        id name nb_fan nb_album
        picture_medium tracklist link
      }
      totalCount
      pageInfo { hasNextPage hasPreviousPage currentPage totalPages }
    }
  }
`;

const ARTIST_TRACKS_QUERY = gql`
  query ArtistTracks($artistId: ID!, $page: Int, $limit: Int) {
    artistTracks(artistId: $artistId, page: $page, limit: $limit) {
      nodes {
        id
        title
        duration
        position
        explicit_lyrics
        album {
          id
          title
          cover_small
        }
      }
      totalCount
      pageInfo { hasNextPage hasPreviousPage currentPage totalPages }
    }
  }
`;

const CREATE_ARTIST_MUTATION = gql`
  mutation CreateArtist($input: CreateArtistInput!) {
    createArtist(input: $input) {
      id name nb_fan nb_album picture_medium
    }
  }
`;

const DELETE_ARTIST_MUTATION = gql`
  mutation DeleteArtist($id: ID!) {
    deleteArtist(id: $id) { success message }
  }
`;

// ============================================================
// SOUS-COMPOSANT : Vue tracks d'un artiste
// ============================================================
function ArtistTracksView({ artist, token, onBack }) {
  const [tracksPage, setTracksPage] = useState(1);
  const TRACKS_LIMIT = 15;

  const authHeaders = { context: { headers: { authorization: `Bearer ${token}` } } };

  const { data, loading, error } = useQuery(ARTIST_TRACKS_QUERY, {
    variables: { artistId: artist.id, page: tracksPage, limit: TRACKS_LIMIT },
    ...authHeaders,
  });

  const tracks   = data?.artistTracks?.nodes    || [];
  const pageInfo = data?.artistTracks?.pageInfo || {};
  const total    = data?.artistTracks?.totalCount ?? 0;

  return (
    <>
      {/* Bouton retour */}
      <button className="sp-back-btn" onClick={onBack}>
        ← Retour aux artistes
      </button>

      {/* Hero artiste */}
      <div className="sp-artist-hero">
        {artist.picture_medium
          ? <img src={artist.picture_medium} alt={artist.name} className="sp-artist-hero-avatar" onError={(e) => { e.target.style.display='none'; }} />
          : <div className="sp-artist-hero-avatar-placeholder">🎤</div>
        }
        <div className="sp-artist-hero-info">
          <div className="sp-artist-hero-label">Artiste</div>
          <div className="sp-artist-hero-name">{artist.name}</div>
          <div className="sp-artist-hero-meta">
            <span>💿 {artist.nb_album ?? 0} album{artist.nb_album > 1 ? 's' : ''}</span>
            <span>👥 {artist.nb_fan?.toLocaleString('fr-FR') ?? 0} fans</span>
            {total > 0 && <span>🎵 {total} titre{total > 1 ? 's' : ''}</span>}
          </div>
        </div>
      </div>

      {/* Bouton play décoratif */}
      <button className="sp-big-play" title="Lecture">
        <svg viewBox="0 0 24 24" style={{ fill: '#000', width: 24, height: 24, marginLeft: 3 }}>
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>

      {/* Titres populaires */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
        Titres populaires
      </h3>

      {error && (
        <div className="sp-alert sp-alert-error">❌ {error.message}</div>
      )}

      {loading ? (
        <div className="sp-tracks-loading">
          <div className="sp-spinner" /> Chargement des titres…
        </div>
      ) : tracks.length === 0 ? (
        <div className="sp-empty">Aucun titre disponible pour cet artiste</div>
      ) : (
        <>
          {/* En-tête */}
          <div className="sp-tracklist-header">
            <span>#</span>
            <span>Titre</span>
            <span>Album</span>
            <span style={{ textAlign: 'right' }}>Durée</span>
          </div>

          {/* Lignes */}
          {tracks.map((track, idx) => (
            <div key={track.id} className="sp-track">
              <span className="sp-track-num">
                {track.position ?? (tracksPage - 1) * TRACKS_LIMIT + idx + 1}
              </span>
              <span className="sp-track-name">
                {track.album?.cover_small && (
                  <img
                    src={track.album.cover_small}
                    alt=""
                    style={{ width: 36, height: 36, borderRadius: 4, flexShrink: 0 }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {track.explicit_lyrics && <span className="sp-explicit">E</span>}
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {track.title}
                    </span>
                  </span>
                </span>
              </span>
              <span className="sp-track-album">{track.album?.title ?? '—'}</span>
              <span className="sp-track-dur">{formatDuration(track.duration)}</span>
            </div>
          ))}

          {/* Pagination tracks */}
          {(pageInfo.hasNextPage || pageInfo.hasPreviousPage) && (
            <div className="sp-pagination" style={{ marginTop: '1.5rem' }}>
              <button
                className="sp-btn sp-btn-ghost"
                onClick={() => setTracksPage((p) => p - 1)}
                disabled={!pageInfo.hasPreviousPage}
              >
                ← Précédent
              </button>
              <span className="sp-pagination-info">
                Page {pageInfo.currentPage} / {pageInfo.totalPages}
              </span>
              <button
                className="sp-btn sp-btn-ghost"
                onClick={() => setTracksPage((p) => p + 1)}
                disabled={!pageInfo.hasNextPage}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function Artists({ token, userRole }) {
  const [page, setPage]                 = useState(1);
  const [limit]                         = useState(5);
  const [showForm, setShowForm]         = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null); // objet artiste complet
  const [formData, setFormData]         = useState({
    name: '', link: '', share: '',
    picture: '', picture_small: '', picture_medium: '', picture_big: '', picture_xl: '',
    nb_fan: '', nb_album: '', radio: false, tracklist: '',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const authHeaders = { context: { headers: { authorization: `Bearer ${token}` } } };

  const { data, loading, error: queryError, refetch } = useQuery(ARTISTS_QUERY, {
    variables: { page, limit },
    ...authHeaders,
  });

  const [createArtist, { loading: createLoading }] = useMutation(CREATE_ARTIST_MUTATION, {
    ...authHeaders,
    onCompleted: () => {
      setSuccess('Artiste créé avec succès !');
      setFormData({
        name: '', link: '', share: '',
        picture: '', picture_small: '', picture_medium: '', picture_big: '', picture_xl: '',
        nb_fan: '', nb_album: '', radio: false, tracklist: '',
      });
      setShowForm(false);
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [deleteArtist, { loading: deleteLoading }] = useMutation(DELETE_ARTIST_MUTATION, {
    ...authHeaders,
    onCompleted: () => { setSuccess('Artiste supprimé.'); refetch(); },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createArtist({
      variables: {
        input: {
          name:           formData.name,
          link:           formData.link           || undefined,
          share:          formData.share          || undefined,
          picture:        formData.picture        || undefined,
          picture_small:  formData.picture_small  || undefined,
          picture_medium: formData.picture_medium || undefined,
          picture_big:    formData.picture_big    || undefined,
          picture_xl:     formData.picture_xl     || undefined,
          nb_fan:         formData.nb_fan   ? parseInt(formData.nb_fan,   10) : undefined,
          nb_album:       formData.nb_album ? parseInt(formData.nb_album, 10) : undefined,
          radio:          formData.radio,
          tracklist:      formData.tracklist      || undefined,
        },
      },
    });
  };

  // ---- Loading / Error global ----
  if (loading) return (
    <div className="sp-root">
      <style>{styles}</style>
      <div className="sp-loading"><div className="sp-spinner" /> Chargement des artistes…</div>
    </div>
  );
  if (queryError) return (
    <div className="sp-root">
      <style>{styles}</style>
      <div className="sp-alert sp-alert-error">❌ {queryError.message}</div>
    </div>
  );

  const artists  = data?.artists?.nodes    || [];
  const pageInfo = data?.artists?.pageInfo || {};

  // ---- Vue tracks d'un artiste sélectionné ----
  if (selectedArtist) {
    return (
      <div className="sp-root">
        <style>{styles}</style>
        <ArtistTracksView
          artist={selectedArtist}
          token={token}
          onBack={() => setSelectedArtist(null)}
        />
      </div>
    );
  }

  // ---- Vue liste artistes ----
  return (
    <div className="sp-root">
      <style>{styles}</style>

      <h2 className="sp-heading">🎤 Artistes</h2>

      {error   && <div className="sp-alert sp-alert-error">⚠ {error}</div>}
      {success && <div className="sp-alert sp-alert-success">✓ {success}</div>}

      {/* Toolbar admin */}
      {userRole === 'admin' && (
        <div className="sp-toolbar">
          <button
            className={showForm ? 'sp-btn sp-btn-ghost' : 'sp-btn sp-btn-primary'}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Annuler' : '+ Ajouter un artiste'}
          </button>
        </div>
      )}

      {/* Formulaire création */}
      {userRole === 'admin' && showForm && (
        <div className="sp-form-panel">
          <h4>Ajouter un nouvel artiste</h4>
          <form onSubmit={handleSubmit}>
            <div className="sp-form-row">
              <div className="sp-form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nom de l'artiste"
                  required
                />
              </div>
            </div>
            <div className="sp-form-row">
              <div className="sp-form-group">
                <label>Nombre de fans</label>
                <input type="number" min="0" value={formData.nb_fan}
                  onChange={(e) => setFormData({ ...formData, nb_fan: e.target.value })}
                  placeholder="ex : 1 500 000" />
              </div>
              <div className="sp-form-group">
                <label>Nombre d'albums</label>
                <input type="number" min="0" value={formData.nb_album}
                  onChange={(e) => setFormData({ ...formData, nb_album: e.target.value })}
                  placeholder="ex : 8" />
              </div>
            </div>
            <div className="sp-form-row">
              <div className="sp-form-group">
                <label>Image (medium)</label>
                <input type="url" value={formData.picture_medium}
                  onChange={(e) => setFormData({ ...formData, picture_medium: e.target.value })}
                  placeholder="https://…" />
              </div>
              <div className="sp-form-group">
                <label>Image (XL)</label>
                <input type="url" value={formData.picture_xl}
                  onChange={(e) => setFormData({ ...formData, picture_xl: e.target.value })}
                  placeholder="https://…" />
              </div>
            </div>
            <div className="sp-form-row">
              <div className="sp-form-group">
                <label>Lien Deezer</label>
                <input type="url" value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://www.deezer.com/artist/…" />
              </div>
              <div className="sp-form-group">
                <label>Tracklist URL</label>
                <input type="url" value={formData.tracklist}
                  onChange={(e) => setFormData({ ...formData, tracklist: e.target.value })}
                  placeholder="https://api.deezer.com/artist/…/top" />
              </div>
            </div>
            <div className="sp-checkbox-row">
              <input type="checkbox" id="radio"
                checked={formData.radio}
                onChange={(e) => setFormData({ ...formData, radio: e.target.checked })} />
              <label htmlFor="radio">Radio disponible</label>
            </div>
            <button type="submit" className="sp-btn sp-btn-primary" disabled={createLoading}>
              {createLoading ? '⏳ Création…' : '+ Créer l\'artiste'}
            </button>
          </form>
        </div>
      )}

      {/* Grille artistes */}
      <div className="sp-grid">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="sp-card"
            onClick={() => setSelectedArtist(artist)}
            title={`Voir les titres de ${artist.name}`}
          >
            <div className="sp-avatar-wrap">
              {artist.picture_medium
                ? <img src={artist.picture_medium} alt={artist.name} className="sp-avatar"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                : <div className="sp-avatar-placeholder">🎤</div>
              }
              <span className="sp-card-play" onClick={(e) => e.stopPropagation()}>▶</span>
            </div>

            <div className="sp-card-name">{artist.name}</div>
            <div className="sp-card-type">Artiste</div>

            <div className="sp-card-meta">
              <span>💿 {artist.nb_album ?? 0} album{artist.nb_album > 1 ? 's' : ''}</span>
              <span>👥 {artist.nb_fan?.toLocaleString('fr-FR') ?? 0} fans</span>
            </div>

            {artist.link && (
              <a href={artist.link} target="_blank" rel="noreferrer" className="sp-deezer-link"
                onClick={(e) => e.stopPropagation()}>
                Deezer ↗
              </a>
            )}

            {userRole === 'admin' && (
              <div className="sp-card-actions">
                <button
                  className="sp-btn sp-btn-danger"
                  disabled={deleteLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Supprimer "${artist.name}" ?`))
                      deleteArtist({ variables: { id: artist.id } });
                  }}
                >
                  🗑 Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {artists.length === 0 && (
        <div className="sp-empty">Aucun artiste trouvé</div>
      )}

      {/* Pagination */}
      <div className="sp-pagination">
        <button
          className="sp-btn sp-btn-ghost"
          onClick={() => setPage((p) => p - 1)}
          disabled={!pageInfo.hasPreviousPage}
        >
          ← Précédent
        </button>
        <span className="sp-pagination-info">
          Page {pageInfo.currentPage} / {pageInfo.totalPages}
        </span>
        <button
          className="sp-btn sp-btn-ghost"
          onClick={() => setPage((p) => p + 1)}
          disabled={!pageInfo.hasNextPage}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}