/**
 * Utility to extract YouTube Playlist ID from various URL formats or raw ID string.
 * Supports:
 * - https://www.youtube.com/playlist?list=PLxxxx
 * - https://www.youtube.com/watch?v=xxxx&list=PLxxxx
 * - https://youtu.be/xxxx?list=PLxxxx
 * - Raw playlist IDs (e.g. PLxxxx, OLAK5uy_xxxx, etc.)
 */
function extractPlaylistId(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();

  // If it's already a raw ID without URL characters
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed) && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }

  try {
    // Check for standard URL
    let urlString = trimmed;
    if (!/^https?:\/\//i.test(urlString)) {
      urlString = 'https://' + urlString;
    }

    const parsedUrl = new URL(urlString);
    const listParam = parsedUrl.searchParams.get('list');
    if (listParam) {
      return listParam;
    }

    // Fallback regex in case URL parsing missed query in hash or weird syntax
    const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (err) {
    // If URL parsing fails, regex fallback
    const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

module.exports = {
  extractPlaylistId
};
