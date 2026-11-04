const Playlist = require('../models/Playlist');
const Video = require('../models/Video');
const { extractPlaylistId } = require('../utils/urlParser');
const { fetchYouTubePlaylist } = require('../services/youtubeService');
const { getDemoPlaylists, getDemoPlaylistById } = require('../services/demoDataService');

/**
 * Get all playlists for the logged-in user
 */
async function getPlaylists(req, res, next) {
  try {
    const playlists = await Playlist.find({ userId: req.user.id });
    res.status(200).json({
      success: true,
      count: playlists.length,
      playlists
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Import a YouTube playlist by URL or demo selection
 */
async function importPlaylist(req, res, next) {
  try {
    const { url, demoId } = req.body;

    let playlistData;
    let videosData;

    if (demoId) {
      // Import from curated demo data
      const result = getDemoPlaylistById(demoId);
      playlistData = result.playlist;
      videosData = result.videos;
    } else {
      // Import from YouTube URL / ID
      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid YouTube playlist URL or Playlist ID.'
        });
      }

      const playlistId = extractPlaylistId(url);
      if (!playlistId) {
        return res.status(400).json({
          success: false,
          message: 'Could not extract playlist ID from the provided link. Please ensure it is a valid YouTube playlist URL.'
        });
      }

      // Check if user already imported this playlist
      const existing = await Playlist.findOne({
        userId: req.user.id,
        youtubePlaylistId: playlistId
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `You already have an active tracker for this playlist: "${existing.title}". You can open and track it from your dashboard.`
        });
      }

      // Fetch from YouTube Data API v3
      const result = await fetchYouTubePlaylist(playlistId);
      playlistData = result.playlist;
      videosData = result.videos;
    }

    // Create Playlist Record
    const playlist = await Playlist.create({
      userId: req.user.id,
      youtubePlaylistId: playlistData.youtubePlaylistId,
      title: playlistData.title,
      originalTitle: playlistData.originalTitle || playlistData.title,
      channelTitle: playlistData.channelTitle,
      description: playlistData.description,
      thumbnailUrl: playlistData.thumbnailUrl,
      totalVideos: playlistData.totalVideos,
      watchedVideos: 0,
      progressPercentage: 0,
      totalDurationSeconds: playlistData.totalDurationSeconds || 0,
      watchedDurationSeconds: 0
    });

    const playlistId = playlist.id || playlist._id;

    // Attach playlistId and userId to all video records
    const preparedVideos = videosData.map((v, idx) => ({
      playlistId: String(playlistId),
      userId: req.user.id,
      youtubeVideoId: v.youtubeVideoId,
      title: v.title,
      thumbnailUrl: v.thumbnailUrl,
      videoUrl: v.videoUrl,
      durationFormatted: v.durationFormatted || '00:00',
      durationSeconds: v.durationSeconds || 0,
      position: v.position || idx + 1,
      isWatched: false,
      watchedAt: null,
      notes: '',
      notesUpdatedAt: null
    }));

    await Video.insertMany(preparedVideos);

    res.status(201).json({
      success: true,
      message: `Successfully imported "${playlist.title}" with ${preparedVideos.length} videos!`,
      playlist
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single playlist by ID with all its videos
 */
async function getPlaylistById(req, res, next) {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist tracker not found.'
      });
    }

    if (playlist.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this playlist tracker.'
      });
    }

    // Update lastAccessedAt timestamp
    await Playlist.findByIdAndUpdate(playlist.id || playlist._id, {
      lastAccessedAt: new Date().toISOString()
    });

    // Fetch videos
    const videos = await Video.find({ playlistId: String(playlist.id || playlist._id) });

    res.status(200).json({
      success: true,
      playlist,
      videos
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Rename a playlist tracker
 */
async function renamePlaylist(req, res, next) {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a non-empty title.'
      });
    }

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist tracker not found.'
      });
    }

    if (playlist.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this playlist tracker.'
      });
    }

    const updated = await Playlist.findByIdAndUpdate(
      playlist.id || playlist._id,
      { title: title.trim() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Playlist renamed successfully!',
      playlist: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a playlist tracker and its videos
 */
async function deletePlaylist(req, res, next) {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Playlist tracker not found.'
      });
    }

    if (playlist.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this playlist tracker.'
      });
    }

    const playlistIdStr = String(playlist.id || playlist._id);

    // Cascade delete videos
    await Video.deleteMany({ playlistId: playlistIdStr });

    // Delete playlist
    await Playlist.findByIdAndDelete(playlistIdStr);

    res.status(200).json({
      success: true,
      message: 'Playlist tracker and all its progress/notes were successfully deleted.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * List available demo playlists
 */
function getDemoList(req, res) {
  const demos = getDemoPlaylists();
  res.status(200).json({
    success: true,
    demos
  });
}

module.exports = {
  getPlaylists,
  importPlaylist,
  getPlaylistById,
  renamePlaylist,
  deletePlaylist,
  getDemoList
};
