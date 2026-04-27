import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, radius } from '../lib/colors';
import type { GeofenceStatus } from '../lib/types';
import { CheckIcon, LocationIcon } from './Icons';

interface Props { status: GeofenceStatus; dark?: boolean; }

export function LocationCard({ status, dark = false }: Props) {
  const bg = dark ? 'rgba(255,255,255,0.08)' : C.accentSoft;
  const border = dark ? 'rgba(195,234,58,0.3)' : C.accentSoft;
  const textPrimary = dark ? '#fff' : '#2E6B00';
  const textSub = dark ? C.accentSoft : '#3A7800';

  return (
    <View style={[styles.card, { backgroundColor: bg, borderColor: border }]}>
      <View style={[styles.iconWrap, { backgroundColor: dark ? C.accent : C.accent }]}>
        <LocationIcon size={20} color={C.accentInk} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, { color: textPrimary }]}>
          {status.inside ? 'Location verified' : 'Outside campus'}
        </Text>
        <Text style={[styles.sub, { color: textSub }]}>
          {status.zoneName} · {status.distanceMeters} m · ±{status.accuracyMeters} m
        </Text>
      </View>
      {status.inside && <CheckIcon size={18} color={textPrimary} strokeWidth={2.5} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1 },
  title: { fontSize: 12.5, fontWeight: '600' },
  sub: { fontSize: 11, fontFamily: 'Courier', marginTop: 2 },
});
