import { useState, useEffect } from 'react';

export const usePlatformConfig = () => {
  const [config, setConfig] = useState({
    platform_name: 'Green Eco CTF',
    platform_subtitle: 'Hack for a Greener Tomorrow',
    platform_logo: '/tree-icon.svg',
    favicon_url: '/favicon.ico',
    background_image: '/heromap.jpg',
    background_opacity: '0.2',
    background_overlay: '0.6',
    chat_enabled: true,
    music_enabled: true,
    environment_globe_enabled: true,
    platform_theme: 'eco',
    primary_color: '#00ff88',
    secondary_color: '#00cc66'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/public_config');
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.config);
        setError(null);
      } else {
        setError('Failed to load configuration');
      }
    } catch (err) {
      console.error('Failed to load platform config:', err);
      setError('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
    
    // Reload config every 30 seconds to pick up admin changes
    const interval = setInterval(loadConfig, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshConfig = () => {
    loadConfig();
  };

  return {
    config,
    loading,
    error,
    refreshConfig
  };
};

export default usePlatformConfig;

