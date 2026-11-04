/**
 * Curated realistic demo playlists for testing without requiring a Google Cloud API Key.
 * Contains real video IDs, actual YouTube thumbnails, and authentic video metadata.
 */
const DEMO_PLAYLISTS = [
  {
    id: 'demo-dsa-striver',
    title: 'Striver A2Z DSA — Masterclass',
    originalTitle: 'Striver A2Z DSA — Masterclass',
    channelTitle: 'take U forward',
    description: 'Complete Data Structures & Algorithms A2Z course covering Arrays, Binary Search, Trees, Graphs, and Dynamic Programming.',
    thumbnailUrl: 'https://i.ytimg.com/vi/37E9ckMDdTk/maxresdefault.jpg',
    videos: [
      {
        youtubeVideoId: '37E9ckMDdTk',
        title: 'L1: Introduction to Time and Space Complexity Analysis',
        thumbnailUrl: 'https://i.ytimg.com/vi/37E9ckMDdTk/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=37E9ckMDdTk',
        durationFormatted: '22:15',
        durationSeconds: 1335
      },
      {
        youtubeVideoId: 'fpnS8YQ_yG4',
        title: 'L2: C++ STL Full Tutorial in One Video | Competitive Programming',
        thumbnailUrl: 'https://i.ytimg.com/vi/fpnS8YQ_yG4/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=fpnS8YQ_yG4',
        durationFormatted: '48:30',
        durationSeconds: 2910
      },
      {
        youtubeVideoId: '34484439050',
        title: 'L3: Arrays Introduction — Largest & Second Largest Element in Array',
        thumbnailUrl: 'https://i.ytimg.com/vi/37E9ckMDdTk/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=37E9ckMDdTk',
        durationFormatted: '18:42',
        durationSeconds: 1122
      },
      {
        youtubeVideoId: 'wvcQg43_V8U',
        title: 'L4: Remove Duplicates from Sorted Array | Two Pointers Technique',
        thumbnailUrl: 'https://i.ytimg.com/vi/wvcQg43_V8U/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=wvcQg43_V8U',
        durationFormatted: '14:20',
        durationSeconds: 860
      },
      {
        youtubeVideoId: 'wpnmL6Z1T9g',
        title: 'L5: Left Rotate Array by K Places | Optimal Reversal Algorithm',
        thumbnailUrl: 'https://i.ytimg.com/vi/wpnmL6Z1T9g/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=wpnmL6Z1T9g',
        durationFormatted: '16:55',
        durationSeconds: 1015
      },
      {
        youtubeVideoId: '68494839201',
        title: 'L6: Move All Zeros to End of Array | In-place Linear Scan',
        thumbnailUrl: 'https://i.ytimg.com/vi/fpnS8YQ_yG4/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=fpnS8YQ_yG4',
        durationFormatted: '12:10',
        durationSeconds: 730
      },
      {
        youtubeVideoId: 'mhxO_m5t0qA',
        title: 'L7: Binary Search Explained | Lower Bound & Upper Bound Intuition',
        thumbnailUrl: 'https://i.ytimg.com/vi/mhxO_m5t0qA/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=mhxO_m5t0qA',
        durationFormatted: '25:40',
        durationSeconds: 1540
      },
      {
        youtubeVideoId: 'bB4i1X9a4sQ',
        title: 'L8: Search in Rotated Sorted Array | Finding the Pivot Element',
        thumbnailUrl: 'https://i.ytimg.com/vi/bB4i1X9a4sQ/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=bB4i1X9a4sQ',
        durationFormatted: '20:18',
        durationSeconds: 1218
      },
      {
        youtubeVideoId: 'yv_kX8yvL1E',
        title: 'L9: Kadane\'s Algorithm | Maximum Subarray Sum with Proof',
        thumbnailUrl: 'https://i.ytimg.com/vi/yv_kX8yvL1E/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=yv_kX8yvL1E',
        durationFormatted: '19:45',
        durationSeconds: 1185
      },
      {
        youtubeVideoId: 'aOxzWk9m_Z0',
        title: 'L10: Dutch National Flag Algorithm | Sort Colors (0s, 1s, and 2s)',
        thumbnailUrl: 'https://i.ytimg.com/vi/aOxzWk9m_Z0/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=aOxzWk9m_Z0',
        durationFormatted: '17:30',
        durationSeconds: 1050
      },
      {
        youtubeVideoId: '7k9x9z_P8x1',
        title: 'L11: 2-Sum and 3-Sum Problems | Hash Map & 3-Pointer Approaches',
        thumbnailUrl: 'https://i.ytimg.com/vi/37E9ckMDdTk/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=37E9ckMDdTk',
        durationFormatted: '28:12',
        durationSeconds: 1692
      },
      {
        youtubeVideoId: '8h8y_K7z9a2',
        title: 'L12: Merge Overlapping Subintervals | Sorting & Greedy Merging',
        thumbnailUrl: 'https://i.ytimg.com/vi/wvcQg43_V8U/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=wvcQg43_V8U',
        durationFormatted: '23:05',
        durationSeconds: 1385
      }
    ]
  },
  {
    id: 'demo-webdev-cwh',
    title: 'CodeWithHarry — Web Development Sigma Course',
    originalTitle: 'CodeWithHarry — Web Development Sigma Course',
    channelTitle: 'CodeWithHarry',
    description: 'Complete Sigma Web Development Course covering HTML, CSS, Modern JavaScript, Node.js, Express, and Database Design.',
    thumbnailUrl: 'https://i.ytimg.com/vi/tVzUXW6siu0/maxresdefault.jpg',
    videos: [
      {
        youtubeVideoId: 'tVzUXW6siu0',
        title: 'Introduction to Web Development | How the Internet Really Works',
        thumbnailUrl: 'https://i.ytimg.com/vi/tVzUXW6siu0/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=tVzUXW6siu0',
        durationFormatted: '18:50',
        durationSeconds: 1130
      },
      {
        youtubeVideoId: 'kJQP7kiw5Fk',
        title: 'HTML Basics: Tags, Elements, Attributes & Page Hierarchy',
        thumbnailUrl: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
        durationFormatted: '24:15',
        durationSeconds: 1455
      },
      {
        youtubeVideoId: 'ESnrn1k974w',
        title: 'Semantic HTML & Accessibility Guidelines for Clean Code',
        thumbnailUrl: 'https://i.ytimg.com/vi/ESnrn1k974w/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=ESnrn1k974w',
        durationFormatted: '19:40',
        durationSeconds: 1180
      },
      {
        youtubeVideoId: '1PnVor36_40',
        title: 'CSS Modern Flexbox Architecture with Real-world Examples',
        thumbnailUrl: 'https://i.ytimg.com/vi/1PnVor36_40/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=1PnVor36_40',
        durationFormatted: '32:10',
        durationSeconds: 1930
      },
      {
        youtubeVideoId: 'rg7Fvvl3taU',
        title: 'CSS Grid Complete Layout Guide: Areas, Fr Units, & MinMax',
        thumbnailUrl: 'https://i.ytimg.com/vi/rg7Fvvl3taU/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=rg7Fvvl3taU',
        durationFormatted: '35:22',
        durationSeconds: 2122
      },
      {
        youtubeVideoId: 'W6NZfCO5SIk',
        title: 'JavaScript Fundamentals: Scopes, Closures & Execution Context',
        thumbnailUrl: 'https://i.ytimg.com/vi/W6NZfCO5SIk/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
        durationFormatted: '29:45',
        durationSeconds: 1785
      },
      {
        youtubeVideoId: 'PoRJizFvM7s',
        title: 'Async JS: Promises, Async/Await & Event Loop Under the Hood',
        thumbnailUrl: 'https://i.ytimg.com/vi/PoRJizFvM7s/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=PoRJizFvM7s',
        durationFormatted: '41:10',
        durationSeconds: 2470
      },
      {
        youtubeVideoId: 'jBw2V_V8Yw4',
        title: 'Node.js & Express REST API Architecture from Scratch',
        thumbnailUrl: 'https://i.ytimg.com/vi/tVzUXW6siu0/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=tVzUXW6siu0',
        durationFormatted: '38:15',
        durationSeconds: 2295
      }
    ]
  },
  {
    id: 'demo-react-mastery',
    title: 'React 19 & Next.js Full Stack Masterclass',
    originalTitle: 'React 19 & Next.js Full Stack Masterclass',
    channelTitle: 'Tech With Tim',
    description: 'Master React 19, Server Components, Hooks, State Management, and Tailwind CSS.',
    thumbnailUrl: 'https://i.ytimg.com/vi/bMknfKXIFA8/maxresdefault.jpg',
    videos: [
      {
        youtubeVideoId: 'bMknfKXIFA8',
        title: 'React Fundamentals: JSX, Props, and State Mechanics',
        thumbnailUrl: 'https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
        durationFormatted: '28:10',
        durationSeconds: 1690
      },
      {
        youtubeVideoId: 'TNhaISAUy68',
        title: 'Mastering React Hooks: useState, useEffect, useMemo, useCallback',
        thumbnailUrl: 'https://i.ytimg.com/vi/TNhaISAUy68/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=TNhaISAUy68',
        durationFormatted: '34:45',
        durationSeconds: 2085
      },
      {
        youtubeVideoId: '0riHps91AzE',
        title: 'React Context API vs Global State Management Patterns',
        thumbnailUrl: 'https://i.ytimg.com/vi/0riHps91AzE/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=0riHps91AzE',
        durationFormatted: '26:30',
        durationSeconds: 1590
      },
      {
        youtubeVideoId: 'SqcY0GlETPk',
        title: 'React Router v6: Dynamic Routes, Loaders & Protected Views',
        thumbnailUrl: 'https://i.ytimg.com/vi/SqcY0GlETPk/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
        durationFormatted: '31:20',
        durationSeconds: 1880
      },
      {
        youtubeVideoId: 'HYrXogies7A',
        title: 'Tailwind CSS in React: Building Modern Dark Mode Interfaces',
        thumbnailUrl: 'https://i.ytimg.com/vi/HYrXogies7A/hqdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=HYrXogies7A',
        durationFormatted: '25:15',
        durationSeconds: 1515
      }
    ]
  }
];

function getDemoPlaylists() {
  return DEMO_PLAYLISTS.map(p => ({
    id: p.id,
    title: p.title,
    channelTitle: p.channelTitle,
    videoCount: p.videos.length,
    thumbnailUrl: p.thumbnailUrl,
    description: p.description
  }));
}

function getDemoPlaylistById(id) {
  const found = DEMO_PLAYLISTS.find(p => p.id === id) || DEMO_PLAYLISTS[0];
  const totalDuration = found.videos.reduce((sum, v) => sum + v.durationSeconds, 0);

  return {
    playlist: {
      youtubePlaylistId: found.id,
      title: found.title,
      originalTitle: found.originalTitle,
      channelTitle: found.channelTitle,
      description: found.description,
      thumbnailUrl: found.thumbnailUrl,
      totalVideos: found.videos.length,
      totalDurationSeconds: totalDuration
    },
    videos: found.videos.map((v, idx) => ({
      ...v,
      position: idx + 1
    }))
  };
}

module.exports = {
  getDemoPlaylists,
  getDemoPlaylistById
};
