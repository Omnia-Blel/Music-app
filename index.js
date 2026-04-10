const { PubSub, withFilter } = require('graphql-subscriptions');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Artist, Album, Track, Playlist, User, Review } = require('./src/models');
require('dotenv').config();

const pubsub = new PubSub();

// ================================
// ÉVÉNEMENTS SUBSCRIPTION
// ================================
const EVENTS = {
  TRACK_ADDED:           'TRACK_ADDED',
  ALBUM_ADDED:           'ALBUM_ADDED',
  ARTIST_UPDATED:        'ARTIST_UPDATED',
  PLAYLIST_UPDATED:      'PLAYLIST_UPDATED',
  REVIEW_ADDED:          'REVIEW_ADDED',
  TRACK_PLAYS_UPDATED:   'TRACK_PLAYS_UPDATED',
};

// ================================
// HELPERS
// ================================
const formatDuration = (seconds) => {
  if (!seconds) return null;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getPagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: Math.min(limit, 100) };
};

const getPageInfo = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    currentPage: page,
    totalPages,
  };
};

const verifyToken = (context) => {
  const token = context.token;
  if (!token) throw new Error('Non authentifié. Veuillez vous connecter.');
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new Error('Token invalide ou expiré.');
  }
};

const requireAdmin = (context) => {
  const user = verifyToken(context);
  if (user.role !== 'admin') throw new Error('Accès réservé aux administrateurs.');
  return user;
};

const buildSort = (sort, fieldMap) => {
  if (!sort) return { createdAt: -1 };
  const field = fieldMap[sort.field] || 'createdAt';
  return { [field]: sort.order === 'DESC' ? -1 : 1 };
};

