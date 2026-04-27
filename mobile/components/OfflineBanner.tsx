import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, radius } from '../lib/colors';
import { WifiOffIcon } from './Icons';

interface Props { pendingCount?: number; }

export function OfflineBanner({ pendingCount = 0 }: Props) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(1, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <WifiOffIcon size={14} color="#7A4A00" />
        <Text style={styles.text}>You're offline</Text>
        {pendingCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount} queued</Text>
          </View>
        )}
      </View>
      <Text style={styles.timer}>retry · {mm}:{ss}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: C.amberSoft,
    marginHorizontal: 22,
    marginTop: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 12.5, fontWeight: '600', color: '#7A4A00' },
  badge: {
    backgroundColor: C.amber,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: { fontSize: 10.5, color: '#fff', fontFamily: 'Courier' },
  timer: { fontSize: 11, fontFamily: 'Courier', color: '#7A4A00' },
});
