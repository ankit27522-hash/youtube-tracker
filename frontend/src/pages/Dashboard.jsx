import React, { useState, useEffect, useMemo } from 'react';
import { playlistService } from '../services/playlistService';
import { useToast } from '../context/ToastContext';
import StatsOverview from '../components/StatsOverview';
import PlaylistCard from '../components/PlaylistCard';
import AddPlaylistModal from '../components/AddPlaylistModal';
import RenamePlaylistModal from '../components/RenamePlaylistModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { Plus, Search, Filter, ArrowUpDown, PlaySquare, Sparkles, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | in_progress | completed | not_started
  const [sortBy, setSortBy] = useState('updated'); // updated | progress_desc | progress_asc | videos_desc | title_asc

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [renamingPlaylist, setRenamingPlaylist] = useState(null);
  const [deletingPlaylist, setDeletingPlaylist] = useState(null);

  const { showToast } = useToast();

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const data = await playlistService.getPlaylists();
      if (data.success) {
        setPlaylists(data.playlists || []);
      }
    } catch (err) {
      showToast('Failed to load your playlists.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handlePlaylistAdded = (newPlaylist) => {
    setPlaylists((prev) => [newPlaylist, ...prev]);
  };

  const handleRenameConfirm = async (id, newTitle) => {
    try {
      const data = await playlistService.renamePlaylist(id, newTitle);
      showToast(data.message || 'Playlist renamed!', 'success');
      setPlaylists((prev) =>
        prev.map((p) => ((p.id === id || p._id === id) ? { ...p, title: newTitle } : p))
      );
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to rename playlist.', 'error');
    }
  };

  const handleDeleteConfirm = async (id) => {
    try {
      const data = await playlistService.deletePlaylist(id);
      showToast(data.message || 'Playlist deleted successfully.', 'success');
      setPlaylists((prev) => prev.filter((p) => p.id !== id && p._id !== id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete playlist.', 'error');
    }
  };

  // Filter and Sort Playlists
  const filteredAndSortedPlaylists = useMemo(() => {
    let list = [...playlists];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.channelTitle?.toLowerCase().includes(q) ||
          p.originalTitle?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter === 'completed') {
      list = list.filter((p) => p.totalVideos > 0 && p.watchedVideos === p.totalVideos);
    } else if (statusFilter === 'in_progress') {
      list = list.filter((p) => p.watchedVideos > 0 && p.watchedVideos < p.totalVideos);
    } else if (statusFilter === 'not_started') {
      list = list.filter((p) => p.watchedVideos === 0);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'progress_desc') return (b.progressPercentage || 0) - (a.progressPercentage || 0);
      if (sortBy === 'progress_asc') return (a.progressPercentage || 0) - (b.progressPercentage || 0);
      if (sortBy === 'videos_desc') return (b.totalVideos || 0) - (a.totalVideos || 0);
      if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
      // Default 'updated'
      return new Date(b.lastAccessedAt || b.updatedAt || 0) - new Date(a.lastAccessedAt || a.updatedAt || 0);
    });

    return list;
  }, [playlists, searchQuery, statusFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Tracked Playlists
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage and track your video tutorials, courses, and learning roadmaps
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-red-600/25 transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Add Playlist</span>
        </button>
      </div>

      {/* Aggregate Statistics */}
      {playlists.length > 0 && <StatsOverview playlists={playlists} />}

      {/* Search, Filter & Sort Controls */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#131c2e] border border-[#24324a] mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search playlists by title or channel..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 text-sm transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto pl-9 pr-8 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-200 text-xs font-medium focus:outline-none focus:border-red-500 appearance-none cursor-pointer"
              >
                <option value="updated">Recently Accessed</option>
                <option value="progress_desc">Highest Progress</option>
                <option value="progress_asc">Lowest Progress</option>
                <option value="videos_desc">Most Videos</option>
                <option value="title_asc">Title (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Playlists' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
            { id: 'not_started', label: 'Not Started' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === pill.id
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Playlist Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-3" />
          <p className="text-sm">Loading your playlists...</p>
        </div>
      ) : filteredAndSortedPlaylists.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPlaylists.map((playlist) => (
            <PlaylistCard
              key={playlist.id || playlist._id}
              playlist={playlist}
              onRename={(p) => setRenamingPlaylist(p)}
              onDelete={(p) => setDeletingPlaylist(p)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 px-4 rounded-3xl bg-[#131c2e]/60 border border-[#24324a] text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <PlaySquare className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {searchQuery || statusFilter !== 'all'
              ? 'No matching playlists found'
              : 'No Playlists Tracked Yet'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Try changing your search keywords or reset your filter.'
              : 'Paste any YouTube playlist link to start tracking your video progress, notes, and study stats.'}
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-red-600/25 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add First Playlist</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <AddPlaylistModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handlePlaylistAdded}
      />

      <RenamePlaylistModal
        isOpen={!!renamingPlaylist}
        playlist={renamingPlaylist}
        onClose={() => setRenamingPlaylist(null)}
        onConfirm={handleRenameConfirm}
      />

      <ConfirmDeleteModal
        isOpen={!!deletingPlaylist}
        playlist={deletingPlaylist}
        onClose={() => setDeletingPlaylist(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