// ================================
// RESOLVERS
// ================================
const resolvers = {

  // ---- CHAMPS CALCULÉS ----
  Artist: {
    albums: async (parent) => {
      return await Album.find({ artistId: parent._id }).exec();
    },
    totalAlbums: async (parent) => {
      return await Album.countDocuments({ artistId: parent._id }).exec();
    },
    id: (parent) => parent._id.toString(),
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },

  Album: {
    artist: async (parent) => {
      return await Artist.findById(parent.artistId).exec();
    },
    tracks: async (parent) => {
      return await Track.find({ albumId: parent._id }).sort({ trackNumber: 1 }).exec();
    },
    reviews: async (parent) => {
      return await Review.find({ albumId: parent._id }).exec();
    },
    averageRating: async (parent) => {
      const reviews = await Review.find({ albumId: parent._id }).exec();
      if (!reviews.length) return null;
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      return Math.round((sum / reviews.length) * 10) / 10;
    },
    id: (parent) => parent._id.toString(),
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },

  Track: {
    album: async (parent) => {
      return await Album.findById(parent.albumId).exec();
    },
    artist: async (parent) => {
      return await Artist.findById(parent.artistId).exec();
    },
    durationFormatted: (parent) => formatDuration(parent.duration),
    id: (parent) => parent._id.toString(),
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },

  Playlist: {
    user: async (parent) => {
      return await User.findById(parent.userId).exec();
    },
    tracks: async (parent) => {
      return await Track.find({ _id: { $in: parent.tracks } }).exec();
    },
    totalTracks: (parent) => parent.tracks.length,
    id: (parent) => parent._id.toString(),
    createdAt: (parent) => parent.createdAt.toISOString(),
    updatedAt: (parent) => parent.updatedAt.toISOString(),
  },

  User: {
    playlists: async (parent) => {
      return await Playlist.find({ userId: parent._id }).exec();
    },
    id: (parent) => parent._id.toString(),
    createdAt: (parent) => parent.createdAt.toISOString(),
  },

  Review: {
    user: async (parent) => {
      return await User.findById(parent.userId).exec();
    },
    album: async (parent) => {
      return await Album.findById(parent.albumId).exec();
    },
    id: (parent) => parent._id.toString(),
    createdAt: (parent) => parent.createdAt.toISOString(),
  },

  // ================================
  // QUERIES
  // ================================
  Query: {

    // --- Artistes avec pagination, filtre et tri ---
    artists: async (_, { filter = {}, sort, page = 1, limit = 10 }) => {
      const query = {};
      if (filter.country)    query.country = new RegExp(filter.country, 'i');
      if (filter.genre)      query.genres  = filter.genre;
      if (filter.searchName) query.name    = new RegExp(filter.searchName, 'i');

      const sortMap = { NAME: 'name', CREATED_AT: 'createdAt' };
      const sortObj = buildSort(sort, sortMap);
      const { skip } = getPagination(page, limit);

      const [nodes, totalCount] = await Promise.all([
        Artist.find(query).sort(sortObj).skip(skip).limit(limit).exec(),
        Artist.countDocuments(query).exec(),
      ]);

      return { nodes, totalCount, pageInfo: getPageInfo(totalCount, page, limit) };
    },

    artist: async (_, { id }) => {
      return await Artist.findById(id).exec();
    },

    // --- Albums avec pagination, filtre et tri ---
    albums: async (_, { filter = {}, sort, page = 1, limit = 10 }) => {
      const query = {};
      if (filter.genre)    query.genre    = new RegExp(filter.genre, 'i');
      if (filter.artistId) query.artistId = filter.artistId;
      if (filter.yearFrom || filter.yearTo) {
        query.releaseDate = {};
        if (filter.yearFrom) query.releaseDate.$gte = new Date(`${filter.yearFrom}-01-01`);
        if (filter.yearTo)   query.releaseDate.$lte = new Date(`${filter.yearTo}-12-31`);
      }

      const sortMap = { TITLE: 'title', RELEASE_DATE: 'releaseDate' };
      const sortObj = buildSort(sort, sortMap);
      const { skip } = getPagination(page, limit);

      const [nodes, totalCount] = await Promise.all([
        Album.find(query).sort(sortObj).skip(skip).limit(limit).exec(),
        Album.countDocuments(query).exec(),
      ]);

      return { nodes, totalCount, pageInfo: getPageInfo(totalCount, page, limit) };
    },

    album: async (_, { id }) => {
      return await Album.findById(id).exec();
    },

    // --- Tracks avec pagination, filtre et tri ---
    tracks: async (_, { filter = {}, sort, page = 1, limit = 20 }) => {
      const query = {};
      if (filter.albumId)    query.albumId    = filter.albumId;
      if (filter.artistId)   query.artistId   = filter.artistId;
      if (filter.isExplicit !== undefined) query.isExplicit = filter.isExplicit;
      if (filter.minPlays)   query.plays      = { $gte: filter.minPlays };

      const sortMap = { TITLE: 'title', PLAYS: 'plays', DURATION: 'duration', TRACK_NUMBER: 'trackNumber' };
      const sortObj = buildSort(sort, sortMap);
      const { skip } = getPagination(page, limit);

      const [nodes, totalCount] = await Promise.all([
        Track.find(query).sort(sortObj).skip(skip).limit(limit).exec(),
        Track.countDocuments(query).exec(),
      ]);

      return { nodes, totalCount, pageInfo: getPageInfo(totalCount, page, limit) };
    },

    track: async (_, { id }) => {
      return await Track.findById(id).exec();
    },

    // --- Top Tracks / Artistes ---
    topTracks: async (_, { limit = 10 }) => {
      return await Track.find().sort({ plays: -1 }).limit(limit).exec();
    },
    topArtists: async (_, { limit = 10 }) => {
      const results = await Track.aggregate([
        { $group: { _id: '$artistId', totalPlays: { $sum: '$plays' } } },
        { $sort: { totalPlays: -1 } },
        { $limit: limit },
      ]);
      return await Artist.find({ _id: { $in: results.map((r) => r._id) } }).exec();
    },

    // --- Playlists ---
    playlists: async (_, { userId, isPublic }) => {
      const query = {};
      if (userId)   query.userId   = userId;
      if (isPublic !== undefined) query.isPublic = isPublic;
      return await Playlist.find(query).exec();
    },
    playlist: async (_, { id }) => {
      return await Playlist.findById(id).exec();
    },

    // --- Reviews ---
    reviews: async (_, { page = 1, limit = 10 }) => {
      const { skip } = getPagination(page, limit);
      const [nodes, totalCount] = await Promise.all([
        Review.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
        Review.countDocuments().exec(),
      ]);
      return { nodes, totalCount, hasMore: (page * limit) < totalCount, total: totalCount };
    },

    albumReviews: async (_, { albumId }) => {
      return await Review.find({ albumId }).sort({ createdAt: -1 }).exec();
    },

    userReviews: async (_, { userId }) => {
      return await Review.find({ userId }).sort({ createdAt: -1 }).exec();
    },

    // --- Utilisateurs ---
    me: async (_, __, context) => {
      const decoded = verifyToken(context);
      return await User.findById(decoded.userId).exec();
    },
    users: async (_, __, context) => {
      requireAdmin(context);
      return await User.find().exec();
    },

    // --- Recherche globale ---
    search: async (_, { query, limit = 5 }) => {
      const regex = new RegExp(query, 'i');
      const [artists, albums, tracks] = await Promise.all([
        Artist.find({ name: regex }).limit(limit).exec(),
        Album.find({ title: regex }).limit(limit).exec(),
        Track.find({ title: regex }).limit(limit).exec(),
      ]);
      return { artists, albums, tracks };
    },
  },

  // ================================
  // MUTATIONS
  // ================================
  Mutation: {

    // --- Auth ---
    register: async (_, { input }) => {
      const existing = await User.findOne({ email: input.email }).exec();
      if (existing) throw new Error('Un compte avec cet email existe déjà.');

      const hashedPwd = await bcrypt.hash(input.password, 12);
      const user = await User.create({ ...input, password: hashedPwd });
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
      return { token, user };
    },

    login: async (_, { input }) => {
      const user = await User.findOne({ email: input.email }).exec();
      if (!user) throw new Error('Email ou mot de passe incorrect.');

      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) throw new Error('Email ou mot de passe incorrect.');

      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
      return { token, user };
    },

    // --- Artistes ---
    createArtist: async (_, { input }, context) => {
      requireAdmin(context);
      const artist = await Artist.create(input);
      pubsub.publish(EVENTS.ARTIST_UPDATED, { artistUpdated: artist });
      return artist;
    },

    updateArtist: async (_, { id, input }, context) => {
      requireAdmin(context);
      const artist = await Artist.findByIdAndUpdate(id, { ...input, updatedAt: new Date() }, { new: true }).exec();
      if (!artist) throw new Error('Artiste introuvable.');
      pubsub.publish(EVENTS.ARTIST_UPDATED, { artistUpdated: artist });
      return artist;
    },

    deleteArtist: async (_, { id }, context) => {
      requireAdmin(context);
      const artist = await Artist.findByIdAndDelete(id).exec();
      if (!artist) throw new Error('Artiste introuvable.');
      return { success: true, message: `Artiste "${artist.name}" supprimé avec succès.` };
    },

    // --- Albums ---
    createAlbum: async (_, { input }, context) => {
      requireAdmin(context);
      const album = await Album.create(input);
      pubsub.publish(EVENTS.ALBUM_ADDED, { albumAdded: album });
      return album;
    },

    updateAlbum: async (_, { id, input }, context) => {
      requireAdmin(context);
      const album = await Album.findByIdAndUpdate(id, { ...input, updatedAt: new Date() }, { new: true }).exec();
      if (!album) throw new Error('Album introuvable.');
      return album;
    },

    deleteAlbum: async (_, { id }, context) => {
      requireAdmin(context);
      const album = await Album.findByIdAndDelete(id).exec();
      if (!album) throw new Error('Album introuvable.');
      await Track.deleteMany({ albumId: id }).exec();
      return { success: true, message: `Album "${album.title}" et ses pistes supprimés.` };
    },

    // --- Tracks ---
    createTrack: async (_, { input }, context) => {
      requireAdmin(context);
      const track = await Track.create(input);
      await Album.findByIdAndUpdate(input.albumId, { $inc: { totalTracks: 1 } }).exec();
      pubsub.publish(EVENTS.TRACK_ADDED, { trackAdded: track });
      return track;
    },

    updateTrack: async (_, { id, input }, context) => {
      requireAdmin(context);
      const track = await Track.findByIdAndUpdate(id, { ...input, updatedAt: new Date() }, { new: true }).exec();
      if (!track) throw new Error('Piste introuvable.');
      return track;
    },

    deleteTrack: async (_, { id }, context) => {
      requireAdmin(context);
      const track = await Track.findByIdAndDelete(id).exec();
      if (!track) throw new Error('Piste introuvable.');
      await Album.findByIdAndUpdate(track.albumId, { $inc: { totalTracks: -1 } }).exec();
      return { success: true, message: `Piste "${track.title}" supprimée.` };
    },

    // --- Playlists ---
    createPlaylist: async (_, { input }, context) => {
      const user = verifyToken(context);
      const playlist = await Playlist.create({ ...input, userId: user.userId });
      return playlist;
    },

    updatePlaylist: async (_, { id, input }, context) => {
      const user = verifyToken(context);
      const playlist = await Playlist.findById(id).exec();
      if (!playlist) throw new Error('Playlist introuvable.');
      if (playlist.userId.toString() !== user.userId && user.role !== 'admin')
        throw new Error('Accès refusé.');
      const updated = await Playlist.findByIdAndUpdate(id, { ...input, updatedAt: new Date() }, { new: true }).exec();
      pubsub.publish(EVENTS.PLAYLIST_UPDATED, { playlistUpdated: updated });
      return updated;
    },

    addTrackToPlaylist: async (_, { playlistId, trackId }, context) => {
      const user = verifyToken(context);
      const playlist = await Playlist.findById(playlistId).exec();
      if (!playlist) throw new Error('Playlist introuvable.');
      if (playlist.userId.toString() !== user.userId && user.role !== 'admin')
        throw new Error('Accès refusé.');
      if (!playlist.tracks.includes(trackId)) {
        playlist.tracks.push(trackId);
        playlist.updatedAt = new Date();
        await playlist.save();
      }
      pubsub.publish(EVENTS.PLAYLIST_UPDATED, { playlistUpdated: playlist });
      return playlist;
    },

    removeTrackFromPlaylist: async (_, { playlistId, trackId }, context) => {
      const user = verifyToken(context);
      const playlist = await Playlist.findById(playlistId).exec();
      if (!playlist) throw new Error('Playlist introuvable.');
      if (playlist.userId.toString() !== user.userId && user.role !== 'admin')
        throw new Error('Accès refusé.');
      playlist.tracks = playlist.tracks.filter((id) => id.toString() !== trackId);
      playlist.updatedAt = new Date();
      await playlist.save();
      pubsub.publish(EVENTS.PLAYLIST_UPDATED, { playlistUpdated: playlist });
      return playlist;
    },

    deletePlaylist: async (_, { id }, context) => {
      const user = verifyToken(context);
      const playlist = await Playlist.findById(id).exec();
      if (!playlist) throw new Error('Playlist introuvable.');
      if (playlist.userId.toString() !== user.userId && user.role !== 'admin')
        throw new Error('Accès refusé.');
      await Playlist.findByIdAndDelete(id).exec();
      return { success: true, message: `Playlist "${playlist.name}" supprimée.` };
    },

    // --- Reviews ---
    createReview: async (_, { input }, context) => {
      const user = verifyToken(context);
      const existing = await Review.findOne({ userId: user.userId, albumId: input.albumId }).exec();
      if (existing) throw new Error('Vous avez déjà donné un avis pour cet album.');
      const review = await Review.create({ ...input, userId: user.userId });
      pubsub.publish(EVENTS.REVIEW_ADDED, { reviewAdded: review, albumId: input.albumId });
      return review;
    },

    updateReview: async (_, { id, input }, context) => {
      const user = verifyToken(context);
      const review = await Review.findById(id).exec();
      if (!review) throw new Error('Avis introuvable.');
      if (review.userId.toString() !== user.userId) throw new Error('Accès refusé.');
      return await Review.findByIdAndUpdate(id, { ...input, updatedAt: new Date() }, { new: true }).exec();
    },

    deleteReview: async (_, { id }, context) => {
      const user = verifyToken(context);
      const review = await Review.findById(id).exec();
      if (!review) throw new Error('Avis introuvable.');
      if (review.userId.toString() !== user.userId && user.role !== 'admin')
        throw new Error('Accès refusé.');
      await Review.findByIdAndDelete(id).exec();
      return { success: true, message: 'Avis supprimé.' };
    },

    // --- Plays ---
    incrementPlays: async (_, { trackId }) => {
      const track = await Track.findByIdAndUpdate(trackId, { $inc: { plays: 1 } }, { new: true }).exec();
      if (!track) throw new Error('Piste introuvable.');
      pubsub.publish(EVENTS.TRACK_PLAYS_UPDATED, { trackPlaysUpdated: track, trackId });
      return track;
    },
  },

  // ================================
  // SUBSCRIPTIONS
  // ================================
  Subscription: {

    trackAdded: {
      subscribe: () => pubsub.asyncIterableIterator([EVENTS.TRACK_ADDED]),
    },

    albumAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator([EVENTS.ALBUM_ADDED]),
        (payload, variables) => {
          if (!variables.artistId) return true;
          return payload.albumAdded.artistId.toString() === variables.artistId;
        }
      ),
    },

    artistUpdated: {
      subscribe: () => pubsub.asyncIterableIterator([EVENTS.ARTIST_UPDATED]),
    },

    playlistUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator([EVENTS.PLAYLIST_UPDATED]),
        (payload, variables) =>
          payload.playlistUpdated._id.toString() === variables.playlistId
      ),
    },

    reviewAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator([EVENTS.REVIEW_ADDED]),
        (payload, variables) => payload.albumId === variables.albumId
      ),
    },

    trackPlaysUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterableIterator([EVENTS.TRACK_PLAYS_UPDATED]),
        (payload, variables) => payload.trackId === variables.trackId
      ),
    },
  },
};

