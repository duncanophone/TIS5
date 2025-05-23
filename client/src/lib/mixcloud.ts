// Mixcloud API utilities
export interface MixcloudEpisode {
  key: string;
  name: string;
  url: string;
  user: {
    name: string;
    username: string;
  };
  pictures: {
    large?: string;
    medium?: string;
    small?: string;
  };
  audio_length: string;
  created_time: string;
  play_count: number;
  favorite_count: number;
}

export interface MixcloudPlaylist {
  name: string;
  description: string;
  user: {
    name: string;
    username: string;
  };
  cloudcast_count: number;
  created_time: string;
  updated_time: string;
}

export interface MixcloudApiResponse<T> {
  data: T[];
  paging: {
    next?: string;
    previous?: string;
  };
}

export async function fetchMixcloudPlaylist(playlistUrl: string): Promise<{
  playlist: MixcloudPlaylist;
  episodes: MixcloudEpisode[];
}> {
  try {
    // Extract playlist path from URL
    const urlParts = playlistUrl.split('/');
    const playlistPath = urlParts.slice(-2).join('/'); // gets "username/playlist-name"
    
    // Mixcloud API endpoint for playlists
    const apiUrl = `https://api.mixcloud.com/${playlistPath}/`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Mixcloud API error: ${response.status}`);
    }
    
    const playlistData: MixcloudPlaylist = await response.json();
    
    // Fetch cloudcasts (episodes) from the playlist
    const cloudcastsUrl = `https://api.mixcloud.com/${playlistPath}/cloudcasts/`;
    const cloudcastsResponse = await fetch(cloudcastsUrl);
    
    if (!cloudcastsResponse.ok) {
      throw new Error(`Mixcloud cloudcasts API error: ${cloudcastsResponse.status}`);
    }
    
    const cloudcastsData: MixcloudApiResponse<MixcloudEpisode> = await cloudcastsResponse.json();
    
    return {
      playlist: playlistData,
      episodes: cloudcastsData.data || []
    };
  } catch (error) {
    console.error('Error fetching Mixcloud playlist:', error);
    throw error;
  }
}

export function formatMixcloudDuration(durationString: string): number {
  // Convert "HH:MM:SS" or "MM:SS" to seconds
  const parts = durationString.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

export function getMixcloudStreamUrl(episodeUrl: string): string {
  // Note: Mixcloud requires authentication for streaming
  // This would typically return a widget embed URL or authenticated stream URL
  return episodeUrl;
}
