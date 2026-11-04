const Video = require('../models/Video');
const Playlist = require('../models/Playlist');

/**
 * Recalculate and update playlist progress metrics based on current video states
 */
async function recalculatePlaylistStats(playlistId) {
  const allVideos = await Video.find({ playlistId: String(playlistId) });
  const totalVideos = allVideos.length;
  const watchedVideos = allVideos.filter(v => v.isWatched).length;
  const progressPercentage = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100 * 10) / 10 : 0;

  const totalDurationSeconds = allVideos.reduce((sum, v) => sum + (v.durationSeconds || 0), 0);
  const watchedDurationSeconds = allVideos
    .filter(v => v.isWatched)
    .reduce((sum, v) => sum + (v.durationSeconds || 0), 0);

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      totalVideos,
      watchedVideos,
      progressPercentage,
      totalDurationSeconds,
      watchedDurationSeconds,
      lastAccessedAt: new Date().toISOString()
    },
    { new: true }
  );

  return {
    totalVideos,
    watchedVideos,
    remainingVideos: Math.max(0, totalVideos - watchedVideos),
    progressPercentage,
    totalDurationSeconds,
    watchedDurationSeconds,
    remainingDurationSeconds: Math.max(0, totalDurationSeconds - watchedDurationSeconds),
    playlist: updatedPlaylist
  };
}

/**
 * Toggle or set video watched status
 */
async function toggleVideoStatus(req, res, next) {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found.'
      });
    }

    if (video.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this video.'
      });
    }

    const nextWatchedStatus = req.body.isWatched !== undefined ? Boolean(req.body.isWatched) : !video.isWatched;
    const watchedAt = nextWatchedStatus ? new Date().toISOString() : null;

    const updatedVideo = await Video.findByIdAndUpdate(
      video.id || video._id,
      {
        isWatched: nextWatchedStatus,
        watchedAt
      },
      { new: true }
    );

    const stats = await recalculatePlaylistStats(video.playlistId);

    res.status(200).json({
      success: true,
      video: updatedVideo,
      stats
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add or update personal notes for a specific video
 */
async function updateVideoNotes(req, res, next) {
  try {
    const { notes } = req.body;

    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found.'
      });
    }

    if (video.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit notes for this video.'
      });
    }

    const noteContent = typeof notes === 'string' ? notes : '';
    const notesUpdatedAt = noteContent.trim() ? new Date().toISOString() : null;

    const updatedVideo = await Video.findByIdAndUpdate(
      video.id || video._id,
      {
        notes: noteContent,
        notesUpdatedAt
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: noteContent.trim() ? 'Notes saved successfully!' : 'Notes cleared.',
      video: updatedVideo
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete notes for a specific video
 */
async function deleteVideoNotes(req, res, next) {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found.'
      });
    }

    if (video.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete notes for this video.'
      });
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      video.id || video._id,
      {
        notes: '',
        notesUpdatedAt: null
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notes deleted successfully.',
      video: updatedVideo
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Bulk update watched status for all videos in a playlist
 */
async function bulkUpdateStatus(req, res, next) {
  try {
    const { playlistId, isWatched } = req.body;

    if (!playlistId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a playlistId.'
      });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist || playlist.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Playlist not found or unauthorized.'
      });
    }

    const targetStatus = Boolean(isWatched);
    const watchedAt = targetStatus ? new Date().toISOString() : null;

    await Video.updateMany(
      { playlistId: String(playlistId), userId: req.user.id },
      { isWatched: targetStatus, watchedAt }
    );

    const stats = await recalculatePlaylistStats(playlistId);
    const videos = await Video.find({ playlistId: String(playlistId) });

    res.status(200).json({
      success: true,
      message: `All videos marked as ${targetStatus ? 'watched' : 'unwatched'}.`,
      stats,
      videos
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  toggleVideoStatus,
  updateVideoNotes,
  deleteVideoNotes,
  bulkUpdateStatus
};
