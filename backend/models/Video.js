const crypto = require('crypto');
const mongoose = require('mongoose');
const { isConnectedToMongo, LocalFileStore } = require('../config/db');

const videoSchema = new mongoose.Schema({
  playlistId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  youtubeVideoId: { type: String, required: true },
  title: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  videoUrl: { type: String, required: true },
  durationFormatted: { type: String, default: '00:00' },
  durationSeconds: { type: Number, default: 0 },
  position: { type: Number, default: 0 },
  isWatched: { type: Boolean, default: false },
  watchedAt: { type: Date, default: null },
  notes: { type: String, default: '' },
  notesUpdatedAt: { type: Date, default: null }
});

const MongoVideoModel = mongoose.models.Video || mongoose.model('Video', videoSchema);

class VideoModel {
  static async find(query = {}) {
    if (isConnectedToMongo()) {
      return MongoVideoModel.find(query).sort({ position: 1 });
    }
    const db = LocalFileStore.read();
    let results = db.videos.filter(v => {
      for (const key in query) {
        if (v[key] !== query[key]) return false;
      }
      return true;
    });
    results.sort((a, b) => (a.position || 0) - (b.position || 0));
    return results.map(v => ({ ...v, _id: v.id }));
  }

  static async findById(id) {
    if (isConnectedToMongo()) {
      return MongoVideoModel.findById(id);
    }
    const db = LocalFileStore.read();
    const item = db.videos.find(v => v.id === id || v._id === id);
    return item ? { ...item, _id: item.id } : null;
  }

  static async insertMany(videos) {
    if (isConnectedToMongo()) {
      return MongoVideoModel.insertMany(videos);
    }
    const db = LocalFileStore.read();
    const prepared = videos.map(v => {
      const id = v.id || crypto.randomUUID();
      return {
        ...v,
        id,
        _id: id,
        isWatched: Boolean(v.isWatched),
        watchedAt: v.watchedAt || null,
        notes: v.notes || '',
        notesUpdatedAt: v.notesUpdatedAt || null
      };
    });
    db.videos.push(...prepared);
    LocalFileStore.write(db);
    return prepared;
  }

  static async findByIdAndUpdate(id, updates, options = {}) {
    if (isConnectedToMongo()) {
      return MongoVideoModel.findByIdAndUpdate(id, updates, options);
    }
    const db = LocalFileStore.read();
    const index = db.videos.findIndex(v => v.id === id || v._id === id);
    if (index === -1) return null;

    db.videos[index] = {
      ...db.videos[index],
      ...updates
    };
    LocalFileStore.write(db);
    return { ...db.videos[index], _id: db.videos[index].id };
  }

  static async deleteMany(query) {
    if (isConnectedToMongo()) {
      return MongoVideoModel.deleteMany(query);
    }
    const db = LocalFileStore.read();
    const initialCount = db.videos.length;
    db.videos = db.videos.filter(v => {
      for (const key in query) {
        if (v[key] === query[key]) return false;
      }
      return true;
    });
    const deletedCount = initialCount - db.videos.length;
    LocalFileStore.write(db);
    return { deletedCount };
  }

  static async updateMany(query, updates) {
    if (isConnectedToMongo()) {
      return MongoVideoModel.updateMany(query, updates);
    }
    const db = LocalFileStore.read();
    let modifiedCount = 0;
    db.videos = db.videos.map(v => {
      let matches = true;
      for (const key in query) {
        if (v[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        modifiedCount++;
        return { ...v, ...updates };
      }
      return v;
    });
    LocalFileStore.write(db);
    return { modifiedCount };
  }
}

module.exports = VideoModel;
