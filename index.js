const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/use/ws');
const { PubSub, withFilter } = require('graphql-subscriptions');

const { Artist, Album, Track, Playlist, User, Genre, LikedTrack } = require('./src/models');
const typeDefs = require('./schema');

// ================================
// PUBSUB
// ================================
const pubsub = new PubSub();

const EVENTS = {
  TRACK_ADDED:        'TRACK_ADDED',
  TRACK_DELETED:      'TRACK_DELETED',
  TRACK_LIKED:        'TRACK_LIKED',
  TRACK_UNLIKED:      'TRACK_UNLIKED',
  ALBUM_ADDED:        'ALBUM_ADDED',
  ARTIST_UPDATED:     'ARTIST_UPDATED',
  PLAYLIST_UPDATED:   'PLAYLIST_UPDATED',
  TRACK_RANK_UPDATED: 'TRACK_RANK_UPDATED',
};

// ================================
// HELPERS
// ================================
const getPagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: Math.min(limit, 100) };
};

const getPageInfo = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  return {
    hasNextPage:     page < totalPages,
    hasPreviousPage: page > 1,
    currentPage:     page,
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
  if (!sort) return { _id: -1 };
  const field = fieldMap[sort.field] || '_id';
  return { [field]: sort.order === 'DESC' ? -1 : 1 };
};

