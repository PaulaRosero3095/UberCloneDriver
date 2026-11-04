export const TILE_URL =
  process.env.EXPO_PUBLIC_MAP_TILES_URL ||
  'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

export const TILE_ATTRIBUTION =
  process.env.EXPO_PUBLIC_MAP_ATTRIBUTION || '© OpenStreetMap contributors © CARTO';
