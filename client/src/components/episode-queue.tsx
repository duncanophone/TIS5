import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { List, Star, Clock } from "lucide-react";
import type { Episode } from "@shared/schema";

interface EpisodeQueueProps {
  episodes: Episode[];
  currentIndex: number;
  onEpisodeSelect: (index: number) => void;
}

export default function EpisodeQueue({ episodes, currentIndex, onEpisodeSelect }: EpisodeQueueProps) {
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:00`;
    }
    return `${mins}:00`;
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center text-primary">
            <List className="h-5 w-5 mr-2" />
            Episode Queue
          </span>
          <span className="text-sm text-muted-foreground font-normal">
            {episodes.length} episodes
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {episodes.map((episode, index) => {
              const isCurrent = index === currentIndex;
              const isUpcoming = index > currentIndex;
              
              return (
                <div
                  key={episode.id}
                  onClick={() => onEpisodeSelect(index)}
                  className={`
                    rounded-lg p-4 cursor-pointer transition-all duration-200 border
                    ${isCurrent 
                      ? 'bg-primary/10 border-primary/30 ring-1 ring-primary/20' 
                      : 'bg-card hover:bg-muted/50 border-border'
                    }
                  `}
                >
                  <div className="flex items-center space-x-4">
                    {/* Position Indicator */}
                    <div className="flex-shrink-0 w-6 flex justify-center">
                      {isCurrent ? (
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    
                    {/* Episode Artwork */}
                    <img 
                      src={episode.artworkUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"} 
                      alt="Episode artwork" 
                      className="w-12 h-12 rounded object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60";
                      }}
                    />
                    
                    {/* Episode Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-medium truncate ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                          {episode.title}
                        </h4>
                        {episode.isNew && (
                          <Badge variant="secondary" className="bg-green-600 text-white text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm truncate ${isCurrent ? 'text-primary/80' : 'text-muted-foreground'}`}>
                        {episode.artist}
                      </p>
                    </div>
                    
                    {/* Episode Metadata */}
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(episode.duration)}
                      </p>
                      {isCurrent ? (
                        <p className="text-xs text-primary font-medium">Now Playing</p>
                      ) : isUpcoming ? (
                        <p className="text-xs text-muted-foreground">Up Next</p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(episode.publishedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Queue Actions */}
        {episodes.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Total duration: {Math.floor(episodes.reduce((acc, ep) => acc + ep.duration, 0) / 3600)}h {Math.floor((episodes.reduce((acc, ep) => acc + ep.duration, 0) % 3600) / 60)}m
              </span>
              <span>
                {episodes.filter(ep => ep.isNew).length} new episodes
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
