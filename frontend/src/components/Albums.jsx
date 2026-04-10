import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

const ALBUMS_QUERY = gql`
  query Albums($page: Int, $limit: Int) {
    albums(page: $page, limit: $limit) {
      nodes {
        id
        title
        artist {
          id
          name
        }
        releaseDate
        genre
        totalTracks
        averageRating
        coverUrl
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
      description
      releaseDate
      genre
      label
      totalTracks
      tracks {
        id
        title
        duration
        durationFormatted
      }
    }
  }
`;

const CREATE_ALBUM_MUTATION = gql`
  mutation CreateAlbum($input: CreateAlbumInput!) {
    createAlbum(input: $input) {
      id
      title
      artist {
        name
      }
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
      nodes {
        id
        name
      }
    }
  }
`;

export default function Albums({ token, userRole }) {
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    artistId: '',
    releaseDate: '',
    genre: '',
    label: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading, error: queryError, refetch } = useQuery(ALBUMS_QUERY, {
    variables: { page, limit: 6 },
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  const { data: artistsData } = useQuery(ARTISTS_LIST_QUERY, {
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  const { data: albumDetail, loading: albumDetailLoading } = useQuery(ALBUM_DETAIL_QUERY, {
    variables: { id: selectedAlbum },
    skip: !selectedAlbum,
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  const [createAlbum, { loading: createLoading }] = useMutation(CREATE_ALBUM_MUTATION, {
    context: { headers: { authorization: `Bearer ${token}` } },
    onCompleted: () => {
      setSuccess('Album créé!');
      setFormData({ title: '', artistId: '', releaseDate: '', genre: '', label: '', description: '' });
      setShowForm(false);
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [deleteAlbum] = useMutation(DELETE_ALBUM_MUTATION, {
    context: { headers: { authorization: `Bearer ${token}` } },
    onCompleted: () => {
      setSuccess('Album supprimé!');
      refetch();
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
          releaseDate: formData.releaseDate,
          genre: formData.genre,
          label: formData.label,
          description: formData.description,
        },
      },
    });
  };

  if (loading) return <div className="loading">⏳ Chargement des albums...</div>;
  if (queryError) return <div className="error">❌ Erreur: {queryError.message}</div>;

  const albums = data?.albums?.nodes || [];
  const pageInfo = data?.albums?.pageInfo || {};

  if (selectedAlbum) {
    return (
      <div>
        <button onClick={() => setSelectedAlbum(null)} className="btn-secondary">
          ← Retour
        </button>
        {albumDetailLoading && <div className="loading">⏳ Chargement...</div>}
        {albumDetail && (
          <div className="card" style={{ maxWidth: '100%', marginTop: '1rem' }}>
            <h3>{albumDetail.album.title}</h3>
            <p>{albumDetail.album.description}</p>
            <div className="card-meta">
              <span>📅 {albumDetail.album.releaseDate}</span>
              <span>🎵 {albumDetail.album.totalTracks} pistes</span>
              <span>🏷️ {albumDetail.album.genre}</span>
            </div>

            <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#333' }}>Pistes:</h4>
            {albumDetail.album.tracks?.map((track, idx) => (
              <div key={track.id} style={{ padding: '0.75rem', background: '#f5f5f5', marginBottom: '0.5rem', borderRadius: '4px' }}>
                <strong>{idx + 1}. {track.title}</strong> <span style={{ color: '#999' }}>({track.durationFormatted})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2>💿 Albums</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {userRole === 'admin' && (
        <div className="filter-section">
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? '❌ Annuler' : '➕ Créer un album'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
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
                  <label>Artiste</label>
                  <select
                    value={formData.artistId}
                    onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                    required
                  >
                    <option value="">Sélectionner</option>
                    {artistsData?.artists?.nodes?.map((artist) => (
                      <option key={artist.id} value={artist.id}>{artist.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filter-group">
                <div className="form-group">
                  <label>Date de sortie</label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Label</label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', minHeight: '100px', padding: '0.75rem' }}
                />
              </div>

              <button type="submit" className="btn-success" disabled={createLoading}>
                ✅ Créer
              </button>
            </form>
          )}
        </div>
      )}

      <div className="items-grid">
        {albums.map((album) => (
          <div key={album.id} className="card" onClick={() => setSelectedAlbum(album.id)} style={{ cursor: 'pointer' }}>
            {album.coverUrl && (
              <img 
                src={album.coverUrl} 
                alt={album.title}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }}
              />
            )}
            <h3>{album.title}</h3>
            <p>🎤 {album.artist.name}</p>

            <div className="card-meta">
              <span>📅 {album.releaseDate}</span>
              <span>🎵 {album.totalTracks} pistes</span>
              {album.averageRating && <span>⭐ {album.averageRating.toFixed(1)}</span>}
            </div>

            {userRole === 'admin' && (
              <div className="card-actions">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAlbum({ variables: { id: album.id } });
                  }}
                  className="btn-danger"
                >
                  🗑️ Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {albums.length === 0 && <div className="empty">📭 Aucun album</div>}

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
