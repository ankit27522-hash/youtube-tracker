import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { playlistService } from '../services/playlistService';
import { videoService } from '../services/videoService';
import { useToast } from '../context/ToastContext';
import ProgressBar from '../components/ProgressBar';
import VideoRow from '../components/VideoRow';
import NoteEditorModal from '../components/NoteEditorModal';
import VideoPlayerModal from '../components/VideoPlayerModal';
import RenamePlaylistModal from '../components/RenamePlaylistModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { formatDurationHoursMinutes } from '../utils/formatters';
import {
  ArrowLeft,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Video,
  ListChecks,
  ExternalLink,
  Edit3,
  Trash2,
  Loader2,
  Layers
} from 'lucide-react';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [playlist, setPlaylist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | watched | unwatched | has_notes | no_notes
  const [sortBy, setSortBy] = useState('order'); // order | watched_first | unwatched_first | shortest | longest | title_asc

  // Modal states
  const [activeNoteVideo, setActiveNoteVideo] = useState(null);
  const [activePlayerVideo, setActivePlayerVideo] = useState(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Fetch playlist & videos
  const fetchPlaylistData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await playlistService.getPlaylistById(id);
      if (data.success) {
        setPlaylist(data.playlist);
        setVideos(data.videos || []);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load playlist.', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => {
    fetchPlaylistData();
  }, [fetchPlaylistData]);

  // Handle Video Watch Toggle with Optimistic UI
  const handleToggleStatus = async (video) => {
    const nextStatus = !video.isWatched;
    const videoId = video.id || video._id;

    // Optimistically update local videos list
    setVideos((prev) =>
      prev.map((v) =>
        (v.id === videoId || v._id === videoId)
          ? { ...v, isWatched: nextStatus, watchedAt: nextStatus ? new Date().toISOString() : null }
          : v
      )
    );

    // Optimistically update playlist stats
    setPlaylist((prev) => {
      if (!prev) return prev;
      const total = prev.totalVideos || videos.length;
      const currentWatched = prev.watchedVideos || 0;
      const newWatched = nextStatus ? currentWatched + 1 : Math.max(0, currentWatched - 1);
      const newPct = total > 0 ? Math.round((newWatched / total) * 100 * 10) / 10 : 0;
      const durationDelta = video.durationSeconds || 0;
      const newWatchedDuration = nextStatus
        ? (prev.watchedDurationSeconds || 0) + durationDelta
        : Math.max(0, (prev.watchedDurationSeconds || 0) - durationDelta);

      return {
        ...prev,
        watchedVideos: newWatched,
        progressPercentage: newPct,
        watchedDurationSeconds: newWatchedDuration
      };
    });

    try {
      const res = await videoService.toggleStatus(videoId, nextStatus);
      if (res.success && res.stats) {
        // Sync accurate server stats
        setPlaylist((prev) => ({
          ...prev,
          watchedVideos: res.stats.watchedVideos,
          progressPercentage: res.stats.progressPercentage,
          watchedDurationSeconds: res.stats.watchedDurationSeconds,
          totalDurationSeconds: res.stats.totalDurationSeconds
        }));
      }
    } catch (err) {
      showToast('Failed to update watch status.', 'error');
      // Rollback on error
      fetchPlaylistData();
    }
  };

  // Handle Save Note
  const handleSaveNote = async (videoId, noteContent) => {
    try {
      const res = await videoService.updateNotes(videoId, noteContent);
      if (res.success) {
        showToast(res.message || 'Note saved!', 'success');
        setVideos((prev) =>
          prev.map((v) =>
            (v.id === videoId || v._id === videoId)
              ? { ...v, notes: res.video.notes, notesUpdatedAt: res.video.notesUpdatedAt }
              : v
          )
        );
      }
    } catch (err) {
      showToast('Failed to save notes.', 'error');
    }
  };

  // Handle Delete Note
  const handleDeleteNote = async (videoId) => {
    try {
      const res = await videoService.deleteNotes(videoId);
      if (res.success) {
        showToast(res.message || 'Note deleted.', 'info');
        setVideos((prev) =>
          prev.map((v) =>
            (v.id === videoId || v._id === videoId)
              ? { ...v, notes: '', notesUpdatedAt: null }
              : v
          )
        );
      }
    } catch (err) {
      showToast('Failed to delete note.', 'error');
    }
  };

  // Bulk status update
  const handleBulkStatus = async (isWatched) => {
    try {
      const res = await videoService.bulkUpdateStatus(id, isWatched);
      if (res.success) {
        showToast(res.message, 'success');
        if (res.videos) setVideos(res.videos);
        if (res.stats && res.stats.playlist) setPlaylist(res.stats.playlist);
      }
    } catch (err) {
      showToast('Failed to update videos in bulk.', 'error');
    }
  };

  // Rename Playlist
  const handleRenameConfirm = async (playlistId, newTitle) => {
    try {
      const res = await playlistService.renamePlaylist(playlistId, newTitle);
      showToast('Playlist renamed!', 'success');
      setPlaylist(res.playlist);
    } catch (err) {
      showToast('Failed to rename playlist.', 'error');
    }
  };

  // Delete Playlist
  const handleDeleteConfirm = async (playlistId) => {
    try {
      await playlistService.deletePlaylist(playlistId);
      showToast('Playlist deleted.', 'success');
      navigate('/');
    } catch (err) {
      showToast('Failed to delete playlist.', 'error');
    }
  };

  // Filtered & Sorted Videos
  const filteredAndSortedVideos = useMemo(() => {
    let list = [...videos];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((v) => v.title?.toLowerCase().includes(q));
    }

    // Status filter
    if (statusFilter === 'watched') {
      list = list.filter((v) => v.isWatched);
    } else if (statusFilter === 'unwatched') {
      list = list.filter((v) => !v.isWatched);
    } else if (statusFilter === 'has_notes') {
      list = list.filter((v) => v.notes && v.notes.trim());
    } else if (statusFilter === 'no_notes') {
      list = list.filter((v) => !v.notes || !v.notes.trim());
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'watched_first') return (b.isWatched ? 1 : 0) - (a.isWatched ? 1 : 0);
      if (sortBy === 'unwatched_first') return (a.isWatched ? 1 : 0) - (b.isWatched ? 1 : 0);
      if (sortBy === 'shortest') return (a.durationSeconds || 0) - (b.durationSeconds || 0);
      if (sortBy === 'longest') return (b.durationSeconds || 0) - (a.durationSeconds || 0);
      if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
      // Default: 'order'
      return (a.position || 0) - (b.position || 0);
    });

    return list;
  }, [videos, searchQuery, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-3" />
        <p className="text-sm">Loading playlist tracker...</p>
      </div>
    );
  }

  if (!playlist) return null;

  const totalVideosCount = playlist.totalVideos || videos.length;
  const watchedVideosCount = playlist.watchedVideos || videos.filter((v) => v.isWatched).length;
  const remainingVideosCount = Math.max(0, totalVideosCount - watchedVideosCount);
  const totalDuration = playlist.totalDurationSeconds || videos.reduce((s, v) => s + (v.durationSeconds || 0), 0);
  const watchedDuration = playlist.watchedDurationSeconds || videos.filter((v) => v.isWatched).reduce((s, v) => s + (v.durationSeconds || 0), 0);
  const remainingDuration = Math.max(0, totalDuration - watchedDuration);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      {/* Back button & Action buttons */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRenameOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Rename</span>
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Playlist Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#131c2e] border border-[#24324a] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider">
              <span>{playlist.channelTitle || 'YouTube Channel'}</span>
              <span className="text-slate-600">•</span>
              <a
                href={`https://www.youtube.com/playlist?list=${playlist.youtubePlaylistId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <span>View on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {playlist.title}
            </h1>

            {playlist.description && (
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 max-w-3xl">
                {playlist.description}
              </p>
            )}
          </div>

          {/* Quick Progress Badge */}
          <div className="shrink-0 flex items-center md:flex-col md:items-end justify-between md:justify-center border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {playlist.progressPercentage}%
            </div>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Completed
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <ProgressBar percentage={playlist.progressPercentage} size="md" />
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Videos</p>
              <p className="text-base font-bold text-white">{totalVideosCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Completed</p>
              <p className="text-base font-bold text-white">
                {watchedVideosCount} <span className="text-xs text-slate-500 font-normal">({remainingVideosCount} left)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Watched Time</p>
              <p className="text-base font-bold text-white">
                {formatDurationHoursMinutes(watchedDuration)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Time Remaining</p>
              <p className="text-base font-bold text-white">
                {formatDurationHoursMinutes(remainingDuration)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video Filter & Search Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#131c2e] border border-[#24324a] space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search video titles in this playlist..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
              >
                <option value="order">Playlist Order</option>
                <option value="watched_first">Watched First</option>
                <option value="unwatched_first">Unwatched First</option>
                <option value="shortest">Shortest Duration</option>
                <option value="longest">Longest Duration</option>
                <option value="title_asc">Title (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills & Bulk Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All Videos' },
              { id: 'watched', label: 'Watched' },
              { id: 'unwatched', label: 'Not Watched' },
              { id: 'has_notes', label: 'Has Notes' },
              { id: 'no_notes', label: 'No Notes' }
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setStatusFilter(pill.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === pill.id
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Bulk actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus(true)}
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Mark All Watched
            </button>
            <span className="text-slate-600">•</span>
            <button
              onClick={() => handleBulkStatus(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>

      {/* Video Rows List */}
      <div className="space-y-3">
        {filteredAndSortedVideos.length > 0 ? (
          filteredAndSortedVideos.map((video) => (
            <VideoRow
              key={video.id || video._id}
              video={video}
              onToggleStatus={handleToggleStatus}
              onOpenNotes={(v) => setActiveNoteVideo(v)}
              onPlayVideo={(v) => setActivePlayerVideo(v)}
            />
          ))
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400">
            <p className="text-sm">No videos match your search or filter.</p>
          </div>
        )}
      </div>

      {/* Note Editor Modal */}
      <NoteEditorModal
        isOpen={!!activeNoteVideo}
        video={activeNoteVideo}
        onClose={() => setActiveNoteVideo(null)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={!!activePlayerVideo}
        video={activePlayerVideo}
        onClose={() => setActivePlayerVideo(null)}
      />

      {/* Rename Playlist Modal */}
      <RenamePlaylistModal
        isOpen={isRenameOpen}
        playlist={playlist}
        onClose={() => setIsRenameOpen(false)}
        onConfirm={handleRenameConfirm}
      />

      {/* Delete Playlist Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        playlist={playlist}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
