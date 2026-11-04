import React, { useState, useEffect } from 'react';
import { playlistService } from '../services/playlistService';
import { useToast } from '../context/ToastContext';
import { X, Link2, Sparkles, Loader2, ArrowRight, PlaySquare, CheckCircle2 } from 'lucide-react';

export default function AddPlaylistModal({ isOpen, onClose, onSuccess }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoPlaylists, setDemoPlaylists] = useState([]);
  const [showDemos, setShowDemos] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setUrl('');
      // Fetch demo playlists options
      playlistService.getDemoPlaylists()
        .then((data) => {
          if (data.success) {
            setDemoPlaylists(data.demos || []);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let cleanUrl = url.trim();
    if (!cleanUrl) {
      showToast('Please paste a YouTube playlist link.', 'error');
      return;
    }

    // Friendly hint if user pasted Love Babbar truncated link
    if (cleanUrl.includes('PLDzeHZWIZsTryvtXd') && !cleanUrl.includes('PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA')) {
      cleanUrl = 'https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA';
      setUrl(cleanUrl);
    }

    setLoading(true);
    try {
      const data = await playlistService.importPlaylist({ url: cleanUrl });
      showToast(data.message || 'Playlist imported successfully!', 'success');
      onSuccess(data.playlist);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to import playlist.';
      showToast(msg, 'error', 6000);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoImport = async (demoId) => {
    setLoading(true);
    try {
      const data = await playlistService.importPlaylist({ demoId });
      showToast(data.message || 'Demo playlist imported successfully!', 'success');
      onSuccess(data.playlist);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to import demo playlist.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#131c2e] border border-slate-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <PlaySquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Add YouTube Playlist</h2>
              <p className="text-xs text-slate-400">Import and track any YouTube course or playlist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                YouTube Playlist URL or ID
              </label>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> No API Key Required
              </span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/playlist?list=PL..."
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm transition-all"
                autoFocus
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Paste any public YouTube playlist link. Entire playlists with all videos & durations will be automatically imported.
            </p>
          </div>

          {/* Import Button */}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing & Parsing All Videos...</span>
              </>
            ) : (
              <>
                <span>Import Playlist</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Try Demo Playlist Option */}
          {demoPlaylists.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Or Try Curated Demo Playlists
                </span>
                <button
                  type="button"
                  onClick={() => setShowDemos(!showDemos)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {showDemos ? 'Hide' : 'Browse Demos'}
                </button>
              </div>

              {showDemos && (
                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-1">
                  {demoPlaylists.map((demo) => (
                    <button
                      key={demo.id}
                      type="button"
                      disabled={loading}
                      onClick={() => handleDemoImport(demo.id)}
                      className="w-full text-left p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="text-xs font-semibold text-slate-200 group-hover:text-red-400 truncate">
                          {demo.title}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {demo.channelTitle} • {demo.videoCount} lessons
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 group-hover:bg-red-500/20 group-hover:text-red-300 transition-colors shrink-0">
                        1-Click Import
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
