import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { formatRelativeTime } from '../utils/formatters';
import { Play, Edit3, Trash2, Video, CheckCircle2 } from 'lucide-react';

export default function PlaylistCard({ playlist, onRename, onDelete }) {
  const navigate = useNavigate();

  const id = playlist.id || playlist._id;
  const isCompleted = playlist.totalVideos > 0 && playlist.watchedVideos === playlist.totalVideos;

  return (
    <div className="group rounded-2xl bg-[#131c2e] border border-[#24324a] hover:border-slate-600/70 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Thumbnail Section with overlay */}
      <div
        onClick={() => navigate(`/playlist/${id}`)}
        className="relative aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer"
      >
        <img
          src={playlist.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop'}
          alt={playlist.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131c2e] via-transparent to-transparent opacity-80" />

        {/* Video count badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-xs font-semibold text-white">
          <Video className="w-3.5 h-3.5 text-red-400" />
          <span>{playlist.totalVideos} videos</span>
        </div>

        {/* Completed ribbon badge */}
        {isCompleted && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1 shadow-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Channel Name */}
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider truncate mb-1">
            {playlist.channelTitle || 'YouTube Channel'}
          </p>

          {/* Title */}
          <h3
            onClick={() => navigate(`/playlist/${id}`)}
            className="text-base font-bold text-slate-100 hover:text-red-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
            title={playlist.title}
          >
            {playlist.title}
          </h3>
        </div>

        <div className="mt-5 space-y-3">
          {/* Progress stats */}
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
            <span>
              <strong className="text-slate-200">{playlist.watchedVideos}</strong> / {playlist.totalVideos} watched
            </span>
            <span className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-slate-200'}`}>
              {playlist.progressPercentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <ProgressBar percentage={playlist.progressPercentage} size="sm" />

          {/* Footer Metadata & Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500 font-medium">
              Updated {formatRelativeTime(playlist.lastAccessedAt || playlist.updatedAt)}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(playlist);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                title="Rename tracker"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(playlist);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete tracker"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate(`/playlist/${id}`)}
                className="ml-1 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md shadow-red-600/20 transition-all hover:gap-1.5"
              >
                <span>Open</span>
                <Play className="w-3 h-3 fill-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
