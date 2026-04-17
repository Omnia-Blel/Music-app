import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider, gql, useQuery } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import './App.css';

import Auth from './components/Auth';
import Artists from './components/Artists';
import Albums from './components/Albums';
import Tracks from './components/Tracks';
import Playlists from './components/Playlists';
import Search from './components/Search';
import LikedTracks from "./components/LikedTracks";

// ================= APOLLO =================
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

// ================= QUERY =================
const GENRES_QUERY = gql`
  query Genres {
    genres {
      id
      name
      picture_medium
    }
  }
`;

// ================= HELPERS =================
function ImgWithFallback({ src, alt }) {
  const [error, setError] = useState(false);

  return error || !src ? (
    <div className="img-fallback">🎵</div>
  ) : (
    <img src={src} alt={alt} onError={() => setError(true)} />
  );
}

function Spinner() {
  return <div className="loading">Chargement...</div>;
}

// ================= GENRES =================
function Genres({ token }) {
  const { data, loading, error } = useQuery(GENRES_QUERY, {
    context: { headers: { authorization: `Bearer ${token}` } },
  });

  if (loading) return <Spinner />;
  if (error) return <div className="error">{error.message}</div>;

  return (
    <div>
      <h2>Genres</h2>
      <div className="grid">
        {data.genres.map((g) => (
          <div key={g.id} className="card">
            <ImgWithFallback src={g.picture_medium} alt={g.name} />
            <p>{g.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================= APP =================
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [activeTab, setActiveTab] = useState('artists');

  const handleLogin = (t, u) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return (
      <ApolloProvider client={client}>
        <Auth onLogin={handleLogin} />
      </ApolloProvider>
    );
  }

  const tabs = [
    { id: 'search', label: 'Recherche' },
    { id: 'artists', label: 'Artistes' },
    { id: 'albums', label: 'Albums' },
    { id: 'tracks', label: 'Pistes' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'genres', label: 'Genres' },
    { id: 'liked', label: 'Likés' },
  ];

  return (
    <ApolloProvider client={client}>
      <div className="spotify-layout">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <h1>Spotify UI</h1>

          {tabs.map(tab => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}

          <div className="user">
            <p>{user?.username}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="main">
          {activeTab === 'search' && <Search token={token} />}
          {activeTab === 'artists' && <Artists token={token} />}
          {activeTab === 'albums' && <Albums token={token} />}
          {activeTab === 'tracks' && <Tracks token={token} userRole={user?.role} />}
          {activeTab === 'playlists' && <Playlists token={token} userId={user?.id} />}
          {activeTab === 'genres' && <Genres token={token} />}
          {activeTab === 'liked' && <LikedTracks token={token} userId={user?.id} />}
        </main>

      </div>
    </ApolloProvider>
  );
}

export default App;