// ================================
// SERVER SETUP
// ================================
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const authMiddleware = require('./auth');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/music_graphql';

async function startServer() {
  const app = express();

  // CORS Configuration - CRITICAL for credentials
  const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'HEAD', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-ID', 'X-Client-Secret'],
    optionsSuccessStatus: 200,
  };

  // Apply CORS globally BEFORE any other middleware
  app.use(cors(corsOptions));
  app.use(express.json());

  // MongoDB Connection
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connecté');
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB:', err);
    process.exit(1);
  }

  // Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return error;
    },
  });

  await server.start();

  // Apply Apollo middleware with proper Express integration
  server.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: false, // We already applied CORS globally
  });

  // Health Check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Start HTTP Server
  const httpServer = http.createServer(app);

  await new Promise((resolve) => {
    httpServer.listen(PORT, resolve);
  });

  console.log(`\n🎵 Serveur GraphQL lancé sur http://localhost:${PORT}/graphql`);
  console.log(`📊 Playground disponible sur http://localhost:${PORT}${server.graphqlPath}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health\n`);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Arrêt du serveur...');
    await server.stop();
    await mongoose.connection.close();
    httpServer.close(() => {
      console.log('✅ Serveur arrêté');
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error('❌ Erreur au démarrage:', err);
  process.exit(1);
});

module.exports = resolvers;
