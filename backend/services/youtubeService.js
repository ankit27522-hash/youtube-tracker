const axios = require('axios');
const { parseIsoDuration } = require('../utils/durationParser');

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

function parseTimeStrToSeconds(str) {
  if (!str) return 0;
  const parts = str.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}

/**
 * Public YouTube playlist resolver (No API key needed!)
 * Uses YouTube's public web and innertube endpoints with full pagination support.
 */
async function scrapePublicYouTubePlaylist(playlistId) {
  const url = `https://www.youtube.com/playlist?list=${playlistId}`;
  let response;

  try {
    response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': 'CONSENT=YES+cb.20210328-17-p0.en+FX+478'
      },
      timeout: 15000
    });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      const error = new Error(
        'The playlist was not found on YouTube (404). Please ensure the playlist link is complete and public.'
      );
      error.statusCode = 404;
      throw error;
    }
    throw err;
  }

  const html = response.data;
  const match = html.match(/ytInitialData\s*=\s*({.+?});/s);
  if (!match) {
    throw new Error('Could not parse YouTube playlist page.');
  }

  const data = JSON.parse(match[1]);

  if (data.alerts) {
    for (const alert of data.alerts) {
      const errText = alert.alertRenderer?.text?.runs?.[0]?.text || alert.alertRenderer?.text?.simpleText;
      if (errText) {
        if (errText.toLowerCase().includes('does not exist')) {
          const notFound = new Error(
            `The playlist does not exist or the link was truncated. If you are importing Love Babbar's C++ course, the full link is: https://www.youtube.com/playlist?list=PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA`
          );
          notFound.statusCode = 404;
          throw notFound;
        }
        const error = new Error(`YouTube: ${errText}`);
        error.statusCode = 400;
        throw error;
      }
    }
  }

  // Playlist Metadata
  const meta = data.metadata?.playlistMetadataRenderer;
  const header = data.header?.playlistHeaderRenderer;
  const pageTitleMatch = html.match(/<title>(.+?)(?: - YouTube)?<\/title>/);

  const title =
    meta?.title ||
    header?.title?.simpleText ||
    header?.title?.runs?.[0]?.text ||
    (pageTitleMatch ? pageTitleMatch[1].replace(' - YouTube', '').trim() : 'YouTube Playlist');

  const channelTitle =
    header?.ownerText?.runs?.[0]?.text ||
    meta?.channelTitle ||
    'YouTube Channel';

  const description =
    meta?.description ||
    header?.descriptionText?.simpleText ||
    header?.descriptionText?.runs?.[0]?.text ||
    '';

  const thumbnailUrl =
    header?.playlistHeaderBanner?.heroPlaylistThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
    meta?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
    '';

  // Extract initial videos
  const tabContent = data.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content;
  const sectionList = tabContent?.sectionListRenderer?.contents || [];

  let rawItems = [];
  let continuationToken = null;

  for (const sec of sectionList) {
    const itemSection = sec.itemSectionRenderer?.contents || [];
    for (const item of itemSection) {
      if (item.playlistVideoListRenderer) {
        rawItems.push(...(item.playlistVideoListRenderer.contents || []));
      } else if (item.lockupViewModel || item.playlistVideoRenderer) {
        rawItems.push(item);
      } else if (item.continuationItemRenderer || item.continuationItemViewModel) {
        continuationToken =
          item.continuationItemViewModel?.continuationCommand?.innertubeCommand?.continuationCommand?.token ||
          item.continuationItemViewModel?.continuationCommand?.token ||
          item.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
      }
    }
  }

  const videos = [];
  let totalDurationSeconds = 0;

  function processItem(item) {
    if (item.lockupViewModel) {
      const vm = item.lockupViewModel;
      const videoId = vm.contentId;
      if (!videoId) return;

      const vTitle = vm.metadata?.lockupMetadataViewModel?.title?.content || 'Untitled Video';
      const durationText =
        vm.contentImage?.thumbnailViewModel?.overlays?.[0]?.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel?.text ||
        '00:00';
      const thumb =
        vm.contentImage?.thumbnailViewModel?.image?.sources?.slice(-1)[0]?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const durationSec = parseTimeStrToSeconds(durationText);

      totalDurationSeconds += durationSec;
      videos.push({
        youtubeVideoId: videoId,
        title: vTitle,
        thumbnailUrl: thumb,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`,
        durationFormatted: durationText,
        durationSeconds: durationSec,
        position: videos.length + 1
      });
    } else if (item.playlistVideoRenderer) {
      const pvr = item.playlistVideoRenderer;
      const videoId = pvr.videoId;
      if (!videoId) return;

      const vTitle = pvr.title?.runs?.[0]?.text || pvr.title?.simpleText || 'Untitled Video';
      if (vTitle === 'Private video' || vTitle === 'Deleted video') return;

      const durationText = pvr.lengthText?.simpleText || '00:00';
      const thumb =
        pvr.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      const durationSec = parseInt(pvr.lengthSeconds || '0', 10) || parseTimeStrToSeconds(durationText);

      totalDurationSeconds += durationSec;
      videos.push({
        youtubeVideoId: videoId,
        title: vTitle,
        thumbnailUrl: thumb,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`,
        durationFormatted: durationText,
        durationSeconds: durationSec,
        position: videos.length + 1
      });
    }
  }

  // Process initial page items
  for (const item of rawItems) {
    processItem(item);
  }

  // Handle Pagination / Continuation (up to 500 videos)
  let pageCount = 0;
  while (continuationToken && pageCount < 10) {
    pageCount++;
    try {
      const browseRes = await axios.post(
        'https://www.youtube.com/youtubei/v1/browse?prettyPrint=false',
        {
          continuation: continuationToken,
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240301.01.00',
              hl: 'en',
              gl: 'US'
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          },
          timeout: 10000
        }
      );

      const actions = browseRes.data.onResponseReceivedActions || [];
      const contItems = actions[0]?.appendContinuationItemsAction?.continuationItems || [];
      continuationToken = null;

      for (const item of contItems) {
        if (item.continuationItemViewModel || item.continuationItemRenderer) {
          continuationToken =
            item.continuationItemViewModel?.continuationCommand?.innertubeCommand?.continuationCommand?.token ||
            item.continuationItemViewModel?.continuationCommand?.token ||
            item.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
        } else {
          processItem(item);
        }
      }
    } catch (err) {
      console.warn('Continuation page fetch error:', err.message);
      break;
    }
  }

  if (videos.length === 0) {
    const error = new Error('No accessible public videos found in this playlist.');
    error.statusCode = 404;
    throw error;
  }

  return {
    playlist: {
      youtubePlaylistId: playlistId,
      title,
      originalTitle: title,
      channelTitle,
      description,
      thumbnailUrl: thumbnailUrl || videos[0]?.thumbnailUrl || '',
      totalVideos: videos.length,
      totalDurationSeconds
    },
    videos
  };
}

