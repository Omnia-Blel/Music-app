import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, HttpLink, ApolloProvider } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import './App.css';
import Auth from './components/Auth';
import Artists from './components/Artists';
import Albums from './components/Albums';
import Tracks from './components/Tracks';
import Playlists from './components/Playlists';
import Reviews from './components/Reviews';
import Search from './components/Search';

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
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const [activeTab, setActiveTab] = useState('artists');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return (
      <ApolloProvider client={client}>
        <div className="app">
          <Auth onLogin={(token, user) => {
            setToken(token);
            setUser(user);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
          }} />
        </div>
      </ApolloProvider>
    );
  }

  return (
    <ApolloProvider client={client}>
      <div className="app">
        <header className="header">
          <h1>🎵 Music GraphQL Tester</h1>
          <div className="user-info">
            <span>👤 {user?.username} ({user?.role})</span>
            <button onClick={handleLogout} className="logout-btn">Déconnexion</button>
          </div>
        </header>

        <nav className="nav-tabs">
          <button 
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Recherche
          </button>
          <button 
            className={`tab ${activeTab === 'artists' ? 'active' : ''}`}
            onClick={() => setActiveTab('artists')}
          >
            🎤 Artistes
          </button>
          <button 
            className={`tab ${activeTab === 'albums' ? 'active' : ''}`}
            onClick={() => setActiveTab('albums')}
          >
            💿 Albums
          </button>
          <button 
            className={`tab ${activeTab === 'tracks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracks')}
          >
            🎵 Pistes
          </button>
          <button 
            className={`tab ${activeTab === 'playlists' ? 'active' : ''}`}
            onClick={() => setActiveTab('playlists')}
          >
            📋 Playlists
          </button>
          <button 
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ Avis
          </button>
        </nav>

        <main className="content">
          {activeTab === 'search' && <Search token={token} />}
          {activeTab === 'artists' && <Artists token={token} userRole={user?.role} />}
          {activeTab === 'albums' && <Albums token={token} userRole={user?.role} />}
          {activeTab === 'tracks' && <Tracks token={token} userRole={user?.role} />}
          {activeTab === 'playlists' && <Playlists token={token} userId={user?.id} />}
          {activeTab === 'reviews' && <Reviews token={token} userId={user?.id} />}
        </main>
      </div>
    </ApolloProvider>
  );
}

export default App;
