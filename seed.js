/**
 * Script de peuplement de la base de données
 * Lance avec : node database/seed.js
 * 
 * Données réelles sur des artistes populaires
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { Artist, Album, Track, User } = require('./src/models');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/music_graphql';

// ============================
// DONNÉES
// ============================

const usersData = [
  {
    username: 'admin',
    email: 'admin@music.app',
    password: 'Admin1234!',
    role: 'admin',
    favoriteGenres: ['Pop', 'Rock', 'Jazz'],
  },
  {
    username: 'alice_music',
    email: 'alice@example.com',
    password: 'User1234!',
    role: 'user',
    favoriteGenres: ['Hip-Hop', 'R&B'],
  },
  {
    username: 'bob_listener',
    email: 'bob@example.com',
    password: 'User1234!',
    role: 'user',
    favoriteGenres: ['Rock', 'Metal'],
  },
];

const artistsData = [
  {
    name: 'The Beatles',
    bio: 'Groupe de rock britannique formé à Liverpool en 1960, composé de John Lennon, Paul McCartney, George Harrison et Ringo Starr.',
    country: 'Royaume-Uni',
    birthDate: new Date('1960-08-01'),
    genres: ['Rock', 'Pop', 'Psychédélique'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Beatles_ad_1965_just_back_from_the_US_top.jpg',
    socialLinks: {
      spotify: 'https://open.spotify.com/artist/3WrFJ7ztbogyGnTHbHJFl2',
      youtube: 'https://www.youtube.com/user/thebeatles',
    },
  },
  {
    name: 'Daft Punk',
    bio: 'Duo de musique électronique français formé en 1993 par Thomas Bangalter et Guy-Manuel de Homem-Christo.',
    country: 'France',
    birthDate: new Date('1993-01-01'),
    genres: ['Électronique', 'House', 'Disco', 'Funk'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Daft_Punk_-_long_shot.jpg',
    socialLinks: {
      spotify: 'https://open.spotify.com/artist/4tZwfgrHOc3mvqYlEYSvVi',
    },
  },
  {
    name: 'Kendrick Lamar',
    bio: 'Rappeur, auteur-compositeur et producteur américain originaire de Compton, Californie. Lauréat du Prix Pulitzer 2018.',
    country: 'États-Unis',
    birthDate: new Date('1987-06-17'),
    genres: ['Hip-Hop', 'Rap', 'R&B'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Kendrick_Lamar_2018.jpg',
    socialLinks: {
      spotify: 'https://open.spotify.com/artist/2YZyLoL8N0Wb9xBt1NhZWg',
      instagram: 'https://www.instagram.com/kendricklamar',
    },
  },
  {
    name: 'Sade',
    bio: 'Chanteuse, compositrice et actrice britannico-nigériane, fondatrice et leader du groupe Sade.',
    country: 'Royaume-Uni',
    birthDate: new Date('1959-01-16'),
    genres: ['Soul', 'R&B', 'Jazz', 'Quiet Storm'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Sade_promotional_image.jpg',
    socialLinks: {
      spotify: 'https://open.spotify.com/artist/47zz7sob9NUcODy0BTDvKx',
    },
  },
  {
    name: 'Miles Davis',
    bio: "Trompettiste, chef d'orchestre et compositeur américain de jazz. L'une des figures les plus influentes de l'histoire de la musique.",
    country: 'États-Unis',
    birthDate: new Date('1926-05-26'),
    genres: ['Jazz', 'Bebop', 'Modal Jazz', 'Jazz Fusion'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Miles_Davis_in_Japan.jpg',
    socialLinks: {
      spotify: 'https://open.spotify.com/artist/0kbYTNQb4Pb1rPbbaF0pT4',
    },
  },
  {
    name: 'Stromae',
    bio: 'Auteur-compositeur-interprète et producteur belge. Mélange unique de styles : électronique, chanson française, hip-hop et musiques du monde.',
    country: 'Belgique',
    birthDate: new Date('1985-03-12'),
    genres: ['Électropop', 'Hip-Hop', 'Chanson Française', 'Afrobeat'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Stromae_%2814737507696%29.jpg',
    socialLinks: {
      spotify: 'https://open.spotify.com/artist/3gd8FJtBJtkRxdfbTu19U2',
      youtube: 'https://www.youtube.com/user/stromae',
    },
  },
];

const albumsData = (artistIds) => [
  // The Beatles
  {
    title: 'Abbey Road',
    artistId: artistIds[0],
    releaseDate: new Date('1969-09-26'),
    genre: 'Rock',
    label: 'Apple Records',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg',
    description: "Le onzième album studio des Beatles, souvent considéré comme leur chef-d'œuvre.",
    totalTracks: 17,
  },
  {
    title: 'Sgt. Pepper\'s Lonely Hearts Club Band',
    artistId: artistIds[0],
    releaseDate: new Date('1967-06-01'),
    genre: 'Rock Psychédélique',
    label: 'Parlophone',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/5/50/Sgt._Pepper%27s_Lonely_Hearts_Club_Band.jpg',
    description: 'Huitième album studio, révolutionnaire dans le monde de la musique.',
    totalTracks: 13,
  },
  // Daft Punk
  {
    title: 'Random Access Memories',
    artistId: artistIds[1],
    releaseDate: new Date('2013-05-17'),
    genre: 'Électronique',
    label: 'Columbia Records',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Random_Access_Memories.jpg',
    description: "Album acclamé par la critique, gagnant du Grammy du meilleur album 2014.",
    totalTracks: 13,
  },
  {
    title: 'Discovery',
    artistId: artistIds[1],
    releaseDate: new Date('2001-02-26'),
    genre: 'French House',
    label: 'Virgin Records',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c7/Daftpunk-discovery.jpg',
    description: 'Deuxième album studio, inclus dans la bande sonore du film Interstella 5555.',
    totalTracks: 14,
  },
  // Kendrick Lamar
  {
    title: 'To Pimp a Butterfly',
    artistId: artistIds[2],
    releaseDate: new Date('2015-03-15'),
    genre: 'Hip-Hop',
    label: 'Top Dawg Entertainment',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f6/To_Pimp_a_Butterfly.png',
    description: 'Album conceptuel mêlant hip-hop, jazz, funk et spoken word.',
    totalTracks: 16,
  },
  // Sade
  {
    title: 'Diamond Life',
    artistId: artistIds[3],
    releaseDate: new Date('1984-07-16'),
    genre: 'Soul',
    label: 'Epic Records',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Sade-diamondlife.jpg',
    description: "Premier album de Sade, vendu à plus de 4 millions d'exemplaires dans le monde.",
    totalTracks: 10,
  },
  // Miles Davis
  {
    title: 'Kind of Blue',
    artistId: artistIds[4],
    releaseDate: new Date('1959-08-17'),
    genre: 'Jazz Modal',
    label: 'Columbia Records',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9c/MilesDavisKindofBlue.jpg',
    description: "L'album de jazz le plus vendu de l'histoire. Un tournant dans la musique modale.",
    totalTracks: 5,
  },
  // Stromae
  {
    title: 'Racine Carrée',
    artistId: artistIds[5],
    releaseDate: new Date('2013-08-13'),
    genre: 'Électropop',
    label: 'Mosaert / Mercury',
    coverUrl: 'https://upload.wikimedia.org/wikipedia/en/6/61/Stromae_-_Racine_carr%C3%A9e.png',
    description: "Deuxième album de Stromae, certifié diamant. Contient les hits Papaoutai et Formidable.",
    totalTracks: 11,
  },
];

const tracksData = (artistIds, albumIds) => [
  // Abbey Road
  { title: 'Come Together', albumId: albumIds[0], artistId: artistIds[0], duration: 259, trackNumber: 1, plays: 1500000, isExplicit: false },
  { title: 'Something',     albumId: albumIds[0], artistId: artistIds[0], duration: 182, trackNumber: 2, plays: 1200000, isExplicit: false },
  { title: 'Here Comes the Sun', albumId: albumIds[0], artistId: artistIds[0], duration: 185, trackNumber: 7, plays: 2000000, isExplicit: false },
  { title: 'Let It Be',     albumId: albumIds[0], artistId: artistIds[0], duration: 243, trackNumber: 17, plays: 1800000, isExplicit: false },

  // Sgt. Pepper's
  { title: "Sgt. Pepper's Lonely Hearts Club Band", albumId: albumIds[1], artistId: artistIds[0], duration: 122, trackNumber: 1, plays: 900000, isExplicit: false },
  { title: 'Lucy in the Sky with Diamonds',         albumId: albumIds[1], artistId: artistIds[0], duration: 208, trackNumber: 3, plays: 1100000, isExplicit: false },
  { title: 'A Day in the Life',                     albumId: albumIds[1], artistId: artistIds[0], duration: 337, trackNumber: 13, plays: 1300000, isExplicit: false },

  // Random Access Memories
  { title: 'Get Lucky',     albumId: albumIds[2], artistId: artistIds[1], duration: 369, trackNumber: 8,  plays: 5000000, isExplicit: false },
  { title: 'Instant Crush', albumId: albumIds[2], artistId: artistIds[1], duration: 337, trackNumber: 9,  plays: 1500000, isExplicit: false },
  { title: 'Lose Yourself to Dance', albumId: albumIds[2], artistId: artistIds[1], duration: 292, trackNumber: 10, plays: 1800000, isExplicit: false },
  { title: 'Giorgio by Moroder',     albumId: albumIds[2], artistId: artistIds[1], duration: 544, trackNumber: 3,  plays: 1000000, isExplicit: false },

  // Discovery
  { title: 'One More Time', albumId: albumIds[3], artistId: artistIds[1], duration: 320, trackNumber: 1, plays: 8000000, isExplicit: false },
  { title: 'Harder Better Faster Stronger', albumId: albumIds[3], artistId: artistIds[1], duration: 224, trackNumber: 3, plays: 6000000, isExplicit: false },
  { title: 'Digital Love',  albumId: albumIds[3], artistId: artistIds[1], duration: 301, trackNumber: 5, plays: 4000000, isExplicit: false },
  { title: 'Aerodynamic',   albumId: albumIds[3], artistId: artistIds[1], duration: 212, trackNumber: 2, plays: 3000000, isExplicit: false },

  // To Pimp a Butterfly
  { title: 'Alright',          albumId: albumIds[4], artistId: artistIds[2], duration: 219, trackNumber: 7,  plays: 3500000, isExplicit: true  },
  { title: 'King Kunta',        albumId: albumIds[4], artistId: artistIds[2], duration: 234, trackNumber: 4,  plays: 2800000, isExplicit: true  },
  { title: 'The Blacker the Berry', albumId: albumIds[4], artistId: artistIds[2], duration: 325, trackNumber: 11, plays: 2200000, isExplicit: true  },
  { title: 'u',                albumId: albumIds[4], artistId: artistIds[2], duration: 273, trackNumber: 8,  plays: 1400000, isExplicit: true  },

  // Diamond Life
  { title: 'Smooth Operator', albumId: albumIds[5], artistId: artistIds[3], duration: 282, trackNumber: 2, plays: 4000000, isExplicit: false },
  { title: 'Your Love Is King', albumId: albumIds[5], artistId: artistIds[3], duration: 202, trackNumber: 1, plays: 2000000, isExplicit: false },

  // Kind of Blue
  { title: 'So What',          albumId: albumIds[6], artistId: artistIds[4], duration: 561, trackNumber: 1, plays: 3000000, isExplicit: false },
  { title: 'Freddie Freeloader', albumId: albumIds[6], artistId: artistIds[4], duration: 589, trackNumber: 2, plays: 1500000, isExplicit: false },
  { title: 'Blue in Green',    albumId: albumIds[6], artistId: artistIds[4], duration: 337, trackNumber: 3, plays: 1200000, isExplicit: false },
  { title: 'All Blues',        albumId: albumIds[6], artistId: artistIds[4], duration: 693, trackNumber: 4, plays: 900000,  isExplicit: false },

  // Racine Carrée
  { title: 'Papaoutai',     albumId: albumIds[7], artistId: artistIds[5], duration: 228, trackNumber: 3, plays: 9000000, isExplicit: false },
  { title: 'Formidable',    albumId: albumIds[7], artistId: artistIds[5], duration: 228, trackNumber: 1, plays: 7000000, isExplicit: false },
  { title: 'Tous Les Mêmes', albumId: albumIds[7], artistId: artistIds[5], duration: 228, trackNumber: 2, plays: 5000000, isExplicit: false },
  { title: 'Ave Cesaria',   albumId: albumIds[7], artistId: artistIds[5], duration: 217, trackNumber: 5, plays: 2000000, isExplicit: false },
];

// ============================
// EXÉCUTION
// ============================
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  MongoDB connecté');

    // Nettoyer les collections
    await Promise.all([
      Artist.deleteMany({}),
      Album.deleteMany({}),
      Track.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('🗑️   Collections nettoyées');

    // Créer les utilisateurs
    const users = await Promise.all(
      usersData.map(async (u) => {
        const hashed = await bcrypt.hash(u.password, 12);
        return User.create({ ...u, password: hashed });
      })
    );
    console.log(`👤  ${users.length} utilisateurs créés`);

    // Créer les artistes
    const artists = await Artist.insertMany(artistsData);
    const artistIds = artists.map((a) => a._id);
    console.log(`🎤  ${artists.length} artistes créés`);

    // Créer les albums
    const albums = await Album.insertMany(albumsData(artistIds));
    const albumIds = albums.map((a) => a._id);
    console.log(`💿  ${albums.length} albums créés`);

    // Créer les tracks
    const tracks = await Track.insertMany(tracksData(artistIds, albumIds));
    console.log(`🎵  ${tracks.length} pistes créées`);

    console.log('\n🎉  Base de données peuplée avec succès !');
    console.log('\n👤  Comptes disponibles :');
    console.log('   Admin  → email: admin@music.app   | pwd: Admin1234!');
    console.log('   User 1 → email: alice@example.com | pwd: User1234!');
    console.log('   User 2 → email: bob@example.com   | pwd: User1234!');

    process.exit(0);
  } catch (err) {
    console.error('❌  Erreur lors du seed :', err);
    process.exit(1);
  }
}

seed();

