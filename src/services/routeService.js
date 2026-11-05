// src/services/routeService.js
// AI-assisted: see docs/AI_LOG.md #8
// Route between two points with OSRM (free, no key, no card). The PDF lists it as the
// alternative to Google Directions. It is called ONCE per leg of the trip (pickup, destination),
// never on every position update.

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

// from / to: { latitude, longitude }
export async function getRoute(from, to) {
  const url =
    `${OSRM_URL}/${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
    '?overview=full&geometries=geojson';
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Route request failed: ${response.status}`);

  const data = await response.json();
  const route = data.routes && data.routes[0];
  if (data.code !== 'Ok' || !route) throw new Error('No route found');

  return {
    // OSRM sends [lng, lat]; the map wants { latitude, longitude }
    coordinates: route.geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng })),
    distanceKm: route.distance / 1000,
    durationMin: route.duration / 60,
  };
}
