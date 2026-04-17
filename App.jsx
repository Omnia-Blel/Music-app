import { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:4000/graphql";

// ============================================================
// HELPERS
// ============================================================
async function gql(query, variables = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

/** Convertit une durée en secondes → "m:ss" */
function formatDuration(seconds) {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

const QUERIES = {
  ARTISTS: `query Artists($filter: ArtistFilter, $sort: ArtistSort, $page: Int, $limit: Int) {
    artists(filter: $filter, sort: $sort, page: $page, limit: $limit) {
      nodes { id name nb_fan nb_album picture_medium }
      totalCount
      pageInfo { currentPage totalPages hasNextPage hasPreviousPage }
    }
  }`,

  ARTIST_DETAIL: `query Artist($id: ID!) {
    artist(id: $id) {
      id name nb_fan nb_album picture_medium tracklist link
      albums {
        id title genre_id release_date nb_tracks cover_medium
        tracks { id title duration rank explicit_lyrics position }
      }
    }
  }`,

  TOP_TRACKS: `query TopTracks($limit: Int) {
    topTracks(limit: $limit) {
      id title duration rank explicit_lyrics
      artist { name }
      album { title cover_medium }
    }
  }`,

  SEARCH: `query Search($q: String!) {
    search(query: $q, limit: 6) {
      artists { id name nb_fan }
      albums  { id title genre_id }
      tracks  { id title duration artist { name } }
    }
  }`,

  LOGIN: `mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      user { id username email role }
    }
  }`,

  ME: `query Me { me { id username email role } }`,

  LIKED_TRACKS: `query {
    likedTracks {
      id
      createdAt
      track {
        id
        title
        duration
        rank
        explicit_lyrics
        artist { name }
        album { title cover_medium }
      }
    }
  }`,
  
  LIKE_TRACK: `mutation LikeTrack($trackId: ID!) {
    likeTrack(trackId: $trackId) {
      id
    }
  }`,
  
  UNLIKE_TRACK: `mutation UnlikeTrack($trackId: ID!) {
    unlikeTrack(trackId: $trackId) {
      acknowledged
    }
  }`,
}; 

// ============================================================
// COMPOSANTS UI
// ============================================================

function Badge({ children, color = "gray" }) {
  const colors = {
    gray:   { bg: "var(--color-background-secondary)", color: "var(--color-text-secondary)" },
    purple: { bg: "#EEEDFE", color: "#3C3489" },
    teal:   { bg: "#E1F5EE", color: "#0F6E56" },
    coral:  { bg: "#FAECE7", color: "#993C1D" },
    amber:  { bg: "#FAEEDA", color: "#854F0B" },
    blue:   { bg: "#E6F1FB", color: "#185FA5" },
    red:    { bg: "#FCEBEB", color: "#A32D2D" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      background: c.bg, color: c.color,
      fontSize: 11, fontWeight: 500, padding: "2px 8px",
      borderRadius: 99, display: "inline-block", whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
      <div style={{
        width: 28, height: 28, border: "2px solid var(--color-border-tertiary)",
        borderTopColor: "var(--color-text-secondary)",
        borderRadius: "50%", animation: "spin 0.8s linear infinite",
      }}/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/** Affiche le rank de la piste comme indicateur de popularité */
function RankBadge({ rank }) {
  if (!rank && rank !== 0) return <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>—</span>;
  const fmt = rank >= 1_000_000
    ? `${(rank / 1_000_000).toFixed(1)}M`
    : rank >= 1_000
    ? `${Math.round(rank / 1_000)}K`
    : rank;
  return <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>★ {fmt}</span>;
}

// ============================================================
// VUE : Top Tracks
// ============================================================
function TopTracksView({ token }) {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    setLoading(true);
    gql(QUERIES.TOP_TRACKS, { limit }, token)
      .then(r => { setTracks(r.data?.topTracks || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [limit, token]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Afficher</label>
        <select value={limit} onChange={e => setLimit(+e.target.value)}
          style={{ fontSize: 13, padding: "4px 8px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)" }}>
          {[5, 10, 20].map(n => <option key={n} value={n}>{n} pistes</option>)}
        </select>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tracks.map((t, i) => (
            <div key={t.id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px",
              background: "var(--color-background-secondary)",
              borderRadius: "var(--border-radius-md)",
              border: "0.5px solid var(--color-border-tertiary)",
            }}>
              <span style={{ fontWeight: 500, fontSize: 13, color: "var(--color-text-secondary)", minWidth: 20, textAlign: "right" }}>{i + 1}</span>
              {t.album?.cover_medium ? (
                <div style={{ width: 36, height: 36, borderRadius: 4, background: "var(--color-border-tertiary)", overflow: "hidden", flexShrink: 0 }}>
                  <img src={t.album.cover_medium} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                </div>
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 4, background: "var(--color-border-tertiary)", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.explicit_lyrics && <Badge color="red">E</Badge>} {t.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{t.artist?.name} · {t.album?.title}</div>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <RankBadge rank={t.rank} />
                <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{formatDuration(t.duration)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// VUE : Artistes
// ============================================================
function ArtistsView({ token, onSelectArtist }) {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback((p = 1, q = "") => {
    setLoading(true);
    const filter = q ? { searchName: q } : {};
    gql(QUERIES.ARTISTS, { filter, page: p, limit: 6, sort: { field: "NAME", order: "ASC" } }, token)
      .then(r => {
        const data = r.data?.artists;
        setArtists(data?.nodes || []);
        setPageInfo(data?.pageInfo);
        setTotalCount(data?.totalCount || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(page, search); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  return (
    <div>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un artiste..."
          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 14 }}
        />
        <button type="submit" style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", cursor: "pointer", fontSize: 13 }}>
          Chercher
        </button>
      </form>

      {loading ? <Spinner /> : (
        <>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 12 }}>{totalCount} artiste{totalCount > 1 ? "s" : ""}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {artists.map(a => (
              <div key={a.id}
                onClick={() => onSelectArtist(a.id)}
                style={{
                  padding: 14, cursor: "pointer",
                  background: "var(--color-background-secondary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: "var(--border-radius-lg)",
                  transition: "border-color 0.15s",
                  display: "flex", alignItems: "center", gap: 12,
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-border-primary)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--color-border-tertiary)"}
              >
                {a.picture_medium ? (
                  <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "var(--color-border-tertiary)" }}>
                    <img src={a.picture_medium} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                  </div>
                ) : (
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--color-border-tertiary)", flexShrink: 0 }} />
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                    {a.nb_album ?? 0} album{a.nb_album > 1 ? "s" : ""} · {a.nb_fan?.toLocaleString("fr-FR") ?? 0} fans
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pageInfo && (pageInfo.hasNextPage || pageInfo.hasPreviousPage) && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
              <button disabled={!pageInfo.hasPreviousPage}
                onClick={() => setPage(p => p - 1)}
                style={{ padding: "6px 14px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", cursor: pageInfo.hasPreviousPage ? "pointer" : "default", opacity: pageInfo.hasPreviousPage ? 1 : 0.4, fontSize: 13 }}>
                ← Préc.
              </button>
              <span style={{ fontSize: 13, lineHeight: "30px", color: "var(--color-text-secondary)" }}>
                {pageInfo.currentPage} / {pageInfo.totalPages}
              </span>
              <button disabled={!pageInfo.hasNextPage}
                onClick={() => setPage(p => p + 1)}
                style={{ padding: "6px 14px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", cursor: pageInfo.hasNextPage ? "pointer" : "default", opacity: pageInfo.hasNextPage ? 1 : 0.4, fontSize: 13 }}>
                Suiv. →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// VUE : Détail artiste
// ============================================================
function ArtistDetail({ artistId, token, onBack }) {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    setLoading(true);
    gql(QUERIES.ARTIST_DETAIL, { id: artistId }, token)
      .then(r => { setArtist(r.data?.artist); setLoading(false); })
      .catch(() => setLoading(false));
  }, [artistId, token]);

  if (loading) return <Spinner />;
  if (!artist) return <p style={{ color: "var(--color-text-secondary)" }}>Artiste introuvable.</p>;

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 16, padding: "6px 12px", borderRadius: 6, border: "0.5px solid var(--color-border-secondary)", background: "none", color: "var(--color-text-secondary)", cursor: "pointer", fontSize: 13 }}>
        ← Retour
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        {artist.picture_medium ? (
          <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "var(--color-border-tertiary)" }}>
            <img src={artist.picture_medium} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
          </div>
        ) : (
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--color-border-tertiary)", flexShrink: 0 }} />
        )}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>{artist.name}</h2>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            {artist.nb_album ?? 0} album{artist.nb_album > 1 ? "s" : ""} · {artist.nb_fan?.toLocaleString("fr-FR") ?? 0} fans
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 500, margin: "0 0 12px" }}>Albums ({artist.albums?.length || 0})</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {artist.albums?.map(album => (
          <div key={album.id} style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>
            <div
              onClick={() => setExpanded(expanded === album.id ? null : album.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, cursor: "pointer", background: "var(--color-background-secondary)" }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 6, background: "var(--color-border-tertiary)", flexShrink: 0, overflow: "hidden" }}>
                {album.cover_medium && <img src={album.cover_medium} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 15 }}>{album.title}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
                  {album.genre_id ? `Genre #${album.genre_id}` : "—"} · {album.release_date ? new Date(album.release_date).getFullYear() : "?"} · {album.nb_tracks ?? 0} piste{album.nb_tracks > 1 ? "s" : ""}
                </div>
              </div>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{expanded === album.id ? "▲" : "▼"}</span>
            </div>

            {expanded === album.id && (
              <div style={{ background: "var(--color-background-primary)" }}>
                {album.tracks?.map(t => (
                  <div key={t.id} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
                    borderTop: "0.5px solid var(--color-border-tertiary)",
                  }}>
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)", minWidth: 18, textAlign: "right" }}>{t.position ?? "—"}</span>
                    <span style={{ flex: 1, fontSize: 14 }}>
                      {t.explicit_lyrics && <Badge color="red">E</Badge>} {t.title}
                    </span>
                    <RankBadge rank={t.rank} />
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{formatDuration(t.duration)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// VUE : Connexion
// ============================================================
function LoginView({ onLogin }) {
  const [email, setEmail] = useState("admin@music.app");
  const [password, setPassword] = useState("Admin1234!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await gql(QUERIES.LOGIN, { email, password });
      if (r.data?.login) {
        onLogin(r.data.login.token, r.data.login.user);
      } else {
        setError(r.errors?.[0]?.message || "Erreur de connexion.");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 360, margin: "0 auto", padding: "2rem 0" }}>
      <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 20 }}>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 14, boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Mot de passe</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", fontSize: 14, boxSizing: "border-box" }}
          />
        </div>
        {error && <p style={{ fontSize: 13, color: "var(--color-text-danger)", marginBottom: 12 }}>{error}</p>}
        <button type="submit" disabled={loading}
          style={{ width: "100%", padding: "10px", borderRadius: 8, border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-secondary)", color: "var(--color-text-primary)", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <div style={{ marginTop: 16, padding: 12, background: "var(--color-background-secondary)", borderRadius: 8, fontSize: 12, color: "var(--color-text-secondary)" }}>
        <strong>Comptes de test :</strong><br />
        Admin : admin@music.app / Admin1234!<br />
        User : alice@example.com / User1234!
      </div>
    </div>
  );
}

// ============================================================
// APP PRINCIPALE
// ============================================================
export default function App() {
  const [tab, setTab] = useState("top");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);

  const tabs = [
    { id: "top",     label: "Top Tracks" },
    { id: "artists", label: "Artistes" },
    { id: "auth",    label: user ? user.username : "Connexion" },
  ];

  const handleLogin = (t, u) => { setToken(t); setUser(u); setTab("top"); };
  const handleLogout = () => { setToken(null); setUser(null); };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "1rem 0 2rem", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: "0 0 4px" }}>🎵 Music GraphQL</h1>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: 0 }}>
          Interface cliente de l'API GraphQL Musique
          {user && <> · <Badge color="teal">{user.role}</Badge></>}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "0.5px solid var(--color-border-tertiary)", paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.id}
            onClick={() => { setTab(t.id); if (t.id === "artists") setSelectedArtist(null); }}
            style={{
              padding: "8px 16px", fontSize: 14, cursor: "pointer",
              border: "none", background: "none",
              color: tab === t.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              borderBottom: tab === t.id ? "2px solid var(--color-text-primary)" : "2px solid transparent",
              fontWeight: tab === t.id ? 500 : 400,
              transition: "color 0.15s",
            }}>
            {t.label}
          </button>
        ))}
        {user && (
          <button onClick={handleLogout}
            style={{ marginLeft: "auto", padding: "8px 12px", fontSize: 13, cursor: "pointer", border: "none", background: "none", color: "var(--color-text-secondary)" }}>
            Déconnexion
          </button>
        )}
      </div>

      {/* Content */}
      {tab === "top" && <TopTracksView token={token} />}
      {tab === "artists" && (
        selectedArtist
          ? <ArtistDetail artistId={selectedArtist} token={token} onBack={() => setSelectedArtist(null)} />
          : <ArtistsView token={token} onSelectArtist={setSelectedArtist} />
      )}
      {tab === "auth" && (
        user
          ? (
            <div style={{ padding: "1rem 0" }}>
              <div style={{ padding: 16, background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>{user.username}</div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>{user.email}</div>
                <Badge color={user.role === "admin" ? "coral" : "blue"}>{user.role}</Badge>
              </div>
            </div>
          )
          : <LoginView onLogin={handleLogin} />
      )}
    </div>
  );
}