// ================================
// RESOLVERS
// ================================
const resolvers = {

  LikedTrack: {
    id:    (parent) => parent._id.toString(),
    user:  async (parent) => User.findById(parent.user).exec(),
    track: async (parent) => {
      if (parent.track && parent.track._id) return parent.track;
      return Track.findById(parent.track).exec();
    },
  },

  Artist: {
    id:     (parent) => parent._id.toString(),
    albums: async (parent) => Album.find({ artist: parent._id }).exec(),
  },

  Album: {
    id:     (parent) => parent._id.toString(),
    artist: async (parent) => Artist.findById(parent.artist).exec(),
    tracks: async (parent) => Track.find({ album: parent._id }).sort({ position: 1 }).exec(),
  },

  Track: {
    id:     (parent) => parent._id.toString(),
    album:  async (parent) => Album.findById(parent.album).exec(),
    artist: async (parent) => Artist.findById(parent.artist).exec(),
  },

  Playlist: {
    id:     (parent) => parent._id.toString(),
    tracks: async (parent) => Track.find({ _id: { $in: parent.tracks } }).exec(),
  },

  User: {
    id: (parent) => parent._id.toString(),
  },

  // ================================
  // QUERIES
  // ================================
  Query: {

    artists: async (_, { filter = {}, sort, page = 1, limit = 10 }) => {
      const query = {};
      if (filter.searchName) query.name = new RegExp(filter.searchName, 'i');
      const sortMap = { NAME: 'name', NB_FAN: 'nb_fan', NB_ALBUM: 'nb_album' };
      const sortObj = buildSort(sort, sortMap);
      const { skip } = getPagination(page, limit);
      const [nodes, totalCount] = await Promise.all([
        Artist.find(query).sort(sortObj).skip(skip).limit(limit).exec(),
        Artist.countDocuments(query).exec(),
      ]);
      return { nodes, totalCount, pageInfo: getPageInfo(totalCount, page, limit) };
    },

    artist: async (_, { id }) => Artist.findById(id).exec(),

    albums: async (_, { filter = {}, sort, page = 1, limit = 10 }) => {
      const query = {};
      if (filter.genre_id)   query.genre_id = filter.genre_id;
      if (filter.artistId)   query.artist   = filter.artistId;
      if (filter.explicit_lyrics !== undefined) query.explicit_lyrics = filter.explicit_lyrics;
      if (filter.yearFrom || filter.yearTo) {
        query.release_date = {};
        if (filter.yearFrom) query.release_date.$gte = new Date(`${filter.yearFrom}-01-01`);
        if (filter.yearTo)   query.release_date.$lte = new Date(`${filter.yearTo}-12-31`);
      }
      const sortMap = { TITLE: 'title', RELEASE_DATE: 'release_date', FANS: 'fans', DURATION: 'duration' };
      const sortObj = buildSort(sort, sortMap);
      const { skip } = getPagination(page, limit);
      const [nodes, totalCount] = await Promise.all([
        Album.find(query).sort(sortObj).skip(skip).limit(limit).exec(),
        Album.countDocuments(query).exec(),
      ]);
      return { nodes, totalCount, pageInfo: getPageInfo(totalCount, page, limit) };
    },

    album: async (_, { id }) => Album.findById(id).exec(),

    tracks: async (_, { filter = {}, sort, page = 1, limit = 20 }) => {
      const query = {};
      if (filter.albumId)  query.album  = filter.albumId;
      if (filter.artistId) query.artist = filter.artistId;
      if (filter.explicit_lyrics !== undefined) query.explicit_lyrics = filter.explicit_lyrics;
      if (filter.minRank !== undefined) query.rank = { $gte: filter.minRank };
      const sortMap = { TITLE: 'title', RANK: 'rank', DURATION: 'duration', POSITION: 'position' };
      const sortObj = buildSort(sort, sortMap);
      const { skip } = getPagination(page, limit);
      const [nodes, totalCount] = await Promise.all([
        Track.find(query).sort(sortObj).skip(skip).limit(limit).exec(),
        Track.countDocuments(query).exec(),
      ]);
      return { nodes, totalCount, pageInfo: getPageInfo(totalCount, page, limit) };
    },

    track: async (_, { id }) => Track.findById(id).exec(),

    topTracks:  async (_, { limit = 10 }) => Track.find().sort({ rank: -1 }).limit(limit).exec(),
    topArtists: async (_, { limit = 10 }) => Artist.find().sort({ nb_fan: -1 }).limit(limit).exec(),

    playlists: async (_, __, context) => {
      let decoded = null;
      try { decoded = verifyToken(context); } catch {}
      if (decoded) {
        return Playlist.find({
          $or: [
            { userId: decoded.userId },
            { userId: { $exists: false } },
            { userId: null },
          ],
        }).exec();
      }
      return Playlist.find({ $or: [{ userId: { $exists: false } }, { userId: null }] }).exec();
    },

    playlist: async (_, { id }) => Playlist.findById(id).exec(),

    genres: async () => Genre.find().exec(),
    genre:  async (_, { id }) => Genre.findById(id).exec(),

    likedTracks: async (_, __, context) => {
      const decoded = verifyToken(context);
      const liked = await LikedTrack.find({ user: decoded.userId }).populate('track').exec();
      return liked;
    },

    artistTracks: async (_, { artistId, page = 1, limit = 20 }) => {
      const { skip } = getPagination(page, limit);
      const [tracks, totalCount] = await Promise.all([
        Track.find({ artist: artistId }).skip(skip).limit(limit).exec(),
        Track.countDocuments({ artist: artistId }).exec(),
      ]);
      return { nodes: tracks, totalCount, pageInfo: getPageInfo(totalCount, page, limit) };
    },

    me: async (_, __, context) => {
      const decoded = verifyToken(context);
      return User.findById(decoded.userId).exec();
    },

    users: async (_, __, context) => {
      requireAdmin(context);
      return User.find().exec();
    },

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

    register: async (_, { input }) => {
      const existing = await User.findOne({ email: input.email }).exec();
      if (existing) throw new Error('Un compte avec cet email existe déjà.');
      const hashedPwd = await bcrypt.hash(input.password, 12);
      const user = await User.create({ ...input, password: hashedPwd, role: 'user' });
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      return { token, user };
    },

    login: async (_, { input }) => {
      const user = await User.findOne({ email: input.email }).exec();
      if (!user) throw new Error('Email ou mot de passe incorrect.');
      const isValid = await bcrypt.compare(input.password, user.password);
      if (!isValid) throw new Error('Email ou mot de passe incorrect.');
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      return { token, user };
    },

    createArtist: async (_, { input }, context) => {
      requireAdmin(context);
      const artist = await Artist.create(input);
      await pubsub.publish(EVENTS.ARTIST_UPDATED, { artistUpdated: artist });
      return artist;
    },

    updateArtist: async (_, { id, input }, context) => {
      requireAdmin(context);
      const artist = await Artist.findByIdAndUpdate(id, input, { new: true }).exec();
      if (!artist) throw new Error('Artiste introuvable.');
      await pubsub.publish(EVENTS.ARTIST_UPDATED, { artistUpdated: artist });
      return artist;
    },

    deleteArtist: async (_, { id }, context) => {
      requireAdmin(context);
      const artist = await Artist.findByIdAndDelete(id).exec();
      if (!artist) throw new Error('Artiste introuvable.');
      return { success: true, message: `Artiste "${artist.name}" supprimé avec succès.` };
    },

    createAlbum: async (_, { input }, context) => {
      requireAdmin(context);
      const { artistId, ...rest } = input;
      const album = await Album.create({ ...rest, artist: artistId });
      await pubsub.publish(EVENTS.ALBUM_ADDED, { albumAdded: album });
      return album;
    },

    updateAlbum: async (_, { id, input }, context) => {
      requireAdmin(context);
      const album = await Album.findByIdAndUpdate(id, input, { new: true }).exec();
      if (!album) throw new Error('Album introuvable.');
      return album;
    },

    deleteAlbum: async (_, { id }, context) => {
      requireAdmin(context);
      const album = await Album.findByIdAndDelete(id).exec();
      if (!album) throw new Error('Album introuvable.');
      await Track.deleteMany({ album: id }).exec();
      return { success: true, message: `Album "${album.title}" et ses pistes supprimés.` };
    },

    // ✅ CORRIGÉ : newTrack → track + publish après création
    createTrack: async (_, { input }, context) => {
      requireAdmin(context);
      const { albumId, artistId, ...rest } = input;
      const track = await Track.create({ ...rest, album: albumId, artist: artistId });

      // Populer album et artist pour que la subscription reçoive un objet complet
      const populatedTrack = await Track.findById(track._id)
        .populate('album')
        .populate('artist')
        .exec();

      await pubsub.publish(EVENTS.TRACK_ADDED, { trackAdded: populatedTrack });
      return populatedTrack;
    },

    updateTrack: async (_, { id, input }, context) => {
      requireAdmin(context);
      const track = await Track.findByIdAndUpdate(id, input, { new: true }).exec();
      if (!track) throw new Error('Piste introuvable.');
      return track;
    },

    // ✅ CORRIGÉ : publish une seule fois, après la vérification d'existence
    deleteTrack: async (_, { id }, context) => {
      requireAdmin(context);
      const track = await Track.findByIdAndDelete(id).exec();
      if (!track) throw new Error('Piste introuvable.');
      await pubsub.publish(EVENTS.TRACK_DELETED, { trackDeleted: { id } });
      return { success: true, message: `Piste "${track.title}" supprimée.` };
    },

    // ✅ CORRIGÉ : publish avant le return + retourner l'objet LikedTrack complet
    likeTrack: async (_, { trackId }, context) => {
      const decoded = verifyToken(context);
      const existing = await LikedTrack.findOne({ user: decoded.userId, track: trackId }).exec();
      if (existing) throw new Error('Piste déjà likée.');
      const liked = await LikedTrack.create({ user: decoded.userId, track: trackId });
      await pubsub.publish(EVENTS.TRACK_LIKED, { trackLiked: { trackId } });
      return liked;
    },

    unlikeTrack: async (_, { trackId }, context) => {
      const decoded = verifyToken(context);
      const liked = await LikedTrack.findOneAndDelete({ user: decoded.userId, track: trackId }).exec();
      if (!liked) throw new Error('Like introuvable.');
      await pubsub.publish(EVENTS.TRACK_UNLIKED, { trackUnliked: { trackId } });
      return { success: true, message: 'Piste retirée des favoris.' };
    },

    createPlaylist: async (_, { input, userId }) => {
      if (!userId) throw new Error('userId est obligatoire');
      return Playlist.create({ ...input, userId });
    },

    updatePlaylist: async (_, { id, input }, context) => {
      const user = verifyToken(context);
      const playlist = await Playlist.findById(id).exec();
      if (!playlist) throw new Error('Playlist introuvable.');
      if (playlist.userId?.toString() !== user.userId && user.role !== 'admin')
        throw new Error('Accès refusé.');
      const updated = await Playlist.findByIdAndUpdate(id, input, { new: true }).exec();
      await pubsub.publish(EVENTS.PLAYLIST_UPDATED, { playlistUpdated: updated });
      return updated;
    },

    addTrackToPlaylist: async (_, { playlistId, trackId }, context) => {
      const user = verifyToken(context);
      const playlist = await Playlist.findById(playlistId).exec();
      if (!playlist) throw new Error('Playlist introuvable.');
      if (playlist.userId?.toString() !== user.userId && user.role !== 'admin')
        throw new Error('Accès refusé.');
      if (!playlist.tracks.map((t) => t.toString()).includes(trackId)) {
        playlist.tracks.push(trackId);
        await playlist.save();
      }
      await pubsub.publish(EVENTS.PLAYLIST_UPDATED, { playlistUpdated: playlist });
      return playlist;
    },

    removeTrackFromPlaylist: async (_, { playlistId, trackId }, context) => {
      const user = verifyToken(context);
      const playlist = await Playlist.findById(playlistId).exec();
      if (!playlist) throw new Error('Playlist introuvable.');
      if (playlist.userId?.toString() !== user.userId && user.role !== 'admin')
        throw new Error('Accès refusé.');
      playlist.tracks = playlist.tracks.filter((id) => id.toString() !== trackId);
      await playlist.save();
      await pubsub.publish(EVENTS.PLAYLIST_UPDATED, { playlistUpdated: playlist });
      return playlist;
    },

    deletePlaylist: async (_, { id }, context) => {
      const user = verifyToken(context);
      const playlist = await Playlist.findById(id).exec();
      if (!playlist) throw new Error('Playlist introuvable.');
      if (playlist.userId?.toString() !== user.userId && user.role !== 'admin')
        throw new Error('Accès refusé.');
      await Playlist.findByIdAndDelete(id).exec();
      return { success: true, message: `Playlist "${playlist.title}" supprimée.` };
    },
  },

  // ================================
  // SUBSCRIPTIONS
  // ================================
// ================================
// SUBSCRIPTIONS (VERSION FINALE ROBUSTE)
// ================================
Subscription: {

  trackAdded: {
    subscribe: () => pubsub.asyncIterator([EVENTS.TRACK_ADDED]),
    resolve: (payload) => payload?.trackAdded || payload,
  },

  trackDeleted: {
    subscribe: () => pubsub.asyncIterator([EVENTS.TRACK_DELETED]),
    resolve: (payload) => payload?.trackDeleted || payload,
  },

  trackLiked: {
    subscribe: () => pubsub.asyncIterator([EVENTS.TRACK_LIKED]),
    resolve: (payload) => payload?.trackLiked || payload,
  },

  trackUnliked: {
    subscribe: () => pubsub.asyncIterator([EVENTS.TRACK_UNLIKED]),
    resolve: (payload) => payload?.trackUnliked || payload,
  },

  albumAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([EVENTS.ALBUM_ADDED]),
      (payload, variables) => {
        if (!variables?.artistId) return true;
        return payload?.albumAdded?.artist?.toString() === variables.artistId;
      }
    ),
    resolve: (payload) => payload?.albumAdded || payload,
  },

  artistUpdated: {
    subscribe: () => pubsub.asyncIterator([EVENTS.ARTIST_UPDATED]),
    resolve: (payload) => payload?.artistUpdated || payload,
  },

  playlistUpdated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([EVENTS.PLAYLIST_UPDATED]),
      (payload, variables) =>
        payload?.playlistUpdated?._id?.toString() === variables?.playlistId
    ),
    resolve: (payload) => payload?.playlistUpdated || payload,
  },

  trackRankUpdated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator([EVENTS.TRACK_RANK_UPDATED]),
      (payload, variables) => payload?.trackId === variables?.trackId
    ),
    resolve: (payload) => payload?.trackRankUpdated || payload,
  },
},

};

