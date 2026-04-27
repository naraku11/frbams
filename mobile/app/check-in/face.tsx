import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../components/PrimaryButton';
import { XIcon } from '../../components/Icons';
import { C, radius } from '../../lib/colors';

function FaceOval({ scanning }: { scanning: boolean }) {
  const strokeColor = scanning ? C.accent : 'rgba(255,255,255,0.65)';
  return (
    <Svg width={220} height={280} viewBox="0 0 220 280">
      <Ellipse
        cx="110" cy="140" rx="90" ry="115"
        fill="none"
        stroke={strokeColor}
        strokeWidth={scanning ? 2.5 : 1.5}
        strokeDasharray={scanning ? undefined : '6 5'}
      />
      {/* Cardinal tick marks */}
      <Path d="M110 20 L110 32" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
      <Path d="M110 248 L110 260" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
      <Path d="M17 140 L29 140" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
      <Path d="M191 140 L203 140" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

export default function FaceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ inside?: string; dist?: string; zone?: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const scanLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!permission?.granted && !permission?.canAskAgain) return;
    if (!permission?.granted) requestPermission();
  }, []);

  useEffect(() => {
    if (scanning) {
      scanLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(scanLineAnim, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      );
      scanLoopRef.current.start();
      return () => { scanLoopRef.current?.stop(); };
    }
  }, [scanning]);

  const onCheckIn = () => {
    setScanning(true);
    setTimeout(() => {
      router.replace({
        pathname: '/check-in/success',
        params: {
          inside: params.inside ?? 'true',
          dist: params.dist ?? '28',
          zone: params.zone ?? 'Main Campus',
          method: 'face',
        },
      });
    }, 2600);
  };

  const onPinInstead = () => {
    router.replace({
      pathname: '/check-in/success',
      params: {
        inside: params.inside ?? 'true',
        dist: params.dist ?? '28',
        zone: params.zone ?? 'Main Campus',
        method: 'pin',
      },
    });
  };

  const insideLabel = params.inside === 'false' ? 'OUTSIDE CAMPUS' : 'ON CAMPUS';
  const distLabel   = params.dist ? `${params.dist} m` : '28 m';
  const zone        = params.zone ?? 'Main Building';

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-90, 90],
  });

  return (
    <View style={styles.screen}>
      {/* Camera feed or dark fallback */}
      {permission?.granted ? (
        <CameraView style={StyleSheet.absoluteFill} facing="front" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0A0B08' }]} />
      )}

      {/* Vignette overlay */}
      <View style={styles.vignette} pointerEvents="none" />

      {/* Face oval + scan line */}
      <View style={styles.ovalContainer} pointerEvents="none">
        <FaceOval scanning={scanning} />
        {scanning && (
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanLineY }] },
            ]}
          />
        )}
        {scanning && (
          <Text style={styles.scanLabel}>SCANNING…</Text>
        )}
      </View>

      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.stepLabel}>STEP 2 OF 2</Text>
            <Text style={styles.heading}>{scanning ? 'Hold\nstill…' : 'Face\ncheck-in'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
            activeOpacity={0.75}
            disabled={scanning}
          >
            <XIcon size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Location chip */}
        <View style={styles.locationChip}>
          <View style={[styles.chipDot, { backgroundColor: params.inside === 'false' ? C.amber : C.accent }]} />
          <Text style={styles.chipText}>{insideLabel} · {distLabel} from {zone}</Text>
        </View>
      </SafeAreaView>

      {/* Bottom card */}
      <View style={styles.bottomSheet}>
        {!permission?.granted ? (
          <View style={styles.permWrap}>
            <Text style={styles.permText}>Camera access required for face check-in</Text>
            {permission?.canAskAgain && (
              <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
                <Text style={styles.permBtnText}>Grant camera access</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <PrimaryButton
              label={scanning ? 'Scanning…' : 'Check in with face'}
              onPress={onCheckIn}
              loading={scanning}
              variant="accent"
            />
            <PrimaryButton
              label="Use PIN instead →"
              onPress={onPinInstead}
              variant="ghost"
              disabled={scanning}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0A0B08' },

  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },

  ovalContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    position: 'absolute',
    width: 172,
    height: 2,
    borderRadius: 1,
    backgroundColor: C.accent,
    opacity: 0.75,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  scanLabel: {
    marginTop: 20,
    fontSize: 11,
    fontFamily: 'Courier',
    color: C.accent,
    letterSpacing: 2.5,
  },

  header: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 24, paddingTop: 8,
  },
  stepLabel: { fontSize: 11, fontFamily: 'Courier', color: 'rgba(255,255,255,0.5)', letterSpacing: 1 },
  heading: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: '#fff', marginTop: 4, lineHeight: 32 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },

  locationChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 14, marginHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(195,234,58,0.3)',
  },
  chipDot:  { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 10.5, fontFamily: 'Courier', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 },

  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 22,
    paddingBottom: 42,
    backgroundColor: 'rgba(10,11,8,0.9)',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(195,234,58,0.15)',
    gap: 10,
  },
  permWrap: { alignItems: 'center', gap: 14, paddingVertical: 12 },
  permText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center' },
  permBtn:  { backgroundColor: C.accent, paddingHorizontal: 22, paddingVertical: 12, borderRadius: radius.md },
  permBtnText: { color: C.accentInk, fontWeight: '600', fontSize: 14 },
});
