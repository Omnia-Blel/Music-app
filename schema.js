const { gql } = require('graphql-tag');

const typeDefs = gql`

  # ================================
  # TYPES PRINCIPAUX
  # ================================

  type Artist {
    id: ID!
    name: String!
    bio: String
    country: String
    birthDate: String
    genres: [String!]
    imageUrl: String
    socialLinks: SocialLinks
    albums: [Album!]
    totalAlbums: Int
    createdAt: String!
    updatedAt: String!
  }

  type SocialLinks {
    spotify: String
    instagram: String
    youtube: String
  }

  type Album {
    id: ID!
    title: String!
    artist: Artist!
    releaseDate: String
    genre: String
    label: String
    coverUrl: String
    description: String
    totalTracks: Int
    tracks: [Track!]
    reviews: [Review!]
    averageRating: Float
    createdAt: String!
    updatedAt: String!
  }

  type Track {
    id: ID!
    title: String!
    album: Album!
    artist: Artist!
    duration: Int
    durationFormatted: String
    trackNumber: Int
    lyrics: String
    audioUrl: String
    plays: Int
    isExplicit: Boolean
    createdAt: String!
    updatedAt: String!
  }

  type Playlist {
    id: ID!
    name: String!
    description: String
    user: User!
    tracks: [Track!]
    totalTracks: Int
    isPublic: Boolean
    coverUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    favoriteGenres: [String!]
    playlists: [Playlist!]
    createdAt: String!
  }

  type Review {
    id: ID!
    user: User!
    album: Album!
    rating: Int!
    comment: String
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # ================================
  # PAGINATION & FILTRES
  # ================================

  type ArtistConnection {
    nodes: [Artist!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type AlbumConnection {
    nodes: [Album!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type TrackConnection {
    nodes: [Track!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type ReviewConnection {
    nodes: [Review!]!
    totalCount: Int!
    hasMore: Boolean!
    total: Int!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }

  input ArtistFilter {
    country: String
    genre: String
    searchName: String
  }

  input AlbumFilter {
    genre: String
    artistId: ID
    yearFrom: Int
    yearTo: Int
  }

  input TrackFilter {
    albumId: ID
    artistId: ID
    isExplicit: Boolean
    minPlays: Int
  }

  enum SortOrder {
    ASC
    DESC
  }

  enum ArtistSortField {
    NAME
    CREATED_AT
  }

  enum AlbumSortField {
    TITLE
    RELEASE_DATE
    AVERAGE_RATING
  }

  enum TrackSortField {
    TITLE
    PLAYS
    DURATION
    TRACK_NUMBER
  }

  input ArtistSort {
    field: ArtistSortField!
    order: SortOrder!
  }

  input AlbumSort {
    field: AlbumSortField!
    order: SortOrder!
  }

  input TrackSort {
    field: TrackSortField!
    order: SortOrder!
  }

  # ================================
  # QUERIES
  # ================================

  type Query {
    # --- Artistes ---
    artists(
      filter: ArtistFilter
      sort: ArtistSort
      page: Int
      limit: Int
    ): ArtistConnection!

    artist(id: ID!): Artist

    # --- Albums ---
    albums(
      filter: AlbumFilter
      sort: AlbumSort
      page: Int
      limit: Int
    ): AlbumConnection!

    album(id: ID!): Album

    # --- Tracks ---
    tracks(
      filter: TrackFilter
      sort: TrackSort
      page: Int
      limit: Int
    ): TrackConnection!

    track(id: ID!): Track

    # --- Top ---
    topTracks(limit: Int): [Track!]!
    topArtists(limit: Int): [Artist!]!

    # --- Playlists ---
    playlists(userId: ID, isPublic: Boolean): [Playlist!]!
    playlist(id: ID!): Playlist

    # --- Reviews ---
    reviews(page: Int, limit: Int): ReviewConnection!
    albumReviews(albumId: ID!): [Review!]!
    userReviews(userId: ID!): [Review!]!

    # --- Utilisateurs ---
    me: User
    users: [User!]!

    # --- Recherche globale ---
    search(query: String!, limit: Int): SearchResults!
  }

  type SearchResults {
    artists: [Artist!]!
    albums: [Album!]!
    tracks: [Track!]!
  }

  # ================================
  # MUTATIONS
  # ================================

  type Mutation {
    # --- Auth ---
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # --- Artistes (admin) ---
    createArtist(input: CreateArtistInput!): Artist!
    updateArtist(id: ID!, input: UpdateArtistInput!): Artist!
    deleteArtist(id: ID!): DeleteResult!

    # --- Albums (admin) ---
    createAlbum(input: CreateAlbumInput!): Album!
    updateAlbum(id: ID!, input: UpdateAlbumInput!): Album!
    deleteAlbum(id: ID!): DeleteResult!

    # --- Tracks (admin) ---
    createTrack(input: CreateTrackInput!): Track!
    updateTrack(id: ID!, input: UpdateTrackInput!): Track!
    deleteTrack(id: ID!): DeleteResult!

    # --- Playlists (user) ---
    createPlaylist(input: CreatePlaylistInput!): Playlist!
    updatePlaylist(id: ID!, input: UpdatePlaylistInput!): Playlist!
    addTrackToPlaylist(playlistId: ID!, trackId: ID!): Playlist!
    removeTrackFromPlaylist(playlistId: ID!, trackId: ID!): Playlist!
    deletePlaylist(id: ID!): DeleteResult!

    # --- Reviews (user) ---
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, input: UpdateReviewInput!): Review!
    deleteReview(id: ID!): DeleteResult!

    # --- Plays ---
    incrementPlays(trackId: ID!): Track!
  }

  type DeleteResult {
    success: Boolean!
    message: String!
  }

  # ================================
  # INPUTS POUR MUTATIONS
  # ================================

  input RegisterInput {
    username: String!
    email: String!
    password: String!
    favoriteGenres: [String!]
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateArtistInput {
    name: String!
    bio: String
    country: String
    birthDate: String
    genres: [String!]
    imageUrl: String
    socialLinks: SocialLinksInput
  }

  input UpdateArtistInput {
    name: String
    bio: String
    country: String
    birthDate: String
    genres: [String!]
    imageUrl: String
    socialLinks: SocialLinksInput
  }

  input SocialLinksInput {
    spotify: String
    instagram: String
    youtube: String
  }

  input CreateAlbumInput {
    title: String!
    artistId: ID!
    releaseDate: String
    genre: String
    label: String
    coverUrl: String
    description: String
  }

  input UpdateAlbumInput {
    title: String
    releaseDate: String
    genre: String
    label: String
    coverUrl: String
    description: String
  }

  input CreateTrackInput {
    title: String!
    albumId: ID!
    artistId: ID!
    duration: Int
    trackNumber: Int
    lyrics: String
    audioUrl: String
    isExplicit: Boolean
  }

  input UpdateTrackInput {
    title: String
    duration: Int
    trackNumber: Int
    lyrics: String
    audioUrl: String
    isExplicit: Boolean
  }

  input CreatePlaylistInput {
    name: String!
    description: String
    isPublic: Boolean
    coverUrl: String
  }

  input UpdatePlaylistInput {
    name: String
    description: String
    isPublic: Boolean
    coverUrl: String
  }

  input CreateReviewInput {
    albumId: ID!
    rating: Int!
    comment: String
  }

  input UpdateReviewInput {
    rating: Int
    comment: String
  }

  # ================================
  # SUBSCRIPTIONS
  # ================================

  type Subscription {
    # Nouvelle piste ajoutée
    trackAdded: Track!

    # Album ajouté par un artiste spécifique
    albumAdded(artistId: ID): Album!

    # Artiste créé/mis à jour
    artistUpdated: Artist!

    # Changement dans une playlist (ajout / suppression de piste)
    playlistUpdated(playlistId: ID!): Playlist!

    # Nouveau avis posté sur un album
    reviewAdded(albumId: ID!): Review!

    # Nombre de plays en temps réel pour une piste
    trackPlaysUpdated(trackId: ID!): Track!
  }
`;

module.exports = typeDefs;
