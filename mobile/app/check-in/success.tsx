import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LocationCard } from '../../components/LocationCard';
import { C, radius } from '../../lib/colors';
import type { GeofenceStatus } from '../../lib/types';

function CheckCircle() {
  return (
    <Svg width={80} height={80} viewBox="0 0 80 80">
      <Circle cx="40" cy="40" r="40" fill={C.accent} />
      <Path
        d="M23 40l13 13 21-26"
        stroke={C.accentInk}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

function StreakBars({ filled, total }: { filled: number; total: number }) {
  return (
    <View style={styles.streakBars}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.streakBar, i < filled ? styles.streakBarFilled : styles.streakBarEmpty]} />
      ))}
    </View>
  );
}

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    inside?: string;
    dist?: string;
    zone?: string;
    method?: string;
  }>();

  const now      = new Date();
  const timeStr  = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const inside   = params.inside !== 'false';
  const dist     = parseInt(params.dist ?? '28', 10);
  const zone     = params.zone ?? 'Main Campus';
  const method   = params.method === 'pin' ? 'pin' : 'face';
  const methodLabel = method === 'pin' ? 'PIN entry' : 'Face recognition';
  const confidence  = method === 'face' ? '98.4%' : null;

  const geofenceStatus: GeofenceStatus = {
    inside,
    distanceMeters: dist,
    accuracyMeters: 5,
    lat: 0,
    lng: 0,
    zoneName: zone,
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Check mark */}
        <View style={styles.checkWrap}>
          <CheckCircle />
        </View>

        {/* Heading */}
        <Text style={styles.heading}>You're in.</Text>
        <Text style={styles.sub}>See you in Calculus II.</Text>

        {/* Location card */}
        <LocationCard status={geofenceStatus} />

        {/* Details card */}
        <View style={styles.detailCard}>
          <DetailRow label="CHECK-IN TIME" value={timeStr} />
          <View style={styles.divider} />
          <DetailRow label="METHOD" value={methodLabel} />
          {confidence && (
            <>
              <View style={styles.divider} />
              <DetailRow label="CONFIDENCE" value={confidence} valueColor={C.accent} />
            </>
          )}
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>STREAK</Text>
            <View style={styles.streakInline}>
              <Text style={[styles.detailValue, { color: C.accent }]}>13</Text>
              <Text style={styles.streakSuffix}> days on time</Text>
            </View>
          </View>
          <StreakBars filled={13} total={14} />
        </View>

        {/* CTA */}
        <PrimaryButton
          label="View today's schedule"
          onPress={() => router.replace('/')}
          variant="dark"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 52, paddingBottom: 36, gap: 16 },

  checkWrap: { alignItems: 'center', marginBottom: 8 },
  heading: { fontSize: 36, fontWeight: '700', letterSpacing: -1.2, color: C.fg, textAlign: 'center' },
  sub: { fontSize: 15, color: C.fg3, textAlign: 'center', marginBottom: 8 },

  detailCard: {
    backgroundColor: C.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  detailLabel: { fontSize: 10.5, color: C.fg4, fontFamily: 'Courier', letterSpacing: 1 },
  detailValue: { fontSize: 14, fontWeight: '600', color: C.fg },
  divider: { height: 1, backgroundColor: C.line, marginHorizontal: 18 },

  streakInline: { flexDirection: 'row', alignItems: 'baseline' },
  streakSuffix: { fontSize: 12, color: C.fg3 },

  streakBars: { flexDirection: 'row', gap: 3, paddingHorizontal: 18, paddingBottom: 16 },
  streakBar: { flex: 1, height: 5, borderRadius: 2 },
  streakBarFilled: { backgroundColor: C.accent },
  streakBarEmpty:  { backgroundColor: C.line2 },
});
