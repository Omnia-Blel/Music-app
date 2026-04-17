import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import Track from "./Track";

// ============================================================
// STYLES
// ============================================================
const styles = `
  .sp-root { background: #121212; border-radius: 12px; padding: 1.5rem; min-height: 500px; color: #fff; font-family: 'Circular', sans-serif; }
  .sp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
  .sp-header h2 { font-size: 22px; font-weight: 700; color: #fff; }
  .sp-btn-create { background: #1DB954; color: #000; border: none; border-radius: 50px; padding: 8px 20px; font-size: 13px; font-weight: 700; cursor: pointer; transition: background .15s; }
  .sp-btn-create:hover { background: #1ed760; }
  .sp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
  .sp-card { background: #181818; border-radius: 8px; padding: 14px; cursor: pointer; transition: background .15s; position: relative; }
  .sp-card:hover { background: #282828; }
  .sp-cover-wrap { position: relative; margin-bottom: 12px; }
  .sp-cover { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; display: block; background: #282828; }
  .sp-cover-placeholder { width: 100%; aspect-ratio: 1; border-radius: 4px; background: #282828; display: flex; align-items: center; justify-content: center; }
  .sp-play-btn { position: absolute; bottom: 8px; right: 8px; width: 40px; height: 40px; border-radius: 50%; background: #1DB954; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; opacity: 0; transform: translateY(6px); transition: opacity .2s, transform .2s; box-shadow: 0 4px 12px rgba(0,0,0,.5); }
  .sp-card:hover .sp-play-btn { opacity: 1; transform: translateY(0); }
  .sp-card-title { font-size: 14px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
  .sp-card-sub { font-size: 12px; color: #A7A7A7; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 8px; }
  .sp-card-meta { display: flex; gap: 6px; flex-wrap: wrap; }
  .sp-badge { font-size: 11px; background: #282828; color: #A7A7A7; padding: 2px 7px; border-radius: 50px; }
  .sp-delete-btn { margin-top: 10px; width: 100%; background: transparent; border: 1px solid #E85D75; color: #E85D75; border-radius: 50px; padding: 5px 0; font-size: 12px; cursor: pointer; transition: background .15s, color .15s; }
  .sp-delete-btn:hover { background: #E85D75; color: #fff; }
  .sp-pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 2rem; }
  .sp-page-btn { background: transparent; border: 1px solid #555; color: #fff; border-radius: 50px; padding: 6px 18px; font-size: 13px; cursor: pointer; transition: border-color .15s; }
  .sp-page-btn:hover:not(:disabled) { border-color: #aaa; }
  .sp-page-btn:disabled { opacity: .3; cursor: default; }
  .sp-page-info { font-size: 13px; color: #A7A7A7; }
  .sp-empty { text-align: center; padding: 3rem; color: #6A6A6A; font-size: 15px; }
  .sp-back-btn { background: transparent; border: none; color: #A7A7A7; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px; margin-bottom: 1.5rem; padding: 0; transition: color .15s; }
  .sp-back-btn:hover { color: #fff; }
  .sp-detail-hero { display: flex; gap: 20px; align-items: flex-end; margin-bottom: 2rem; }
  .sp-detail-cover { width: 160px; height: 160px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: #282828; }
  .sp-detail-cover-placeholder { width: 160px; height: 160px; border-radius: 8px; flex-shrink: 0; background: #282828; display: flex; align-items: center; justify-content: center; }
  .sp-detail-info h3 { font-size: 28px; font-weight: 700; margin-bottom: 6px; }
  .sp-detail-meta { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 8px; font-size: 13px; color: #A7A7A7; }
  .sp-detail-meta .dot { color: #555; }
  .sp-big-play { width: 56px; height: 56px; border-radius: 50%; background: #1DB954; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem; transition: background .15s, transform .1s; }
  .sp-big-play:hover { background: #1ed760; transform: scale(1.05); }
  .sp-track-header { display: grid; grid-template-columns: 30px 1fr 60px; padding: 0 10px 8px; font-size: 11px; color: #6A6A6A; border-bottom: 1px solid #2a2a2a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: .06em; }
  .sp-track { display: grid; grid-template-columns: 30px 1fr 60px; padding: 6px 10px; border-radius: 4px; transition: background .12s; align-items: center; }
  .sp-track:hover { background: #282828; }
  .sp-track-num { font-size: 13px; color: #A7A7A7; }
  .sp-track-name { font-size: 14px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 6px; }
  .sp-track-dur { font-size: 13px; color: #A7A7A7; text-align: right; }
  .sp-explicit { background: #A7A7A7; color: #121212; font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 2px; flex-shrink: 0; }
  .sp-form { background: #181818; border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem; }
  .sp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .sp-form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 14px; }
  .sp-form label { font-size: 11px; color: #A7A7A7; text-transform: uppercase; letter-spacing: .06em; display: block; margin-bottom: 5px; }
  .sp-form input, .sp-form select { width: 100%; background: #282828; border: 1px solid #333; color: #fff; border-radius: 4px; padding: 8px 10px; font-size: 13px; outline: none; transition: border-color .15s; }
  .sp-form input:focus, .sp-form select:focus { border-color: #1DB954; }
  .sp-form select option { background: #282828; }
  .sp-form-actions { display: flex; gap: 10px; }
  .sp-btn-save { background: #1DB954; color: #000; border: none; border-radius: 50px; padding: 8px 22px; font-size: 13px; font-weight: 700; cursor: pointer; }
  .sp-btn-save:hover { background: #1ed760; }
  .sp-btn-save:disabled { opacity: .5; cursor: default; }
  .sp-btn-cancel { background: transparent; border: 1px solid #555; color: #A7A7A7; border-radius: 50px; padding: 8px 22px; font-size: 13px; cursor: pointer; }
  .sp-btn-cancel:hover { border-color: #aaa; color: #fff; }
  .sp-loading { color: #A7A7A7; font-size: 14px; padding: 1.5rem 0; }
  .sp-error { color: #E85D75; font-size: 14px; padding: 1rem; background: #2a1a1a; border-radius: 8px; margin-bottom: 1rem; }
  .sp-success { color: #1DB954; font-size: 14px; padding: 1rem; background: #1a2a1a; border-radius: 8px; margin-bottom: 1rem; }
`;

