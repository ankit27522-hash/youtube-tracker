import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDeleteModal({ isOpen, playlist, onClose, onConfirm }) {
  if (!isOpen || !playlist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#131c2e] border border-rose-500/30 shadow-2xl overflow-hidden">
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2">Delete Playlist Tracker?</h3>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            Are you sure you want to delete <strong className="text-white">"{playlist.title}"</strong>?
          </p>
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300 mb-6">
            Your watch status and notes for this playlist will also be permanently deleted.
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm(playlist.id || playlist._id);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-colors"
            >
              Yes, Delete Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
