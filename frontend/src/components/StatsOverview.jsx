import React from 'react';
import { Layers, Video, CheckCircle2, TrendingUp } from 'lucide-react';

export default function StatsOverview({ playlists = [] }) {
  const totalPlaylists = playlists.length;
  const totalVideos = playlists.reduce((acc, p) => acc + (p.totalVideos || 0), 0);
  const totalWatched = playlists.reduce((acc, p) => acc + (p.watchedVideos || 0), 0);
  const overallPercentage = totalVideos > 0 ? Math.round((totalWatched / totalVideos) * 1000) / 10 : 0;

  const stats = [
    {
      label: 'Playlists Tracked',
      value: totalPlaylists,
      icon: Layers,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20'
    },
    {
      label: 'Total Videos',
      value: totalVideos,
      icon: Video,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      label: 'Videos Completed',
      value: totalWatched,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Overall Progress',
      value: `${overallPercentage}%`,
      icon: TrendingUp,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm flex items-center gap-4 hover:border-slate-700 transition-colors"
          >
            <div className={`p-3 rounded-xl border shrink-0 ${item.bg}`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-400 truncate">{item.label}</p>
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                {item.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
