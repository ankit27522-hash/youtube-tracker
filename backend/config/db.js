const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let isMongoConnected = false;

// File DB location
const dataDir = path.join(__dirname, '..', 'data');
const dbFilePath = path.join(dataDir, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure db.json exists with initial structure
if (!fs.existsSync(dbFilePath)) {
  const initialData = {
    users: [],
    playlists: [],
    videos: []
  };
  fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), 'utf8');
}

/**
 * File Database Helper - provides atomic read/write for seamless zero-config local storage
 */
class LocalFileStore {
  static read() {
    try {
      const content = fs.readFileSync(dbFilePath, 'utf8');
      return JSON.parse(content || '{"users":[],"playlists":[],"videos":[]}');
    } catch (err) {
      console.error('Error reading local file DB:', err);
      return { users: [], playlists: [], videos: [] };
    }
  }

  static write(data) {
    try {
      const tempPath = `${dbFilePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
      fs.renameSync(tempPath, dbFilePath);
    } catch (err) {
      console.error('Error writing local file DB:', err);
    }
  }
}

/**
 * Connect to database
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      isMongoConnected = true;
      console.log('MongoDB connected successfully!');
      return;
    } catch (err) {
      console.warn('MongoDB connection failed. Falling back to local persistent file store.');
      console.warn(`Reason: ${err.message}`);
    }
  } else {
    console.log('No MONGODB_URI provided in .env. Using built-in local persistent store (data/db.json).');
  }

  isMongoConnected = false;
  console.log('Using Local Persistent File Storage at backend/data/db.json');
}

function isConnectedToMongo() {
  return isMongoConnected;
}

module.exports = {
  connectDB,
  isConnectedToMongo,
  LocalFileStore
};
