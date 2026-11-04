import React, { useState, useEffect } from 'react';
import { X, FileText, Trash2, Check, Clock } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatters';

export default function NoteEditorModal({ isOpen, video, onClose, onSave, onDelete }) {
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (video) {
      setNotes(video.notes || '');
    }
  }, [video]);

  if (!isOpen || !video) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(video.id || video._id, notes);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await onDelete(video.id || video._id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const hasExistingNote = Boolean(video.notes && video.notes.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#131c2e] border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                Video #{video.position} Notes
              </span>
              <h2 className="text-sm font-semibold text-white truncate" title={video.title}>
                {video.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note Body */}
        <form onSubmit={handleSave} className="p-6 flex-1 flex flex-col justify-between space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Personal Study Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Important: remember lower_bound vs upper_bound.&#10;Practice problems: 34, 35, 36."
              rows={8}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-mono leading-relaxed transition-all resize-none"
              autoFocus
            />
            {video.notesUpdatedAt && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated {formatRelativeTime(video.notesUpdatedAt)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            {hasExistingNote ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Note</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
