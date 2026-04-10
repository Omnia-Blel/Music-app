# 🎵 Music GraphQL Frontend Tester

Une interface React complète pour tester tous les endpoints GraphQL de l'API Music GraphQL.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 14+ et npm
- Le serveur GraphQL doit être en cours d'exécution sur `http://localhost:4000`

### Installation et lancement

```bash
# Dans le dossier frontend/
npm install
npm start
```

L'application s'ouvrira sur `http://localhost:3000`

## 📋 Fonctionnalités testables

### 🔐 Authentification / Auth
- **Inscription**: Créer un nouveau compte utilisateur
- **Connexion**: Se connecter avec les identifiants
- **Déconnexion**: Terminer la session
- **Tokens JWT**: Gestion automatique des tokens d'authentification

**Comptes de test disponibles:**
```
Admin  → email: admin@music.app   | pwd: Admin1234!
User 1 → email: alice@example.com | pwd: User1234!
User 2 → email: bob@example.com   | pwd: User1234!
```

### 🔍 Recherche
- **Recherche globale**: Trouve artistes, albums et pistes
- **Top Artistes**: Liste les artistes les plus populaires
- **Top Pistes**: Liste les pistes les plus écoutées
- **Filtrage**: Résultats par type (artiste/album/piste)

### 🎤 Artistes
- **Lister les artistes**: Affiche tous les artistes avec pagination
- **Ajouter un artiste** (Admin): Créer un nouvel artiste
- **Supprimer un artiste** (Admin): Supprimer un artiste
- **Gérer les genres**: Ajouter/modifier les genres musicaux
- **Voir les détails**: Nombre d'albums, historique, etc.

**Requêtes testées:**
```graphql
query Artists($page: Int, $limit: Int, $filter: ArtistFilter, $sort: ArtistSort)
mutation CreateArtist($input: CreateArtistInput!)
mutation DeleteArtist($id: ID!)
query TopArtists($limit: Int)
```

### 💿 Albums
- **Lister les albums**: Affiche tous les albums avec pagination
- **Voir les détails**: Titre, artiste, pistes, date de sortie, etc.
- **Ajouter un album** (Admin): Créer un nouvel album
- **Supprimer un album** (Admin): Supprimer un album
- **Note moyenne**: Affiche la note moyenne de l'album

**Requêtes testées:**
```graphql
query Albums($page: Int, $limit: Int)
query Album($id: ID!)
mutation CreateAlbum($input: CreateAlbumInput!)
mutation DeleteAlbum($id: ID!)
```

### 🎵 Pistes / Tracks
- **Lister les pistes**: Affiche toutes les pistes avec pagination
- **Détails des pistes**: Titre, durée, nombre d'écoutes, explicite
- **Incrémenter les écoutes**: Augmenter le compteur de plays
- **Ajouter une piste** (Admin): Créer une nouvelle piste
- **Supprimer une piste** (Admin): Supprimer une piste
- **Top pistes**: Voir les pistes les plus écoutées

**Requêtes testées:**
```graphql
query Tracks($page: Int, $limit: Int)
mutation IncrementPlays($trackId: ID!)
mutation CreateTrack($input: CreateTrackInput!)
mutation DeleteTrack($id: ID!)
query TopTracks($limit: Int)
```

### 📋 Playlists
- **Mes playlists**: Affiche les playlists de l'utilisateur connecté
- **Créer une playlist**: Créer une nouvelle playlist
- **Supprimer une playlist**: Supprimer une playlist
- **Ajouter une piste**: Ajouter une piste à une playlist
- **Retirer une piste**: Retirer une piste d'une playlist
- **Personnaliser**: Nom, description, visibilité (public/privé)

**Requêtes testées:**
```graphql
query Playlists($userId: ID)
query Playlist($id: ID!)
mutation CreatePlaylist($input: CreatePlaylistInput!)
mutation DeletePlaylist($id: ID!)
mutation AddTrackToPlaylist($playlistId: ID!, $trackId: ID!)
mutation RemoveTrackFromPlaylist($playlistId: ID!, $trackId: ID!)
```

