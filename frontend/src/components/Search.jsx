import React, { useState, useRef, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';

// ============================================================
// QUERIES
// ============================================================
const SEARCH_QUERY = gql`
  query Search($query: String!, $limit: Int) {
    search(query: $query, limit: $limit) {
      artists {
        id
        name
        nb_fan
        nb_album
        picture_medium
      }
      albums {
        id
        title
        cover_medium
        release_date
        artist { name }
      }
      tracks {
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

const TOP_ARTISTS_QUERY = gql`
  query TopArtists($limit: Int) {
    topArtists(limit: $limit) {
      id
      name
      nb_fan
      nb_album
      picture_medium
    }
  }
`;

const TOP_TRACKS_QUERY = gql`
  query TopTracks($limit: Int) {
    topTracks(limit: $limit) {
      id
      title
      rank
      duration
      explicit_lyrics
      artist { name }
      album { cover_medium }
    }
  }
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

function formatFans(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

// ============================================================
// STYLES
// ============================================================
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  .sp-wrap * { box-sizing: border-box; margin: 0; padding: 0; }

  .sp-wrap {
    background: #121212;
    min-height: 100vh;
    color: #fff;
    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
    padding-bottom: 60px;
  }

  .sp-search-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: linear-gradient(180deg, #121212 70%, transparent);
    padding: 20px 24px 16px;
  }

  .sp-search-input-wrap { position: relative; max-width: 440px; }

  .sp-search-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%);
    color: #000; display: flex; pointer-events: none;
  }

  .sp-search-input {
    width: 100%;
    background: #fff;
    border: none;
    border-radius: 500px;
    padding: 12px 16px 12px 44px;
    font-size: 14px;
    font-family: inherit;
    font-weight: 500;
    color: #000;
    outline: none;
    transition: box-shadow 0.2s;
  }
  .sp-search-input::placeholder { color: #727272; font-weight: 400; }
  .sp-search-input:focus { box-shadow: 0 0 0 3px #1ed760; }

  .sp-top-btn {
    display: inline-flex; align-items: center; gap: 6px;
    margin-top: 14px;
    padding: 7px 18px;
    border-radius: 500px;
    border: 1px solid rgba(255,255,255,0.2);
    background: transparent;
    color: #b3b3b3;
    font-size: 13px; font-family: inherit; font-weight: 600;
    cursor: pointer; transition: all 0.15s;
    letter-spacing: 0.2px;
  }
  .sp-top-btn:hover { border-color: #fff; color: #fff; }
  .sp-top-btn.active { background: #1ed760; border-color: #1ed760; color: #000; }

  .sp-section { padding: 28px 24px 0; }

  .sp-section-title {
    font-size: 22px; font-weight: 700;
    color: #fff; margin-bottom: 18px;
    letter-spacing: -0.4px;
  }

  /* Artists */
  .sp-artists-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
    gap: 18px;
  }

  .sp-artist-card {
    background: #181818;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
  }
  .sp-artist-card:hover { background: #282828; }
  .sp-artist-card:hover .sp-play-fab { opacity: 1; transform: translateY(0); }

  .sp-artist-img {
    width: 100%; aspect-ratio: 1;
    border-radius: 50%;
    object-fit: cover; display: block;
    margin-bottom: 14px;
    background: #333;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }

  .sp-artist-img-placeholder {
    width: 100%; aspect-ratio: 1; border-radius: 50%;
    background: #333; display: flex; align-items: center;
    justify-content: center; font-size: 36px;
    margin-bottom: 14px;
  }

  .sp-artist-name {
    font-size: 14px; font-weight: 700; color: #fff;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 4px;
  }
  .sp-artist-meta { font-size: 12px; color: #b3b3b3; }

  .sp-play-fab {
    position: absolute; right: 14px; bottom: 62px;
    width: 44px; height: 44px; border-radius: 50%;
    background: #1ed760; border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transform: translateY(10px);
    transition: opacity 0.2s, transform 0.2s;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }
  .sp-play-fab:hover { background: #1fdf64; transform: scale(1.04) translateY(0) !important; }

  /* Albums */
  .sp-albums-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(158px, 1fr));
    gap: 18px;
  }

  .sp-album-card {
    background: #181818; border-radius: 8px;
    padding: 14px; cursor: pointer; transition: background 0.2s;
  }
  .sp-album-card:hover { background: #282828; }

  .sp-album-img {
    width: 100%; aspect-ratio: 1; border-radius: 5px;
    object-fit: cover; display: block;
    margin-bottom: 12px; background: #333;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  }

  .sp-album-img-placeholder {
    width: 100%; aspect-ratio: 1; border-radius: 5px;
    background: #333; display: flex; align-items: center;
    justify-content: center; font-size: 36px; margin-bottom: 12px;
  }

  .sp-album-name {
    font-size: 14px; font-weight: 700; color: #fff;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 4px;
  }
  .sp-album-meta {
    font-size: 12px; color: #b3b3b3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Tracks */
  .sp-track-list { display: flex; flex-direction: column; }

  .sp-track-row {
    display: grid;
    grid-template-columns: 44px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 6px 12px 6px 6px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .sp-track-row:hover { background: rgba(255,255,255,0.07); }
  .sp-track-row:hover .sp-track-num { display: none; }
  .sp-track-row:hover .sp-track-play { display: flex; }

  .sp-track-idx {
    display: flex; align-items: center; justify-content: center;
    width: 44px; height: 44px; position: relative; flex-shrink: 0;
  }
  .sp-track-num { font-size: 15px; color: #b3b3b3; }
  .sp-track-play { display: none; align-items: center; justify-content: center; color: #fff; }

  .sp-track-thumb {
    width: 44px; height: 44px; border-radius: 3px;
    object-fit: cover; background: #333; flex-shrink: 0;
  }
  .sp-track-thumb-ph {
    width: 44px; height: 44px; border-radius: 3px;
    background: #333; display: flex; align-items: center;
    justify-content: center; font-size: 20px; flex-shrink: 0;
  }

  .sp-track-body { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .sp-track-text { min-width: 0; }

  .sp-track-title {
    font-size: 15px; font-weight: 500; color: #fff;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .sp-track-sub {
    font-size: 12px; color: #b3b3b3;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .sp-track-right {
    display: flex; align-items: center; gap: 14px; flex-shrink: 0;
  }
  .sp-track-dur { font-size: 13px; color: #b3b3b3; font-variant-numeric: tabular-nums; }

  .sp-explicit {
    background: rgba(255,255,255,0.15);
    color: #b3b3b3; font-size: 9px; font-weight: 700;
    padding: 2px 5px; border-radius: 3px; letter-spacing: 0.5px;
  }

  /* Top grid */
  .sp-top-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 32px;
  }

  .sp-top-row {
    display: grid; grid-template-columns: 24px 44px 1fr auto;
    align-items: center; gap: 12px;
    padding: 6px 8px; border-radius: 6px; cursor: pointer;
    transition: background 0.15s;
  }
  .sp-top-row:hover { background: rgba(255,255,255,0.07); }
  .sp-top-num { font-size: 14px; color: #b3b3b3; text-align: right; }

  /* States */
  .sp-spinner-wrap { display: flex; justify-content: center; padding: 60px; }
  .sp-spinner {
    width: 36px; height: 36px;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: #1ed760;
    border-radius: 50%;
    animation: sp-spin 0.7s linear infinite;
  }
  @keyframes sp-spin { to { transform: rotate(360deg); } }

  .sp-empty {
    text-align: center; padding: 72px 24px; color: #b3b3b3;
  }
  .sp-empty-emoji { font-size: 56px; margin-bottom: 20px; }
  .sp-empty-title { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 10px; }
  .sp-empty-sub { font-size: 15px; }

  .sp-fade { animation: sp-fadein 0.25s ease both; }
  @keyframes sp-fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; } }

  @media (max-width: 580px) {
    .sp-top-grid { grid-template-columns: 1fr; }
    .sp-artists-grid { grid-template-columns: repeat(2, 1fr); }
    .sp-albums-grid  { grid-template-columns: repeat(2, 1fr); }
  }
`;

function injectStyles() {
  if (!document.getElementById('sp-search-styles')) {
    const el = document.createElement('style');
    el.id = 'sp-search-styles';
    el.textContent = CSS;
    document.head.appendChild(el);
  }
}

// ============================================================
// ICONS
// ============================================================
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3.868v16.264c0 .787.863 1.26 1.543.847l13.5-8.132a1 1 0 0 0 0-1.694l-13.5-8.132C5.863 2.608 5 3.08 5 3.868z"/>
    </svg>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================
function Spinner() {
  return <div className="sp-spinner-wrap"><div className="sp-spinner" /></div>;
}

function ArtistCard({ artist, index }) {
  return (
    <div className="sp-artist-card sp-fade" style={{ animationDelay: `${index * 35}ms` }}>
      {artist.picture_medium
        ? <img src={artist.picture_medium} alt={artist.name} className="sp-artist-img" onError={e => e.target.style.display = 'none'} />
        : <div className="sp-artist-img-placeholder">🎤</div>
      }
      <div className="sp-artist-name">{artist.name}</div>
      <div className="sp-artist-meta">{formatFans(artist.nb_fan)} fans · {artist.nb_album ?? 0} albums</div>
      <button className="sp-play-fab" onClick={e => e.stopPropagation()} aria-label="Play">
        <IconPlay />
      </button>
    </div>
  );
}

function AlbumCard({ album, index }) {
  const year = album.release_date ? new Date(album.release_date).getFullYear() : null;
  return (
    <div className="sp-album-card sp-fade" style={{ animationDelay: `${index * 35}ms` }}>
      {album.cover_medium
        ? <img src={album.cover_medium} alt={album.title} className="sp-album-img" onError={e => e.target.style.display = 'none'} />
        : <div className="sp-album-img-placeholder">💿</div>
      }
      <div className="sp-album-name">{album.title}</div>
      <div className="sp-album-meta">{year && `${year} · `}{album.artist?.name}</div>
    </div>
  );
}

function TrackRow({ track, index }) {
  return (
    <div className="sp-track-row sp-fade" style={{ animationDelay: `${index * 25}ms` }}>
      <div className="sp-track-body">
        <div className="sp-track-idx">
          <span className="sp-track-num">{index + 1}</span>
          <span className="sp-track-play"><IconPlay /></span>
        </div>
        {track.album?.cover_medium
          ? <img src={track.album.cover_medium} alt="" className="sp-track-thumb" onError={e => e.target.style.display = 'none'} />
          : <div className="sp-track-thumb-ph">🎵</div>
        }
        <div className="sp-track-text">
          <div className="sp-track-title">{track.title}</div>
          <div className="sp-track-sub">{track.artist?.name} · {track.album?.title}</div>
        </div>
      </div>
      <div className="sp-track-right">
        {track.explicit_lyrics && <span className="sp-explicit">E</span>}
        <span className="sp-track-dur">{formatDuration(track.duration)}</span>
      </div>
    </div>
  );
}

function TopRow({ item, index, isArtist }) {
  const img = isArtist ? item.picture_medium : item.album?.cover_medium;
  const title = item.title ?? item.name;
  const sub = isArtist
    ? `${formatFans(item.nb_fan)} fans`
    : item.artist?.name;

  return (
    <div className="sp-top-row">
      <span className="sp-top-num">{index + 1}</span>
      {img
        ? <img src={img} alt="" style={{ width: 44, height: 44, borderRadius: isArtist ? '50%' : 3, objectFit: 'cover', background: '#333' }} onError={e => e.target.style.display = 'none'} />
        : <div style={{ width: 44, height: 44, borderRadius: isArtist ? '50%' : 3, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isArtist ? '🎤' : '🎵'}</div>
      }
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
          {!isArtist && item.explicit_lyrics && <span className="sp-explicit" style={{ marginRight: 6 }}>E</span>}
          {title}
        </div>
        <div style={{ fontSize: 12, color: '#b3b3b3' }}>{sub}</div>
      </div>
      {!isArtist && <span style={{ fontSize: 13, color: '#b3b3b3', fontVariantNumeric: 'tabular-nums' }}>{formatDuration(item.duration)}</span>}
    </div>
  );
}

// ============================================================
// MAIN
// ============================================================
export default function Search({ token }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [showTop, setShowTop]         = useState(false);

  useEffect(() => { injectStyles(); }, []);

  const auth = { context: { headers: { authorization: `Bearer ${token}` } } };

  const { data, loading } = useQuery(SEARCH_QUERY, {
    variables: { query: activeQuery, limit: 20 },
    skip: !activeQuery,
    ...auth,
  });

  const { data: topArtistsData, loading: laTop } = useQuery(TOP_ARTISTS_QUERY, {
    variables: { limit: 10 }, skip: !showTop, ...auth,
  });

  const { data: topTracksData, loading: ltTop } = useQuery(TOP_TRACKS_QUERY, {
    variables: { limit: 10 }, skip: !showTop, ...auth,
  });

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim()) { setActiveQuery(''); return; }
    const t = setTimeout(() => setActiveQuery(searchQuery.trim()), 380);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const artists = data?.search?.artists || [];
  const albums  = data?.search?.albums  || [];
  const tracks  = data?.search?.tracks  || [];
  const topArtists = topArtistsData?.topArtists || [];
  const topTracks  = topTracksData?.topTracks   || [];
  const hasResults = artists.length || albums.length || tracks.length;

  return (
    <div className="sp-wrap">

      {/* Search bar */}
      <div className="sp-search-bar">
        <div className="sp-search-input-wrap">
          <span className="sp-search-icon"><IconSearch /></span>
          <input
            className="sp-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Artistes, albums ou pistes"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          className={`sp-top-btn${showTop ? ' active' : ''}`}
          onClick={() => setShowTop(s => !s)}
        >
          🏆 Top 10
        </button>
      </div>

      {/* Top 10 */}
      {showTop && (
        <div className="sp-section sp-fade">
          <div className="sp-section-title">Top du moment</div>
          {(laTop || ltTop) ? <Spinner /> : (
            <div className="sp-top-grid">
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Artistes</div>
                {topArtists.map((a, i) => <TopRow key={a.id} item={a} index={i} isArtist />)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#b3b3b3', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Pistes</div>
                {topTracks.map((t, i) => <TopRow key={t.id} item={t} index={i} isArtist={false} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {activeQuery && (
        <>
          {loading && <Spinner />}

          {!loading && !hasResults && (
            <div className="sp-empty sp-fade">
              <div className="sp-empty-emoji">🔍</div>
              <div className="sp-empty-title">Aucun résultat pour « {activeQuery} »</div>
              <div className="sp-empty-sub">Vérifiez l'orthographe ou essayez d'autres mots-clés.</div>
            </div>
          )}

          {!loading && !!hasResults && (
            <>
              {artists.length > 0 && (
                <div className="sp-section">
                  <div className="sp-section-title">Artistes</div>
                  <div className="sp-artists-grid">
                    {artists.map((a, i) => <ArtistCard key={a.id} artist={a} index={i} />)}
                  </div>
                </div>
              )}

              {albums.length > 0 && (
                <div className="sp-section" style={{ marginTop: 16 }}>
                  <div className="sp-section-title">Albums</div>
                  <div className="sp-albums-grid">
                    {albums.map((a, i) => <AlbumCard key={a.id} album={a} index={i} />)}
                  </div>
                </div>
              )}

              {tracks.length > 0 && (
                <div className="sp-section" style={{ marginTop: 16 }}>
                  <div className="sp-section-title">Pistes</div>
                  <div className="sp-track-list">
                    {tracks.map((t, i) => <TrackRow key={t.id} track={t} index={i} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Default state */}
      {!activeQuery && !showTop && (
        <div className="sp-empty" style={{ paddingTop: 80 }}>
          <div className="sp-empty-emoji">🎵</div>
          <div className="sp-empty-title">Trouvez ce que vous aimez</div>
          <div className="sp-empty-sub">Recherchez vos artistes, albums ou pistes préférés.</div>
        </div>
      )}
    </div>
  );
}