import React from 'react';

export default function ProgressBar({ percentage = 0, size = 'md', showLabel = false, color = 'auto' }) {
  const clamped = Math.min(100, Math.max(0, Math.round(percentage * 10) / 10));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5'
  };

  const getGradient = () => {
    if (color === 'emerald') return 'from-emerald-500 to-teal-400';
    if (color === 'red') return 'from-red-500 to-rose-400';
    if (clamped >= 100) return 'from-emerald-500 to-teal-400';
    if (clamped >= 50) return 'from-cyan-500 to-emerald-400';
    return 'from-red-500 to-rose-400';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-1.5">
          <span>Progress</span>
          <span className={clamped === 100 ? 'text-emerald-400' : 'text-slate-200'}>
            {clamped}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/50 ${heightClasses[size] || heightClasses.md}`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getGradient()} transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
