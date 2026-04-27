import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pill } from '../../components/Pill';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ChevronRightIcon, LeaveIcon, UsersIcon } from '../../components/Icons';
import { api } from '../../lib/api';
import { C, radius } from '../../lib/colors';
import { getCachedStudent } from '../../lib/storage';
import type { LeaveRequest, Student } from '../../lib/types';

const DEMO_LEAVES: LeaveRequest[] = [
  { id: 1, dateFrom: '2026-04-10', dateTo: '2026-04-10', reason: 'Medical appointment',  type: 'Medical',  status: 'approved', submittedAt: '2026-04-08' },
  { id: 2, dateFrom: '2026-04-28', dateTo: '2026-04-28', reason: 'Family commitment',    type: 'Personal', status: 'pending',  submittedAt: '2026-04-20' },
];

function LeaveRow({ leave }: { leave: LeaveRequest }) {
  const statusPill = leave.status === 'approved' ? 'present' : leave.status === 'declined' ? 'absent' : 'live';
  const dateStr = leave.dateFrom === leave.dateTo ? leave.dateFrom : `${leave.dateFrom} – ${leave.dateTo}`;
  return (
    <View style={styles.leaveRow}>
      <View style={styles.leaveLeft}>
        <Text style={styles.leaveDate}>{dateStr}</Text>
        <Text style={styles.leaveReason}>{leave.reason}</Text>
        <Text style={styles.leaveType}>{leave.type}</Text>
      </View>
      <Pill status={statusPill} />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [student, setStudent]   = useState<Student | null>(null);
  const [leaves, setLeaves]     = useState<LeaveRequest[]>(DEMO_LEAVES);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveReason, setLeaveReason]     = useState('');
  const [leaveDate, setLeaveDate]         = useState('');
  const [leaveType, setLeaveType]         = useState('Personal');
  const [submitting, setSubmitting]       = useState(false);
  const [submitted, setSubmitted]         = useState(false);

  useEffect(() => {
    getCachedStudent().then((s) => { if (s) setStudent(s); });
    api.student.leaveRequests().then((l) => { if (l?.length) setLeaves(l); }).catch(() => {});
  }, []);

  const submitLeave = async () => {
    if (!leaveReason.trim() || !leaveDate.trim()) return;
    setSubmitting(true);
    try {
      await api.student.submitLeave({ dateFrom: leaveDate, dateTo: leaveDate, reason: leaveReason, type: leaveType });
    } catch { /* offline or error */ }
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSubmitted(true);
    setShowLeaveForm(false);
    setLeaveReason('');
    setLeaveDate('');
    setLeaves((prev) => [
      { id: Date.now(), dateFrom: leaveDate, dateTo: leaveDate, reason: leaveReason, type: leaveType, status: 'pending', submittedAt: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
  };

  const firstName = student?.firstName ?? 'Maya';
  const lastName  = student?.lastName  ?? 'Chen';
  const grade     = student?.gradeLabel ?? 'Grade 11';
  const code      = student?.studentCode ?? 'STU-2024-0042';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Avatar + name */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <UsersIcon size={36} color={C.fg3} />
            </View>
            <Text style={styles.name}>{firstName} {lastName}</Text>
            <Text style={styles.gradePill}>{grade}</Text>
          </View>

          {/* Info card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>STUDENT INFO</Text>
            <InfoRow label="STUDENT ID" value={code} />
            <View style={styles.divider} />
            <InfoRow label="GRADE"      value={grade} />
            <View style={styles.divider} />
            <InfoRow label="EMAIL"      value={student?.email ?? 'maya.chen@school.edu'} />
          </View>

          {/* Leave requests */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Leave Requests</Text>
            <TouchableOpacity onPress={() => { setShowLeaveForm(v => !v); setSubmitted(false); }} activeOpacity={0.7}>
              <Text style={styles.newLeaveBtn}>{showLeaveForm ? 'Cancel' : '+ New request'}</Text>
            </TouchableOpacity>
          </View>

          {submitted && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>Leave request submitted.</Text>
            </View>
          )}

          {showLeaveForm && (
            <View style={styles.leaveForm}>
              <Text style={styles.formLabel}>DATE</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-05-01"
                placeholderTextColor={C.fg4}
                value={leaveDate}
                onChangeText={setLeaveDate}
                keyboardType="numbers-and-punctuation"
              />
              <Text style={[styles.formLabel, { marginTop: 12 }]}>TYPE</Text>
              <View style={styles.typeRow}>
                {['Personal', 'Medical', 'Family', 'Other'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setLeaveType(t)}
                    style={[styles.typeChip, leaveType === t && styles.typeChipActive]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.typeChipText, leaveType === t && styles.typeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.formLabel, { marginTop: 12 }]}>REASON</Text>
              <TextInput
                style={[styles.input, styles.inputMulti]}
                placeholder="Brief description…"
                placeholderTextColor={C.fg4}
                value={leaveReason}
                onChangeText={setLeaveReason}
                multiline
                numberOfLines={3}
              />
              <View style={{ marginTop: 14 }}>
                <PrimaryButton
                  label={submitting ? 'Submitting…' : 'Submit request'}
                  onPress={submitLeave}
                  loading={submitting}
                  disabled={!leaveReason.trim() || !leaveDate.trim()}
                  variant="accent"
                />
              </View>
            </View>
          )}

          <View style={styles.leaveList}>
            {leaves.map((l) => <LeaveRow key={l.id} leave={l} />)}
          </View>

          {/* Sign out */}
          <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.7} onPress={() => api.auth.logout().catch(() => {})}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48, gap: 0 },

  avatarSection: { alignItems: 'center', paddingBottom: 28 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.line2,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  name:      { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, color: C.fg },
  gradePill: { marginTop: 6, fontSize: 12, color: C.fg3, backgroundColor: C.line2, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },

  card: {
    backgroundColor: C.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
    marginBottom: 24,
  },
  cardTitle: { fontSize: 10.5, color: C.fg4, fontFamily: 'Courier', letterSpacing: 1, padding: 16, paddingBottom: 12 },
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13 },
  infoLabel: { fontSize: 10.5, color: C.fg4, fontFamily: 'Courier', letterSpacing: 1 },
  infoValue: { fontSize: 13, fontWeight: '500', color: C.fg },
  divider:   { height: 1, backgroundColor: C.line, marginHorizontal: 16 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: C.fg },
  newLeaveBtn:   { fontSize: 13, color: C.fg3, fontWeight: '500' },

  successBanner: {
    backgroundColor: C.accentSoft,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
  },
  successText: { color: '#2E6B00', fontSize: 13, fontWeight: '500' },

  leaveForm: {
    backgroundColor: C.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
    marginBottom: 16,
  },
  formLabel: { fontSize: 10.5, color: C.fg4, fontFamily: 'Courier', letterSpacing: 1, marginBottom: 6 },
  input: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: C.fg,
  },
  inputMulti: { minHeight: 72, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typeChip: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: radius.sm,
    borderWidth: 1, borderColor: C.line,
    backgroundColor: C.bg,
  },
  typeChipActive:    { backgroundColor: C.fg, borderColor: C.fg },
  typeChipText:      { fontSize: 12, color: C.fg3 },
  typeChipTextActive: { color: C.bg, fontWeight: '600' },

  leaveList: {
    gap: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 32,
  },
  leaveRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: C.card,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.line,
    gap: 12,
  },
  leaveLeft:   { flex: 1, gap: 3 },
  leaveDate:   { fontSize: 13, fontWeight: '600', color: C.fg },
  leaveReason: { fontSize: 12, color: C.fg3 },
  leaveType:   { fontSize: 10.5, color: C.fg4, fontFamily: 'Courier', letterSpacing: 0.5 },

  signOutBtn: { alignItems: 'center', paddingVertical: 14 },
  signOutText: { fontSize: 14, color: C.red, fontWeight: '500' },
});
