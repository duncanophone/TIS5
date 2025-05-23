import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  RotateCcw, 
  RefreshCw,
  Clock,
  Calendar,
  Headphones
} from "lucide-react";
import type { Episode } from "@shared/schema";

interface AudioPlayerProps {
  episode: Episode | undefined;
  onNext: () => void;
  onPrevious: () => void;
  autoRefreshEnabled: boolean;
  onAutoRefreshToggle: (enabled: boolean) => void;
}

// Auto-advance with proper episode timing
const useAutoAdvance = (episode: Episode | undefined, onNext: () => void, autoAdvanceEnabled: boolean) => {
  useEffect(() => {
    if (!episode || !autoAdvanceEnabled) return;
    
    // Set timer for near the end of the episode (leave 30 seconds before end)
    const timeoutMs = Math.max((episode.duration - 30) * 1000, 30000); // At least 30 seconds
    const minutes = Math.ceil(timeoutMs / 60000);
    
    console.log(`🎵 Auto-advance set for ${minutes} minutes for: ${episode.title}`);
    
    const timer = setTimeout(() => {
      console.log('🔄 Auto-advancing to next episode');
      onNext();
    }, timeoutMs);
    
    return () => clearTimeout(timer);
  }, [episode?.id, onNext, autoAdvanceEnabled]);
};

export default function AudioPlayer({ 
  episode, 
  onNext, 
  onPrevious, 
  autoRefreshEnabled, 
  onAutoRefreshToggle 
}: AudioPlayerProps) {
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);
  const [volume, setVolume] = useState([75]);
  
  // Enable auto-advance functionality
  useAutoAdvance(episode, onNext, autoAdvanceEnabled);
  const { 
    isPlaying, 
    currentTime, 
    duration, 
    togglePlayPause, 
    seek,
    loadEpisode
  } = useAudioPlayer();

  // Load episode when it changes
  if (episode && episode.mixcloudUrl) {
    loadEpisode(episode.mixcloudUrl);
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "0:00";
    return formatTime(seconds);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!episode) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-muted rounded-lg mx-auto mb-4" />
              <p className="text-muted-foreground">No episode selected</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Episode Display */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Episode Artwork */}
            <div className="flex-shrink-0">
              <img 
                src={episode.artworkUrl || "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"} 
                alt="Episode artwork"
                className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300";
                }}
              />
            </div>
            
            {/* Episode Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl md:text-2xl font-bold text-foreground truncate">
                  {episode.title}
                </h3>
                {episode.isNew && (
                  <Badge variant="secondary" className="bg-green-600 text-white ml-2">
                    NEW
                  </Badge>
                )}
              </div>
              
              <p className="text-primary font-medium mb-2">
                {episode.artist}
              </p>
              
              {/* Episode Description & Show Notes */}
              <div className="mt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-orange-400 mb-2">Episode Description</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    Dive deep into the industrial underground with this carefully curated mix of dark electronic beats, industrial rhythms, and atmospheric soundscapes. Perfect for late-night listening sessions and exploring the darker side of electronic music.
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-orange-400 mb-2">Show Notes</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <p>• Industrial & EBM classics mixed with cutting-edge underground tracks</p>
                    <p>• Duration: {episode.duration ? Math.ceil(episode.duration / 60) : '60'} minutes of non-stop industrial beats</p>
                    <p>• Published: {episode.publishedAt ? new Date(episode.publishedAt).toLocaleDateString() : 'Recently'}</p>
                    <p>• Genre: Industrial, EBM, Dark Electronic, Synthwave</p>
                  </div>
                </div>
              </div>
              
              {/* Social Sharing & Actions */}
              <div className="flex flex-wrap gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}?episode=${encodeURIComponent(episode.title)}`;
                    navigator.clipboard.writeText(shareUrl);
                    console.log('🔗 Episode link copied to clipboard!');
                  }}
                  className="bg-gray-800 border-orange-500/30 hover:bg-orange-900/20 text-orange-400"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const shareText = `🎵 Listening to "${episode.title}" on TotalRock Industrial Show! Dark electronic beats and industrial soundscapes. ${episode.mixcloudUrl}`;
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
                    window.open(twitterUrl, '_blank');
                  }}
                  className="bg-gray-800 border-blue-500/30 hover:bg-blue-900/20 text-blue-400"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Share on X
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Toggle favorite (visual feedback only for now)
                    console.log(`❤️ Added "${episode.title}" to favorites!`);
                  }}
                  className="bg-gray-800 border-red-500/30 hover:bg-red-900/20 text-red-400"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Favorite
                </Button>
              </div>
              
              {/* Episode Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-4">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(episode.duration)}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(episode.publishedAt)}
                </span>
                <span className="flex items-center">
                  <Headphones className="h-4 w-4 mr-1" />
                  Industrial
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Controls */}
      <Card>
        <CardContent className="p-6">



          {/* Mixcloud Embed Player - Shows current episode */}
          <div className="mb-6 bg-gray-900 rounded-lg p-2">
            <iframe
              key={`${episode.mixcloudUrl}-${Date.now()}`} // Force complete reload with timestamp
              title={`TotalRock Industrial Show - ${episode.title}`}
              width="100%"
              height="180"
              src={`https://www.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(episode.mixcloudUrl)}&hide_cover=1&mini=0&autoplay=1&light=1&auto_play=true&start_playing=true`}
              className="rounded-lg"
              frameBorder="0"
              allow="autoplay; encrypted-media; fullscreen"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
              onLoad={() => {
                // Try to trigger autoplay after iframe loads
                console.log(`🎵 Episode loaded: ${episode.title} - Attempting autoplay`);
              }}
            />
          </div>
          
          {/* Show Title */}
          <div className="mb-4 text-center bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
            <div className="text-sm text-orange-400 font-medium mb-2">
              🎵 Duncan (Nox Pulso) TotalRock Industrial Show Archives
            </div>
            <div className="text-xs text-gray-400">
              Click ▶️ in the Mixcloud player to start each episode
            </div>
          </div>

          {/* Episode Navigation Controls */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              className="text-2xl control-button hover:text-orange-400 transition-colors"
              title="Previous Episode"
            >
              <SkipBack />
            </Button>
            
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Episode Navigation</div>
              <div className="text-sm text-orange-400 font-medium">
                Use ⬅️ ➡️ buttons to switch episodes
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="text-2xl control-button hover:text-orange-400 transition-colors"
              title="Next Episode"
            >
              <SkipForward />
            </Button>
          </div>


        </CardContent>
      </Card>
    </div>
  );
}
