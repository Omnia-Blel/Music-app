require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const bcrypt = require("bcryptjs");

const {
  Artist,
  Album,
  Track,
  Genre,
  Playlist,
  User,
} = require("./src/models");

const MONGO_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/music_graphql";

// ============================================================
// HELPERS
// ============================================================

/** Pause pour éviter le rate-limit Deezer (50 req/5s) */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/** GET avec retry automatique sur 429 / erreur réseau */
async function deezerGet(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(url, { timeout: 10000 });
      if (res.data?.error) {
        console.warn(`⚠️  Deezer error sur ${url}:`, res.data.error.message);
        return null;
      }
      return res.data;
    } catch (err) {
      const wait = (i + 1) * 1500;
      console.warn(`⏳ Retry ${i + 1}/${retries} dans ${wait}ms — ${url}`);
      await sleep(wait);
    }
  }
  return null;
}

/** Pagine une ressource Deezer jusqu'à `maxItems` */
async function fetchAll(baseUrl, maxItems = 500) {
  const results = [];
  let index = 0;
  const limit = 25;

  while (results.length < maxItems) {
    const url = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}index=${index}&limit=${limit}`;
    const data = await deezerGet(url);
    if (!data || !data.data || data.data.length === 0) break;

    results.push(...data.data);
    index += limit;

    if (data.next === undefined || results.length >= maxItems) break;
    await sleep(300);
  }

  return results.slice(0, maxItems);
}

// ============================================================
// UPSERT HELPERS — garantissent l'unicité par `id` Deezer
// ============================================================

async function upsertArtist(data) {
  return Artist.findOneAndUpdate(
    { id: data.id },
    { $setOnInsert: data },
    { upsert: true, new: true }
  );
}

async function upsertAlbum(data) {
  return Album.findOneAndUpdate(
    { id: data.id },
    { $setOnInsert: data },
    { upsert: true, new: true }
  );
}

async function upsertTrack(data) {
  return Track.findOneAndUpdate(
    { id: data.id },
    { $setOnInsert: data },
    { upsert: true, new: true }
  );
}

// ============================================================
// SEED
// ============================================================
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connecté\n");

    // ---- NETTOYAGE ----
    await Promise.all([
      Artist.deleteMany({}),
      Album.deleteMany({}),
      Track.deleteMany({}),
      Genre.deleteMany({}),
      Playlist.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log("🗑️  Collections nettoyées\n");

    // ============================
    // 👤 USERS
    // ============================
    const adminPwd = await bcrypt.hash("Admin1234!", 10);
    const userPwd  = await bcrypt.hash("User1234!",  10);

    await User.insertMany([
      { username: "admin", email: "admin@music.app",    password: adminPwd, role: "admin" },
      { username: "alice", email: "alice@example.com",  password: userPwd,  role: "user"  },
      { username: "bob",   email: "bob@example.com",    password: userPwd,  role: "user"  },
    ]);
    console.log("👤 Users créés : 3");

    // ============================
    // 🎼 GENRES
    // ============================
    console.log("\n📡 Récupération des genres...");
    const genresData = await deezerGet("https://api.deezer.com/genre");
    const genreItems = genresData?.data || [];

    const genreDocs = genreItems
      .filter((g) => g.id !== 0)
      .map((g) => ({
        id:             g.id,
        name:           g.name,
        picture:        g.picture,
        picture_small:  g.picture_small,
        picture_medium: g.picture_medium,
        picture_big:    g.picture_big,
        picture_xl:     g.picture_xl,
      }));

    await Genre.insertMany(genreDocs);
    console.log(`🎼 Genres insérés : ${genreDocs.length}`);

    // ============================
    // 🎤 ARTISTS + 💿 ALBUMS + 🎵 TRACKS
    // ============================
    console.log("\n📡 Récupération des artistes / albums / tracks...");

    const artistsMap = new Map(); // deezerId → mongoDoc
    const albumsMap  = new Map(); // deezerId → mongoDoc
    let trackCount   = 0;

    const TARGET_ARTISTS = 200;
    const TARGET_TRACKS  = 2000;

    for (const genre of genreDocs) {
      if (artistsMap.size >= TARGET_ARTISTS) break;
      await sleep(400);

      const chart        = await deezerGet(`https://api.deezer.com/genre/${genre.id}/artists`);
      const genreArtists = chart?.data || [];

      for (const ga of genreArtists.slice(0, 20)) {
        if (artistsMap.size >= TARGET_ARTISTS) break;
        if (artistsMap.has(ga.id)) continue;
        await sleep(300);

        const artistDetail = await deezerGet(`https://api.deezer.com/artist/${ga.id}`);
        if (!artistDetail) continue;

        // ✅ upsert — jamais de doublon artiste
        const artistDoc = await upsertArtist({
          id:             artistDetail.id,
          name:           artistDetail.name,
          link:           artistDetail.link,
          share:          artistDetail.share,
          picture:        artistDetail.picture,
          picture_small:  artistDetail.picture_small,
          picture_medium: artistDetail.picture_medium,
          picture_big:    artistDetail.picture_big,
          picture_xl:     artistDetail.picture_xl,
          nb_album:       artistDetail.nb_album,
          nb_fan:         artistDetail.nb_fan,
          radio:          artistDetail.radio,
          tracklist:      artistDetail.tracklist,
        });
        artistsMap.set(ga.id, artistDoc);

        // Albums de l'artiste — on en prend jusqu'à 10
        await sleep(300);
        const albumsRes    = await deezerGet(`https://api.deezer.com/artist/${ga.id}/albums?limit=10`);
        const artistAlbums = albumsRes?.data || [];

        for (const alb of artistAlbums.slice(0, 10)) {
          // ✅ vérification en mémoire d'abord (évite un aller-retour BDD inutile)
          if (albumsMap.has(alb.id)) continue;
          await sleep(300);

          const albumDetail = await deezerGet(`https://api.deezer.com/album/${alb.id}`);
          if (!albumDetail) continue;

          // ✅ upsert — jamais de doublon album
          const albumDoc = await upsertAlbum({
            id:                      albumDetail.id,
            title:                   albumDetail.title,
            upc:                     albumDetail.upc,
            link:                    albumDetail.link,
            share:                   albumDetail.share,
            cover:                   albumDetail.cover,
            cover_small:             albumDetail.cover_small,
            cover_medium:            albumDetail.cover_medium,
            cover_big:               albumDetail.cover_big,
            cover_xl:                albumDetail.cover_xl,
            genre_id:                albumDetail.genre_id,
            label:                   albumDetail.label,
            nb_tracks:               albumDetail.nb_tracks,
            duration:                albumDetail.duration,
            fans:                    albumDetail.fans,
            release_date:            albumDetail.release_date ? new Date(albumDetail.release_date) : null,
            record_type:             albumDetail.record_type,
            available:               albumDetail.available,
            tracklist:               albumDetail.tracklist,
            explicit_lyrics:         albumDetail.explicit_lyrics,
            explicit_content_lyrics: albumDetail.explicit_content_lyrics,
            explicit_content_cover:  albumDetail.explicit_content_cover,
            artist:                  artistDoc._id,
          });
          albumsMap.set(alb.id, albumDoc);

          // Toutes les tracks de l'album
          const tracks = albumDetail.tracks?.data || [];
          for (const t of tracks) {
            try {
              const existing = await Track.findOne({ id: t.id }).select("_id").lean();
              if (existing) continue; // skip doublon track

              await Track.create({
                id:                      t.id,
                readable:                t.readable,
                title:                   t.title,
                title_short:             t.title_short,
                title_version:           t.title_version,
                isrc:                    t.isrc,
                link:                    t.link,
                share:                   t.share,
                duration:                t.duration,
                track_position:          t.track_position,
                disk_number:             t.disk_number,
                rank:                    t.rank,
                release_date:            albumDetail.release_date ? new Date(albumDetail.release_date) : null,
                explicit_lyrics:         t.explicit_lyrics,
                explicit_content_lyrics: t.explicit_content_lyrics,
                explicit_content_cover:  t.explicit_content_cover,
                preview:                 t.preview,
                bpm:                     t.bpm,
                gain:                    t.gain,
                available_countries:     t.available_countries || [],
                md5_image:               t.md5_image,
                track_token:             t.track_token,
                cover:                   albumDetail.cover,
                cover_small:             albumDetail.cover_small,
                cover_medium:            albumDetail.cover_medium,
                cover_big:               albumDetail.cover_big,
                cover_xl:                albumDetail.cover_xl,
                position:                t.track_position,
                artist:                  artistDoc._id,
                album:                   albumDoc._id,
              });
              trackCount++;
            } catch (e) {
              if (e.code !== 11000) {
                console.warn(`⚠️  Track skip [${t?.id}] : ${e.message}`);
              }
            }
          }
        }

        console.log(
          `  ✅ ${artistDoc.name} | artistes: ${artistsMap.size} | albums: ${albumsMap.size} | tracks: ${trackCount}`
        );
      }
    }

    // ============================
    // Complément via chart global si tracks insuffisantes
    // ============================
    if (trackCount < TARGET_TRACKS) {
      console.log("\n📡 Complément via chart global...");
      const chartData   = await deezerGet("https://api.deezer.com/chart/0/tracks?limit=100");
      const chartTracks = chartData?.data || [];

      for (const t of chartTracks) {
        // ✅ upsert artiste
        let artistDoc = artistsMap.get(t.artist.id);
        if (!artistDoc) {
          artistDoc = await upsertArtist({
            id:             t.artist.id,
            name:           t.artist.name,
            link:           t.artist.link,
            picture:        t.artist.picture,
            picture_medium: t.artist.picture_medium,
            picture_big:    t.artist.picture_big,
          });
          artistsMap.set(t.artist.id, artistDoc);
        }

        // ✅ upsert album
        let albumDoc = albumsMap.get(t.album.id);
        if (!albumDoc) {
          albumDoc = await upsertAlbum({
            id:           t.album.id,
            title:        t.album.title,
            cover:        t.album.cover,
            cover_medium: t.album.cover_medium,
            cover_big:    t.album.cover_big,
            artist:       artistDoc._id,
          });
          albumsMap.set(t.album.id, albumDoc);
        }

        // ✅ upsert track
        const trackDoc = await upsertTrack({
          id:              t.id,
          readable:        t.readable,
          title:           t.title,
          title_short:     t.title_short,
          link:            t.link,
          duration:        t.duration,
          rank:            t.rank,
          explicit_lyrics: t.explicit_lyrics,
          preview:         t.preview,
          cover:           t.album?.cover         || albumDoc.cover,
          cover_medium:    t.album?.cover_medium  || albumDoc.cover_medium,
          cover_big:       t.album?.cover_big     || albumDoc.cover_big,
          position:        t.track_position,
          artist:          artistDoc._id,
          album:           albumDoc._id,
        });

        // On compte uniquement les nouvelles insertions
        if (trackDoc.__v === undefined || trackDoc.isNew) trackCount++;
      }
    }

    // ============================
    // 🎧 PLAYLISTS
    // ============================
    console.log("\n📡 Récupération des playlists...");
    const playlistsRaw = await fetchAll("https://api.deezer.com/chart/0/playlists", 500);

    for (const pl of playlistsRaw) {
      await sleep(200);
      const detail = await deezerGet(`https://api.deezer.com/playlist/${pl.id}`);
      if (!detail) continue;

      // Résoudre les tracks de la playlist avec les _id MongoDB existants
      const trackIds = [];
      for (const t of (detail.tracks?.data || []).slice(0, 20)) {
        const existing = await Track.findOne({ id: t.id }).select("_id").lean();
        if (existing) trackIds.push(existing._id);
      }

      try {
        await Playlist.findOneAndUpdate(
          { id: detail.id },
          {
            $setOnInsert: {
              id:             detail.id,
              title:          detail.title,
              description:    detail.description,
              duration:       detail.duration,
              public:         detail.public,
              collaborative:  detail.collaborative,
              nb_tracks:      detail.nb_tracks,
              fans:           detail.fans,
              link:           detail.link,
              share:          detail.share,
              picture:        detail.picture,
              picture_small:  detail.picture_small,
              picture_medium: detail.picture_medium,
              picture_big:    detail.picture_big,
              picture_xl:     detail.picture_xl,
              tracks:         trackIds,
            },
          },
          { upsert: true }
        );
      } catch (e) {
        console.warn(`⚠️  Playlist skip [${detail.id}] : ${e.message}`);
      }
    }

    const playlistCount = await Playlist.countDocuments();
    console.log(`🎧 Playlists insérées : ${playlistCount}`);

    // ============================
    // RÉSUMÉ
    // ============================
    console.log("\n========================================");
    console.log("🎉 Seed terminé !\n");
    console.log(`  👤 Users      : ${await User.countDocuments()}`);
    console.log(`  🎼 Genres     : ${await Genre.countDocuments()}`);
    console.log(`  🎤 Artists    : ${await Artist.countDocuments()}`);
    console.log(`  💿 Albums     : ${await Album.countDocuments()}`);
    console.log(`  🎵 Tracks     : ${await Track.countDocuments()}`);
    console.log(`  🎧 Playlists  : ${await Playlist.countDocuments()}`);
    console.log("========================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur seed :", err);
    process.exit(1);
  }
}

seed();