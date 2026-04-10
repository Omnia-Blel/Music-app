const mongoose = require('mongoose');

// ===========================
// MODÈLE : Artiste
// ===========================
const artistSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  bio: { type: String },
  country: { type: String },
  birthDate: { type: Date },
  genres: [{ type: String }],
  imageUrl: { type: String },
  socialLinks: {
    spotify: String,
    instagram: String,
    youtube: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ===========================
// MODÈLE : Album
// ===========================
const albumSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  releaseDate: { type: Date },
  genre: { type: String },
  label: { type: String },
  coverUrl: { type: String },
  description: { type: String },
  totalTracks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ===========================
// MODÈLE : Chanson (Track)
// ===========================
const trackSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  duration: { type: Number }, // en secondes
  trackNumber: { type: Number },
  lyrics: { type: String },
  audioUrl: { type: String },
  plays: { type: Number, default: 0 },
  isExplicit: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ===========================
// MODÈLE : Playlist
// ===========================
const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
  isPublic: { type: Boolean, default: true },
  coverUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ===========================
// MODÈLE : Utilisateur
// ===========================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favoriteGenres: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// ===========================
// MODÈLE : Avis (Review)
// ===========================
const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Artist   = mongoose.model('Artist',   artistSchema);
const Album    = mongoose.model('Album',    albumSchema);
const Track    = mongoose.model('Track',    trackSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);
const User     = mongoose.model('User',     userSchema);
const Review   = mongoose.model('Review',   reviewSchema);

module.exports = { Artist, Album, Track, Playlist, User, Review };
