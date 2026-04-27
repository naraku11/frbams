import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { XIcon } from '../../components/Icons';
import { useLocation } from '../../hooks/useLocation';
import { C, radius } from '../../lib/colors';

function MapSvg({ inside }: { inside: boolean }) {
  const accentOpa = inside ? '0.2' : '0.1';
  return (
    <Svg width="100%" height="100%" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice">
      {/* Street grid */}
      <Rect width="400" height="320" fill="#0F1410" />
      <Path d="M0 160 H400" stroke="#1A221C" strokeWidth="28" />
      <Path d="M0 160 H400" stroke="#2D3830" strokeWidth="1" />
      <Path d="M200 0 V320" stroke="#1A221C" strokeWidth="22" />
      <Path d="M200 0 V320" stroke="#2D3830" strokeWidth="1" />
      {/* Buildings */}
      <Rect x="40"  y="40"  width="100" height="60" rx="4" fill="#1B2118" />
      <Rect x="260" y="60"  width="70"  height="45" rx="4" fill="#1B2118" />
      <Rect x="40"  y="230" width="90"  height="60" rx="4" fill="#1B2118" />
      <Rect x="270" y="220" width="80"  height="55" rx="4" fill="#1B2118" />
      {/* Campus block */}
      <Rect x="140" y="110" width="130" height="110" rx="5" fill={`rgba(195,234,58,${accentOpa})`} />
      <SvgText x="205" y="170" textAnchor="middle" fill="rgba(195,234,58,0.7)" fontSize="9" fontFamily="Courier" letterSpacing="1">
        RIDGEVIEW HIGH
      </SvgText>
      {/* Geofence */}
      <Circle cx="205" cy="165" r="80" fill="rgba(195,234,58,0.06)" stroke={C.accent} strokeWidth="1.5" strokeDasharray="4 4" />
      {/* User dot */}
      <Circle cx="205" cy="165" r="28" fill={C.accent} opacity="0.18" />
      <Circle cx="205" cy="165" r="16" fill={C.accent} opacity="0.35" />
      <Circle cx="205" cy="165" r="8"  fill={C.accent} />
      <Circle cx="205" cy="165" r="8"  fill="none" stroke="#0E1A14" strokeWidth="2.5" />
    </Svg>
  );
}

export default function LocationScreen() {
  const router = useRouter();
  const { status, permissionGranted, loading, requestAndWatch } = useLocation();

  useEffect(() => { requestAndWatch(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onContinue = () => router.replace({
    pathname: '/check-in/face',
    params: status ? {
      inside: String(status.inside),
      dist:   String(status.distanceMeters),
      zone:   status.zoneName,
    } : {},
  });

  return (
    <View style={styles.screen}>
      {/* Map background */}
      <View style={styles.mapBg}>
        <MapSvg inside={status?.inside ?? false} />
      </View>

      {/* User pulse ring */}
      {status && (
        <View style={styles.pulseOuter} pointerEvents="none">
          <View style={styles.pulseRing1} />
          <View style={styles.pulseRing2} />
          <View style={styles.pulseDot} />
        </View>
      )}

      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.stepLabel}>STEP 1 OF 2</Text>
            <Text style={styles.heading}>Verifying{'\n'}your location…</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
            activeOpacity={0.75}
          >
            <XIcon size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom card */}
      <View style={styles.bottomSheet}>
        {loading || !status ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={C.accent} />
            <Text style={styles.loadingText}>
              {permissionGranted === false ? 'Location permission denied' : 'Getting your location…'}
            </Text>
          </View>
        ) : (
          <>
            {/* Status indicator */}
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: status.inside ? C.accent : C.amber }]} />
              <Text style={[styles.statusText, { color: status.inside ? C.accent : C.amber }]}>
                {status.inside ? 'INSIDE GEOFENCE' : 'OUTSIDE CAMPUS'}
              </Text>
            </View>

            {/* Metrics grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>DISTANCE</Text>
                <Text style={styles.metricValue}>{status.distanceMeters}<Text style={styles.metricUnit}> m</Text></Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>ACCURACY</Text>
                <Text style={styles.metricValue}>±{status.accuracyMeters}<Text style={styles.metricUnit}> m</Text></Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>LOCATION</Text>
                <Text style={[styles.metricValue, { fontSize: 14 }]}>{status.zoneName}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>COORDINATES</Text>
                <Text style={[styles.metricValue, { fontSize: 11 }]}>
                  {status.lat.toFixed(4)}, {status.lng.toFixed(4)}
                </Text>
              </View>
            </View>

            <PrimaryButton
              label={status.inside ? 'Continue to face check-in →' : 'Continue anyway →'}
              onPress={onContinue}
              variant="accent"
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: '#0E1A14' },
  mapBg:     { ...StyleSheet.absoluteFillObject },

  pulseOuter: {
    position: 'absolute',
    top: '47%', left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60, height: 60,
    alignItems: 'center', justifyContent: 'center',
  },
  pulseRing1: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: C.accent, opacity: 0.18 },
  pulseRing2: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: C.accent, opacity: 0.35 },
  pulseDot:   { width: 18, height: 18, borderRadius: 9, backgroundColor: C.accent, borderWidth: 3, borderColor: '#0E1A14' },

  header: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 24, paddingTop: 8,
  },
  stepLabel: { fontSize: 11, fontFamily: 'Courier', color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  heading:   { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: '#fff', marginTop: 4, lineHeight: 32 },
  closeBtn:  {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },

  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 22,
    paddingBottom: 38,
    backgroundColor: 'rgba(20,30,22,0.92)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(195,234,58,0.2)',
    gap: 16,
  },
  loadingWrap: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  loadingText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontFamily: 'Courier', letterSpacing: 1, fontWeight: '600' },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metric: { width: '45%' },
  metricLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'Courier', letterSpacing: 1, marginBottom: 3 },
  metricValue: { fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  metricUnit: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '400' },
});
