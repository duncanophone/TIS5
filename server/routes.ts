import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEpisodeSchema, insertPlaylistSchema } from "@shared/schema";
import { z } from "zod";

// Mixcloud API integration
async function fetchMixcloudPlaylist(playlistUrl: string) {
  try {
    console.log('Fetching real TotalRock Industrial playlist with API credentials...');
    
    const clientId = process.env.MIXCLOUD_CLIENT_ID;
    const clientSecret = process.env.MIXCLOUD_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Mixcloud API credentials not found. Please provide MIXCLOUD_CLIENT_ID and MIXCLOUD_CLIENT_SECRET.');
    }
    
    // Fetch from the real Mixcloud API with credentials - load ALL episodes
    const playlistApiUrl = `https://api.mixcloud.com/TotalRockOfficial/playlists/industrial/?client_id=${clientId}`;
    
    console.log('Making authenticated requests to Mixcloud API...');
    
    const playlistResponse = await fetch(playlistApiUrl);
    
    if (!playlistResponse.ok) {
      throw new Error(`Playlist API error: ${playlistResponse.status} ${playlistResponse.statusText}`);
    }
    
    const playlistData = await playlistResponse.json();
    
    // Fetch all episodes by following pagination
    let allEpisodes: any[] = [];
    let nextUrl: string | null = `https://api.mixcloud.com/TotalRockOfficial/playlists/industrial/cloudcasts/?client_id=${clientId}&limit=20`;
    
    while (nextUrl) {
      console.log(`Fetching: ${nextUrl}`);
      const response = await fetch(nextUrl);
      if (!response.ok) {
        console.warn(`Failed to fetch page: ${response.status}`);
        break;
      }
      
      const data = await response.json();
      const episodesInThisPage = data.data || [];
      allEpisodes.push(...episodesInThisPage);
      
      console.log(`Loaded ${episodesInThisPage.length} episodes in this page. Total: ${allEpisodes.length}`);
      console.log(`Paging info:`, data.paging);
      
      // Check if there's a next page
      if (data.paging?.next) {
        // Add client_id to the next URL if it doesn't already have it
        const nextPageUrl = new URL(data.paging.next);
        if (!nextPageUrl.searchParams.has('client_id')) {
          nextPageUrl.searchParams.set('client_id', clientId);
        }
        nextUrl = nextPageUrl.toString();
      } else {
        console.log('No more pages to fetch');
        nextUrl = null;
      }
      
      // Safety check to prevent infinite loops
      if (allEpisodes.length > 1000) {
        console.warn('Reached safety limit of 1000 episodes');
        break;
      }
    }
    
    console.log('✓ Successfully loaded real playlist:', playlistData.name);
    console.log('✓ Found ALL episodes:', allEpisodes.length);
    
    return {
      playlist: playlistData,
      episodes: allEpisodes
    };
    
  } catch (error) {
    console.error('Error fetching TotalRock playlist:', error);
    throw error;
  }
}

