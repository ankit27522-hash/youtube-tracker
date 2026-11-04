import api from './api';

export const videoService = {
  async toggleStatus(videoId, isWatched) {
    const response = await api.patch(`/videos/${videoId}/status`, { isWatched });
    return response.data;
  },

  async updateNotes(videoId, notes) {
    const response = await api.put(`/videos/${videoId}/notes`, { notes });
    return response.data;
  },

  async deleteNotes(videoId) {
    const response = await api.delete(`/videos/${videoId}/notes`);
    return response.data;
  },

  async bulkUpdateStatus(playlistId, isWatched) {
    const response = await api.post('/videos/bulk-status', { playlistId, isWatched });
    return response.data;
  }
};
