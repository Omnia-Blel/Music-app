const { gql } = require('graphql-tag');

const typeDefs = gql`

  # ================================
  # TYPES PRINCIPAUX
  # ================================

  type Artist {
    id: ID!
    name: String!
    link: String
    share: String
    picture: String
    picture_small: String
    picture_medium: String
    picture_big: String
    picture_xl: String
    nb_album: Int
    nb_fan: Int
    radio: Boolean
    tracklist: String
    albums: [Album!]
    createdAt: String
    updatedAt: String
  }

  type Album {
    id: ID!
    title: String!
    upc: String
    link: String
    share: String
    cover: String
    cover_small: String
    cover_medium: String
    cover_big: String
    cover_xl: String
    genre_id: Int
    label: String
    provider: String
    nb_tracks: Int
    duration: Int
    fans: Int
    release_date: String
    record_type: String
    available: Boolean
    tracklist: String
    explicit_lyrics: Boolean
    explicit_content_lyrics: Int
    explicit_content_cover: Int
    artist: Artist
    tracks: [Track!]
    createdAt: String
    updatedAt: String
  }

  type Track {
    id: ID!
    readable: Boolean
    title: String!
    title_short: String
    title_version: String
    isrc: String
    link: String
    share: String
    duration: Int
    track_position: Int
    disk_number: Int
    rank: Int
    release_date: String
    explicit_lyrics: Boolean
    explicit_content_lyrics: Int
    explicit_content_cover: Int
    preview: String
    bpm: Float
    gain: Float
    available_countries: [String]
    md5_image: String
    track_token: String
    cover: String
    cover_small: String
    cover_medium: String
    cover_big: String
    cover_xl: String
    position: Int
    artist: Artist
    album: Album
    createdAt: String
    updatedAt: String
  }

  type Playlist {
    id: ID!
    title: String!
    description: String
    duration: Int
    public: Boolean
    collaborative: Boolean
    nb_tracks: Int
    fans: Int
    link: String
    share: String
    picture: String
    picture_small: String
    picture_medium: String
    picture_big: String
    picture_xl: String
    tracks: [Track!]
    user: User
    createdAt: String
    updatedAt: String
  }

  type User {
    id: ID!
    username: String!
    email: String!
    role: String!
    createdAt: String
  }

  type Genre {
    id: ID!
    name: String!
    picture: String
    picture_small: String
    picture_medium: String
    picture_big: String
    picture_xl: String
  }

  type ArtistTracksResult {
    nodes: [Track!]!
    totalCount: Int!
    pageInfo: PageInfo!
  }

  type Radio {
    id: ID!
    title: String!
    description: String
    picture: String
    picture_small: String
    picture_medium: String
    picture_big: String
    picture_xl: String
    tracklist: String
  }

  type Podcast {
    id: ID!
    title: String!
    description: String
    available: Boolean
    fans: Int
    link: String
    share: String
    picture: String
    picture_small: String
    picture_medium: String
    picture_big: String
    picture_xl: String
  }


  type AuthPayload {
    token: String!
    user: User!
  }

  type LikedTrack {
    id: ID!
    user: User!
    track: Track!
    createdAt: String
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

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }

  input ArtistFilter {
    searchName: String
  }

  input AlbumFilter {
    genre_id: Int
    artistId: ID
    yearFrom: Int
    yearTo: Int
    explicit_lyrics: Boolean
  }

  input TrackFilter {
    albumId: ID
    artistId: ID
    explicit_lyrics: Boolean
    minRank: Int
  }

  enum SortOrder {
    ASC
    DESC
  }

  enum ArtistSortField {
    NAME
    NB_FAN
    NB_ALBUM
  }

  enum AlbumSortField {
    TITLE
    RELEASE_DATE
    FANS
    DURATION
  }

  enum TrackSortField {
    TITLE
    RANK
    DURATION
    POSITION
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
    artistTracks(artistId: ID!, page: Int, limit: Int): ArtistTracksResult!  # ← ajouter ici

    # --- Top ---
    topTracks(limit: Int): [Track!]!
    topArtists(limit: Int): [Artist!]!

    # --- Playlists ---
    playlists(isPublic: Boolean): [Playlist!]!
    playlist(id: ID!): Playlist

    # --- Genres ---
    genres: [Genre!]!
    genre(id: ID!): Genre

    # --- Radios ---
    radios: [Radio!]!
    radio(id: ID!): Radio

    # --- Podcasts ---
    podcasts: [Podcast!]!
    podcast(id: ID!): Podcast

    # --- Liked tracks ---
    likedTracks: [LikedTrack!]!          # pistes likées de l'utilisateur connecté
    isTrackLiked(trackId: ID!): Boolean!



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
    createPlaylist(input: CreatePlaylistInput!, userId: ID!): Playlist!
    updatePlaylist(id: ID!, input: UpdatePlaylistInput!): Playlist!
    addTrackToPlaylist(playlistId: ID!, trackId: ID!): Playlist!
    removeTrackFromPlaylist(playlistId: ID!, trackId: ID!): Playlist!
    deletePlaylist(id: ID!): DeleteResult!

    # --- Liked Tracks (user) ---
    likeTrack(trackId: ID!): LikedTrack!
    unlikeTrack(trackId: ID!): DeleteResult!
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
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateArtistInput {
    name: String!
    link: String
    share: String
    picture: String
    picture_small: String
    picture_medium: String
    picture_big: String
    picture_xl: String
    nb_album: Int
    nb_fan: Int
    radio: Boolean
    tracklist: String
  }

  input UpdateArtistInput {
    name: String
    link: String
    share: String
    picture: String
    picture_small: String
    picture_medium: String
    picture_big: String
    picture_xl: String
    nb_album: Int
    nb_fan: Int
    radio: Boolean
    tracklist: String
  }

  input CreateAlbumInput {
    title: String!
    artistId: ID!
    upc: String
    link: String
    share: String
    cover: String
    cover_small: String
    cover_medium: String
    cover_big: String
    cover_xl: String
    genre_id: Int
    label: String
    provider: String
    nb_tracks: Int
    duration: Int
    release_date: String
    record_type: String
    available: Boolean
    explicit_lyrics: Boolean
  }

  input UpdateAlbumInput {
    title: String
    upc: String
    link: String
    share: String
    cover: String
    cover_small: String
    cover_medium: String
    cover_big: String
    cover_xl: String
    genre_id: Int
    label: String
    provider: String
    nb_tracks: Int
    duration: Int
    release_date: String
    record_type: String
    available: Boolean
    explicit_lyrics: Boolean
  }

  input CreateTrackInput {
    title: String!
    albumId: ID!
    artistId: ID!
    readable: Boolean
    title_short: String
    title_version: String
    link: String
    duration: Int
    rank: Int
    explicit_lyrics: Boolean
    preview: String
    position: Int
  }

  input UpdateTrackInput {
    title: String
    readable: Boolean
    title_short: String
    title_version: String
    link: String
    duration: Int
    rank: Int
    explicit_lyrics: Boolean
    preview: String
    position: Int
  }

  input CreatePlaylistInput {
    title: String!
    description: String
    public: Boolean
    collaborative: Boolean
    picture: String
    picture_small: String
    picture_medium: String
    picture_big: String
    picture_xl: String
  }

  input UpdatePlaylistInput {
    title: String
    description: String
    public: Boolean
    collaborative: Boolean
    picture: String
    picture_small: String
    picture_medium: String
    picture_big: String
    picture_xl: String
  }

  # ================================
  # SUBSCRIPTIONS
  # ================================
  type TrackDeletedPayload {
    id: ID!
  }
  
  type TrackLikedPayload {
    trackId: ID!
  }
  
  type TrackUnlikedPayload {
    trackId: ID!
  }
  type Subscription {
    trackAdded: Track
    trackDeleted: TrackDeletedPayload
    trackLiked: TrackLikedPayload
    trackUnliked: TrackUnlikedPayload
    albumAdded(artistId: ID): Album
    artistUpdated: Artist
    playlistUpdated(playlistId: ID!): Playlist
    trackRankUpdated(trackId: ID!): Track
  }
`;

module.exports = typeDefs;