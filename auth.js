const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware d'authentification.
 * Supporte deux modes :
 *   - JWT (Bearer token)
 *   - Client Credentials (clientId + clientSecret dans les headers)
 */
const authMiddleware = ({ req }) => {
  const context = {};

  // --- Option 1 : JWT Bearer token ---
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    context.token = authHeader.replace('Bearer ', '');
  }

  // --- Option 2 : Client Credentials ---
  const clientId     = req.headers['x-client-id'];
  const clientSecret = req.headers['x-client-secret'];
  if (clientId && clientSecret) {
    if (
      clientId     === process.env.CLIENT_ID &&
      clientSecret === process.env.CLIENT_SECRET
    ) {
      // Génère un token admin temporaire pour les clients de confiance
      context.token = jwt.sign(
        { userId: 'service-account', role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    }
  }

  return context;
};

module.exports = authMiddleware;
