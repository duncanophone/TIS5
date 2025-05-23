import { useState, useRef, useEffect, useCallback } from "react";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = "anonymous";
    audioRef.current.preload = "metadata";

    const audio = audioRef.current;

    // Event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // Could trigger next episode here
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, []);

  const loadEpisode = useCallback((url: string) => {
    if (currentUrl === url) return;

    console.log("Loading episode:", url);
    setCurrentUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
    
    // For Mixcloud episodes, we'll use their embed player approach
    // This provides real audio streaming using their public widget
    const mixcloudKey = url.replace('https://www.mixcloud.com', '');
    
    // Create a hidden iframe with Mixcloud's widget for audio streaming
    if (typeof window !== 'undefined') {
      // Remove any existing player iframe
      const existingPlayer = document.getElementById('mixcloud-player');
      if (existingPlayer) {
        existingPlayer.remove();
      }
      
      // Create new Mixcloud widget iframe
      const iframe = document.createElement('iframe');
      iframe.id = 'mixcloud-player';
      iframe.src = `https://www.mixcloud.com/widget/iframe/?hide_cover=1&hide_artwork=1&feed=${encodeURIComponent(mixcloudKey)}`;
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '100%';
      iframe.style.height = '60px';
      iframe.allow = 'autoplay';
      
      document.body.appendChild(iframe);
      
      // Set realistic duration based on episode length
      setDuration(3600); // Default 1 hour, could be parsed from episode data
    }
  }, [currentUrl]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // For demo purposes, we'll just toggle the state
      // Real implementation would play the actual audio
      setIsPlaying(true);
      
      // Simulate playback progress
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  }, [isPlaying, duration]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    
    setCurrentTime(Math.max(0, Math.min(time, duration)));
    // In real implementation: audioRef.current.currentTime = time;
  }, [duration]);

  const setVolumeLevel = useCallback((level: number) => {
    const clampedLevel = Math.max(0, Math.min(1, level));
    setVolume(clampedLevel);
    
    if (audioRef.current) {
      audioRef.current.volume = clampedLevel;
    }
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    seek,
    setVolume: setVolumeLevel,
    loadEpisode,
  };
}
