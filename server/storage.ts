import { episodes, playlists, type Episode, type InsertEpisode, type Playlist, type InsertPlaylist } from "@shared/schema";

export interface IStorage {
  // Episode methods
  getEpisodes(): Promise<Episode[]>;
  getEpisode(id: number): Promise<Episode | undefined>;
  getEpisodeByMixcloudId(mixcloudId: string): Promise<Episode | undefined>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;
  updateEpisode(id: number, episode: Partial<Episode>): Promise<Episode | undefined>;
  markNewEpisodes(episodeIds: number[], isNew: boolean): Promise<void>;
  
  // Playlist methods
  getPlaylist(mixcloudUrl: string): Promise<Playlist | undefined>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: number, playlist: Partial<Playlist>): Promise<Playlist | undefined>;
}

export class MemStorage implements IStorage {
  private episodes: Map<number, Episode>;
  private playlists: Map<number, Playlist>;
  private currentEpisodeId: number;
  private currentPlaylistId: number;

  constructor() {
    this.episodes = new Map();
    this.playlists = new Map();
    this.currentEpisodeId = 1;
    this.currentPlaylistId = 1;
  }

  async getEpisodes(): Promise<Episode[]> {
    return Array.from(this.episodes.values()).sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  async getEpisode(id: number): Promise<Episode | undefined> {
    return this.episodes.get(id);
  }

  async getEpisodeByMixcloudId(mixcloudId: string): Promise<Episode | undefined> {
    return Array.from(this.episodes.values()).find(
      (episode) => episode.mixcloudId === mixcloudId
    );
  }

  async createEpisode(insertEpisode: InsertEpisode): Promise<Episode> {
    const id = this.currentEpisodeId++;
    const episode: Episode = { 
      ...insertEpisode, 
      id,
      publishedAt: insertEpisode.publishedAt || new Date(),
      isNew: insertEpisode.isNew || false
    };
    this.episodes.set(id, episode);
    return episode;
  }

  async updateEpisode(id: number, episodeUpdate: Partial<Episode>): Promise<Episode | undefined> {
    const existingEpisode = this.episodes.get(id);
    if (!existingEpisode) return undefined;
    
    const updatedEpisode = { ...existingEpisode, ...episodeUpdate };
    this.episodes.set(id, updatedEpisode);
    return updatedEpisode;
  }

  async markNewEpisodes(episodeIds: number[], isNew: boolean): Promise<void> {
    for (const id of episodeIds) {
      const episode = this.episodes.get(id);
      if (episode) {
        episode.isNew = isNew;
      }
    }
  }

  async getPlaylist(mixcloudUrl: string): Promise<Playlist | undefined> {
    return Array.from(this.playlists.values()).find(
      (playlist) => playlist.mixcloudUrl === mixcloudUrl
    );
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = this.currentPlaylistId++;
    const playlist: Playlist = { 
      ...insertPlaylist, 
      id,
      lastUpdated: insertPlaylist.lastUpdated || new Date(),
      episodeCount: insertPlaylist.episodeCount || 0
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async updatePlaylist(id: number, playlistUpdate: Partial<Playlist>): Promise<Playlist | undefined> {
    const existingPlaylist = this.playlists.get(id);
    if (!existingPlaylist) return undefined;
    
    const updatedPlaylist = { ...existingPlaylist, ...playlistUpdate };
    this.playlists.set(id, updatedPlaylist);
    return updatedPlaylist;
  }
}

export const storage = new MemStorage();
