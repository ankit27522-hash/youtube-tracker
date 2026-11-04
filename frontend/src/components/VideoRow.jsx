import React from 'react';
import { Check, Play, FileText, Plus, ExternalLink } from 'lucide-react';

export default function VideoRow({
  video,
  onToggleStatus,
  onOpenNotes,
  onPlayVideo
}) {
  const isWatched = Boolean(video.isWatched);
  const hasNotes = Boolean(video.notes && video.notes.trim());

  return (
    <div
      className={`group p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-3.5 ${
        isWatched
          ? 'bg-slate-900/40 border-slate-800/60 opacity-80 hover:opacity-100 hover:border-slate-700'
          : 'bg-[#131c2e]/90 border-[#24324a] hover:border-slate-600/80 hover:shadow-lg shadow-sm'
      }`}
    >
      {/* Left side: Checkbox, Position, Thumbnail, Title */}
      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
        {/* Watched Checkbox */}
        <button
          type="button"
          onClick={() => onToggleStatus(video)}
          className={`shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all mt-1 sm:mt-0 ${
            isWatched
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'border-slate-600 hover:border-emerald-400 bg-slate-900/80 text-transparent hover:text-slate-500'
          }`}
          title={isWatched ? 'Mark as unwatched' : 'Mark as watched'}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Position number */}
        <span className="text-xs font-mono font-bold text-slate-500 shrink-0 w-7 text-center">
          #{String(video.position).padStart(2, '0')}
        </span>

        {/* Video Thumbnail with duration overlay */}
        <div
          onClick={() => onPlayVideo(video)}
          className="relative w-24 sm:w-28 aspect-video rounded-xl bg-slate-950 overflow-hidden shrink-0 cursor-pointer group/thumb border border-slate-800"
        >
          <img
            src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
            alt={video.title}
            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 group-hover/thumb:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-7 h-7 rounded-full bg-red-600/90 flex items-center justify-center text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-md">
              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
            </div>
          </div>
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-mono font-semibold text-white">
            {video.durationFormatted || '00:00'}
          </span>
        </div>

        {/* Title and metadata */}
        <div className="flex-1 min-w-0 pr-2">
          <h4
            onClick={() => onPlayVideo(video)}
            className={`text-sm font-semibold transition-colors cursor-pointer line-clamp-2 leading-snug ${
              isWatched ? 'line-through text-slate-400 hover:text-slate-200' : 'text-slate-100 hover:text-red-400'
            }`}
            title={video.title}
          >
            {video.title}
          </h4>

          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
            {/* Status Pill */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                isWatched
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isWatched ? 'Watched' : 'Unwatched'}
            </span>

            {/* Note Snippet / Badge */}
            {hasNotes && (
              <button
                onClick={() => onOpenNotes(video)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors max-w-[200px] truncate"
                title={video.notes}
              >
                <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
                <span className="truncate">{video.notes}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center justify-end gap-2 pl-9 sm:pl-0 shrink-0 border-t md:border-t-0 border-slate-800/80 pt-2 md:pt-0">
        {/* Watch on YouTube button */}
        <a
          href={video.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
          title="Open in YouTube"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">YouTube</span>
        </a>

        {/* Note Action Button */}
        <button
          onClick={() => onOpenNotes(video)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            hasNotes
              ? 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
          }`}
        >
          {hasNotes ? (
            <>
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Note</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span>Add Note</span>
            </>
          )}
        </button>

        {/* Quick Play in App Button */}
        <button
          onClick={() => onPlayVideo(video)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-slate-300 text-xs font-semibold border border-slate-700/60 hover:border-red-600 transition-all"
          title="Watch in App"
        >
          <Play className="w-3 h-3 fill-current" />
          <span className="hidden sm:inline">Play</span>
        </button>
      </div>
    </div>
  );
}
