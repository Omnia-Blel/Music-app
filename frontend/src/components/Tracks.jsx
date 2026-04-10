import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

const TRACKS_QUERY = gql`
  query Tracks($page: Int, $limit: Int) {
    tracks(page: $page, limit: $limit) {
      nodes {
        id
        title
        album {
          id
          title
        }
        artist {
          id
          name
        }
        duration
        durationFormatted
        plays
        isExplicit
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

const TOP_TRACKS_QUERY = gql`
  query TopTracks($limit: Int) {
    topTracks(limit: $limit) {
      id
      title
      plays
    }
  }
`;

const INCREMENT_PLAYS_MUTATION = gql`
  mutation IncrementPlays($trackId: ID!) {
    incrementPlays(trackId: $trackId) {
      id
      plays
    }
  }
`;

const CREATE_TRACK_MUTATION = gql`
  mutation CreateTrack($input: CreateTrackInput!) {
    createTrack(input: $input) {
      id
      title
    }
  }
`;

const DELETE_TRACK_MUTATION = gql`
  mutation DeleteTrack($id: ID!) {
    deleteTrack(id: $id) {
      success
    }
  }
`;

const ALBUMS_LIST_QUERY = gql`
  query Albums {
    albums(limit: 100) {
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

export default function Tracks({ token, userRole }) {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showTopTracks, setShowTopTracks] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    albumId: '',
    artistId: '',
    duration: '',
    trackNumber: '',
    isExplicit: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading, error: queryError, refetch } = useQuery(TRACKS_QUERY, {
    variables: { page, limit: 6 },
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  const { data: topTracksData } = useQuery(TOP_TRACKS_QUERY, {
    variables: { limit: 10 },
    skip: !showTopTracks,
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  const { data: albumsData } = useQuery(ALBUMS_LIST_QUERY, {
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  const [incrementPlays] = useMutation(INCREMENT_PLAYS_MUTATION, {
    context: { headers: { authorization: `Bearer ${token}` } },
    onCompleted: () => {
      setSuccess('Lecture enregistrée!');
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [createTrack, { loading: createLoading }] = useMutation(CREATE_TRACK_MUTATION, {
    context: { headers: { authorization: `Bearer ${token}` } },
    onCompleted: () => {
      setSuccess('Piste créée!');
      setFormData({ title: '', albumId: '', artistId: '', duration: '', trackNumber: '', isExplicit: false });
      setShowForm(false);
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [deleteTrack] = useMutation(DELETE_TRACK_MUTATION, {
    context: { headers: { authorization: `Bearer ${token}` } },
    onCompleted: () => {
      setSuccess('Piste supprimée!');
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTrack({
      variables: {
        input: {
          title: formData.title,
          albumId: formData.albumId,
          artistId: formData.artistId,
          duration: parseInt(formData.duration) || null,
          trackNumber: parseInt(formData.trackNumber) || null,
          isExplicit: formData.isExplicit,
        },
      },
    });
  };

  if (loading) return <div className="loading">⏳ Chargement des pistes...</div>;
  if (queryError) return <div className="error">❌ Erreur: {queryError.message}</div>;

  const tracks = data?.tracks?.nodes || [];
  const pageInfo = data?.tracks?.pageInfo || {};
  const topTracks = topTracksData?.topTracks || [];

  return (
    <div>
      <h2>🎵 Pistes</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="filter-section">
        <button onClick={() => setShowTopTracks(!showTopTracks)} className="btn-primary">
          {showTopTracks ? '❌ Masquer' : '🏆 Top Pistes'}
        </button>

        {userRole === 'admin' && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
            style={{ marginLeft: '0.5rem' }}
          >
            {showForm ? '❌ Annuler' : '➕ Créer'}
          </button>
        )}

        {showTopTracks && (
          <div style={{ marginTop: '1rem', background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
            <h4>Top 10 des pistes les plus écoutées</h4>
            {topTracks.map((track, idx) => (
              <div key={track.id} style={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }}>
                {idx + 1}. <strong>{track.title}</strong> - <span style={{ color: '#999' }}>{track.plays} lectures</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {userRole === 'admin' && showForm && (
        <div className="filter-section">
          <h4>Créer une piste</h4>
          <form onSubmit={handleSubmit}>
            <div className="filter-group">
              <div className="form-group">
                <label>Titre</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Album</label>
                <select
                  value={formData.albumId}
                  onChange={(e) => setFormData({ ...formData, albumId: e.target.value })}
                  required
                >
                  <option value="">Sélectionner</option>
                  {albumsData?.albums?.nodes?.map((album) => (
                    <option key={album.id} value={album.id}>
                      {album.title} - {album.artist.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-group">
              <div className="form-group">
                <label>Durée (secondes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Numéro de piste</label>
                <input
                  type="number"
                  value={formData.trackNumber}
                  onChange={(e) => setFormData({ ...formData, trackNumber: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isExplicit}
                    onChange={(e) => setFormData({ ...formData, isExplicit: e.target.checked })}
                  />
                  {' '}Contenu explicite
                </label>
              </div>
            </div>

            <button type="submit" className="btn-success" disabled={createLoading}>
              ✅ Créer
            </button>
          </form>
        </div>
      )}

      <div className="items-grid">
        {tracks.map((track) => (
          <div key={track.id} className="card">
            <h3>{track.title}</h3>
            <p>🎤 {track.artist.name}</p>
            <p>💿 {track.album.title}</p>

            <div className="card-meta">
              <span>⏱️ {track.durationFormatted}</span>
              <span>🔊 {track.plays} lectures</span>
              {track.isExplicit && <span className="badge">🔞 Explicite</span>}
            </div>

            <div className="card-actions">
              <button 
                onClick={() => incrementPlays({ variables: { trackId: track.id } })}
                className="btn-primary"
              >
                📈 Écouter
              </button>
              {userRole === 'admin' && (
                <button 
                  onClick={() => deleteTrack({ variables: { id: track.id } })}
                  className="btn-danger"
                >
                  🗑️ Supprimer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {tracks.length === 0 && <div className="empty">📭 Aucune piste</div>}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => setPage(page - 1)}
          disabled={!pageInfo.hasPreviousPage}
          className="btn-secondary"
        >
          ← Précédent
        </button>
        <span style={{ color: 'white', alignSelf: 'center' }}>
          Page {pageInfo.currentPage} / {pageInfo.totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={!pageInfo.hasNextPage}
          className="btn-secondary"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
