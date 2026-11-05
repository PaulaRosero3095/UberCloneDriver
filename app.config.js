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
