import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import Track from "./Track";

// ============================================================
// STYLES SPOTIFY
// ============================================================
const S = {
  page: {
    background: '#121212',
    minHeight: '100vh',
    color: '#fff',
    fontFamily: "'Circular', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    padding: '24px',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 24px 0',
    letterSpacing: '-0.3px',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#fff',
    margin: '24px 0 12px',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#b3b3b3',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '0 0 8px',
  },
  error: {
    background: '#e74c3c22',
    border: '1px solid #e74c3c',
    color: '#e74c3c',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 14,
    marginBottom: 16,
  },
  success: {
    background: '#1db95422',
    border: '1px solid #1db954',
    color: '#1db954',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 14,
    marginBottom: 16,
  },
  loading: {
    color: '#b3b3b3',
    fontSize: 14,
    padding: '32px 0',
    textAlign: 'center',
  },
  empty: {
    color: '#b3b3b3',
    fontSize: 14,
    padding: '32px 0',
    textAlign: 'center',
  },
  btnPrimary: {
    background: '#1db954',
    color: '#000',
    border: 'none',
    borderRadius: 500,
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.5px',
    transition: 'transform 0.1s, background 0.15s',
  },
  btnSecondary: {
    background: 'transparent',
    color: '#fff',
    border: '1px solid #727272',
    borderRadius: 500,
    padding: '8px 20px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  btnDanger: {
    background: 'transparent',
    color: '#b3b3b3',
    border: 'none',
    borderRadius: 500,
    padding: '4px 10px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'color 0.15s',
  },
  btnSuccess: {
    background: '#1db954',
    color: '#000',
    border: 'none',
    borderRadius: 500,
    padding: '10px 28px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.5px',
  },
  btnBack: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#2a2a2a',
    color: '#fff',
    border: 'none',
    borderRadius: 500,
    padding: '8px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 24,
    transition: 'background 0.15s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 20,
    marginTop: 8,
  },
  card: {
    background: '#181818',
    borderRadius: 8,
    padding: 16,
    cursor: 'pointer',
    transition: 'background 0.15s',
    position: 'relative',
    overflow: 'hidden',
  },
  cardArt: {
    width: '100%',
    aspectRatio: '1',
    background: '#282828',
    borderRadius: 4,
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 40,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardDesc: {
    fontSize: 13,
    color: '#a7a7a7',
    margin: '0 0 6px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardMeta: {
    fontSize: 12,
    color: '#727272',
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  badge: (pub) => ({
    display: 'inline-block',
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 500,
    background: pub ? '#1db95422' : '#ffffff18',
    color: pub ? '#1db954' : '#a7a7a7',
    marginTop: 2,
  }),
  detailHeader: {
    display: 'flex',
    gap: 24,
    alignItems: 'flex-end',
    marginBottom: 32,
    background: 'linear-gradient(180deg,#3e3e3e 0%,#121212 100%)',
    borderRadius: 8,
    padding: 24,
  },
  detailArt: {
    width: 140,
    height: 140,
    minWidth: 140,
    background: '#282828',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 56,
    boxShadow: '0 8px 32px #0008',
  },
  detailInfo: {
    flex: 1,
  },
  detailType: {
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: 6,
  },
  detailTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 8px',
    lineHeight: 1.1,
    wordBreak: 'break-word',
  },
  detailDesc: {
    fontSize: 14,
    color: '#a7a7a7',
    margin: '0 0 10px',
  },
  detailMeta: {
    fontSize: 14,
    color: '#b3b3b3',
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  controlsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  playBtn: {
    width: 52,
    height: 52,
    background: '#1db954',
    border: 'none',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 22,
    transition: 'transform 0.1s, background 0.15s',
    flexShrink: 0,
  },
  trackList: {
    width: '100%',
  },
  trackListHeader: {
    display: 'grid',
    gridTemplateColumns: '32px 1fr 160px 80px 60px',
    padding: '0 16px 8px',
    borderBottom: '1px solid #282828',
    marginBottom: 4,
    fontSize: 12,
    fontWeight: 600,
    color: '#727272',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  trackRow: {
    display: 'grid',
    gridTemplateColumns: '32px 1fr 160px 80px 60px',
    padding: '8px 16px',
    borderRadius: 4,
    alignItems: 'center',
    transition: 'background 0.1s',
    cursor: 'pointer',
  },
  trackIdx: {
    fontSize: 14,
    color: '#727272',
    textAlign: 'right',
    paddingRight: 8,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  trackArtist: {
    fontSize: 13,
    color: '#a7a7a7',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  trackDuration: {
    fontSize: 14,
    color: '#a7a7a7',
    textAlign: 'right',
  },
  explicitBadge: {
    display: 'inline-block',
    background: '#727272',
    color: '#121212',
    fontSize: 9,
    fontWeight: 700,
    padding: '1px 4px',
    borderRadius: 2,
    marginRight: 6,
    verticalAlign: 'middle',
    lineHeight: '14px',
  },
  form: {
    background: '#181818',
    borderRadius: 8,
    padding: 24,
    marginTop: 16,
    maxWidth: 500,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#b3b3b3',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    background: '#2a2a2a',
    border: '1px solid #404040',
    borderRadius: 4,
    color: '#fff',
    fontSize: 14,
    padding: '10px 14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  textarea: {
    width: '100%',
    background: '#2a2a2a',
    border: '1px solid #404040',
    borderRadius: 4,
    color: '#fff',
    fontSize: 14,
    padding: '10px 14px',
    minHeight: 90,
    resize: 'vertical',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  select: {
    width: '100%',
    background: '#2a2a2a',
    border: '1px solid #404040',
    borderRadius: 4,
    color: '#fff',
    fontSize: 14,
    padding: '10px 14px',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    boxSizing: 'border-box',
  },
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: '#1db954',
    cursor: 'pointer',
  },
};

// ============================================================
// HELPERS
// ============================================================
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function getPlaylistColor(id) {
  const colors = ['#4a148c', '#1a237e', '#006064', '#1b5e20', '#e65100', '#880e4f', '#0d47a1', '#37474f'];
  const idx = (parseInt(id, 10) || 0) % colors.length;
  return colors[idx];
}

// ============================================================
// QUERIES & MUTATIONS
// ============================================================
const PLAYLISTS_QUERY = gql`
  query Playlists {
    playlists {
      id
      title
      description
      public
      nb_tracks
    }
  }
`;

const PLAYLIST_DETAIL_QUERY = gql`
  query Playlist($id: ID!) {
    playlist(id: $id) {
      id
      title
      description
      public
      nb_tracks
      tracks {
        id
        title
        duration
        explicit_lyrics
        artist {
          name
        }
      }
    }
  }
`;

const CREATE_PLAYLIST_MUTATION = gql`
mutation CreatePlaylist($input: CreatePlaylistInput!, $userId: ID!) {
  createPlaylist(input: $input, userId: $userId) {
    id
    title
    user
    {
      id
    }
  }
}
`;

const DELETE_PLAYLIST_MUTATION = gql`
  mutation DeletePlaylist($id: ID!) {
    deletePlaylist(id: $id) {
      success
    }
  }
`;

const ADD_TRACK_TO_PLAYLIST_MUTATION = gql`
  mutation AddTrackToPlaylist($playlistId: ID!, $trackId: ID!) {
    addTrackToPlaylist(playlistId: $playlistId, trackId: $trackId) {
      id
      nb_tracks
    }
  }
`;

const REMOVE_TRACK_FROM_PLAYLIST_MUTATION = gql`
  mutation RemoveTrackFromPlaylist($playlistId: ID!, $trackId: ID!) {
    removeTrackFromPlaylist(playlistId: $playlistId, trackId: $trackId) {
      id
      nb_tracks
    }
  }
`;

const TRACKS_QUERY = gql`
  query Tracks {
    tracks(limit: 100) {
      nodes {
        id
        title
        artist {
          name
        }
      }
    }
  }
`;

// ============================================================
// SUB-COMPONENTS
// ============================================================
function PlaylistArt({ id, size = 64, fontSize = 28 }) {
  const color = getPlaylistColor(id);
  return (
    <div style={{
      width: size,
      height: size,
      minWidth: size,
      background: color,
      borderRadius: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize,
      boxShadow: '0 4px 16px #0006',
    }}>
      🎵
    </div>
  );
}

// ---- TrackRow ----
// onSelect   : (trackId) => void  — navigue vers la page Track
// onRemove   : (trackId) => void  — retire de la playlist (stoppe la propagation)
function TrackRow({ track, idx, onRemove, hoveredId, setHoveredId, onSelect }) {
  const isHovered = hoveredId === track.id;

  const handleRowClick = () => {
    onSelect(track.id);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation(); // empêche la navigation vers Track
    onRemove(track.id);
  };

  return (
    <div
      style={{
        ...S.trackRow,
        background: isHovered ? '#ffffff0d' : 'transparent',
      }}
      onClick={handleRowClick}
      onMouseEnter={() => setHoveredId(track.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <span style={S.trackIdx}>{idx + 1}</span>
      <div style={{ overflow: 'hidden', paddingRight: 12 }}>
        <div style={S.trackTitle}>
          {track.explicit_lyrics && (
            <span style={S.explicitBadge}>E</span>
          )}
          {track.title}
        </div>
        <div style={S.trackArtist}>{track.artist?.name}</div>
      </div>
      <div style={{ fontSize: 13, color: '#a7a7a7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {track.artist?.name}
      </div>
      <div style={S.trackDuration}>{formatDuration(track.duration)}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {isHovered && (
          <button
            onClick={handleRemoveClick}
            title="Retirer de la playlist"
            style={{
              ...S.btnDanger,
              opacity: 1,
              padding: '4px 8px',
              fontSize: 18,
              lineHeight: 1,
              color: '#b3b3b3',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#b3b3b3'}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
// Props :
//   token        {string}   — JWT Bearer token (envoyé dans les headers Apollo)
//   onSelectTrack {function} — (trackId: string) => void
//                              appelé quand l'utilisateur clique sur un titre
//                              Le parent gère l'affichage de <Track>
export default function Playlists({ token, onSelectTrack, userId }) {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showForm, setShowForm]                 = useState(false);
  const [formData, setFormData]                 = useState({ title: '', description: '', public: true });
  const [error, setError]                       = useState('');
  const [success, setSuccess]                   = useState('');
  const [hoveredCard, setHoveredCard]           = useState(null);
  const [hoveredTrack, setHoveredTrack]         = useState(null);

  const currentUserId = userId;
  // ----------------------------------------------------------------
  // NOTE : le userId n'est PAS envoyé depuis le front.
  // Le resolver createPlaylist extrait lui-même decoded.userId depuis
  // le JWT via verifyToken(context). L'input reste title/description/public.
  // ----------------------------------------------------------------

  const authHeaders = { context: { headers: { authorization: `Bearer ${token}` } } };

  const { data, loading, error: queryError, refetch } = useQuery(PLAYLISTS_QUERY, authHeaders);

  const { data: playlistDetail, loading: detailLoading, refetch: refetchDetail } = useQuery(
    PLAYLIST_DETAIL_QUERY,
    {
      variables: { id: selectedPlaylist },
      skip: !selectedPlaylist,
      ...authHeaders,
    }
  );

  const { data: tracksData } = useQuery(TRACKS_QUERY, authHeaders);

  const notify = (msg, type = 'success') => {
    if (type === 'success') { setSuccess(msg); setError(''); }
    else                    { setError(msg);   setSuccess(''); }
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const [createPlaylist, { loading: createLoading }] = useMutation(CREATE_PLAYLIST_MUTATION, {
    ...authHeaders,
    onCompleted: () => {
      notify('Playlist créée avec succès !');
      setFormData({ title: '', description: '', public: true });
      setShowForm(false);
      refetch();
    },
    onError: (err) => notify(err.message, 'error'),
  });

  const [deletePlaylist] = useMutation(DELETE_PLAYLIST_MUTATION, {
    ...authHeaders,
    onCompleted: () => {
      notify('Playlist supprimée');
      setSelectedPlaylist(null);
      refetch();
    },
    onError: (err) => notify(err.message, 'error'),
  });

  const [addTrack] = useMutation(ADD_TRACK_TO_PLAYLIST_MUTATION, {
    ...authHeaders,
    onCompleted: () => { notify('Piste ajoutée !'); refetch(); refetchDetail(); },
    onError: (err) => notify(err.message, 'error'),
  });

  const [removeTrack] = useMutation(REMOVE_TRACK_FROM_PLAYLIST_MUTATION, {
    ...authHeaders,
    onCompleted: () => { notify('Piste retirée'); refetch(); refetchDetail(); },
    onError: (err) => notify(err.message, 'error'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("userId =", userId);
    if (!formData.title.trim()) return;
    createPlaylist({
      variables: {
        input: {
          title: formData.title.trim(),
          description: formData.description.trim(),
        },
        userId: currentUserId, 
      },

    });
  };

  // ---- Navigation vers la page Track ----
  // Délègue au parent via la prop onSelectTrack
  const handleSelectTrack = (trackId) => {
    if (typeof onSelectTrack === 'function') {
      onSelectTrack(trackId);
    }
  };

  // ---- États globaux ----
  if (loading)    return <div style={S.page}><div style={S.loading}>Chargement des playlists…</div></div>;
  if (queryError) return <div style={S.page}><div style={{ ...S.error, marginTop: 24 }}>Erreur : {queryError.message}</div></div>;

  const playlists = data?.playlists || [];

  // ============================================================
  // VUE DÉTAIL
  // ============================================================
  if (selectedPlaylist) {
    const pl = playlistDetail?.playlist;
    const trackCount = pl?.nb_tracks ?? pl?.tracks?.length ?? 0;

    return (
      <div style={S.page}>
        <button
          onClick={() => setSelectedPlaylist(null)}
          style={S.btnBack}
          onMouseEnter={e => e.currentTarget.style.background = '#333'}
          onMouseLeave={e => e.currentTarget.style.background = '#2a2a2a'}
        >
          ← Retour
        </button>

        {error   && <div style={S.error}>{error}</div>}
        {success && <div style={S.success}>{success}</div>}

        {detailLoading && <div style={S.loading}>Chargement…</div>}

        {pl && (
          <>
            {/* Header de la playlist */}
            <div style={{
              ...S.detailHeader,
              background: `linear-gradient(180deg, ${getPlaylistColor(pl.id)}88 0%, #121212 100%)`,
            }}>
              <PlaylistArt id={pl.id} size={160} fontSize={64} />
              <div style={S.detailInfo}>
                <p style={S.detailType}>Playlist</p>
                <h1 style={S.detailTitle}>{pl.title}</h1>
                {pl.description && (
                  <p style={S.detailDesc}>{pl.description}</p>
                )}
                <div style={S.detailMeta}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>Ma bibliothèque</span>
                  <span>·</span>
                  <span>{trackCount} titre{trackCount !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span style={S.badge(pl.public)}>{pl.public ? '🌐 Publique' : '🔒 Privée'}</span>
                </div>
              </div>
            </div>

            {/* Barre de contrôle */}
            <div style={S.controlsBar}>
              <button style={S.playBtn} title="Lecture">▶</button>
              <button
                onClick={() => {
                  if (window.confirm(`Supprimer "${pl.title}" ?`)) {
                    deletePlaylist({ variables: { id: selectedPlaylist } });
                  }
                }}
                style={{
                  ...S.btnSecondary,
                  color: '#e74c3c',
                  borderColor: '#e74c3c55',
                  fontSize: 13,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#e74c3c'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e74c3c55'}
              >
                Supprimer la playlist
              </button>
            </div>

            {/* Ajout de piste */}
            <div style={{ marginBottom: 24 }}>
              <p style={S.subTitle}>Ajouter une piste</p>
              <div style={{ position: 'relative', maxWidth: 420 }}>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addTrack({ variables: { playlistId: selectedPlaylist, trackId: e.target.value } });
                      e.target.value = '';
                    }
                  }}
                  style={S.select}
                >
                  <option value="" disabled>Sélectionner une piste…</option>
                  {tracksData?.tracks?.nodes?.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.title} — {track.artist?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Liste des pistes */}
            {pl.tracks?.length === 0 ? (
              <div style={{ ...S.empty, textAlign: 'left', paddingTop: 48 }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Aucun titre dans cette playlist</p>
                <p style={{ fontSize: 15, color: '#a7a7a7', margin: 0 }}>Ajoutez des titres en utilisant la liste ci-dessus.</p>
              </div>
            ) : (
              <div style={S.trackList}>
                <div style={S.trackListHeader}>
                  <span style={{ textAlign: 'right', paddingRight: 8 }}>#</span>
                  <span>Titre</span>
                  <span>Artiste</span>
                  <span style={{ textAlign: 'right' }}>Durée</span>
                  <span />
                </div>
                {pl.tracks.map((track, idx) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    idx={idx}
                    onRemove={(trackId) =>
                      removeTrack({ variables: { playlistId: selectedPlaylist, trackId } })
                    }
                    hoveredId={hoveredTrack}
                    setHoveredId={setHoveredTrack}
                    onSelect={handleSelectTrack}   // ← navigation vers Track
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ============================================================
  // VUE LISTE
  // ============================================================
  return (
    <div style={S.page}>
      <h1 style={S.pageTitle}>Mes Playlists</h1>

      {error   && <div style={S.error}>{error}</div>}
      {success && <div style={S.success}>{success}</div>}

      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={S.btnPrimary}
          onMouseEnter={e => e.currentTarget.style.background = '#1ed760'}
          onMouseLeave={e => e.currentTarget.style.background = '#1db954'}
        >
          {showForm ? 'Annuler' : '+ Créer une playlist'}
        </button>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <form onSubmit={handleSubmit} style={S.form}>
          <h2 style={{ ...S.sectionTitle, marginTop: 0 }}>Nouvelle playlist</h2>

          <div style={S.formGroup}>
            <label style={S.label}>Titre *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Mon titre de playlist"
              required
              style={S.input}
              onFocus={e => e.target.style.borderColor = '#1db954'}
              onBlur={e => e.target.style.borderColor = '#404040'}
            />
          </div>

          <div style={S.formGroup}>
            <label style={S.label}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ajoutez une description optionnelle…"
              style={S.textarea}
              onFocus={e => e.target.style.borderColor = '#1db954'}
              onBlur={e => e.target.style.borderColor = '#404040'}
            />
          </div>

          <div style={{ ...S.formGroup, ...S.checkboxRow }}>
            <input
              type="checkbox"
              id="public-check"
              checked={formData.public}
              onChange={(e) => setFormData({ ...formData, public: e.target.checked })}
              style={S.checkbox}
            />
            <label
              htmlFor="public-check"
              style={{ ...S.label, margin: 0, textTransform: 'none', letterSpacing: 0, fontSize: 14, cursor: 'pointer' }}
            >
              Rendre la playlist publique
            </label>
          </div>

          <button
            type="submit"
            disabled={createLoading}
            style={{
              ...S.btnSuccess,
              opacity: createLoading ? 0.6 : 1,
              cursor: createLoading ? 'default' : 'pointer',
            }}
          >
            {createLoading ? 'Création…' : 'Créer'}
          </button>
        </form>
      )}

      {/* Grille de playlists */}
      {playlists.length === 0 ? (
        <div style={{ ...S.empty, textAlign: 'left', paddingTop: 48 }}>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Créez votre première playlist</p>
          <p style={{ fontSize: 15, color: '#a7a7a7', margin: '0 0 24px' }}>C'est facile, nous allons vous aider.</p>
          <button
            onClick={() => setShowForm(true)}
            style={S.btnPrimary}
            onMouseEnter={e => e.currentTarget.style.background = '#1ed760'}
            onMouseLeave={e => e.currentTarget.style.background = '#1db954'}
          >
            Créer une playlist
          </button>
        </div>
      ) : (
        <div style={S.grid}>
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              style={{
                ...S.card,
                background: hoveredCard === playlist.id ? '#282828' : '#181818',
              }}
              onClick={() => setSelectedPlaylist(playlist.id)}
              onMouseEnter={() => setHoveredCard(playlist.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{
                ...S.cardArt,
                background: getPlaylistColor(playlist.id),
              }}>
                🎵
              </div>
              <p style={S.cardTitle}>{playlist.title}</p>
              {playlist.description && (
                <p style={S.cardDesc}>{playlist.description}</p>
              )}
              <div style={S.cardMeta}>
                <span>{playlist.nb_tracks ?? 0} titre{playlist.nb_tracks !== 1 ? 's' : ''}</span>
                <span style={S.badge(playlist.public)}>
                  {playlist.public ? 'Publique' : 'Privée'}
                </span>
              </div>

              {hoveredCard === playlist.id && (
                <div style={{
                  position: 'absolute',
                  bottom: 80,
                  right: 12,
                  width: 42,
                  height: 42,
                  background: '#1db954',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  boxShadow: '0 4px 12px #0006',
                  transition: 'opacity 0.15s',
                }}>
                  ▶
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}