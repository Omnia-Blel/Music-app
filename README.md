# 🎵 Music GraphQL API

API GraphQL complète autour de la musique — Mini-Projet Universitaire.

## 🏗️ Architecture

```
music-graphql/
├── src/
│   ├── index.js          ← Serveur Express + Apollo + WebSocket
│   ├── schema.js         ← Schéma GraphQL (types, queries, mutations, subscriptions)
│   ├── auth.js           ← Middleware d'authentification (JWT + Client Credentials)
│   ├── models/
│   │   └── index.js      ← Modèles Mongoose (Artist, Album, Track, Playlist, User, Review)
│   └── resolvers/
│       └── index.js      ← Résolveurs GraphQL complets
├── database/
│   └── seed.js           ← Script de peuplement avec données réelles
├── docs/
│   └── queries-examples.md ← Exemples de requêtes GraphQL
├── .env.example          ← Variables d'environnement
└── package.json
```

## 🗄️ Modèle de données

### Entités principales

| Entité    | Description                         |
|-----------|-------------------------------------|
| `Artist`  | Artiste avec bio, genres, liens sociaux |
| `Album`   | Album lié à un artiste              |
| `Track`   | Piste audio liée à un album         |
| `Playlist`| Playlist créée par un utilisateur   |
| `User`    | Utilisateur (rôle user ou admin)    |
| `Review`  | Avis noté (1-5) sur un album        |

### Relations

```
Artist  ──< Album  ──< Track
User    ──< Playlist ─< Track (références)
User    ──< Review  >── Album
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+
- MongoDB 6+

### Étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditez .env avec vos valeurs

# 3. Peupler la base de données
npm run seed

# 4. Démarrer le serveur
npm run dev
```

L'API sera disponible sur :
- 🔗 **HTTP GraphQL** : http://localhost:4000/graphql
- 🔗 **WebSocket**    : ws://localhost:4000/graphql
- 💡 **Sandbox Apollo**: http://localhost:4000/graphql (navigateur)

## ✨ Fonctionnalités

### Queries
- Lister artistes, albums, pistes avec **pagination**
- **Filtrer** par genre, pays, artiste, année, nombre de plays...
- **Trier** par nom, date, plays, note...
- Recherche globale (artistes + albums + pistes)
- Top tracks et top artistes

### Mutations
- Inscription / Connexion (JWT)
- CRUD Artistes, Albums, Pistes (admin)
- Gestion playlists (utilisateur authentifié)
- Avis sur albums
- Incrément des plays

### Subscriptions (temps réel)
- `trackAdded` — nouvelle piste ajoutée
- `albumAdded(artistId)` — nouvel album d'un artiste
- `artistUpdated` — mise à jour d'un artiste
- `playlistUpdated(playlistId)` — changement dans une playlist
- `reviewAdded(albumId)` — nouvel avis sur un album
- `trackPlaysUpdated(trackId)` — plays en temps réel

## 🔐 Sécurité

### Option 1 — Client Credentials (simple)
```http
x-client-id: music_app_client
x-client-secret: music_app_secret_2024
```

### Option 2 — JWT Bearer Token
```http
Authorization: Bearer <votre_token_jwt>
```

Obtenez un token via `mutation login`.

## 📊 APIs publiques utilisables pour enrichir les données

| API              | Utilisation                          | Lien                          |
|------------------|--------------------------------------|-------------------------------|
| **MusicBrainz**  | Métadonnées (artistes, albums, tracks) | https://musicbrainz.org/doc/MusicBrainz_API |
| **Last.fm**      | Popularité, tags, biographies        | https://www.last.fm/api       |
| **Spotify Web API** | Covers, audio features, popularité | https://developer.spotify.com/documentation/web-api |
| **Discogs**      | Données de disques, labels           | https://www.discogs.com/developers/ |
| **Genius**       | Paroles de chansons                  | https://docs.genius.com/      |
| **AcousticBrainz** | Caractéristiques audio             | https://acousticbrainz.org/   |

## 🧪 Comptes de test

| Rôle  | Email                | Mot de passe  |
|-------|----------------------|---------------|
| Admin | admin@music.app      | Admin1234!    |
| User  | alice@example.com    | User1234!     |
| User  | bob@example.com      | User1234!     |
