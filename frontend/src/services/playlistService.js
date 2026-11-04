import api from './api';

export const playlistService = {
  async getPlaylists() {
    const response = await api.get('/playlists');
    return response.data;
  },

  async importPlaylist({ url, demoId }) {
    const response = await api.post('/playlists/import', { url, demoId });
    return response.data;
  },

  async getPlaylistById(id) {
    const response = await api.get(`/playlists/${id}`);
    return response.data;
  },

  async renamePlaylist(id, title) {
    const response = await api.patch(`/playlists/${id}`, { title });
    return response.data;
  },

  async deletePlaylist(id) {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  },

  async getDemoPlaylists() {
    const response = await api.get('/playlists/demos');
    return response.data;
  }
};
