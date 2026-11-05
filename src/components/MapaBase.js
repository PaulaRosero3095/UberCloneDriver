// src/components/MapaBase.js
// AI-assisted: see docs/AI_LOG.md #8
// The map used by every screen: Google Maps when there is a key, free tiles otherwise.

import React, { forwardRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';

import { HAS_GOOGLE_KEY, TILE_ATTRIBUTION, TILE_URL } from '../config/map';
import { colors, spacing } from '../theme';

const FALLBACK_REGION = { latitude: 4.711, longitude: -74.0721, latitudeDelta: 0.05, longitudeDelta: 0.05 };

const MapaBase = forwardRef(function MapaBase({ children, initialRegion = FALLBACK_REGION }, ref) {
  return (
    <>
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        provider={HAS_GOOGLE_KEY ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        mapType={HAS_GOOGLE_KEY ? 'standard' : 'none'}
        initialRegion={initialRegion}
      >
        {!HAS_GOOGLE_KEY && <UrlTile urlTemplate={TILE_URL} maximumZ={19} tileSize={256} zIndex={1} />}
        {children}
      </MapView>
      {!HAS_GOOGLE_KEY && <Text style={styles.attribution}>{TILE_ATTRIBUTION}</Text>}
    </>
  );
});

export default MapaBase;

const styles = StyleSheet.create({
  attribution: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    fontSize: 10,
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: spacing.xs,
  },
});
