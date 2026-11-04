/**
 * Format total seconds into human-readable duration like "12h 45m" or "25m"
 */
export function formatDurationHoursMinutes(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0m';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format date string into readable format like "Sep 21, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return 'Recently';
  }
}

/**
 * Format timestamp into relative time like "Just now", "2 hours ago", "Yesterday"
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return 'Recently';
  try {
    const now = new Date();
    const past = new Date(dateString);
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return formatDate(dateString);
  } catch {
    return 'Recently';
  }
}
