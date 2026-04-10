require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');

const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');

const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');

const mongoose = require('mongoose');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const authMiddleware = require('./auth');

const PORT = process.env.PORT || 4000;

async function startServer() {
  // --- MongoDB ---
  await mongoose.connect(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/music_graphql'
  );
  console.log('✅ MongoDB connecté');

  // --- GraphQL schema ---
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  const app = express();
  const httpServer = http.createServer(app);

  // --- WebSocket (Subscriptions) ---
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: (ctx) => {
        const token =
          ctx.connectionParams?.authorization?.replace('Bearer ', '');
        return { token };
      },
    },
    wsServer
  );

  // --- Apollo Server ---
  const server = new ApolloServer({
    schema,
    introspection: true,
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
  });

  await server.start();

  // =========================
  // ✅ FIXED CORS CONFIG HERE
  // =========================

  const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
  };

  // 1. Global CORS (IMPORTANT)
  app.use(cors(corsOptions));

  // 2. Preflight requests
  app.options('*', cors(corsOptions));

  // 3. GraphQL endpoint
  app.use(
    '/graphql',
    bodyParser.json(),
    expressMiddleware(server, {
      context: authMiddleware,
    })
  );

  // --- Health check ---
  app.get('/health', (_, res) =>
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
    })
  );

  // --- Start server ---
  await new Promise((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(`🎵 API GraphQL Musique démarrée`);
  console.log(`🔗 HTTP: http://localhost:${PORT}/graphql`);
  console.log(`🔗 WS  : ws://localhost:${PORT}/graphql`);
}

startServer().catch((err) => {
  console.error('❌ Erreur au démarrage :', err);
  process.exit(1);
});