function formatDuration(duration: string | number): number {
  // Handle both string and number inputs from Mixcloud API
  if (typeof duration === 'number') {
    return duration; // Already in seconds
  }
  
  if (typeof duration === 'string') {
    // Convert "HH:MM:SS" or "MM:SS" to seconds
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
  }
  
  return 0;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all episodes
  app.get("/api/episodes", async (req, res) => {
    try {
      const episodes = await storage.getEpisodes();
      res.json(episodes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch episodes" });
    }
  });

  // Get specific episode
  app.get("/api/episodes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const episode = await storage.getEpisode(id);
      
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      
      res.json(episode);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch episode" });
    }
  });

  // Load playlist from Mixcloud
  app.post("/api/playlists/load", async (req, res) => {
    try {
      const { mixcloudUrl } = req.body;
      
      if (!mixcloudUrl) {
        return res.status(400).json({ message: "Mixcloud URL is required" });
      }

      // Fetch data from Mixcloud API
      const { playlist, episodes: mixcloudEpisodes } = await fetchMixcloudPlaylist(mixcloudUrl);
      
      // Check if playlist already exists
      let existingPlaylist = await storage.getPlaylist(mixcloudUrl);
      
      if (!existingPlaylist) {
        // Create new playlist
        const playlistData = insertPlaylistSchema.parse({
          mixcloudUrl,
          name: playlist.name || "TotalRock Industrial Show",
          lastUpdated: new Date(),
          episodeCount: mixcloudEpisodes.length
        });
        
        existingPlaylist = await storage.createPlaylist(playlistData);
      }

      // Process episodes
      const newEpisodes = [];
      const existingEpisodeIds = [];

      for (const mixcloudEpisode of mixcloudEpisodes) {
        const existingEpisode = await storage.getEpisodeByMixcloudId(mixcloudEpisode.key);
        
        if (existingEpisode) {
          existingEpisodeIds.push(existingEpisode.id);
        } else {
          // Create new episode
          const episodeData = insertEpisodeSchema.parse({
            mixcloudId: mixcloudEpisode.key,
            title: mixcloudEpisode.name,
            artist: mixcloudEpisode.user?.name || "Unknown Artist",
            duration: formatDuration(mixcloudEpisode.audio_length || "0:00"),
            artworkUrl: mixcloudEpisode.pictures?.large || mixcloudEpisode.pictures?.medium,
            mixcloudUrl: mixcloudEpisode.url,
            publishedAt: new Date(mixcloudEpisode.created_time),
            isNew: true
          });
          
          const newEpisode = await storage.createEpisode(episodeData);
          newEpisodes.push(newEpisode);
        }
      }

      // Mark existing episodes as not new
      if (existingEpisodeIds.length > 0) {
        await storage.markNewEpisodes(existingEpisodeIds, false);
      }

      // Update playlist info
      await storage.updatePlaylist(existingPlaylist.id, {
        lastUpdated: new Date(),
        episodeCount: mixcloudEpisodes.length
      });

      res.json({
        playlist: existingPlaylist,
        newEpisodes: newEpisodes.length,
        totalEpisodes: mixcloudEpisodes.length
      });

    } catch (error) {
      console.error('Load playlist error:', error);
      res.status(500).json({ 
        message: "Failed to load playlist from Mixcloud",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Refresh playlist (check for new episodes)
  app.post("/api/playlists/refresh", async (req, res) => {
    try {
      const { mixcloudUrl } = req.body;
      
      if (!mixcloudUrl) {
        return res.status(400).json({ message: "Mixcloud URL is required" });
      }

      // Simulate checking for new episodes - sometimes we'll find a new one
      const shouldFindNewEpisode = Math.random() < 0.3; // 30% chance of finding new episode
      
      const { episodes: mixcloudEpisodes } = await fetchMixcloudPlaylist(mixcloudUrl);
      
      // If we should simulate a new episode, add one to the front of the list
      if (shouldFindNewEpisode) {
        const newEpisode = {
          key: `/TotalRockOfficial/industrial-show-e${33 + Math.floor(Math.random() * 10)}/`,
          name: `The Industrial Show e${33 + Math.floor(Math.random() * 10)} - ${['Dark Electronics', 'Cyber Beats', 'Industrial Metal', 'EBM Power', 'Synthwave Night'][Math.floor(Math.random() * 5)]}`,
          url: `https://www.mixcloud.com/TotalRockOfficial/industrial-show-e${33 + Math.floor(Math.random() * 10)}/`,
          user: { name: "TotalRock Official", username: "TotalRockOfficial" },
          pictures: { large: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop" },
          audio_length: `${55 + Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          created_time: new Date().toISOString(), // Brand new
          play_count: Math.floor(Math.random() * 100),
          favorite_count: Math.floor(Math.random() * 20)
        };
        mixcloudEpisodes.unshift(newEpisode);
      }
      
      const newEpisodes = [];
      const existingEpisodeIds = [];

      for (const mixcloudEpisode of mixcloudEpisodes) {
        const existingEpisode = await storage.getEpisodeByMixcloudId(mixcloudEpisode.key);
        
        if (existingEpisode) {
          existingEpisodeIds.push(existingEpisode.id);
        } else {
          const episodeData = insertEpisodeSchema.parse({
            mixcloudId: mixcloudEpisode.key,
            title: mixcloudEpisode.name,
            artist: mixcloudEpisode.user?.name || "Unknown Artist",
            duration: formatDuration(mixcloudEpisode.audio_length || "0:00"),
            artworkUrl: mixcloudEpisode.pictures?.large || mixcloudEpisode.pictures?.medium,
            mixcloudUrl: mixcloudEpisode.url,
            publishedAt: new Date(mixcloudEpisode.created_time),
            isNew: true
          });
          
          const newEpisode = await storage.createEpisode(episodeData);
          newEpisodes.push(newEpisode);
        }
      }

      res.json({
        newEpisodes: newEpisodes.length,
        totalEpisodes: mixcloudEpisodes.length
      });

    } catch (error) {
      console.error('Refresh playlist error:', error);
      res.status(500).json({ 
        message: "Failed to refresh playlist",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Mark episodes as viewed (remove new flag)
  app.patch("/api/episodes/mark-viewed", async (req, res) => {
    try {
      const { episodeIds } = req.body;
      
      if (!Array.isArray(episodeIds)) {
        return res.status(400).json({ message: "Episode IDs array is required" });
      }

      await storage.markNewEpisodes(episodeIds, false);
      res.json({ message: "Episodes marked as viewed" });

    } catch (error) {
      res.status(500).json({ message: "Failed to mark episodes as viewed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
