import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseRow } from '../../components/CourseRow';
import { OfflineBanner } from '../../components/OfflineBanner';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { api } from '../../lib/api';
import { C, radius } from '../../lib/colors';
import { getCachedStudent } from '../../lib/storage';
import type { CourseSession, Student } from '../../lib/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Fallback demo data used when offline or API not yet configured
const DEMO_SESSIONS: CourseSession[] = [
  { id:1, courseCode:'MATH 201', courseName:'Calculus II',       teacher:'Mr. Okafor',   room:'204',   startTime:'09:30', endTime:'10:20', date:'', sessionStatus:'done',     attendanceStatus:'present' },
  { id:2, courseCode:'LIT 110',  courseName:'World Literature',  teacher:'Ms. Singh',    room:'118',   startTime:'11:00', endTime:'11:50', date:'', sessionStatus:'done',     attendanceStatus:'present' },
  { id:3, courseCode:'FRA 301',  courseName:'French III',        teacher:'Mme. Romero',  room:'302',   startTime:'13:30', endTime:'14:20', date:'', sessionStatus:'next',     attendanceStatus: null },
  { id:4, courseCode:'CHEM 220', courseName:'Organic Chemistry', teacher:'Dr. Tanaka',   room:'Lab 4', startTime:'15:00', endTime:'16:00', date:'', sessionStatus:'upcoming', attendanceStatus: null },
];

export default function HomeScreen() {
  const router = useRouter();
  const isOnline = useNetworkStatus();
  const { pendingCount } = useOfflineQueue();

  const [student, setStudent] = useState<Student | null>(null);
  const [sessions, setSessions] = useState<CourseSession[]>(DEMO_SESSIONS);
  const [termRate, setTermRate] = useState({ rate: 94, attended: 18, total: 19 });
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const dateLabel = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  const load = async () => {
    const cached = await getCachedStudent();
    if (cached) setStudent(cached);
    if (!isOnline) return;
    try {
      const [s, sched, rate] = await Promise.all([
        api.student.me(),
        api.student.schedule(),
        api.student.termRate(),
      ]);
      setStudent(s);
      setSessions(sched);
      setTermRate(rate);
    } catch { /* use cached / demo */ }
  };

  useEffect(() => { load(); }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const firstName = student?.firstName ?? 'Maya';
  const pct = termRate.rate;
  const bars = termRate.total;
  const filledBars = termRate.attended;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {!isOnline && <OfflineBanner pendingCount={pendingCount} />}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.fg3} />}
      >
        {/* Header */}
        <Text style={styles.eyebrow}>{dateLabel}</Text>
        <Text style={styles.heading}>Hi, {firstName}.</Text>

        {/* Term attendance card */}
        <View style={styles.termCard}>
          <Text style={styles.termLabel}>THIS TERM</Text>
          <View style={styles.termRow}>
            <Text style={styles.termPct}>{pct}<Text style={styles.termPctSuffix}>%</Text></Text>
            <Text style={styles.termSub}>attendance</Text>
          </View>
          <View style={styles.barsRow}>
            {Array.from({ length: bars }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.bar,
                  i < filledBars ? styles.barFilled : styles.barEmpty,
                ]}
              />
            ))}
          </View>
          <Text style={styles.termMeta}>{filledBars} of {bars} school days present</Text>
        </View>

        {/* Today header + clock-out shortcut */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>TODAY</Text>
          <TouchableOpacity onPress={() => router.push('/check-out')} activeOpacity={0.7}>
            <Text style={styles.clockOutLink}>Clock out →</Text>
          </TouchableOpacity>
        </View>

        {/* Schedule */}
        <View style={styles.sessionList}>
          {sessions.map((s) => (
            <CourseRow
              key={s.id}
              time={s.startTime}
              courseName={s.courseName}
              teacher={s.teacher}
              sessionStatus={s.sessionStatus}
            />
          ))}
        </View>

        {/* Streak mini-card */}
        <View style={styles.streakCard}>
          <Text style={styles.eyebrow}>STREAK</Text>
          <View style={styles.streakRow}>
            <Text style={styles.streakNum}>12</Text>
            <Text style={styles.streakSub}>days on time</Text>
          </View>
          <View style={styles.streakBars}>
            {Array.from({ length: 14 }, (_, i) => (
              <View key={i} style={[styles.streakBar, i < 12 ? styles.streakBarFilled : styles.streakBarEmpty]} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 32, gap: 0 },

  eyebrow: { fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: C.fg4, fontFamily: 'Courier', marginBottom: 6 },
  heading: { fontSize: 30, fontWeight: '700', letterSpacing: -0.8, color: C.fg, marginBottom: 20 },

  termCard: {
    backgroundColor: C.fg,
    borderRadius: radius.lg,
    padding: 18,
    marginBottom: 24,
  },
  termLabel: { fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontFamily: 'Courier' },
  termRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 },
  termPct: { fontSize: 48, fontWeight: '700', letterSpacing: -1.5, color: C.accent },
  termPctSuffix: { fontSize: 22, color: C.accent },
  termSub: { fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  barsRow: { flexDirection: 'row', gap: 3, marginTop: 14 },
  bar: { flex: 1, height: 14, borderRadius: 2 },
  barFilled: { backgroundColor: C.accent },
  barEmpty:  { backgroundColor: 'rgba(255,255,255,0.12)' },
  termMeta: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'Courier', marginTop: 8 },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionLabel: { fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: C.fg4, fontFamily: 'Courier' },
  clockOutLink: { fontSize: 12.5, color: C.fg3, fontWeight: '500' },
  sessionList: { gap: 8, marginBottom: 20 },

  streakCard: { borderRadius: radius.md, borderWidth: 1, borderColor: C.line, backgroundColor: C.card, padding: 16 },
  streakRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 8 },
  streakNum: { fontSize: 44, fontWeight: '700', letterSpacing: -1.5, color: C.fg, lineHeight: 48 },
  streakSub: { fontSize: 13, color: C.fg3 },
  streakBars: { flexDirection: 'row', gap: 3, marginTop: 14 },
  streakBar: { flex: 1, height: 24, borderRadius: 3 },
  streakBarFilled: { backgroundColor: C.accent },
  streakBarEmpty:  { backgroundColor: C.line2 },
});
