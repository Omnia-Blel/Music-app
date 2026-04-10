import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';

const SEARCH_QUERY = gql`
  query Search($query: String!, $limit: Int) {
    search(query: $query, limit: $limit) {
      artists {
        id
        name
        genres
      }
      albums {
        id
        title
        artist {
          name
        }
      }
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

const TOP_ARTISTS_QUERY = gql`
  query TopArtists($limit: Int) {
    topArtists(limit: $limit) {
      id
      name
      genres
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

export default function Search({ token }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [showTop, setShowTop] = useState(false);

  const { data, loading, error } = useQuery(SEARCH_QUERY, {
    variables: { query: searchQuery, limit: 20 },
    skip: !searchQuery || !hasSearched,
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  const { data: topArtistsData } = useQuery(TOP_ARTISTS_QUERY, {
    variables: { limit: 10 },
    skip: !showTop,
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  const { data: topTracksData } = useQuery(TOP_TRACKS_QUERY, {
    variables: { limit: 10 },
    skip: !showTop,
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setHasSearched(true);
  };

  const artists = data?.search?.artists || [];
  const albums = data?.search?.albums || [];
  const tracks = data?.search?.tracks || [];
  const topArtists = topArtistsData?.topArtists || [];
  const topTracks = topTracksData?.topTracks || [];

  return (
    <div>
      <h2>🔍 Recherche</h2>

      <div className="filter-section">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher artistes, albums, pistes..."
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.95rem',
            }}
          />
          <button type="submit" className="btn-primary">
            🔍 Rechercher
          </button>
        </form>

        <button 
          onClick={() => setShowTop(!showTop)}
          className="btn-secondary"
          style={{ marginTop: '1rem' }}
        >
          {showTop ? '❌ Masquer' : '🏆 Top 10'}
        </button>
      </div>

      {showTop && (
        <div className="items-grid">
          <div className="card">
            <h3>🏆 Top Artistes</h3>
            {topArtists.map((artist, idx) => (
              <div key={artist.id} style={{ padding: '0.5rem', cursor: 'pointer' }}>
                <strong>{idx + 1}. {artist.name}</strong>
                <div>
                  {artist.genres?.map((genre) => (
                    <span key={genre} className="badge genre">{genre}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3>🏆 Top Pistes</h3>
            {topTracks.map((track, idx) => (
              <div key={track.id} style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                <strong>{idx + 1}. {track.title}</strong>
                <div style={{ color: '#999', fontSize: '0.85rem' }}>
                  {track.plays} lectures
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSearched && (
        <div>
          <h3 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>
            📊 Résultats de recherche
          </h3>

          {loading && <div className="loading">⏳ Recherche en cours...</div>}
          {error && <div className="error">❌ Erreur: {error.message}</div>}

          {!loading && !error && artists.length === 0 && albums.length === 0 && tracks.length === 0 && (
            <div className="empty">😕 Aucun résultat trouvé</div>
          )}

          {artists.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h4>🎤 Artistes ({artists.length})</h4>
              {artists.map((artist) => (
                <div key={artist.id} style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                  <h5>{artist.name}</h5>
                  <div>
                    {artist.genres?.map((genre) => (
                      <span key={genre} className="badge genre">{genre}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {albums.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h4>💿 Albums ({albums.length})</h4>
              {albums.map((album) => (
                <div key={album.id} style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                  <h5>{album.title}</h5>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Par {album.artist.name}
                  </p>
                </div>
              ))}
            </div>
          )}

          {tracks.length > 0 && (
            <div className="card">
              <h4>🎵 Pistes ({tracks.length})</h4>
              {tracks.map((track) => (
                <div key={track.id} style={{ padding: '0.75rem', borderBottom: '1px solid #eee' }}>
                  <h5>{track.title}</h5>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Par {track.artist.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
