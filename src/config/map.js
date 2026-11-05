// src/config/map.js
// AI-assisted: see docs/AI_LOG.md #8
// Free map tiles used when there is no Google Maps key (see InicioScreen).
// Both values can be changed from the .env file, without touching the code.
// If the map stays blank, try another provider (see .env.example).

export const TILE_URL =
  process.env.EXPO_PUBLIC_MAP_TILES_URL ||
  'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

export const TILE_ATTRIBUTION =
  process.env.EXPO_PUBLIC_MAP_ATTRIBUTION || '© OpenStreetMap contributors © CARTO';

// With a Google key the map uses Google Maps; without it, the free tiles above
export const HAS_GOOGLE_KEY = !!process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
