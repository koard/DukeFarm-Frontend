import L from 'leaflet';

/**
 * Fix Leaflet default marker icon paths for Next.js
 * This is needed because Leaflet's default icon paths don't work with Next.js webpack bundling
 */
export const fixLeafletDefaultIcon = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Remove the default icon URL getter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  // Set icon URLs to use CDN
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
};
