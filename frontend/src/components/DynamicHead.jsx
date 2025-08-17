import { useEffect } from 'react';

const DynamicHead = ({ platformConfig }) => {
  useEffect(() => {
    // Update document title
    if (platformConfig.platform_name) {
      document.title = platformConfig.platform_name;
    }

    // Update favicon
    if (platformConfig.favicon_url) {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => link.remove());

      // Add new favicon
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.type = 'image/x-icon';
      favicon.href = platformConfig.favicon_url;
      document.head.appendChild(favicon);

      // Add apple touch icon
      const appleFavicon = document.createElement('link');
      appleFavicon.rel = 'apple-touch-icon';
      appleFavicon.href = platformConfig.favicon_url;
      document.head.appendChild(appleFavicon);

      // Add 32x32 icon
      const favicon32 = document.createElement('link');
      favicon32.rel = 'icon';
      favicon32.type = 'image/png';
      favicon32.sizes = '32x32';
      favicon32.href = platformConfig.favicon_url;
      document.head.appendChild(favicon32);

      // Add 16x16 icon
      const favicon16 = document.createElement('link');
      favicon16.rel = 'icon';
      favicon16.type = 'image/png';
      favicon16.sizes = '16x16';
      favicon16.href = platformConfig.favicon_url;
      document.head.appendChild(favicon16);
    }

    // Update meta theme color
    if (platformConfig.primary_color) {
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.name = 'theme-color';
        document.head.appendChild(themeColorMeta);
      }
      themeColorMeta.content = platformConfig.primary_color;
    }

    // Update meta description
    if (platformConfig.platform_subtitle) {
      let descriptionMeta = document.querySelector('meta[name="description"]');
      if (!descriptionMeta) {
        descriptionMeta = document.createElement('meta');
        descriptionMeta.name = 'description';
        document.head.appendChild(descriptionMeta);
      }
      descriptionMeta.content = `${platformConfig.platform_name} - ${platformConfig.platform_subtitle}`;
    }

  }, [platformConfig]);

  return null; // This component doesn't render anything
};

export default DynamicHead;