### ⭐ Avis / Reviews
- **Lister les avis**: Affiche tous les avis des utilisateurs
- **Créer un avis**: Laisser un avis et une note (1-5 étoiles) sur un album
- **Modifier un avis**: Éditer sa note et son commentaire
- **Supprimer un avis**: Supprimer un avis
- **Filtrer les avis**: Par album ou par utilisateur
- **Voir mes avis**: Affiche les avis de l'utilisateur connecté

**Requêtes testées:**
```graphql
query Reviews($page: Int, $limit: Int)
query AlbumReviews($albumId: ID!)
query UserReviews($userId: ID!)
mutation CreateReview($input: CreateReviewInput!)
mutation UpdateReview($id: ID!, $input: UpdateReviewInput!)
mutation DeleteReview($id: ID!)
```

## 🎨 Interface utilisateur

### Navigation par onglets
Les onglets en haut permettent de naviguer entre les différentes sections:
- 🔍 **Recherche**: Recherche globale
- 🎤 **Artistes**: Gestion des artistes
- 💿 **Albums**: Gestion des albums
- 🎵 **Pistes**: Gestion des pistes
- 📋 **Playlists**: Gestion des playlists
- ⭐ **Avis**: Gestion des avis/reviews

### Fonctionnalités communes

#### Pagination
- Boutons "Précédent" et "Suivant" pour naviguer
- Affichage de la page actuelle et du nombre total

#### Filtrage
- Champs de recherche et de filtrage
- Boutons pour affiner les résultats

#### Actions
- Boutons d'édition et suppression (selon les droits)
- Formulaires en ligne pour créer/modifier

#### Affichages des erreurs et succès
- Messages d'erreur en rouge
- Messages de succès en vert

## 🔐 Contrôle d'accès

### Rôles utilisateur
- **Admin**: Accès complet (création, modification, suppression)
- **User**: Accès limité (lecture, création de playlists/avis personnels)

### Droits par action
- ✅ Lecture: Tous les utilisateurs
- ✅ Création: Admin pour artistes/albums/pistes, User pour playlists/avis
- ✅ Modification: Admin sauf pour playlists/avis (User peut modifier ses propres)
- ✅ Suppression: Admin sauf pour playlists/avis (User peut supprimer ses propres)

## 🐛 Dépannage

### Connection refused?
Vérifiez que le serveur backend est en cours d'exécution:
```bash
# Dans le dossier principal
npm run dev
```

### Erreurs de CORS?
Le frontend utilise un proxy configuré dans `package.json`:
```json
"proxy": "http://localhost:4000"
```

### Pas de données après login?
- Assurez-vous que le seed a été exécuté: `npm run seed`
- Vérifiez que MongoDB est en cours d'exécution
- Vérifiez les variables d'environnement dans `.env`

## 📦 Technos utilisées

- **React 18**: Framework UI
- **Apollo Client 3**: Gestion GraphQL et cache
- **GraphQL**: Requêtes et mutations
- **CSS3**: Styles personnalisés

## 🎯 Cas d'utilisation testables

1. **Test complet d'authentification**: Register → Login → Actions authentifiées → Logout
2. **CRUD complet**: Créer, lire, mettre à jour, supprimer des ressources
3. **Gestion de relations**: Songs dans Albums, Tracks dans Playlists
4. **Pagination**: Navigation entre les pages de résultats
5. **Filtrage et recherche**: Tests de recherche et de filtrage
6. **Autorisations**: Admin vs User (actions limitées)
7. **Gestion des erreurs**: Messages d'erreur appropriés

## 📖 Documentation API

Pour voir toutes les requêtes GraphQL disponibles:
```
http://localhost:4000/graphql
```

Visitez la page pour accéder à GraphQL Playground et explorer le schéma.

---

**Happy Testing! 🎵**
