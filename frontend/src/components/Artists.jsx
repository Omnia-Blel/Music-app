import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

const ARTISTS_QUERY = gql`
  query Artists($page: Int, $limit: Int, $filter: ArtistFilter, $sort: ArtistSort) {
    artists(page: $page, limit: $limit, filter: $filter, sort: $sort) {
      nodes {
        id
        name
        bio
        country
        genres
        imageUrl
        totalAlbums
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

const CREATE_ARTIST_MUTATION = gql`
  mutation CreateArtist($input: CreateArtistInput!) {
    createArtist(input: $input) {
      id
      name
      bio
      country
      genres
    }
  }
`;

const DELETE_ARTIST_MUTATION = gql`
  mutation DeleteArtist($id: ID!) {
    deleteArtist(id: $id) {
      success
      message
    }
  }
`;

export default function Artists({ token, userRole }) {
  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    country: '',
    genres: '',
    imageUrl: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data, loading, error: queryError, refetch } = useQuery(ARTISTS_QUERY, {
    variables: { page, limit },
  });

  const [createArtist, { loading: createLoading }] = useMutation(CREATE_ARTIST_MUTATION, {
    onCompleted: () => {
      setSuccess('Artiste créé avec succès!');
      setFormData({ name: '', bio: '', country: '', genres: '', imageUrl: '' });
      setShowForm(false);
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const [deleteArtist, { loading: deleteLoading }] = useMutation(DELETE_ARTIST_MUTATION, {
    context: { headers: { authorization: `Bearer ${token}` } },
    onCompleted: () => {
      setSuccess('Artiste supprimé avec succès!');
      refetch();
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createArtist({
      variables: {
        input: {
          name: formData.name,
          bio: formData.bio,
          country: formData.country,
          genres: formData.genres.split(',').map(g => g.trim()),
          imageUrl: formData.imageUrl,
        },
      },
    });
  };

  if (loading) return <div className="loading">⏳ Chargement des artistes...</div>;
  if (queryError) return <div className="error">❌ Erreur: {queryError.message}</div>;

  const artists = data?.artists?.nodes || [];
  const pageInfo = data?.artists?.pageInfo || {};

  return (
    <div>
      <h2>🎤 Artistes</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {userRole === 'admin' && (
        <div className="filter-section">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? '❌ Annuler' : '➕ Créer un artiste'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
              <div className="filter-group">
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
                  <label>Pays</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  style={{ width: '100%', minHeight: '100px', padding: '0.75rem' }}
                />
              </div>

              <div className="filter-group">
                <div className="form-group">
                  <label>Genres (séparés par des virgules)</label>
                  <input
                    type="text"
                    value={formData.genres}
                    onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                    placeholder="Pop, Rock, Jazz"
                  />
                </div>
                <div className="form-group">
                  <label>URL Image</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn-success" disabled={createLoading}>
                {createLoading ? '⏳ Création...' : '✅ Créer'}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="items-grid">
        {artists.map((artist) => (
          <div key={artist.id} className="card">
            {artist.imageUrl && (
              <img 
                src={artist.imageUrl} 
                alt={artist.name}
                style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '1rem' }}
              />
            )}
            <h3>{artist.name}</h3>
            <p>{artist.bio}</p>

            <div className="card-meta">
              <span>🌍 {artist.country}</span>
              <span>💿 {artist.totalAlbums} album(s)</span>
            </div>

            <div>
              {artist.genres?.map((genre) => (
                <span key={genre} className="badge genre">{genre}</span>
              ))}
            </div>

            {userRole === 'admin' && (
              <div className="card-actions">
                <button 
                  onClick={() => deleteArtist({ variables: { id: artist.id } })}
                  className="btn-danger"
                  disabled={deleteLoading}
                >
                  🗑️ Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {artists.length === 0 && <div className="empty">📭 Aucun artiste trouvé</div>}

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
