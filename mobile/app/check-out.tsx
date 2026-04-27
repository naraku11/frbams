import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { XIcon } from '../components/Icons';
import { C, radius } from '../lib/colors';

function ClockOutIcon() {
  return (
    <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
      <Circle cx="32" cy="32" r="30" stroke={C.amber} strokeWidth="2" />
      <Circle cx="32" cy="32" r="22" fill={C.amberSoft} />
      <Path d="M32 20v13l7 5" stroke={C.amber} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M44 50l6-6M50 50l-6-6" stroke={C.amber} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

function SessionRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.sessionRow}>
      <Text style={styles.sessionLabel}>{label}</Text>
      <Text style={styles.sessionValue}>{value}</Text>
    </View>
  );
}

export default function CheckOutScreen() {
  const router  = useRouter();
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const now      = new Date();
  const timeStr  = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr  = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const onClockOut = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Handle / drag indicator */}
      <View style={styles.handle} />

      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{done ? 'Clocked out' : 'Clock out'}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.75}>
          <XIcon size={18} color={C.fg3} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {done ? (
          /* ─── Done state ─── */
          <>
            <View style={styles.iconWrap}>
              <Svg width={72} height={72} viewBox="0 0 72 72">
                <Circle cx="36" cy="36" r="36" fill={C.amberSoft} />
                <Path d="M21 36l12 12 18-24" stroke={C.amber} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </View>
            <Text style={styles.doneHeading}>See you tomorrow.</Text>
            <Text style={styles.doneSub}>Clocked out at {timeStr}</Text>

            <View style={styles.summaryCard}>
              <SessionRow label="DATE"        value={dateStr} />
              <View style={styles.divider} />
              <SessionRow label="CHECK-IN"    value="08:42" />
              <View style={styles.divider} />
              <SessionRow label="CHECK-OUT"   value={timeStr} />
              <View style={styles.divider} />
              <SessionRow label="TOTAL TIME"  value="7h 18m" />
            </View>

            <PrimaryButton label="Done" onPress={() => router.replace('/')} variant="dark" />
          </>
        ) : (
          /* ─── Confirm state ─── */
          <>
            <View style={styles.iconWrap}>
              <ClockOutIcon />
            </View>
            <Text style={styles.confirmHeading}>End your school day?</Text>
            <Text style={styles.confirmSub}>This will record your check-out time for today.</Text>

            <View style={styles.summaryCard}>
              <SessionRow label="DATE"       value={dateStr} />
              <View style={styles.divider} />
              <SessionRow label="CHECK-IN"   value="08:42" />
              <View style={styles.divider} />
              <SessionRow label="NOW"        value={timeStr} />
            </View>

            <PrimaryButton
              label={loading ? 'Clocking out…' : 'Clock out now'}
              onPress={onClockOut}
              loading={loading}
              variant="accent"
            />
            <PrimaryButton
              label="Cancel"
              onPress={() => router.back()}
              variant="ghost"
              disabled={loading}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.line,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  title:    { fontSize: 17, fontWeight: '700', color: C.fg },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: C.line2,
    alignItems: 'center', justifyContent: 'center',
  },

  body: { flex: 1, paddingHorizontal: 24, paddingTop: 12, gap: 14 },

  iconWrap: { alignItems: 'center', marginBottom: 4 },

  confirmHeading: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8, color: C.fg, textAlign: 'center' },
  confirmSub:     { fontSize: 14, color: C.fg3, textAlign: 'center' },

  doneHeading: { fontSize: 28, fontWeight: '700', letterSpacing: -0.8, color: C.fg, textAlign: 'center' },
  doneSub:     { fontSize: 14, color: C.fg3, textAlign: 'center' },

  summaryCard: {
    backgroundColor: C.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
    marginBottom: 4,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  sessionLabel: { fontSize: 10.5, color: C.fg4, fontFamily: 'Courier', letterSpacing: 1 },
  sessionValue: { fontSize: 14, fontWeight: '600', color: C.fg },
  divider: { height: 1, backgroundColor: C.line, marginHorizontal: 18 },
});
