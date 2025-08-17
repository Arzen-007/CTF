import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  Search,
  Heart,
  Shuffle,
  Repeat
} from 'lucide-react';
import '../App.css';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  
  const audioRef = useRef(null);

  // Curated list of royalty-free music tracks with Indian/Pakistani style
  const musicTracks = [
    {
      id: 1,
      title: "Indian Music",
      artist: "SoundGalleryByDmitryTaras",
      genre: "Indian",
      duration: "3:45",
      url: "https://cdn.pixabay.com/download/audio/2025/08/05/audio_4c0691745d.mp3?filename=indian-music-385019.mp3",
      cover: "https://cdn.pixabay.com/audio/2025/08/05/09-58-54-676_200x200.jpg"
    },
    {
      id: 2,
      title: "Indian",
      artist: "SoundGalleryByDmitryTaras",
      genre: "Indian",
      duration: "3:04",
      url: "https://cdn.pixabay.com/download/audio/2025/08/05/audio_3cc1adfcae.mp3?filename=indian-385020.mp3",
      cover: "https://cdn.pixabay.com/audio/2025/08/05/07-12-53-374_200x200.jpg"
    },
    {
      id: 3,
      title: "Indian Calm",
      artist: "SoundGalleryByDmitryTaras",
      genre: "Indian",
      duration: "4:13",
      url: "https://cdn.pixabay.com/download/audio/2025/08/05/audio_7ce226c200.mp3?filename=indian-calm-385022.mp3",
      cover: "https://cdn.pixabay.com/audio/2025/08/05/09-58-44-389_200x200.jpg"
    },
    {
      id: 4,
      title: "Epic Indian Drums Beat",
      artist: "9JackJack8",
      genre: "Beats",
      duration: "1:43",
      url: "https://cdn.pixabay.com/download/audio/2025/08/05/audio_7ce226c200.mp3?filename=indian-calm-385022.mp3", // Placeholder - will be replaced with actual royalty-free music
      cover: "https://cdn.pixabay.com/audio/2025/08/05/20-20-31-637_200x200.jpg"
    },
    {
      id: 5,
      title: "Bollywood Indian Hindi Song Music",
      artist: "original_soundtrack",
      genre: "World",
      duration: "2:46",
      url: "https://cdn.pixabay.com/download/audio/2025/08/05/audio_7ce226c200.mp3?filename=indian-calm-385022.mp3", // Placeholder
      cover: "https://cdn.pixabay.com/audio/2025/08/05/13-59-32-260_200x200.jpg"
    }
  ];

  const [filteredTracks, setFilteredTracks] = useState(musicTracks);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeating) {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextTrack();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, isRepeating]);

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    setIsLoading(true);
    try {
      if (isPlaying) {
        await audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextTrack = () => {
    if (isShuffled) {
      const randomIndex = Math.floor(Math.random() * filteredTracks.length);
      setCurrentTrack(randomIndex);
    } else {
      setCurrentTrack((prev) => (prev + 1) % filteredTracks.length);
    }
  };

  const previousTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + filteredTracks.length) % filteredTracks.length);
  };

  const selectTrack = (index) => {
    setCurrentTrack(index);
    setIsPlaying(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredTracks(musicTracks);
    } else {
      const filtered = musicTracks.filter(track =>
        track.title.toLowerCase().includes(query.toLowerCase()) ||
        track.artist.toLowerCase().includes(query.toLowerCase()) ||
        track.genre.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTracks(filtered);
    }
  };

  const toggleFavorite = (trackId) => {
    setFavorites(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current || !duration) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const currentTrackData = filteredTracks[currentTrack] || musicTracks[0];

  return (
    <motion.div 
      className="fixed bottom-4 left-4 z-50"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrackData.url}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          console.error('Audio loading error');
        }}
      />

      {/* Toggle Button */}
      <motion.button
        className="mb-2 p-3 rounded-full eco-button eco-hover-glow"
        onClick={() => setIsVisible(!isVisible)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Music size={20} />
      </motion.button>

      {/* Music Player Panel */}
      <motion.div
        className={`bg-background/95 backdrop-blur-md rounded-lg eco-border-glow w-80 ${
          isVisible ? 'block' : 'hidden'
        }`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/20">
          <h4 className="text-sm font-bold mb-3 eco-text-glow flex items-center">
            🎵 Eco Music Player
          </h4>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search music..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card/50 rounded-lg border border-border/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Current Track Display */}
        <div className="p-4 border-b border-border/20">
          <div className="flex items-center space-x-3">
            <img
              src={currentTrackData.cover}
              alt={currentTrackData.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-sm truncate">{currentTrackData.title}</h5>
              <p className="text-xs text-muted-foreground truncate">{currentTrackData.artist}</p>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                {currentTrackData.genre}
              </span>
            </div>
            <button
              onClick={() => toggleFavorite(currentTrackData.id)}
              className={`p-1 rounded ${
                favorites.includes(currentTrackData.id) 
                  ? 'text-red-500' 
                  : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart size={16} fill={favorites.includes(currentTrackData.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div 
              className="w-full h-2 bg-muted rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-border/20">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <button
              onClick={() => setIsShuffled(!isShuffled)}
              className={`p-2 rounded ${isShuffled ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Shuffle size={16} />
            </button>
            
            <button
              onClick={previousTrack}
              className="p-2 rounded hover:bg-card/50"
            >
              <SkipBack size={20} />
            </button>

            <motion.button
              className="p-3 rounded-full eco-button flex items-center justify-center"
              onClick={togglePlayback}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause size={20} />
              ) : (
                <Play size={20} />
              )}
            </motion.button>

            <button
              onClick={nextTrack}
              className="p-2 rounded hover:bg-card/50"
            >
              <SkipForward size={20} />
            </button>

            <button
              onClick={() => setIsRepeating(!isRepeating)}
              className={`p-2 rounded ${isRepeating ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Repeat size={16} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-3">
            <button onClick={() => setVolume(volume > 0 ? 0 : 0.7)}>
              {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer eco-slider"
              style={{
                background: `linear-gradient(to right, #00ff88 0%, #00ff88 ${volume * 100}%, #1a4a1a ${volume * 100}%, #1a4a1a 100%)`
              }}
            />
            <span className="text-xs text-muted-foreground w-8">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        {/* Track List */}
        <div className="max-h-48 overflow-y-auto">
          {filteredTracks.map((track, index) => (
            <motion.div
              key={track.id}
              className={`p-3 border-b border-border/10 cursor-pointer hover:bg-card/30 transition-colors ${
                index === currentTrack ? 'bg-primary/10' : ''
              }`}
              onClick={() => selectTrack(index)}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={track.cover}
                  alt={track.title}
                  className="w-8 h-8 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{track.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{track.duration}</p>
                  <span className="text-xs bg-primary/20 text-primary px-1 py-0.5 rounded">
                    {track.genre}
                  </span>
                </div>
                {index === currentTrack && isPlaying && (
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-primary rounded-full"
                        animate={{
                          height: [4, 12, 4],
                          opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 text-center">
          <p className="text-xs text-muted-foreground">
            🌱 Royalty-free eco-friendly music
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MusicPlayer;

