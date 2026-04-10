import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

const PLAYLISTS_QUERY = gql`
  query Playlists($userId: ID) {
    playlists(userId: $userId) {
      id
      name
      description
      isPublic
      totalTracks
    }
  }
`;

const PLAYLIST_DETAIL_QUERY = gql`
  query Playlist($id: ID!) {
    playlist(id: $id) {
      id
      name
      description
      totalTracks
      isPublic
      tracks {
        id
        title
        artist {
          name
        }
      }
    }
  }
`;

const CREATE_PLAYLIST_MUTATION = gql`
  mutation CreatePlaylist($input: CreatePlaylistInput!) {
    createPlaylist(input: $input) {
      id
      name
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
      totalTracks
    }
  }
`;

const REMOVE_TRACK_FROM_PLAYLIST_MUTATION = gql`
  mutation RemoveTrackFromPlaylist($playlistId: ID!, $trackId: ID!) {
    removeTrackFromPlaylist(playlistId: $playlistId, trackId: $trackId) {
      id
      totalTracks
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

export default function Playlists({ token, userId }) {
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading, error: queryError, refetch } = useQuery(PLAYLISTS_QUERY, {
    variables: { userId },
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  const { data: playlistDetail, loading: detailLoading } = useQuery(PLAYLIST_DETAIL_QUERY, {
    variables: { id: selectedPlaylist },
    skip: !selectedPlaylist,
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  const { data: tracksData } = useQuery(TRACKS_QUERY, {
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  const [createPlaylist, { loading: createLoading }] = useMutation(CREATE_PLAYLIST_MUTATION, {
    context: { headers: { authorization: `Bearer ${token}` } },
    onCompleted: () => {
      setSuccess('Playlist créée!');
      setFormData({ name: '', description: '', isPublic: true });
      setShowForm(false);
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [deletePlaylist] = useMutation(DELETE_PLAYLIST_MUTATION, {
    context: { headers: { authorization: `Bearer ${token}` } },
    onCompleted: () => {
      setSuccess('Playlist supprimée!');
      setSelectedPlaylist(null);
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [addTrack] = useMutation(ADD_TRACK_TO_PLAYLIST_MUTATION, {
    context: { headers: { authorization: `Bearer ${token}` } },
    onCompleted: () => {
      setSuccess('Piste ajoutée!');
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [removeTrack] = useMutation(REMOVE_TRACK_FROM_PLAYLIST_MUTATION, {
    context: { headers: { authorization: `Bearer ${token}` } },
    onCompleted: () => {
      setSuccess('Piste supprimée!');
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPlaylist({
      variables: {
        input: {
          name: formData.name,
          description: formData.description,
          isPublic: formData.isPublic,
        },
      },
    });
  };

  if (loading) return <div className="loading">⏳ Chargement des playlists...</div>;
  if (queryError) return <div className="error">❌ Erreur: {queryError.message}</div>;

  const playlists = data?.playlists || [];

  if (selectedPlaylist) {
    return (
      <div>
        <button onClick={() => setSelectedPlaylist(null)} className="btn-secondary">
          ← Retour
        </button>

        {detailLoading && <div className="loading">⏳ Chargement...</div>}
        {playlistDetail && (
          <div className="card" style={{ maxWidth: '100%', marginTop: '1rem' }}>
            <h3>{playlistDetail.playlist.name}</h3>
            <p>{playlistDetail.playlist.description}</p>
            <div className="card-meta">
              <span>🎵 {playlistDetail.playlist.totalTracks} pistes</span>
              <span>{playlistDetail.playlist.isPublic ? '🌐 Publique' : '🔒 Privée'}</span>
            </div>

            <div className="card-actions" style={{ marginTop: '1rem' }}>
              <button
                onClick={() => deletePlaylist({ variables: { id: selectedPlaylist } })}
                className="btn-danger"
              >
                🗑️ Supprimer
              </button>
            </div>

            <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#333' }}>Ajouter une piste</h4>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  addTrack({
                    variables: {
                      playlistId: selectedPlaylist,
                      trackId: e.target.value,
                    },
                  });
                  e.target.value = '';
                }
              }}
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
            >
              <option value="">Sélectionner une piste</option>
              {tracksData?.tracks?.nodes?.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.title} - {track.artist.name}
                </option>
              ))}
            </select>

            <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#333' }}>Pistes</h4>
            {playlistDetail.playlist.tracks?.map((track) => (
              <div key={track.id} style={{ padding: '0.75rem', background: '#f5f5f5', marginBottom: '0.5rem', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{track.title}</strong> <span style={{ color: '#999' }}>- {track.artist.name}</span>
                </div>
                <button
                  onClick={() => removeTrack({
                    variables: {
                      playlistId: selectedPlaylist,
                      trackId: track.id,
                    },
                  })}
                  className="btn-danger"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>📋 Mes Playlists</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="filter-section">
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? '❌ Annuler' : '➕ Créer une playlist'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', minHeight: '80px', padding: '0.75rem' }}
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                />
                {' '}Playlist publique
              </label>
            </div>

            <button type="submit" className="btn-success" disabled={createLoading}>
              ✅ Créer
            </button>
          </form>
        )}
      </div>

      <div className="items-grid">
        {playlists.map((playlist) => (
          <div 
            key={playlist.id} 
            className="card"
            onClick={() => setSelectedPlaylist(playlist.id)}
            style={{ cursor: 'pointer' }}
          >
            <h3>{playlist.name}</h3>
            <p>{playlist.description}</p>
            <div className="card-meta">
              <span>🎵 {playlist.totalTracks} pistes</span>
              <span>{playlist.isPublic ? '🌐 Publique' : '🔒 Privée'}</span>
            </div>
          </div>
        ))}
      </div>

      {playlists.length === 0 && <div className="empty">📭 Aucune playlist</div>}
    </div>
  );
}
