// app.config.js
// AI-assisted: see docs/AI_LOG.md #5
// Extends app.json. It injects the Google Maps key from the .env file, so the key is never
// written in a file that goes to GitHub. (Restrict the key in Google Cloud to this app.)
// Without a key a placeholder is used: the native map still starts (no crash) and the app
// draws OpenStreetMap tiles instead (see InicioScreen).

const mapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'NO_KEY_USING_OPENSTREETMAP';

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...(config.android && config.android.config),
      googleMaps: { apiKey: mapsKey },
    },
  },
});
