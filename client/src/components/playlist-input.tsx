import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link, AlertCircle } from "lucide-react";

export default function PlaylistInput() {
  const [url, setUrl] = useState("https://www.mixcloud.com/TotalRockOfficial/playlists/industrial/");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loadPlaylistMutation = useMutation({
    mutationFn: async (mixcloudUrl: string) => {
      const response = await apiRequest("POST", "/api/playlists/load", { mixcloudUrl });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Playlist loaded successfully!",
        description: `Loaded ${data.totalEpisodes} episodes${data.newEpisodes > 0 ? `, ${data.newEpisodes} new` : ""}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/episodes"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to load playlist",
        description: error instanceof Error ? error.message : "Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a Mixcloud playlist URL.",
        variant: "destructive",
      });
      return;
    }

    if (!url.includes("mixcloud.com")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Mixcloud playlist URL.",
        variant: "destructive",
      });
      return;
    }

    loadPlaylistMutation.mutate(url.trim());
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-primary">
          <Link className="h-5 w-5" />
          <span>Playlist Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="playlist-url" className="block text-sm font-medium mb-2">
              Mixcloud Playlist URL
            </label>
            <div className="flex space-x-3">
              <Input
                id="playlist-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.mixcloud.com/playlists/industrial/"
                className="flex-1"
                disabled={loadPlaylistMutation.isPending}
              />
              <Button 
                type="submit" 
                disabled={loadPlaylistMutation.isPending}
                className="control-button"
              >
                {loadPlaylistMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : (
                  "Load"
                )}
              </Button>
            </div>
          </div>
          
          {loadPlaylistMutation.error && (
            <div className="flex items-center space-x-2 text-destructive bg-destructive/10 rounded-md p-3">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">
                {loadPlaylistMutation.error instanceof Error 
                  ? loadPlaylistMutation.error.message 
                  : "Failed to load playlist"}
              </span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
