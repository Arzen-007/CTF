import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  Upload, 
  Eye, 
  EyeOff, 
  Palette, 
  Type, 
  Image,
  MessageCircle,
  Music,
  Globe,
  RefreshCw,
  Check,
  X
} from 'lucide-react';

const PlatformSettings = ({ onRefresh }) => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin_config.php', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      showMessage('error', 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin_config.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: config }),
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        showMessage('success', 'Configuration saved successfully');
        if (onRefresh) onRefresh();
      } else {
        showMessage('error', data.message || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      showMessage('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', 'Please select a valid image file (PNG, JPG, GIF, or SVG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 5MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const logoData = e.target.result.split(',')[1]; // Remove data:type;base64, prefix
        
        const response = await fetch('/api/admin_config.php?action=upload_logo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            logo_data: logoData,
            filename: file.name
          }),
          credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
          setConfig(prev => ({ ...prev, platform_logo: data.logo_url }));
          showMessage('success', 'Logo uploaded successfully');
        } else {
          showMessage('error', data.message || 'Failed to upload logo');
        }
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload logo:', error);
      showMessage('error', 'Failed to upload logo');
      setUploadingLogo(false);
    }
  };

  const handleBackgroundUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', 'Please select a valid image file (PNG, JPG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 10MB for backgrounds)
    if (file.size > 10 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 10MB');
      return;
    }

    setUploadingBackground(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const backgroundData = e.target.result.split(',')[1]; // Remove data:type;base64, prefix
        
        const response = await fetch('/api/admin_config.php?action=upload_background', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            background_data: backgroundData,
            filename: file.name
          }),
          credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
          setConfig(prev => ({ ...prev, background_image: data.background_url }));
          showMessage('success', 'Background image uploaded successfully');
        } else {
          showMessage('error', data.message || 'Failed to upload background image');
        }
        setUploadingBackground(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload background:', error);
      showMessage('error', 'Failed to upload background image');
      setUploadingBackground(false);
    }
  };

  const handleFaviconUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', 'Please select a valid favicon file (PNG, JPG, GIF, or ICO)');
      return;
    }

    // Validate file size (max 2MB for favicons)
    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 2MB');
      return;
    }

    setUploadingFavicon(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const faviconData = e.target.result.split(',')[1]; // Remove data:type;base64, prefix
        
        const response = await fetch('/api/admin_config.php?action=upload_favicon', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            favicon_data: faviconData,
            filename: file.name
          }),
          credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
          setConfig(prev => ({ ...prev, favicon_url: data.favicon_url }));
          showMessage('success', 'Favicon uploaded successfully');
        } else {
          showMessage('error', data.message || 'Failed to upload favicon');
        }
        setUploadingFavicon(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Failed to upload favicon:', error);
      showMessage('error', 'Failed to upload favicon');
      setUploadingFavicon(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const themePresets = [
    {
      id: 'eco',
      name: 'Green Eco',
      primary: '#00ff88',
      secondary: '#00cc66',
      description: 'Environmental theme with green colors'
    },
    {
      id: 'heist',
      name: 'Money Heist',
      primary: '#ff0000',
      secondary: '#cc0000',
      description: 'Red theme inspired by Money Heist'
    },
    {
      id: 'pokemon',
      name: 'Pokemon',
      primary: '#ffcc00',
      secondary: '#ff6600',
      description: 'Yellow and orange Pokemon theme'
    },
    {
      id: 'cyber',
      name: 'Cyber Blue',
      primary: '#00ccff',
      secondary: '#0099cc',
      description: 'Blue cyberpunk theme'
    },
    {
      id: 'dark',
      name: 'Dark Purple',
      primary: '#9966ff',
      secondary: '#7744cc',
      description: 'Dark purple hacker theme'
    }
  ];

  const applyThemePreset = (preset) => {
    setConfig(prev => ({
      ...prev,
      platform_theme: preset.id,
      primary_color: preset.primary,
      secondary_color: preset.secondary
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Platform Settings</h2>
          <p className="text-gray-400">Configure your CTF platform appearance and features</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadConfig}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-400'
              : 'bg-red-500/20 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="bg-gray-900 rounded-lg border border-green-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Type className="w-5 h-5" />
            <span>Basic Information</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform Name</label>
              <input
                type="text"
                value={config.platform_name || ''}
                onChange={(e) => updateConfig('platform_name', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="Green Eco CTF"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Platform Subtitle</label>
              <input
                type="text"
                value={config.platform_subtitle || ''}
                onChange={(e) => updateConfig('platform_subtitle', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                placeholder="Hack for a Greener Tomorrow"
              />
            </div>
          </div>
        </div>

        {/* Logo Settings */}
        <div className="bg-gray-900 rounded-lg border border-green-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Image className="w-5 h-5" />
            <span>Platform Logo</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                {config.platform_logo ? (
                  <img 
                    src={config.platform_logo} 
                    alt="Platform Logo" 
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div className="text-gray-500 text-xs text-center" style={{ display: config.platform_logo ? 'none' : 'block' }}>
                  No Logo
                </div>
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${
                    uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                </label>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, or SVG (max 5MB)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Background Image Settings */}
        <div className="bg-gray-900 rounded-lg border border-green-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Image className="w-5 h-5" />
            <span>Background Image</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-16 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700 overflow-hidden">
                {config.background_image ? (
                  <img 
                    src={config.background_image} 
                    alt="Background Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div className="text-gray-500 text-xs text-center" style={{ display: config.background_image ? 'none' : 'block' }}>
                  No Background
                </div>
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundUpload}
                  disabled={uploadingBackground}
                  className="hidden"
                  id="background-upload"
                />
                <label
                  htmlFor="background-upload"
                  className={`flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer ${
                    uploadingBackground ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingBackground ? 'Uploading...' : 'Upload Background'}</span>
                </label>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, or WebP (max 10MB)</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Background Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.background_opacity || '0.2'}
                  onChange={(e) => updateConfig('background_opacity', e.target.value)}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{((config.background_opacity || 0.2) * 100).toFixed(0)}%</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dark Overlay</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.background_overlay || '0.6'}
                  onChange={(e) => updateConfig('background_overlay', e.target.value)}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{((config.background_overlay || 0.6) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Favicon Settings */}
        <div className="bg-gray-900 rounded-lg border border-green-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Browser Favicon</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
                {config.favicon_url ? (
                  <img 
                    src={config.favicon_url} 
                    alt="Favicon Preview" 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div className="text-gray-500 text-xs text-center" style={{ display: config.favicon_url ? 'none' : 'block' }}>
                  No Icon
                </div>
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*,.ico"
                  onChange={handleFaviconUpload}
                  disabled={uploadingFavicon}
                  className="hidden"
                  id="favicon-upload"
                />
                <label
                  htmlFor="favicon-upload"
                  className={`flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer ${
                    uploadingFavicon ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}</span>
                </label>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, or ICO (max 2MB)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Theme Presets */}
        <div className="bg-gray-900 rounded-lg border border-green-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Theme Presets</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            {themePresets.map((preset) => (
              <div
                key={preset.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  config.platform_theme === preset.id
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
                onClick={() => applyThemePreset(preset)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{preset.name}</h4>
                    <p className="text-xs text-gray-400">{preset.description}</p>
                  </div>
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-600"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-600"
                      style={{ backgroundColor: preset.secondary }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="bg-gray-900 rounded-lg border border-green-500/30 p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Custom Colors</span>
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Primary Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={config.primary_color || '#00ff88'}
                  onChange={(e) => updateConfig('primary_color', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-700 bg-gray-800"
                />
                <input
                  type="text"
                  value={config.primary_color || '#00ff88'}
                  onChange={(e) => updateConfig('primary_color', e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Secondary Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={config.secondary_color || '#00cc66'}
                  onChange={(e) => updateConfig('secondary_color', e.target.value)}
                  className="w-12 h-10 rounded border border-gray-700 bg-gray-800"
                />
                <input
                  type="text"
                  value={config.secondary_color || '#00cc66'}
                  onChange={(e) => updateConfig('secondary_color', e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Controls */}
        <div className="bg-gray-900 rounded-lg border border-green-500/30 p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Platform Features</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="text-white font-medium">Chat System</h4>
                  <p className="text-xs text-gray-400">Enable team communication</p>
                </div>
              </div>
              <button
                onClick={() => updateConfig('chat_enabled', !config.chat_enabled)}
                className={`p-2 rounded-lg transition-colors ${
                  config.chat_enabled 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {config.chat_enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Music className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-white font-medium">Music Player</h4>
                  <p className="text-xs text-gray-400">Background music system</p>
                </div>
              </div>
              <button
                onClick={() => updateConfig('music_enabled', !config.music_enabled)}
                className={`p-2 rounded-lg transition-colors ${
                  config.music_enabled 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {config.music_enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-green-400" />
                <div>
                  <h4 className="text-white font-medium">Environment Globe</h4>
                  <p className="text-xs text-gray-400">CO2 and environmental stats</p>
                </div>
              </div>
              <button
                onClick={() => updateConfig('environment_globe_enabled', !config.environment_globe_enabled)}
                className={`p-2 rounded-lg transition-colors ${
                  config.environment_globe_enabled 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {config.environment_globe_enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettings;

