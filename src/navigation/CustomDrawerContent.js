// src/navigation/CustomDrawerContent.js
// AI-assisted: see docs/AI_LOG.md #11
// Custom Drawer: shows driver profile at the top and menu items below.

import React from 'react';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useDriver } from '../context/DriverContext';
import { colors, fontSize, spacing } from '../theme';

export default function CustomDrawerContent(props) {
  const { driver } = useDriver();
  const photo = driver?.personal?.photoUrl;
  const name = driver?.personal?.fullName || 'Conductor';
  const isApproved = driver?.status === 'approved';

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={[styles.status, isApproved ? styles.approved : styles.pending]}>
            {isApproved ? 'Aprobado' : 'Pendiente'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Lista de pantallas del Drawer */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.border,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.textSoft,
  },
  info: { marginLeft: spacing.md, flex: 1 },
  name: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.text,
  },
  status: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginTop: 2,
  },
  approved: { color: colors.accent },
  pending: { color: colors.error },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});