// ================================
// DÉMARRAGE DU SERVEUR
// ================================
const PORT     = process.env.PORT       || 4000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/music_graphql';

async function startServer() {
  // 1. Connexion MongoDB
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connecté');
  } catch (err) {
    console.error('❌ Erreur MongoDB:', err);
    process.exit(1);
  }

  // 2. App Express + serveur HTTP
  const app        = express();
  const httpServer = http.createServer(app);

  // 3. Schéma exécutable
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // 4. WebSocket server pour les subscriptions
  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });

  const serverCleanup = useServer(
    {
      schema,
      connectionInitWaitTimeout: 10000,
      context: async (ctx) => {
        const token = ctx.connectionParams?.authorization?.replace('Bearer ', '') || null;
        return { token };
      },
      onConnect: async (ctx) => {
        console.log('✅ WS client connecté, params:', ctx.connectionParams);
        return true; // ← IMPORTANT : doit retourner true pour accepter la connexion
      },
  
      onDisconnect: (ctx, code, reason) => {
        console.log('🔴 WS client déconnecté:', code, reason);
      },
    },
    wsServer
  );

  // 5. Apollo Server
  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return error;
    },
  });

  await server.start();

  // 6. Middleware Express
  app.use(
    '/graphql',
    cors({
      origin:      process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        token: req.headers.authorization?.replace('Bearer ', '') || null,
      }),
    })
  );

  app.get('/health', (_, res) =>
    res.json({ status: 'OK', timestamp: new Date().toISOString() })
  );

  // 7. Écoute
  await new Promise((resolve) => httpServer.listen(PORT, resolve));

  console.log(`\n🎵 Serveur GraphQL  → http://localhost:${PORT}/graphql`);
  console.log(`🔌 WebSocket        → ws://localhost:${PORT}/graphql`);
  console.log(`❤️  Health check    → http://localhost:${PORT}/health\n`);

  // 8. Arrêt propre
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