// ============================================================
// HELPER
// ============================================================
function formatDuration(seconds) {
  const sec = Number(seconds);

  if (seconds === null || seconds === undefined || isNaN(sec)) {
    return '—';
  }

  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function AlbumCover({ src, title, size = '100%' }) {
  const [failed, setFailed] = useState(false);
  const colors = ['#533483','#1a5276','#145a32','#7b241c','#784212','#1f618d'];
  const colorIndex = title ? title.charCodeAt(0) % colors.length : 0;

  if (src && !failed) {
    return (
      <img
        className="sp-cover"
        src={src}
        alt={title}
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className="sp-cover-placeholder"
      style={{ width: size, height: size, background: colors[colorIndex] }}
    >
      <svg viewBox="0 0 24 24" style={{ width: 40, height: 40, fill: '#fff', opacity: 0.4 }}>
        <path d="M12 3v10.55A4 4 0 1014 17V7h4V3z" />
      </svg>
    </div>
  );
}

// ============================================================
// QUERIES & MUTATIONS
// ============================================================
const ALBUMS_QUERY = gql`
  query Albums($page: Int, $limit: Int) {
    albums(page: $page, limit: $limit) {
      nodes {
        id
        title
        artist { id name }
        release_date
        genre_id
        nb_tracks
        cover_medium
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        currentPage
        totalPages
      }
    }
  }
`;

const ALBUM_DETAIL_QUERY = gql`
  query Album($id: ID!) {
    album(id: $id) {
      id
      title
      release_date
      genre_id
      label
      nb_tracks
      tracks {
        id
        title
        duration
        position
        explicit_lyrics
      }
    }
  }
`;

const CREATE_ALBUM_MUTATION = gql`
  mutation CreateAlbum($input: CreateAlbumInput!) {
    createAlbum(input: $input) {
      id
      title
      artist { name }
    }
  }
`;

const DELETE_ALBUM_MUTATION = gql`
  mutation DeleteAlbum($id: ID!) {
    deleteAlbum(id: $id) {
      success
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
// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function Albums({ token, userRole }) {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    artistId: '',
    release_date: '',
    genre_id: '',
    label: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const authHeaders = { context: { headers: { authorization: `Bearer ${token}` } } };

  const { data, loading, error: queryError, refetch } = useQuery(ALBUMS_QUERY, {
    variables: { page, limit: 6 },
    ...authHeaders,
  });

  const { data: artistsData } = useQuery(ARTISTS_LIST_QUERY, authHeaders);

  const { data: albumDetail, loading: albumDetailLoading } = useQuery(ALBUM_DETAIL_QUERY, {
    variables: { id: selectedAlbum },
    skip: !selectedAlbum,
    ...authHeaders,
  });

  const [createAlbum, { loading: createLoading }] = useMutation(CREATE_ALBUM_MUTATION, {
    ...authHeaders,
    onCompleted: () => {
      setSuccess('Album créé avec succès !');
      setFormData({ title: '', artistId: '', release_date: '', genre_id: '', label: '' });
      setShowForm(false);
      refetch();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => setError(err.message),
  });

  const [deleteAlbum] = useMutation(DELETE_ALBUM_MUTATION, {
    ...authHeaders,
    onCompleted: () => {
      setSuccess('Album supprimé !');
      refetch();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createAlbum({
      variables: {
        input: {
          title: formData.title,
          artistId: formData.artistId,
          release_date: formData.release_date || undefined,
          genre_id: formData.genre_id ? parseInt(formData.genre_id, 10) : undefined,
          label: formData.label || undefined,
        },
      },
    });
  };

  if (loading) return <div className="sp-root"><div className="sp-loading">Chargement des albums...</div></div>;
  if (queryError) return <div className="sp-root"><div className="sp-error">Erreur : {queryError.message}</div></div>;


  const albums   = data?.albums?.nodes   || [];
  const pageInfo = data?.albums?.pageInfo || {};

  if (selectedTrack) {
    return (
      <Track
        trackId={selectedTrack}
        token={token}
        onBack={() => setSelectedTrack(null)}
      />
    );
  }
  // ---- Vue détail ----
  if (selectedAlbum) {
    const album = albumDetail?.album;
    return (
      <>
        <style>{styles}</style>
        <div className="sp-root">
          {albumDetailLoading && <div className="sp-loading">Chargement...</div>}
          {album && (
            <>
              <button className="sp-back-btn" onClick={() => setSelectedAlbum(null)}>
                <svg viewBox="0 0 24 24" style={{ fill: 'currentColor', width: 16, height: 16 }}>
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                Retour à la bibliothèque
              </button>

              <div className="sp-detail-hero">
                <AlbumCover src={album.cover_medium} title={album.title} size="160px" />
                <div className="sp-detail-info">
                  <div style={{ fontSize: 11, color: '#A7A7A7', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
                    Album
                  </div>
                  <h3>{album.title}</h3>
                  <div className="sp-detail-meta">
                    {album.release_date && (
                      <><span>{new Date(album.release_date).getFullYear()}</span><span className="dot">•</span></>
                    )}
                    <span>{album.nb_tracks ?? 0} titre{album.nb_tracks > 1 ? 's' : ''}</span>
                    {album.genre_id && <><span className="dot">•</span><span>Genre #{album.genre_id}</span></>}
                    {album.label && <><span className="dot">•</span><span>{album.label}</span></>}
                  </div>
                </div>
              </div>

              <button className="sp-big-play">
                <svg viewBox="0 0 24 24" style={{ fill: '#000', width: 24, height: 24, marginLeft: 3 }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              <div style={{ marginTop: '0.5rem' }}>
                <div className="sp-track-header">
                  <span>#</span>
                  <span>Titre</span>
                  <span style={{ textAlign: 'right' }}>Durée</span>
                </div>
                {album.tracks?.map((track, idx) => (
                  <div
                  key={track.id}
                  className="sp-track"
                  onClick={() => setSelectedTrack(track.id)}
                  style={{ cursor: "pointer" }}
                >
                    <span className="sp-track-num">{track.position ?? idx + 1}</span>
                    <span className="sp-track-name">
                      {track.explicit_lyrics && <span className="sp-explicit">E</span>}
                      {track.title}
                    </span>
                    <span className="sp-track-dur">{formatDuration(track.duration)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </>
    );
  }


  // ---- Vue liste ----
  return (
    <>
      <style>{styles}</style>
      <div className="sp-root">
        {error   && <div className="sp-error">{error}</div>}
        {success && <div className="sp-success">{success}</div>}

        <div className="sp-header">
          <h2>Votre bibliothèque</h2>
          {userRole === 'admin' && (
            <button className="sp-btn-create" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Annuler' : '+ Nouvel album'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="sp-form">
            <div className="sp-form-grid">
              <div className="form-group">
                <label>Titre *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de l'album"
                  required
                />
              </div>
              <div className="form-group">
                <label>Artiste *</label>
                <select
                  value={formData.artistId}
                  onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                  required
                >
                  <option value="">Sélectionner un artiste</option>
                  {artistsData?.artists?.nodes?.map((artist) => (
                    <option key={artist.id} value={artist.id}>{artist.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="sp-form-grid-3">
              <div className="form-group">
                <label>Date de sortie</label>
                <input
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Genre ID</label>
                <input
                  type="number"
                  min="0"
                  value={formData.genre_id}
                  placeholder="ex: 132"
                  onChange={(e) => setFormData({ ...formData, genre_id: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={formData.label}
                  placeholder="Label musical"
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </div>
            </div>
            <div className="sp-form-actions">
              <button type="submit" className="sp-btn-save" disabled={createLoading}>
                {createLoading ? 'Création...' : 'Créer l\'album'}
              </button>
              <button
                type="button"
                className="sp-btn-cancel"
                onClick={() => setShowForm(false)}
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        <div className="sp-grid">
          {albums.map((album) => (
            <div
              key={album.id}
              className="sp-card"
              onClick={() => setSelectedAlbum(album.id)}
            >
              <div className="sp-cover-wrap">
                <AlbumCover src={album.cover_medium} title={album.title} />
                <button className="sp-play-btn" onClick={(e) => e.stopPropagation()}>
                  <svg viewBox="0 0 24 24" style={{ fill: '#000', width: 18, height: 18, marginLeft: 2 }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>

              <div className="sp-card-title">{album.title}</div>
              <div className="sp-card-sub">{album.artist?.name}</div>

              <div className="sp-card-meta">
                {album.release_date && (
                  <span className="sp-badge">{new Date(album.release_date).getFullYear()}</span>
                )}
                <span className="sp-badge">{album.nb_tracks ?? 0} titres</span>
                {album.genre_id && <span className="sp-badge">Genre #{album.genre_id}</span>}
              </div>

              {userRole === 'admin' && (
                <button
                  className="sp-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Supprimer "${album.title}" ?`)) {
                      deleteAlbum({ variables: { id: album.id } });
                    }
                  }}
                >
                  Supprimer
                </button>
              )}
            </div>
          ))}
        </div>

        {albums.length === 0 && (
          <div className="sp-empty">Aucun album dans votre bibliothèque</div>
        )}

        <div className="sp-pagination">
          <button
            className="sp-page-btn"
            onClick={() => setPage((p) => p - 1)}
            disabled={!pageInfo.hasPreviousPage}
          >
            ← Précédent
          </button>
          <span className="sp-page-info">
            Page {pageInfo.currentPage} / {pageInfo.totalPages}
          </span>
          <button
            className="sp-page-btn"
            onClick={() => setPage((p) => p + 1)}
            disabled={!pageInfo.hasNextPage}
          >
            Suivant →
          </button>
        </div>
      </div>
    </>
  );
}