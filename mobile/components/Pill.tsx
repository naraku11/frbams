import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C } from '../lib/colors';
import type { AttendanceStatus } from '../lib/types';

type PillVariant = AttendanceStatus | 'live' | 'offline' | 'queued' | 'verified';

const VARIANT_COLORS: Record<PillVariant, { bg: string; text: string }> = {
  present:  { bg: C.accentSoft,  text: '#2E6B00' },
  late:     { bg: C.amberSoft,   text: '#7A4A00' },
  absent:   { bg: C.redSoft,     text: '#7A1A00' },
  excused:  { bg: C.line2,       text: C.fg3 },
  live:     { bg: C.accentSoft,  text: '#2E6B00' },
  offline:  { bg: C.amberSoft,   text: '#7A4A00' },
  queued:   { bg: C.amberSoft,   text: '#7A4A00' },
  verified: { bg: C.accentSoft,  text: '#2E6B00' },
};

const STATUS_LABELS: Record<PillVariant, string> = {
  present:  'PRESENT',
  late:     'LATE',
  absent:   'ABSENT',
  excused:  'EXCUSED',
  live:     'LIVE',
  offline:  'OFFLINE',
  queued:   'QUEUED',
  verified: 'VERIFIED',
};

interface Props {
  label?: string;
  variant?: PillVariant;
  status?: PillVariant;
  dot?: boolean;
}

export function Pill({ label, variant, status, dot }: Props) {
  const resolvedVariant = variant ?? status ?? 'present';
  const resolvedLabel   = label ?? STATUS_LABELS[resolvedVariant];
  const colors = VARIANT_COLORS[resolvedVariant];
  return (
    <View style={[styles.pill, { backgroundColor: colors.bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: colors.text }]} />}
      <Text style={[styles.text, { color: colors.text }]}>{resolvedLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11.5,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
});
