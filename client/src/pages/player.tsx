import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import AudioPlayer from "@/components/audio-player";
import EpisodeQueue from "@/components/episode-queue";
import PlaylistInput from "@/components/playlist-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Wifi, Music } from "lucide-react";
import type { Episode } from "@shared/schema";

export default function Player() {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [newEpisodeCount, setNewEpisodeCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch episodes
  const { data: episodes = [], isLoading, error } = useQuery<Episode[]>({
    queryKey: ["/api/episodes"],
    refetchInterval: autoRefreshEnabled ? 300000 : false, // 5 minutes
  });

  // Refresh playlist mutation
  const refreshMutation = useMutation({
    mutationFn: async (mixcloudUrl: string) => {
      const response = await apiRequest("POST", "/api/playlists/refresh", { mixcloudUrl });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.newEpisodes > 0) {
        setNewEpisodeCount(data.newEpisodes);
        toast({
          title: "New episodes found!",
          description: `${data.newEpisodes} new episodes added to the queue.`,
        });
      } else {
        toast({
          title: "Playlist up to date",
          description: "No new episodes found.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/episodes"] });
    },
    onError: () => {
      toast({
        title: "Refresh failed",
        description: "Could not check for new episodes. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mark episodes as viewed
  const markViewedMutation = useMutation({
    mutationFn: async (episodeIds: number[]) => {
      await apiRequest("PATCH", "/api/episodes/mark-viewed", { episodeIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/episodes"] });
      setNewEpisodeCount(0);
    },
  });

  const currentEpisode = episodes[currentEpisodeIndex];
  const newEpisodes = episodes.filter(ep => ep.isNew);

  // Auto-load default playlist on mount
  useEffect(() => {
    const loadDefaultPlaylist = async () => {
      try {
        await apiRequest("POST", "/api/playlists/load", {
          mixcloudUrl: "https://www.mixcloud.com/TotalRockOfficial/playlists/industrial/"
        });
        queryClient.invalidateQueries({ queryKey: ["/api/episodes"] });
      } catch (error) {
        console.error("Failed to load default playlist:", error);
      }
    };

    if (episodes.length === 0 && !isLoading) {
      loadDefaultPlaylist();
    }
  }, [episodes.length, isLoading, queryClient]);

  // Update new episode count when episodes change
  useEffect(() => {
    setNewEpisodeCount(newEpisodes.length);
  }, [newEpisodes.length]);

  const handleNext = () => {
    if (episodes.length > 0) {
      setCurrentEpisodeIndex((prev) => (prev + 1) % episodes.length);
    }
  };

  const handlePrevious = () => {
    if (episodes.length > 0) {
      setCurrentEpisodeIndex((prev) => 
        prev === 0 ? episodes.length - 1 : prev - 1
      );
    }
  };

  const handleEpisodeSelect = (index: number) => {
    setCurrentEpisodeIndex(index);
  };

  const handleRefresh = () => {
    refreshMutation.mutate("https://www.mixcloud.com/TotalRockOfficial/playlists/industrial/");
  };

  const handleMarkAllViewed = () => {
    const newEpisodeIds = newEpisodes.map(ep => ep.id);
    if (newEpisodeIds.length > 0) {
      markViewedMutation.mutate(newEpisodeIds);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Failed to load episodes</h1>
          <p className="text-muted-foreground mb-4">
            Could not connect to the music service.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Music className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-mono font-bold text-primary">
                  TotalRock Industrial Show
                </h1>
                <p className="text-sm text-muted-foreground">
                  Industrial Show Archives
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground hidden md:inline">
                  Connected
                </span>
              </div>

              {/* New Episodes Badge */}
              {newEpisodeCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="bg-green-600 text-white cursor-pointer"
                  onClick={handleMarkAllViewed}
                >
                  {newEpisodeCount} New Episodes
                </Badge>
              )}
              
              {/* Refresh Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshMutation.isPending}
              >
                {refreshMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">


        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading episodes...</p>
            </div>
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-center py-12">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No episodes loaded</h2>
            <p className="text-muted-foreground">
              Load a playlist to start listening to industrial music.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Player */}
            <div className="lg:col-span-2">
              <AudioPlayer
                episode={currentEpisode}
                onNext={handleNext}
                onPrevious={handlePrevious}
                autoRefreshEnabled={autoRefreshEnabled}
                onAutoRefreshToggle={setAutoRefreshEnabled}
              />
            </div>

            {/* Episode Queue */}
            <div className="lg:col-span-1">
              <EpisodeQueue
                episodes={episodes}
                currentIndex={currentEpisodeIndex}
                onEpisodeSelect={handleEpisodeSelect}
              />
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="mt-6 bg-card rounded-lg p-4 flex items-center justify-between text-sm border border-border">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Stream Quality: 320 kbps</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Auto-refresh: {autoRefreshEnabled ? "ON" : "OFF"}
            </span>
          </div>
          
          <div className="text-muted-foreground">
            <span>TotalRock Industrial Show v1.0</span>
          </div>
        </div>
      </main>
    </div>
  );
}
