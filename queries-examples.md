# Exemples de requêtes GraphQL — Music API

## 🔐 Authentification

### Inscription
```graphql
mutation Register {
  register(input: {
    username: "nouveau_user"
    email: "nouveau@example.com"
    password: "MonMotDePasse123!"
    favoriteGenres: ["Jazz", "Rock"]
  }) {
    token
    user {
      id
      username
      email
      role
    }
  }
}
```

### Connexion
```graphql
mutation Login {
  login(input: {
    email: "admin@music.app"
    password: "Admin1234!"
  }) {
    token
    user { id username role }
  }
}
```

---

## 📖 QUERIES

### Lister tous les artistes (avec pagination et filtres)
```graphql
query GetArtists {
  artists(
    filter: { genre: "Rock" }
    sort: { field: NAME, order: ASC }
    page: 1
    limit: 10
  ) {
    nodes {
      id
      name
      country
      genres
      totalAlbums
    }
    totalCount
    pageInfo {
      currentPage
      totalPages
      hasNextPage
    }
  }
}
```

### Artiste avec tous ses albums et pistes
```graphql
query GetArtistFull($id: ID!) {
  artist(id: $id) {
    id
    name
    bio
    country
    genres
    albums {
      id
      title
      releaseDate
      genre
      averageRating
      tracks {
        id
        title
        durationFormatted
        plays
      }
    }
  }
}
```

### Top 10 des pistes les plus écoutées
```graphql
query TopTracks {
  topTracks(limit: 10) {
    id
    title
    plays
    durationFormatted
    artist { name }
    album { title coverUrl }
  }
}
```

### Recherche globale
```graphql
query Search($q: String!) {
  search(query: $q, limit: 5) {
    artists { id name country }
    albums  { id title genre }
    tracks  { id title durationFormatted artist { name } }
  }
}
```

### Albums avec filtre et tri
```graphql
query GetAlbums {
  albums(
    filter: { genre: "Jazz", yearFrom: 1950, yearTo: 1970 }
    sort: { field: RELEASE_DATE, order: ASC }
    page: 1
    limit: 5
  ) {
    nodes {
      title
      releaseDate
      averageRating
      artist { name }
    }
    totalCount
  }
}
```

---

## ✏️ MUTATIONS

### Créer un artiste (admin)
```graphql
# Header requis : Authorization: Bearer <token_admin>
mutation CreateArtist {
  createArtist(input: {
    name: "Pink Floyd"
    bio: "Groupe de rock progressif britannique"
    country: "Royaume-Uni"
    genres: ["Rock Progressif", "Psychédélique", "Space Rock"]
    birthDate: "1965-01-01"
    socialLinks: {
      spotify: "https://open.spotify.com/artist/0k17h0D3J5VfsdmQ1iZtE9"
    }
  }) {
    id
    name
    genres
  }
}
```

### Créer une playlist
```graphql
# Header requis : Authorization: Bearer <token_user>
mutation CreatePlaylist {
  createPlaylist(input: {
    name: "Ma playlist Jazz du soir"
    description: "Sélection de jazz pour se détendre"
    isPublic: true
  }) {
    id
    name
    user { username }
  }
}
```

### Ajouter une piste à une playlist
```graphql
mutation AddTrack {
  addTrackToPlaylist(
    playlistId: "..."
    trackId: "..."
  ) {
    id
    name
    totalTracks
    tracks { title artist { name } }
  }
}
```

### Incrémenter les écoutes d'une piste
```graphql
mutation Play {
  incrementPlays(trackId: "...") {
    id
    title
    plays
  }
}
```

### Publier un avis sur un album
```graphql
mutation PostReview {
  createReview(input: {
    albumId: "..."
    rating: 5
    comment: "Un chef-d'œuvre absolu !"
  }) {
    id
    rating
    comment
    user { username }
    album { title }
  }
}
```

---

## 🔔 SUBSCRIPTIONS

### Nouvelle piste ajoutée
```graphql
subscription OnTrackAdded {
  trackAdded {
    id
    title
    artist { name }
    album { title }
    durationFormatted
  }
}
```

### Avis ajouté sur un album spécifique
```graphql
subscription OnReviewAdded($albumId: ID!) {
  reviewAdded(albumId: $albumId) {
    id
    rating
    comment
    user { username }
  }
}
```

### Plays en temps réel d'une piste
```graphql
subscription OnPlaysUpdated($trackId: ID!) {
  trackPlaysUpdated(trackId: $trackId) {
    id
    title
    plays
  }
}
```

### Album ajouté pour un artiste
```graphql
subscription OnAlbumAdded($artistId: ID!) {
  albumAdded(artistId: $artistId) {
    id
    title
    coverUrl
    genre
  }
}
```

---

## 🔑 Authentification par Client Credentials (Option 1)

Envoyez ces headers dans vos requêtes HTTP :
```
x-client-id: music_app_client
x-client-secret: music_app_secret_2024
```

Cela accorde un accès admin automatique sans JWT.
