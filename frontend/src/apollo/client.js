// frontend/src/apollo/client.js
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions/index.js';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities/index.js';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
    // ✅ Fonction appelée à chaque reconnexion — lit le token au bon moment
    connectionParams: () => {
      const token = localStorage.getItem('token');
      return token ? { authorization: `Bearer ${token}` } : {};
    },
    // ✅ Reconnexion auto si la connexion tombe
    shouldRetry: () => true,
    retryAttempts: 5,
    connectionAckWaitTimeout: 10000,

  })
);

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});