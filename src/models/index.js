const mongoose = require("mongoose");

// ============================
// 🎤 ARTIST
// ============================
const artistSchema = new mongoose.Schema({
  id: Number,
  name: String,
  link: String,
  share: String,

  picture: String,
  picture_small: String,
  picture_medium: String,
  picture_big: String,
  picture_xl: String,

  nb_album: Number,
  nb_fan: Number,
  radio: Boolean,

  tracklist: String,
});

// ============================
// 💿 ALBUM
// ============================
const albumSchema = new mongoose.Schema({
  id: Number,
  title: String,
  upc: String,
  link: String,
  share: String,

  cover: String,
  cover_small: String,
  cover_medium: String,
  cover_big: String,
  cover_xl: String,

  genre_id: Number,

  label: String,
  provider: String,

  nb_tracks: Number,
  duration: Number,
  fans: Number,

  release_date: Date,
  record_type: String,
  available: Boolean,

  tracklist: String,

  explicit_lyrics: Boolean,
  explicit_content_lyrics: Number,
  explicit_content_cover: Number,

  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
  },
});

// ============================
// 🎵 TRACK
// ============================
const trackSchema = new mongoose.Schema({
  id: Number,
  readable: Boolean,

  title: String,
  title_short: String,
  title_version: String,

  isrc: String,
  link: String,
  share: String,

  duration: Number,
  track_position: Number,
  disk_number: Number,
  rank: Number,
  release_date: Date,

  explicit_lyrics: Boolean,
  explicit_content_lyrics: Number,
  explicit_content_cover: Number,

  preview: String,
  bpm: Number,
  gain: Number,
  available_countries: [String],
  md5_image: String,
  track_token: String,

  // Album cover image fields (from album sub-object)
  cover: String,
  cover_small: String,
  cover_medium: String,
  cover_big: String,
  cover_xl: String,

  position: Number,

  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
  },
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
  },
});

// ============================
// 🎼 GENRE
// ============================
const genreSchema = new mongoose.Schema({
  id: Number,
  name: String,

  picture: String,
  picture_small: String,
  picture_medium: String,
  picture_big: String,
  picture_xl: String,
});

// ============================
// 📻 RADIO
// ============================
const radioSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,

  picture: String,
  picture_small: String,
  picture_medium: String,
  picture_big: String,
  picture_xl: String,

  tracklist: String,
});

// ============================
// 🎧 PLAYLIST
// ============================
const playlistSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  duration: Number,

  public: Boolean,
  collaborative: Boolean,

  nb_tracks: Number,
  fans: Number,

  link: String,
  share: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  picture: String,
  picture_small: String,
  picture_medium: String,
  picture_big: String,
  picture_xl: String,

  tracks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
    },
  ],
});

// ============================
// 🎙️ PODCAST
// ============================
const podcastSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  available: Boolean,

  fans: Number,

  link: String,
  share: String,

  picture: String,
  picture_small: String,
  picture_medium: String,
  picture_big: String,
  picture_xl: String,
});

// ============================
// 📰 EDITORIAL
// ============================
const editorialSchema = new mongoose.Schema({
  id: Number,
  name: String,

  picture: String,
  picture_small: String,
  picture_medium: String,
  picture_big: String,
  picture_xl: String,
});

// ============================
// 👤 USER
// ============================
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
});

// ============================
// ❤️ LIKED TRACKS
// ============================
const likedTracksSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      required: true,
    },
  },
  { timestamps: true }
);

// Empêcher les doublons : un user ne peut liker le même track qu'une seule fois
likedTracksSchema.index({ user: 1, track: 1 }, { unique: true });

// ============================
// EXPORTS
// ============================
module.exports = {
  Artist: mongoose.model("Artist", artistSchema),
  Album: mongoose.model("Album", albumSchema),
  Track: mongoose.model("Track", trackSchema),
  Genre: mongoose.model("Genre", genreSchema),
  Radio: mongoose.model("Radio", radioSchema),
  Playlist: mongoose.model("Playlist", playlistSchema),
  Podcast: mongoose.model("Podcast", podcastSchema),
  Editorial: mongoose.model("Editorial", editorialSchema),
  User: mongoose.model("User", userSchema),
  LikedTrack: mongoose.model("LikedTrack", likedTracksSchema)
};
