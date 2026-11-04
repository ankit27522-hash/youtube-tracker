/**
 * Utility to parse ISO 8601 YouTube duration strings into seconds and formatted string.
 * e.g. "PT1H15M32S" -> { durationSeconds: 4532, durationFormatted: "1:15:32" }
 * e.g. "PT5M12S"    -> { durationSeconds: 312,  durationFormatted: "05:12" }
 * e.g. "PT45S"      -> { durationSeconds: 45,   durationFormatted: "00:45" }
 */
function parseIsoDuration(durationStr) {
  if (!durationStr || typeof durationStr !== 'string') {
    return { durationSeconds: 0, durationFormatted: '00:00' };
  }

  // Regex matching ISO 8601 duration components
  const regex = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = durationStr.match(regex);

  if (!matches) {
    return { durationSeconds: 0, durationFormatted: '00:00' };
  }

  const days = parseInt(matches[1] || '0', 10);
  const hours = parseInt(matches[2] || '0', 10);
  const minutes = parseInt(matches[3] || '0', 10);
  const seconds = parseInt(matches[4] || '0', 10);

  const totalHours = (days * 24) + hours;
  const totalSeconds = (totalHours * 3600) + (minutes * 60) + seconds;

  let formatted = '';
  if (totalHours > 0) {
    formatted = `${totalHours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return {
    durationSeconds: totalSeconds,
    durationFormatted: formatted
  };
}

/**
 * Format total seconds into human-readable duration (e.g. 14h 25m or 45m 12s)
 */
function formatHumanDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0m';

  const hours = Math.floor(totalSeconds / 3600);
  const remainingSeconds = totalSeconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

module.exports = {
  parseIsoDuration,
  formatHumanDuration
};
