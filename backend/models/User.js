const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isConnectedToMongo, LocalFileStore } = require('../config/db');

// Mongoose Schema definition
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const MongoUserModel = mongoose.models.User || mongoose.model('User', userSchema);

// Unified Model Adapter
class UserModel {
  static async findOne(query) {
    if (isConnectedToMongo()) {
      return MongoUserModel.findOne(query);
    }
    const db = LocalFileStore.read();
    const user = db.users.find(u => {
      for (const key in query) {
        if (key === 'email' && u.email.toLowerCase() === query[key].toLowerCase()) return true;
        if (u[key] === query[key]) return true;
      }
      return false;
    });
    return user ? { ...user, _id: user.id } : null;
  }

  static async findById(id) {
    if (isConnectedToMongo()) {
      return MongoUserModel.findById(id);
    }
    const db = LocalFileStore.read();
    const user = db.users.find(u => u.id === id || u._id === id);
    return user ? { ...user, _id: user.id } : null;
  }

  static async create(data) {
    if (isConnectedToMongo()) {
      return MongoUserModel.create(data);
    }
    const db = LocalFileStore.read();
    const newUser = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: data.password,
      createdAt: new Date().toISOString()
    };
    newUser._id = newUser.id;
    db.users.push(newUser);
    LocalFileStore.write(db);
    return newUser;
  }

  static async comparePassword(enteredPassword, hashedPassword) {
    return bcrypt.compare(enteredPassword, hashedPassword);
  }
}

module.exports = UserModel;
