const express = require('express');
const router = express.Router();
const {
  getPlaylists,
  importPlaylist,
  getPlaylistById,
  renamePlaylist,
  deletePlaylist,
  getDemoList
} = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

// Public route to inspect demo playlists
router.get('/demos', getDemoList);

// Protected routes
router.use(protect);

router.route('/')
  .get(getPlaylists);

router.post('/import', importPlaylist);

router.route('/:id')
  .get(getPlaylistById)
  .patch(renamePlaylist)
  .delete(deletePlaylist);

module.exports = router;
