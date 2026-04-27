import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pill } from '../../components/Pill';
import { ClockIcon } from '../../components/Icons';
import { api } from '../../lib/api';
import { C, radius } from '../../lib/colors';
import type { AttendanceRecord } from '../../lib/types';

const DEMO_RECORDS: AttendanceRecord[] = [
  { id: 1, recordDate: '2026-04-26', checkInTime: '08:42', checkOutTime: null,    status: 'present', method: 'face',   confidence: 0.984, locationLabel: 'Main Building', courseName: 'Calculus II' },
  { id: 2, recordDate: '2026-04-25', checkInTime: '08:38', checkOutTime: '15:10', status: 'present', method: 'face',   confidence: 0.971, locationLabel: 'Main Building', courseName: 'World Literature' },
  { id: 3, recordDate: '2026-04-24', checkInTime: '09:04', checkOutTime: '14:55', status: 'late',    method: 'pin',    confidence: null,   locationLabel: 'Side Gate',     courseName: 'French III' },
  { id: 4, recordDate: '2026-04-23', checkInTime: '08:45', checkOutTime: '15:22', status: 'present', method: 'face',   confidence: 0.991, locationLabel: 'Main Building', courseName: 'Organic Chemistry' },
  { id: 5, recordDate: '2026-04-22', checkInTime: null,    checkOutTime: null,    status: 'absent',  method: 'manual', confidence: null,   locationLabel: null,            courseName: null },
  { id: 6, recordDate: '2026-04-21', checkInTime: '08:40', checkOutTime: '14:58', status: 'present', method: 'face',   confidence: 0.967, locationLabel: 'Main Building', courseName: 'Calculus II' },
  { id: 7, recordDate: '2026-04-18', checkInTime: '08:55', checkOutTime: '15:05', status: 'present', method: 'face',   confidence: 0.978, locationLabel: 'Main Building', courseName: 'World Literature' },
  { id: 8, recordDate: '2026-04-17', checkInTime: null,    checkOutTime: null,    status: 'excused', method: 'manual', confidence: null,   locationLabel: null,            courseName: null },
];

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function MethodBadge({ method, confidence }: { method: string; confidence: number | null }) {
  const label = method === 'face' ? `Face ${confidence ? Math.round(confidence * 100) + '%' : ''}` : method === 'pin' ? 'PIN' : 'Manual';
  return (
    <View style={[styles.methodBadge, method === 'face' ? styles.methodFace : method === 'pin' ? styles.methodPin : styles.methodManual]}>
      <Text style={[styles.methodText, method === 'face' ? styles.methodFaceText : method === 'pin' ? styles.methodPinText : styles.methodManualText]}>
        {label.trim()}
      </Text>
    </View>
  );
}

function RecordRow({ record }: { record: AttendanceRecord }) {
  const pillStatus = record.status === 'present' ? 'present'
    : record.status === 'late'    ? 'late'
    : record.status === 'absent'  ? 'absent'
    : 'excused';

  return (
    <View style={styles.recordRow}>
      <View style={styles.recordLeft}>
        <Text style={styles.recordDate}>{formatDate(record.recordDate)}</Text>
        {record.courseName && <Text style={styles.recordCourse}>{record.courseName}</Text>}
        {record.checkInTime ? (
          <View style={styles.timesRow}>
            <ClockIcon size={12} color={C.fg4} />
            <Text style={styles.recordTime}>
              {record.checkInTime}
              {record.checkOutTime ? ` – ${record.checkOutTime}` : '  (in progress)'}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.recordRight}>
        <Pill status={pillStatus} />
        {record.method !== 'manual' && (
          <MethodBadge method={record.method} confidence={record.confidence} />
        )}
      </View>
    </View>
  );
}

export default function ScheduleScreen() {
  const [records, setRecords]     = useState<AttendanceRecord[]>(DEMO_RECORDS);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await api.student.attendance();
      if (data?.length) setRecords(data);
    } catch { /* keep demo data */ }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.fg3} />}
      >
        <Text style={styles.pageTitle}>Log</Text>
        <Text style={styles.pageSubtitle}>Your attendance history</Text>

        <View style={styles.list}>
          {records.map((r) => (
            <RecordRow key={r.id} record={r} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  pageTitle:    { fontSize: 28, fontWeight: '700', letterSpacing: -0.8, color: C.fg },
  pageSubtitle: { fontSize: 13, color: C.fg3, marginTop: 4, marginBottom: 24 },

  list: { gap: 1, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.line },

  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  recordLeft:  { flex: 1, gap: 3 },
  recordRight: { alignItems: 'flex-end', gap: 6 },

  recordDate:   { fontSize: 13.5, fontWeight: '600', color: C.fg },
  recordCourse: { fontSize: 12, color: C.fg3 },
  timesRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  recordTime:   { fontSize: 11, color: C.fg4, fontFamily: 'Courier' },

  methodBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm },
  methodFace:   { backgroundColor: C.accentSoft },
  methodPin:    { backgroundColor: C.line2 },
  methodManual: { backgroundColor: C.line2 },
  methodText:   { fontSize: 10, fontFamily: 'Courier', letterSpacing: 0.3 },
  methodFaceText:   { color: '#2E6B00' },
  methodPinText:    { color: C.fg3 },
  methodManualText: { color: C.fg4 },
});