/**
 * Fetch official YouTube Data API v3 playlist
 */
async function fetchOfficialYouTubeAPI(playlistId, apiKey) {
  // 1. Fetch Playlist Metadata
  const playlistResponse = await axios.get(`${YOUTUBE_API_BASE}/playlists`, {
    params: {
      part: 'snippet,contentDetails',
      id: playlistId,
      key: apiKey
    }
  });

  const playlistItems = playlistResponse.data.items;
  if (!playlistItems || playlistItems.length === 0) {
    const error = new Error('Playlist not found. It may be private, deleted, or the playlist ID is invalid.');
    error.statusCode = 404;
    throw error;
  }

  const playlistSnippet = playlistItems[0].snippet;
  const playlistTitle = playlistSnippet.title || 'Untitled Playlist';
  const channelTitle = playlistSnippet.channelTitle || 'Unknown Channel';
  const description = playlistSnippet.description || '';
  const thumbnailUrl =
    playlistSnippet.thumbnails?.maxres?.url ||
    playlistSnippet.thumbnails?.standard?.url ||
    playlistSnippet.thumbnails?.high?.url ||
    playlistSnippet.thumbnails?.medium?.url ||
    playlistSnippet.thumbnails?.default?.url ||
    '';

  // 2. Fetch all playlist items (videos) with full pagination
  let rawVideos = [];
  let nextPageToken = null;

  do {
    const itemsResponse = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
      params: {
        part: 'snippet,contentDetails',
        playlistId: playlistId,
        maxResults: 50,
        pageToken: nextPageToken || undefined,
        key: apiKey
      }
    });

    const pageItems = itemsResponse.data.items || [];
    for (const item of pageItems) {
      const title = item.snippet?.title || '';
      const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;

      if (!videoId || title === 'Private video' || title === 'Deleted video') {
        continue;
      }

      const thumb =
        item.snippet?.thumbnails?.maxres?.url ||
        item.snippet?.thumbnails?.standard?.url ||
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      rawVideos.push({
        youtubeVideoId: videoId,
        title,
        thumbnailUrl: thumb,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}`,
        position: item.snippet?.position !== undefined ? item.snippet.position + 1 : rawVideos.length + 1
      });
    }

    nextPageToken = itemsResponse.data.nextPageToken;
  } while (nextPageToken);

  if (rawVideos.length === 0) {
    const error = new Error('The playlist does not contain any accessible or public videos.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Batch fetch video durations from 'videos' endpoint (chunks of 50)
  const videoDurationsMap = new Map();
  const chunkSize = 50;

  for (let i = 0; i < rawVideos.length; i += chunkSize) {
    const chunk = rawVideos.slice(i, i + chunkSize);
    const videoIds = chunk.map(v => v.youtubeVideoId).join(',');

    try {
      const videosResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
        params: {
          part: 'contentDetails',
          id: videoIds,
          key: apiKey
        }
      });

      const detailItems = videosResponse.data.items || [];
      for (const detail of detailItems) {
        const isoDuration = detail.contentDetails?.duration;
        const parsed = parseIsoDuration(isoDuration);
        videoDurationsMap.set(detail.id, parsed);
      }
    } catch (err) {
      console.warn(`Warning: Could not fetch durations for chunk starting at ${i}:`, err.message);
    }
  }

  // 4. Assemble final videos list
  let totalPlaylistSeconds = 0;
  const processedVideos = rawVideos.map((video, idx) => {
    const durationInfo = videoDurationsMap.get(video.youtubeVideoId) || {
      durationSeconds: 0,
      durationFormatted: '00:00'
    };

    totalPlaylistSeconds += durationInfo.durationSeconds;

    return {
      youtubeVideoId: video.youtubeVideoId,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      videoUrl: video.videoUrl,
      durationFormatted: durationInfo.durationFormatted,
      durationSeconds: durationInfo.durationSeconds,
      position: idx + 1
    };
  });

  return {
    playlist: {
      youtubePlaylistId: playlistId,
      title: playlistTitle,
      originalTitle: playlistTitle,
      channelTitle,
      description,
      thumbnailUrl: thumbnailUrl || processedVideos[0]?.thumbnailUrl || '',
      totalVideos: processedVideos.length,
      totalDurationSeconds: totalPlaylistSeconds
    },
    videos: processedVideos
  };
}

/**
 * Main function to fetch YouTube Playlist
 * First checks if official API key is provided; if not or if quota exceeded, seamlessly falls back to public resolver!
 */
async function fetchYouTubePlaylist(playlistId) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      console.log(`Fetching playlist ${playlistId} via YouTube Data API v3...`);
      return await fetchOfficialYouTubeAPI(playlistId, apiKey.trim());
    } catch (err) {
      console.warn(`Official API failed (${err.message}). Falling back to public resolver.`);
    }
  }

  // Fallback: Public web & Innertube resolver (No API key needed!)
  console.log(`Fetching playlist ${playlistId} via Public YouTube Resolver...`);
  return await scrapePublicYouTubePlaylist(playlistId);
}

module.exports = {
  fetchYouTubePlaylist,
  scrapePublicYouTubePlaylist
};
