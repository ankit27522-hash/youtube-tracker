const crypto = require('crypto');
const mongoose = require('mongoose');
const { isConnectedToMongo, LocalFileStore } = require('../config/db');

const playlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  youtubePlaylistId: { type: String, required: true },
  title: { type: String, required: true },
  originalTitle: { type: String, required: true },
  channelTitle: { type: String, default: 'YouTube Channel' },
  description: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  totalVideos: { type: Number, default: 0 },
  watchedVideos: { type: Number, default: 0 },
  progressPercentage: { type: Number, default: 0 },
  totalDurationSeconds: { type: Number, default: 0 },
  watchedDurationSeconds: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now }
});

const MongoPlaylistModel = mongoose.models.Playlist || mongoose.model('Playlist', playlistSchema);

class PlaylistModel {
  static async find(query = {}) {
    if (isConnectedToMongo()) {
      return MongoPlaylistModel.find(query).sort({ lastAccessedAt: -1, updatedAt: -1 });
    }
    const db = LocalFileStore.read();
    let results = db.playlists.filter(p => {
      for (const key in query) {
        if (p[key] !== query[key]) return false;
      }
      return true;
    });
    // Sort descending by lastAccessedAt or updatedAt
    results.sort((a, b) => new Date(b.lastAccessedAt || b.updatedAt || 0) - new Date(a.lastAccessedAt || a.updatedAt || 0));
    return results.map(p => ({ ...p, _id: p.id }));
  }

  static async findOne(query) {
    if (isConnectedToMongo()) {
      return MongoPlaylistModel.findOne(query);
    }
    const db = LocalFileStore.read();
    const item = db.playlists.find(p => {
      for (const key in query) {
        if (p[key] !== query[key]) return false;
      }
      return true;
    });
    return item ? { ...item, _id: item.id } : null;
  }

  static async findById(id) {
    if (isConnectedToMongo()) {
      return MongoPlaylistModel.findById(id);
    }
    const db = LocalFileStore.read();
    const item = db.playlists.find(p => p.id === id || p._id === id);
    return item ? { ...item, _id: item.id } : null;
  }

  static async create(data) {
    if (isConnectedToMongo()) {
      return MongoPlaylistModel.create(data);
    }
    const db = LocalFileStore.read();
    const now = new Date().toISOString();
    const newPlaylist = {
      id: crypto.randomUUID(),
      userId: data.userId,
      youtubePlaylistId: data.youtubePlaylistId,
      title: data.title,
      originalTitle: data.originalTitle || data.title,
      channelTitle: data.channelTitle || 'YouTube Channel',
      description: data.description || '',
      thumbnailUrl: data.thumbnailUrl || '',
      totalVideos: Number(data.totalVideos) || 0,
      watchedVideos: Number(data.watchedVideos) || 0,
      progressPercentage: Number(data.progressPercentage) || 0,
      totalDurationSeconds: Number(data.totalDurationSeconds) || 0,
      watchedDurationSeconds: Number(data.watchedDurationSeconds) || 0,
      createdAt: now,
      updatedAt: now,
      lastAccessedAt: now
    };
    newPlaylist._id = newPlaylist.id;
    db.playlists.push(newPlaylist);
    LocalFileStore.write(db);
    return newPlaylist;
  }

  static async findByIdAndUpdate(id, updates, options = {}) {
    if (isConnectedToMongo()) {
      return MongoPlaylistModel.findByIdAndUpdate(id, updates, options);
    }
    const db = LocalFileStore.read();
    const index = db.playlists.findIndex(p => p.id === id || p._id === id);
    if (index === -1) return null;

    db.playlists[index] = {
      ...db.playlists[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    LocalFileStore.write(db);
    return { ...db.playlists[index], _id: db.playlists[index].id };
  }

  static async findByIdAndDelete(id) {
    if (isConnectedToMongo()) {
      return MongoPlaylistModel.findByIdAndDelete(id);
    }
    const db = LocalFileStore.read();
    const index = db.playlists.findIndex(p => p.id === id || p._id === id);
    if (index === -1) return null;

    const [deleted] = db.playlists.splice(index, 1);
    LocalFileStore.write(db);
    return { ...deleted, _id: deleted.id };
  }
}

module.exports = PlaylistModel;
