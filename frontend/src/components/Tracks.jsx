import React, { useState } from 'react';
import { gql, useQuery, useMutation, useSubscription, ApolloClient, InMemoryCache } from '@apollo/client';

// ============================================================
// STYLES GLOBAUX INJECTÉS
// ============================================================
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Circular+Std:wght@400;500;700&family=DM+Sans:wght@400;500;600;700&display=swap');

  .sp-root {
    --sp-green: #1DB954;
    --sp-green-dim: #1aa34a;
    --sp-black: #121212;
    --sp-surface: #181818;
    --sp-surface2: #282828;
    --sp-surface3: #333333;
    --sp-text: #FFFFFF;
    --sp-text-sub: #B3B3B3;
    --sp-text-muted: #6A6A6A;
    --sp-pink: #E75480;
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

  .sp-btn-primary  { background: var(--sp-green); color: #000; }
  .sp-btn-primary:hover:not(:disabled)  { background: #1ed760; }

  .sp-btn-ghost    { background: transparent; color: var(--sp-text); border: 1px solid var(--sp-surface3); }
  .sp-btn-ghost:hover:not(:disabled)    { border-color: var(--sp-text); }

  .sp-btn-danger   { background: transparent; color: var(--sp-red); border: 1px solid rgba(241,94,108,.4); font-size: 0.75rem; padding: 0.4rem 0.9rem; }
  .sp-btn-danger:hover { background: rgba(241,94,108,.1); }

  .sp-btn-like {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    padding: 4px 8px;
    border-radius: 50%;
    transition: transform 0.15s ease, opacity 0.15s;
    opacity: 0.7;
  }
  .sp-btn-like:hover { transform: scale(1.25); opacity: 1; }
  .sp-btn-like.liked { opacity: 1; }

  .sp-top-panel {
    background: var(--sp-surface);
    border: 1px solid var(--sp-surface3);
    border-radius: var(--sp-radius);
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    animation: sp-fadein 0.2s ease;
  }
  .sp-top-panel h4 {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--sp-text-sub);
    margin: 0 0 1rem;
  }
  .sp-top-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.5rem;
    border-radius: 4px;
    transition: background 0.15s;
  }
  .sp-top-row:hover { background: var(--sp-surface2); }
  .sp-top-num  { color: var(--sp-text-muted); font-size: 0.85rem; min-width: 22px; text-align: right; font-variant-numeric: tabular-nums; }
  .sp-top-name { flex: 1; font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .sp-top-meta { font-size: 0.78rem; color: var(--sp-text-sub); }
  .sp-top-rank { font-size: 0.75rem; color: var(--sp-green); font-weight: 600; }

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
  .sp-form-row  { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
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
  .sp-form-group input:focus,
  .sp-form-group select:focus { border-color: var(--sp-green); }
  .sp-form-group input[readonly] { opacity: 0.5; cursor: not-allowed; }
  .sp-form-group input::placeholder { color: var(--sp-text-muted); }
  .sp-form-group select option { background: var(--sp-surface2); }

  .sp-new-album-panel {
    background: var(--sp-surface2);
    border: 1px solid var(--sp-green);
    border-radius: var(--sp-radius);
    padding: 1.25rem;
    margin-top: 0.75rem;
    animation: sp-fadein 0.2s ease;
  }
  .sp-new-album-panel .sp-new-album-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  .sp-new-album-panel .sp-new-album-title {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--sp-green);
  }
  .sp-btn-cancel-album {
    background: transparent;
    border: none;
    color: var(--sp-text-muted);
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    transition: color 0.15s;
  }
  .sp-btn-cancel-album:hover { color: var(--sp-text); }
  .sp-btn-sm {
    font-size: 0.75rem;
    padding: 0.4rem 0.9rem;
  }
  .sp-album-preview {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: rgba(29,185,84,.08);
    border: 1px solid rgba(29,185,84,.25);
    border-radius: 6px;
    margin-top: 0.75rem;
    font-size: 0.82rem;
  }
  .sp-album-preview img {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    object-fit: cover;
  }
  .sp-album-preview-placeholder {
    width: 36px;
    height: 36px;
    border-radius: 4px;
    background: var(--sp-surface3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
  }
  .sp-album-preview-info strong { display: block; font-weight: 600; }
  .sp-album-preview-info span { color: var(--sp-text-sub); font-size: 0.75rem; }

  .sp-checkbox-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; }
  .sp-checkbox-row input[type=checkbox] { accent-color: var(--sp-green); width: 16px; height: 16px; }
  .sp-checkbox-row label { font-size: 0.85rem; color: var(--sp-text-sub); }

  .sp-select-with-action {
    display: flex;
    gap: 0.5rem;
    align-items: stretch;
  }
  .sp-select-with-action select { flex: 1; }

  .sp-live-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--sp-green);
    padding: 0.2rem 0.55rem;
    border: 1px solid rgba(29,185,84,.35);
    border-radius: 500px;
    background: rgba(29,185,84,.08);
  }
  .sp-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--sp-green);
    animation: sp-pulse 1.4s ease-in-out infinite;
  }
  @keyframes sp-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.75); }
  }

  .sp-toast {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    background: var(--sp-surface);
    border: 1px solid var(--sp-green);
    border-radius: var(--sp-radius);
    padding: 0.75rem 1rem;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--sp-text);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: 0 8px 32px rgba(0,0,0,.6);
    z-index: 999;
    animation: sp-toastin 0.3s ease;
    max-width: 320px;
  }
  .sp-toast-delete {
    border-color: var(--sp-red);
  }
  .sp-toast-like {
    border-color: var(--sp-pink);
  }
  @keyframes sp-toastin {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sp-card-new {
    outline: 1.5px solid var(--sp-green);
    outline-offset: -1px;
  }
  .sp-card-new::after {
    content: 'NOUVEAU';
    position: absolute;
    top: 8px;
    left: 8px;
    background: var(--sp-green);
    color: #000;
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 2px 6px;
    border-radius: 3px;
  }

  .sp-card-deleting {
    opacity: 0.4;
    pointer-events: none;
    transform: scale(0.97);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .sp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .sp-card {
    background: var(--sp-surface);
    border-radius: var(--sp-radius);
    padding: 1rem;
    transition: background 0.2s ease, transform 0.2s ease;
    cursor: default;
    position: relative;
    overflow: hidden;
  }
  .sp-card:hover { background: var(--sp-surface2); transform: translateY(-2px); }
  .sp-card:hover .sp-card-play { opacity: 1; transform: translateY(0); }

  .sp-card-cover {
    width: 100%; aspect-ratio: 1; object-fit: cover;
    border-radius: 6px; margin-bottom: 0.85rem; display: block;
    box-shadow: 0 8px 24px rgba(0,0,0,.5);
  }
  .sp-card-cover-placeholder {
    width: 100%; aspect-ratio: 1; border-radius: 6px; margin-bottom: 0.85rem;
    background: var(--sp-surface3); display: flex; align-items: center;
    justify-content: center; font-size: 2rem; box-shadow: 0 8px 24px rgba(0,0,0,.5);
  }
  .sp-card-cover-wrap { position: relative; }
  .sp-card-play {
    position: absolute; bottom: 12px; right: 8px;
    width: 40px; height: 40px; background: var(--sp-green);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 1rem; opacity: 0; transform: translateY(6px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    box-shadow: 0 8px 16px rgba(0,0,0,.5); text-decoration: none;
  }
  .sp-card-play:hover { background: #1ed760; transform: translateY(0) scale(1.05); }

  .sp-card-title {
    font-size: 0.92rem; font-weight: 700; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.25rem;
    display: flex; align-items: center; gap: 0.4rem;
  }
  .sp-explicit {
    background: var(--sp-surface3); color: var(--sp-text-sub);
    font-size: 0.55rem; font-weight: 700; letter-spacing: 0.05em;
    padding: 1px 4px; border-radius: 2px; flex-shrink: 0;
  }
  .sp-card-sub { font-size: 0.78rem; color: var(--sp-text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.15rem; }
  .sp-card-meta {
    display: flex; align-items: center; gap: 0.6rem; font-size: 0.72rem;
    color: var(--sp-text-muted); margin: 0.5rem 0 0.75rem; flex-wrap: wrap;
  }
  .sp-card-meta span { display: flex; align-items: center; gap: 0.2rem; }
  .sp-card-meta .sp-rank { color: var(--sp-green); font-weight: 600; }

  .sp-audio { width: 100%; height: 28px; margin-bottom: 0.5rem; accent-color: var(--sp-green); }
  audio::-webkit-media-controls-panel { background: var(--sp-surface3); }

  .sp-deezer-link {
    display: inline-flex; align-items: center; gap: 0.3rem;
    font-size: 0.72rem; font-weight: 600; color: var(--sp-green);
    text-decoration: none; letter-spacing: 0.03em; margin-bottom: 0.5rem;
  }
  .sp-deezer-link:hover { text-decoration: underline; }

  .sp-card-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 0.25rem; }

  .sp-pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding: 1rem 0; }
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
// HELPERS
// ============================================================
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// ============================================================
// QUERIES, MUTATIONS & SUBSCRIPTIONS
// ============================================================

const APP_DATA_QUERY = gql`
query AppData($page: Int, $limit: Int, $withTop: Boolean!) {
  tracks(page: $page, limit: $limit) {
    nodes {
      id title link duration explicit_lyrics preview
      album { id title cover_medium }
      artist { id name }
    }
    totalCount
    pageInfo { hasNextPage hasPreviousPage currentPage totalPages }
  }
  likedTracks { id }
  albums(limit: 100) {
    nodes { id title cover_medium artist { id name } }
  }
  artists(limit: 100) {
    nodes { id name }
  }
  topTracks(limit: 10) @include(if: $withTop) {
    id title rank
    artist { name }
  }
}
`;

const TRACKS_QUERY = gql`
  query Tracks($page: Int, $limit: Int) {
    tracks(page: $page, limit: $limit) {
      nodes {
        id title link cover_medium
        album { id title }
        artist { id name }
        duration rank explicit_lyrics position preview
      }
      totalCount
      pageInfo { hasNextPage hasPreviousPage currentPage totalPages }
    }
  }
`;

const TOP_TRACKS_QUERY = gql`
  query TopTracks($limit: Int) {
    topTracks(limit: $limit) {
      id title rank
      artist { name }
    }
  }
`;

const LIKED_TRACKS_QUERY = gql`
  query LikedTracks {
    likedTracks { id }
  }
`;

const CREATE_TRACK_MUTATION = gql`
  mutation CreateTrack($input: CreateTrackInput!) {
    createTrack(input: $input) { id title }
  }
`;

const DELETE_TRACK_MUTATION = gql`
  mutation DeleteTrack($id: ID!) {
    deleteTrack(id: $id) { success }
  }
`;

const LIKE_TRACK_MUTATION = gql`
  mutation LikeTrack($trackId: ID!) {
    likeTrack(trackId: $trackId) { id track { id } }
  }
`;

const UNLIKE_TRACK_MUTATION = gql`
  mutation UnlikeTrack($trackId: ID!) {
    unlikeTrack(trackId: $trackId) { success }
  }
`;

const ALBUMS_LIST_QUERY = gql`
  query Albums {
    albums(limit: 100) {
      nodes { id title cover_medium artist { id name } }
    }
  }
`;

const ARTISTS_LIST_QUERY = gql`
  query Artists {
    artists(limit: 100) {
      nodes { id name }
    }
  }
`;

const CREATE_ALBUM_MUTATION = gql`
  mutation CreateAlbum($input: CreateAlbumInput!) {
    createAlbum(input: $input) {
      id title cover_medium
      artist { id name }
    }
  }
`;

// ============================================================
// SUBSCRIPTIONS
// ============================================================

// 1. Nouvelle piste ajoutée
const TRACK_ADDED_SUBSCRIPTION = gql`
  subscription TrackAdded {
    trackAdded {
      id title link cover_medium
      album { id title }
      artist { id name }
      duration rank explicit_lyrics position preview
    }
  }
`;

// 2. Piste supprimée — le serveur renvoie juste l'id supprimé
const TRACK_DELETED_SUBSCRIPTION = gql`
  subscription TrackDeleted {
    trackDeleted {
      id
    }
  }
`;

// 3. Like ajouté — le serveur renvoie trackId + userId
const TRACK_LIKED_SUBSCRIPTION = gql`
  subscription TrackLiked {
    trackLiked {
      trackId
    }
  }
`;

// 4. Like retiré
const TRACK_UNLIKED_SUBSCRIPTION = gql`
  subscription TrackUnliked {
    trackUnliked {
      trackId
    }
  }
`;

// ============================================================
// Fragment réutilisé pour l'écriture dans le cache
// ============================================================
const TRACK_FRAGMENT = gql`
  fragment TrackFull on Track {
    id title link cover_medium
    album { id title }
    artist { id name }
    duration rank explicit_lyrics position preview
  }
`;

// ============================================================
// SOUS-COMPOSANT : formulaire nouvel album (inline)
// ============================================================
const EMPTY_ALBUM_FORM = {
  title: '',
  artistId: '',
  release_date: '',
  cover_medium: '',
};

function NewAlbumInlineForm({ artistsData, authHeaders, onAlbumCreated, onCancel }) {
  const [albumForm, setAlbumForm] = useState(EMPTY_ALBUM_FORM);
  const [albumError, setAlbumError] = useState('');

  const [createAlbum, { loading }] = useMutation(CREATE_ALBUM_MUTATION, {
    ...authHeaders,
    onCompleted: (data) => {
      onAlbumCreated(data.createAlbum);
      setAlbumForm(EMPTY_ALBUM_FORM);
      setAlbumError('');
    },
    onError: (err) => setAlbumError(err.message),
  });

  const handleSubmit = () => {
    if (!albumForm.title.trim()) { setAlbumError("Le titre de l'album est requis."); return; }
    if (!albumForm.artistId)    { setAlbumError('Veuillez sélectionner un artiste.'); return; }
    setAlbumError('');
    createAlbum({
      variables: {
        input: {
          title:        albumForm.title.trim(),
          artistId:     albumForm.artistId,
          release_date: albumForm.release_date || undefined,
          cover_medium: albumForm.cover_medium || undefined,
        },
      },
    });
  };

  return (
    <div className="sp-new-album-panel">
      <div className="sp-new-album-header">
        <span className="sp-new-album-title">💿 Nouvel album</span>
        <button className="sp-btn-cancel-album" onClick={onCancel}>✕ Annuler</button>
      </div>

      {albumError && (
        <div className="sp-alert sp-alert-error" style={{ marginBottom: '0.75rem' }}>
          ⚠ {albumError}
        </div>
      )}

      <div className="sp-form-row">
        <div className="sp-form-group">
          <label>Titre *</label>
          <input
            type="text"
            value={albumForm.title}
            onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
            placeholder="Nom de l'album"
          />
        </div>

        <div className="sp-form-group">
          <label>Artiste *</label>
          <select
            value={albumForm.artistId}
            onChange={(e) => setAlbumForm({ ...albumForm, artistId: e.target.value })}
          >
            <option value="">Sélectionner un artiste</option>
            {artistsData?.artists?.nodes?.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="sp-form-row">
        <div className="sp-form-group">
          <label>Date de sortie</label>
          <input
            type="date"
            value={albumForm.release_date}
            onChange={(e) => setAlbumForm({ ...albumForm, release_date: e.target.value })}
          />
        </div>

        <div className="sp-form-group">
          <label>Cover (URL image)</label>
          <input
            type="url"
            value={albumForm.cover_medium}
            onChange={(e) => setAlbumForm({ ...albumForm, cover_medium: e.target.value })}
            placeholder="https://…"
          />
        </div>
      </div>

      {albumForm.cover_medium && (
        <div className="sp-album-preview" style={{ marginBottom: '0.75rem' }}>
          <img src={albumForm.cover_medium} alt="preview" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="sp-album-preview-info">
            <strong>{albumForm.title || '—'}</strong>
            <span>
              {artistsData?.artists?.nodes?.find((a) => a.id === albumForm.artistId)?.name || '—'}
            </span>
          </div>
        </div>
      )}

      <button
        className="sp-btn sp-btn-primary sp-btn-sm"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? '⏳ Création…' : "💿 Créer l'album"}
      </button>
    </div>
  );
}

// ============================================================
// HELPERS cache — réutilisés par mutations ET subscriptions
// ============================================================

/**
 * Insère une piste en tête de la liste paginée dans le cache Apollo.
 * Appelé par : subscription trackAdded.
 */
function cacheInsertTrack(cache, newTrack, page, limit = 5, withTop = false) {
  cache.writeFragment({
    data: newTrack,
    fragment: TRACK_FRAGMENT,
  });

  cache.updateQuery(
    { query: APP_DATA_QUERY, variables: { page, limit, withTop } },
    (existing) => {
      if (!existing?.tracks) return existing;
      if (existing.tracks.nodes.some((t) => t.id === newTrack.id)) return existing;

      return {
        ...existing,
        tracks: {
          ...existing.tracks,
          nodes: [newTrack, ...existing.tracks.nodes].slice(0, limit),
          totalCount: existing.tracks.totalCount + 1,
          pageInfo: {
            ...existing.tracks.pageInfo,
            totalPages: Math.ceil((existing.tracks.totalCount + 1) / limit),
          },
        },
      };
    }
  );
}
/**
 * Retire une piste du cache Apollo par son id.
 * Appelé par : mutation deleteTrack (onCompleted) ET subscription trackDeleted.
 */
function cacheRemoveTrack(cache, trackId, page, limit = 5, withTop = false) {
  cache.evict({ id: cache.identify({ __typename: 'Track', id: trackId }) });
  cache.gc();

  cache.updateQuery(
    { query: APP_DATA_QUERY, variables: { page, limit, withTop } },
    (existing) => {
      if (!existing?.tracks) return existing;

      const filtered = existing.tracks.nodes.filter((t) => t.id !== trackId);
      const newTotal = Math.max(0, existing.tracks.totalCount - 1);

      return {
        ...existing,
        tracks: {
          ...existing.tracks,
          nodes: filtered,
          totalCount: newTotal,
          pageInfo: {
            ...existing.tracks.pageInfo,
            totalPages: Math.ceil(newTotal / limit),
          },
        },
      };
    }
  );
}

/**
 * Ajoute un like dans likedTracks du cache.
 * Appelé par : optimisticResponse likeTrack ET subscription trackLiked.
 */
function cacheAddLike(cache, trackId) {
  cache.updateQuery({ query: LIKED_TRACKS_QUERY }, (existing) => {
    if (!existing?.likedTracks) return existing;
    if (existing.likedTracks.some((t) => t.id === trackId)) return existing;
    return { likedTracks: [...existing.likedTracks, { __typename: 'Track', id: trackId }] };
  });
}

/**
 * Retire un like de likedTracks dans le cache.
 * Appelé par : optimisticResponse unlikeTrack ET subscription trackUnliked.
 */
function cacheRemoveLike(cache, trackId) {
  cache.updateQuery({ query: LIKED_TRACKS_QUERY }, (existing) => {
    if (!existing?.likedTracks) return existing;
    return { likedTracks: existing.likedTracks.filter((t) => t.id !== trackId) };
  });
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function Tracks({ token, userRole }) {
  const [page, setPage]                   = useState(1);
  const [showForm, setShowForm]           = useState(false);
  const [showTopTracks, setShowTopTracks] = useState(false);
  const [showNewAlbumForm, setShowNewAlbumForm] = useState(false);

  const [newTrackIds, setNewTrackIds]   = useState(new Set());
  const [deletingIds, setDeletingIds]   = useState(new Set());
  const [toast, setToast]               = useState(null); // { message, type }

  const [formData, setFormData] = useState({
    title: '',
    albumId: '',
    artistId: '',
    duration: '',
    preview: '',
    link: '',
    explicit_lyrics: false,
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const LIMIT = 5;

  // ---- Helper toast ----
  const showToast = (message, type = 'add') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const authHeaders = { context: { headers: { authorization: `Bearer ${token}` } } };

  // ---- Query principale ----


  const { data, loading, error: queryError } = useQuery(APP_DATA_QUERY, {
    variables: { page, limit: LIMIT, withTop: showTopTracks },
    ...authHeaders,
    fetchPolicy: 'cache-and-network',
  });

  const { data: topTracksData } = useQuery(TOP_TRACKS_QUERY, {
    variables: { limit: 10 },
    skip: !showTopTracks,
    ...authHeaders,
  });

  const { data: likedData } = useQuery(LIKED_TRACKS_QUERY, {
    ...authHeaders,
    skip: !token,
  });

  const { data: albumsData, refetch: refetchAlbums } = useQuery(ALBUMS_LIST_QUERY, authHeaders);
  const { data: artistsData } = useQuery(ARTISTS_LIST_QUERY, authHeaders);

  // ============================================================
  // MUTATION : createTrack
  // La subscription trackAdded gère la mise à jour du cache —
  // on ne touche pas au cache ici pour éviter les doublons.
  // ============================================================
  const [createTrack, { loading: createLoading }] = useMutation(CREATE_TRACK_MUTATION, {
    ...authHeaders,
    onCompleted: () => {
      setFormData({
        title: '', albumId: '', artistId: '', duration: '',
        position: '', explicit_lyrics: false, rank: '', preview: '', link: '',
      });
      setShowForm(false);
      setShowNewAlbumForm(false);
      setSuccess('Piste créée avec succès !');
      // Pas de refetch : trackAdded subscription met à jour le cache
    },
    onError: (err) => setError(err.message),
  });

  // ============================================================
  // MUTATION : deleteTrack
  // ➜ cache.modify dans update() : retire immédiatement la carte
  // ➜ subscription trackDeleted : propage la suppression aux autres clients
  // ➜ Plus de refetch()
  // ============================================================
  const [deleteTrack] = useMutation(DELETE_TRACK_MUTATION, {
    ...authHeaders,
    update(cache, _result, { variables }) {
      cacheRemoveTrack(cache, variables.id, page, LIMIT, showTopTracks);
    },
    onCompleted: (_data, { variables }) => {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(variables.id);
        return next;
      });
      setSuccess('Piste supprimée.');
      // Pas de refetch()
    },
    onError: (err) => {
      setError(err.message);
      // Retire le flag "suppression en cours" si erreur
      setDeletingIds(new Set());
    },
  });

  // ============================================================
  // MUTATION : likeTrack
  // ➜ optimisticResponse : met à jour l'UI avant la réponse serveur
  // ➜ update cache : synchronise likedTracks
  // ➜ subscription trackLiked : propage aux autres clients
  // ➜ Plus de refetchLiked()
  // ============================================================
  const [likeTrack] = useMutation(LIKE_TRACK_MUTATION, {
    ...authHeaders,
    // Réponse optimiste immédiate — shape doit correspondre au type retourné
    optimisticResponse: ({ trackId }) => ({
      likeTrack: {
        __typename: 'Like',
        id: `optimistic-like-${trackId}`,
        track: { __typename: 'Track', id: trackId },
      },
    }),
    // Mise à jour du cache avec la réponse optimiste OU la vraie réponse
    update(cache, { data: { likeTrack: likeResult } }) {
      cacheAddLike(cache, likeResult.track.id);
    },
    onError: (err) => {
      setError(err.message);
      // Le cache optimiste est automatiquement rollback par Apollo en cas d'erreur
    },
  });

  // ============================================================
  // MUTATION : unlikeTrack
  // ➜ optimisticResponse : retire le like de l'UI instantanément
  // ➜ update cache : synchronise likedTracks
  // ➜ subscription trackUnliked : propage aux autres clients
  // ➜ Plus de refetchLiked()
  // ============================================================
  const [unlikeTrack] = useMutation(UNLIKE_TRACK_MUTATION, {
    ...authHeaders,
    optimisticResponse: { unlikeTrack: { __typename: 'UnlikeResult', success: true } },
    update(cache, _result, { variables }) {
      cacheRemoveLike(cache, variables.trackId);
    },
    onError: (err) => {
      setError(err.message);
      // Rollback automatique Apollo
    },
  });

  // ============================================================
  // SUBSCRIPTION 1 : trackAdded
  // Insère la nouvelle piste dans le cache + badge + toast
  // ============================================================
  useSubscription(TRACK_ADDED_SUBSCRIPTION, {
    ...authHeaders,
    onData: ({ client, data: subData }) => {
      const newTrack = subData?.data?.trackAdded;
      if (!newTrack || !newTrack.id) return; // guard contre null serveur
      
      cacheInsertTrack(client.cache, newTrack, page, LIMIT, showTopTracks);
      setNewTrackIds((prev) => new Set([...prev, newTrack.id]));
      setTimeout(() => {
        setNewTrackIds((prev) => {
          const next = new Set(prev);
          next.delete(newTrack.id);
          return next;
        });
      }, 8000);
      showToast(`🎵 "${newTrack.title}" — ${newTrack.artist?.name}`, 'add');
    },
  });

  // ============================================================
  // SUBSCRIPTION 2 : trackDeleted
  // Retire la piste du cache sur TOUS les clients connectés
  // (y compris celui qui a déclenché la suppression, en double-sécurité)
  // ============================================================
  useSubscription(TRACK_DELETED_SUBSCRIPTION, {
    ...authHeaders,
    onData: ({ client, data: subData }) => {
      const deletedId = subData?.data?.trackDeleted?.id;
      if (!deletedId) return;
  
      cacheRemoveTrack(client.cache, deletedId, page, LIMIT, showTopTracks);
      showToast(`🗑 Piste supprimée`, 'delete');
    },
  });

// ============================================================
// SUBSCRIPTIONS (VERSION CORRIGÉE - sans authHeaders)
// ============================================================

// ✅ UNE SEULE FOIS chaque subscription, SANS authHeaders

useSubscription(TRACK_ADDED_SUBSCRIPTION, {
  onData: ({ client, data: subData }) => {
    const newTrack = subData?.data?.trackAdded;
    if (!newTrack?.id) return;
    cacheInsertTrack(client.cache, newTrack, page, LIMIT, showTopTracks);
    setNewTrackIds((prev) => new Set([...prev, newTrack.id]));
    setTimeout(() => {
      setNewTrackIds((prev) => {
        const next = new Set(prev);
        next.delete(newTrack.id);
        return next;
      });
    }, 8000);
    showToast(`🎵 "${newTrack.title}" — ${newTrack.artist?.name || 'Artiste inconnu'}`, 'add');
  },
});

useSubscription(TRACK_DELETED_SUBSCRIPTION, {
  onData: ({ client, data: subData }) => {
    const deletedId = subData?.data?.trackDeleted?.id;
    if (!deletedId) return;
    cacheRemoveTrack(client.cache, deletedId, page, LIMIT, showTopTracks);
    showToast('🗑 Piste supprimée', 'delete');
  },
});

useSubscription(TRACK_LIKED_SUBSCRIPTION, {
  skip: !token,
  onData: ({ client, data: subData }) => {
    const trackId = subData?.data?.trackLiked?.trackId;
    if (trackId) cacheAddLike(client.cache, trackId);
  },
});

useSubscription(TRACK_UNLIKED_SUBSCRIPTION, {
  skip: !token,
  onData: ({ client, data: subData }) => {
    const trackId = subData?.data?.trackUnliked?.trackId;
    if (trackId) cacheRemoveLike(client.cache, trackId);
  },
});

  // ---- Helpers form ----
  const likedIds = new Set((likedData?.likedTracks || []).map((t) => t.id));

  const handleLikeToggle = (track) => {
    likedIds.has(track.id)
      ? unlikeTrack({ variables: { trackId: track.id } })
      : likeTrack({ variables: { trackId: track.id } });
  };

  const handleDelete = (track) => {
    if (!window.confirm(`Supprimer "${track.title}" ?`)) return;
    setDeletingIds((prev) => new Set([...prev, track.id]));
    deleteTrack({ variables: { id: track.id } });
  };

  const handleAlbumChange = (albumId) => {
    if (albumId === '__new__') {
      setShowNewAlbumForm(true);
      setFormData({ ...formData, albumId: '', artistId: '' });
      return;
    }
    setShowNewAlbumForm(false);
    const album = albumsData?.albums?.nodes?.find((a) => a.id === albumId);
    setFormData({ ...formData, albumId, artistId: album?.artist?.id || '' });
  };

  const handleAlbumCreated = async (newAlbum) => {
    await refetchAlbums();
    setFormData((prev) => ({
      ...prev,
      albumId:  newAlbum.id,
      artistId: newAlbum.artist?.id || '',
    }));
    setShowNewAlbumForm(false);
    setSuccess(`Album "${newAlbum.title}" créé et sélectionné !`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTrack({
      variables: {
        input: {
          title:          formData.title,
          albumId:        formData.albumId,
          artistId:       formData.artistId,
          duration:       formData.duration ? parseInt(formData.duration, 10) : undefined,
          explicit_lyrics: formData.explicit_lyrics,
          preview:        formData.preview || undefined,
          link:           formData.link    || undefined,
        },
      },
    });
  };

  const selectedAlbum = albumsData?.albums?.nodes?.find((a) => a.id === formData.albumId);

  // ---- Rendu ----
  if (loading) return (
    <div className="sp-root" style={{ padding: 0 }}>
      <style>{styles}</style>
      <div className="sp-loading"><div className="sp-spinner" /> Chargement des pistes…</div>
    </div>
  );
  if (queryError) return (
    <div className="sp-root">
      <style>{styles}</style>
      <div className="sp-alert sp-alert-error">❌ {queryError.message}</div>
    </div>
  );

  const tracks    = data?.tracks?.nodes    || [];
  const pageInfo  = data?.tracks?.pageInfo || {};
  const topTracks = topTracksData?.topTracks || [];

  // Classe et couleur du toast selon le type d'événement
  const toastClass = toast?.type === 'delete'
    ? 'sp-toast sp-toast-delete'
    : toast?.type === 'like'
      ? 'sp-toast sp-toast-like'
      : 'sp-toast';

  return (
    <div className="sp-root">
      <style>{styles}</style>

      {/* ---- Toast subscription ---- */}
      {toast && (
        <div className={toastClass}>
          <span style={{
            color: toast.type === 'delete' ? 'var(--sp-red)' : 'var(--sp-green)',
          }}>
            {toast.type === 'delete' ? '🔴' : '🟢'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      <h2 className="sp-heading">
        🎵 Pistes
        <span className="sp-live-badge">
          <span className="sp-live-dot" />
          Live
        </span>
      </h2>

      {error   && <div className="sp-alert sp-alert-error">⚠ {error}</div>}
      {success && <div className="sp-alert sp-alert-success">✓ {success}</div>}

      {/* ---- Toolbar ---- */}
      <div className="sp-toolbar">
        <button
          className="sp-btn sp-btn-ghost"
          onClick={() => setShowTopTracks(!showTopTracks)}
        >
          {showTopTracks ? '✕ Masquer' : '🏆 Top Pistes'}
        </button>

        {userRole === 'admin' && (
          <button
            className={showForm ? 'sp-btn sp-btn-ghost' : 'sp-btn sp-btn-primary'}
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) setShowNewAlbumForm(false);
            }}
          >
            {showForm ? '✕ Annuler' : '+ Ajouter une piste'}
          </button>
        )}
      </div>

      {/* ---- Top Tracks ---- */}
      {showTopTracks && (
        <div className="sp-top-panel">
          <h4>Top 10 — par rang de popularité</h4>
          {topTracks.map((track, idx) => (
            <div key={track.id} className="sp-top-row">
              <span className="sp-top-num">{idx + 1}</span>
              <span className="sp-top-name">{track.title}</span>
              <span className="sp-top-meta">{track.artist?.name}</span>
              <span className="sp-top-rank">★ {track.rank?.toLocaleString('fr-FR') ?? '—'}</span>
            </div>
          ))}
        </div>
      )}

      {/* ---- Formulaire création piste ---- */}
      {userRole === 'admin' && showForm && (
        <div className="sp-form-panel">
          <h4>Ajouter une nouvelle piste</h4>
          <form onSubmit={handleSubmit}>

            <div className="sp-form-row">
              <div className="sp-form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nom de la piste"
                  required
                />
              </div>

              <div className="sp-form-group">
                <label>Album *</label>
                <select
                  value={showNewAlbumForm ? '__new__' : formData.albumId}
                  onChange={(e) => handleAlbumChange(e.target.value)}
                  required={!showNewAlbumForm}
                >
                  <option value="">Sélectionner un album</option>
                  {albumsData?.albums?.nodes?.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.title} — {album.artist?.name}
                    </option>
                  ))}
                  <option value="__new__" style={{ color: '#1DB954', fontWeight: 700 }}>
                    ＋ Créer un nouvel album…
                  </option>
                </select>

                {selectedAlbum && !showNewAlbumForm && (
                  <div className="sp-album-preview">
                    {selectedAlbum.cover_medium
                      ? <img src={selectedAlbum.cover_medium} alt={selectedAlbum.title} />
                      : <div className="sp-album-preview-placeholder">💿</div>
                    }
                    <div className="sp-album-preview-info">
                      <strong>{selectedAlbum.title}</strong>
                      <span>{selectedAlbum.artist?.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showNewAlbumForm && (
              <NewAlbumInlineForm
                artistsData={artistsData}
                authHeaders={authHeaders}
                onAlbumCreated={handleAlbumCreated}
                onCancel={() => {
                  setShowNewAlbumForm(false);
                  setFormData({ ...formData, albumId: '', artistId: '' });
                }}
              />
            )}

            {formData.artistId && !showNewAlbumForm && (
              <div className="sp-form-row">
                <div className="sp-form-group">
                  <label>Artiste (déduit de l'album)</label>
                  <input
                    type="text"
                    value={
                      albumsData?.albums?.nodes?.find((a) => a.artist?.id === formData.artistId)?.artist?.name
                      || formData.artistId
                    }
                    readOnly
                  />
                </div>
              </div>
            )}

            <div className="sp-form-row">
              <div className="sp-form-group">
                <label>Durée (sec.)</label>
                <input type="number" min="0" value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="ex : 214" />
              </div>
              <div className="sp-form-group">
                <label>Position (album)</label>
                <input type="number" min="1" value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="ex : 3" />
              </div>
              <div className="sp-form-group">
                <label>Rang (popularité)</label>
                <input type="number" min="0" value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  placeholder="ex : 850000" />
              </div>
            </div>

            <div className="sp-form-row">
              <div className="sp-form-group">
                <label>URL Preview (30 s)</label>
                <input type="url" value={formData.preview}
                  onChange={(e) => setFormData({ ...formData, preview: e.target.value })}
                  placeholder="https://…" />
              </div>
              <div className="sp-form-group">
                <label>Lien Deezer</label>
                <input type="url" value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://www.deezer.com/track/…" />
              </div>
            </div>

            <div className="sp-checkbox-row">
              <input
                type="checkbox" id="explicit_lyrics"
                checked={formData.explicit_lyrics}
                onChange={(e) => setFormData({ ...formData, explicit_lyrics: e.target.checked })}
              />
              <label htmlFor="explicit_lyrics">Contenu explicite</label>
            </div>

            <button
              type="submit"
              className="sp-btn sp-btn-primary"
              disabled={createLoading || showNewAlbumForm || !formData.albumId}
              title={showNewAlbumForm ? "Terminez d'abord la création de l'album" : ''}
            >
              {createLoading ? '⏳ Création…' : '+ Créer la piste'}
            </button>
            {showNewAlbumForm && (
              <span style={{ marginLeft: '0.75rem', fontSize: '0.78rem', color: 'var(--sp-text-muted)' }}>
                ← Créez d'abord l'album ci-dessus
              </span>
            )}
          </form>
        </div>
      )}

      {/* ---- Grille de pistes ---- */}
      <div className="sp-grid">
        {tracks.map((track) => {
          const isLiked    = likedIds.has(track.id);
          const isNew      = newTrackIds.has(track.id);
          const isDeleting = deletingIds.has(track.id);
          return (
            <div
              key={track.id}
              className={[
                'sp-card',
                isNew      ? 'sp-card-new'      : '',
                isDeleting ? 'sp-card-deleting' : '',
              ].filter(Boolean).join(' ')}
            >
              <div className="sp-card-cover-wrap">
                {track.album?.cover_medium
                  ? <img src={track.album.cover_medium} alt={track.title} className="sp-card-cover" />
                  : <div className="sp-card-cover-placeholder">🎵</div>
                }
                {track.link && (
                  <a href={track.link} target="_blank" rel="noreferrer" className="sp-card-play" title="Écouter sur Deezer">▶</a>
                )}
              </div>

              <div className="sp-card-title">
                {track.explicit_lyrics && <span className="sp-explicit">E</span>}
                {track.title}
              </div>
              <div className="sp-card-sub">🎤 {track.artist?.name}</div>
              <div className="sp-card-sub">💿 {track.album?.title}</div>

              <div className="sp-card-meta">
                {track.position && <span>#{track.position}</span>}
                <span>⏱ {formatDuration(track.duration)}</span>
                {track.rank && <span className="sp-rank">★ {track.rank.toLocaleString('fr-FR')}</span>}
              </div>

              {track.preview && (
                <audio controls src={track.preview} className="sp-audio" />
              )}

              <div className="sp-card-actions">
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {token && (
                    <button
                      className={`sp-btn-like${isLiked ? ' liked' : ''}`}
                      onClick={() => handleLikeToggle(track)}
                      title={isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      {isLiked ? '❤️' : '🤍'}
                    </button>
                  )}
                  {track.link && (
                    <a href={track.link} target="_blank" rel="noreferrer" className="sp-deezer-link">
                      Deezer ↗
                    </a>
                  )}
                </div>
                {userRole === 'admin' && (
                  <button
                    className="sp-btn sp-btn-danger"
                    onClick={() => handleDelete(track)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? '⏳' : '🗑'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tracks.length === 0 && (
        <div className="sp-empty">Aucune piste trouvée</div>
      )}

      {/* ---- Pagination ---- */}
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