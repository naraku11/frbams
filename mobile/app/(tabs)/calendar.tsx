import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRightIcon } from '../../components/Icons';
import { Pill } from '../../components/Pill';
import { C, radius } from '../../lib/colors';
import type { AttendanceStatus } from '../../lib/types';

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

type DayStatus = AttendanceStatus | 'weekend' | 'future' | null;

interface DayData { date: number; status: DayStatus; }

function buildMonth(year: number, month: number): DayData[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const cells: DayData[] = [];

  for (let i = 0; i < firstDay; i++) cells.push({ date: 0, status: null });

  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month, d).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const thisDay = new Date(year, month, d);
    const isFuture = thisDay > today;
    const isToday = thisDay.toDateString() === today.toDateString();

    let status: DayStatus;
    if (isWeekend) {
      status = 'weekend';
    } else if (isFuture && !isToday) {
      status = 'future';
    } else {
      // Simulate past attendance
      const hash = (d * 7 + month * 13) % 20;
      if (hash < 14)      status = 'present';
      else if (hash < 17) status = 'late';
      else if (hash < 19) status = 'absent';
      else                status = 'excused';
    }
    cells.push({ date: d, status });
  }
  return cells;
}

const STATUS_COLOR: Record<string, string> = {
  present: C.accent,
  late:    C.amber,
  absent:  C.red,
  excused: C.fg4,
  weekend: 'transparent',
  future:  'transparent',
};

function DayCell({ day, isToday }: { day: DayData; isToday?: boolean }) {
  if (day.date === 0) return <View style={styles.dayCell} />;

  const dot = day.status && !['weekend', 'future', null].includes(day.status)
    ? STATUS_COLOR[day.status]
    : null;

  return (
    <View style={[styles.dayCell, isToday && styles.dayCellToday]}>
      <Text style={[
        styles.dayNum,
        day.status === 'weekend' && styles.dayNumWeekend,
        day.status === 'future'  && styles.dayNumFuture,
        isToday                  && styles.dayNumToday,
      ]}>
        {day.date}
      </Text>
      {dot ? <View style={[styles.dayDot, { backgroundColor: dot }]} /> : <View style={styles.dayDotEmpty} />}
    </View>
  );
}

interface MonthSummary { present: number; late: number; absent: number; excused: number; }

function calcSummary(days: DayData[]): MonthSummary {
  return days.reduce<MonthSummary>((acc, d) => {
    if (d.status === 'present') acc.present++;
    else if (d.status === 'late')    acc.late++;
    else if (d.status === 'absent')  acc.absent++;
    else if (d.status === 'excused') acc.excused++;
    return acc;
  }, { present: 0, late: 0, absent: 0, excused: 0 });
}

export default function CalendarScreen() {
  const now = new Date();
  const [viewYear, setViewYear]   = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const days    = buildMonth(viewYear, viewMonth);
  const summary = calcSummary(days);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Page header */}
        <Text style={styles.pageTitle}>Attendance</Text>

        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn} activeOpacity={0.7}>
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <ChevronRightIcon size={20} color={C.fg2} />
            </View>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn} activeOpacity={0.7}>
            <ChevronRightIcon size={20} color={C.fg2} />
          </TouchableOpacity>
        </View>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <SummaryChip label="Present" count={summary.present} color={C.accent} bg={C.accentSoft} />
          <SummaryChip label="Late"    count={summary.late}    color={C.amber}  bg={C.amberSoft} />
          <SummaryChip label="Absent"  count={summary.absent}  color={C.red}    bg={C.redSoft} />
          <SummaryChip label="Excused" count={summary.excused} color={C.fg3}    bg={C.line2} />
        </View>

        {/* Day-of-week headers */}
        <View style={styles.weekRow}>
          {DAYS_SHORT.map((d) => (
            <Text key={d} style={styles.weekDay}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {days.map((day, i) => {
            const isToday = day.date === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
            return <DayCell key={i} day={day} isToday={isToday} />;
          })}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { label: 'Present', color: C.accent },
            { label: 'Late',    color: C.amber },
            { label: 'Absent',  color: C.red },
            { label: 'Excused', color: C.fg4 },
          ].map(({ label, color }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendLabel}>{label}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryChip({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <View style={[styles.summaryChip, { backgroundColor: bg }]}>
      <Text style={[styles.summaryCount, { color }]}>{count}</Text>
      <Text style={[styles.summaryChipLabel, { color }]}>{label}</Text>
    </View>
  );
}

const CELL_SIZE = '13.5%';

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  scroll:  { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  pageTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.8, color: C.fg, marginBottom: 20 },

  monthNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  monthLabel: { fontSize: 16, fontWeight: '600', color: C.fg, letterSpacing: -0.3 },

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  summaryChip: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.md,
  },
  summaryCount:     { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  summaryChipLabel: { fontSize: 10, fontFamily: 'Courier', letterSpacing: 0.5, marginTop: 2 },

  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekDay: {
    width: CELL_SIZE, textAlign: 'center',
    fontSize: 11, color: C.fg4, fontFamily: 'Courier', letterSpacing: 0.5,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },

  dayCell: {
    width: CELL_SIZE,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dayCellToday: {
    backgroundColor: C.line2,
    borderRadius: radius.sm,
  },
  dayNum:         { fontSize: 13, color: C.fg, fontWeight: '500' },
  dayNumWeekend:  { color: C.fg4 },
  dayNumFuture:   { color: C.line },
  dayNumToday:    { fontWeight: '700' },
  dayDot:         { width: 5, height: 5, borderRadius: 2.5, marginTop: 2 },
  dayDotEmpty:    { width: 5, height: 5, marginTop: 2 },

  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 7, height: 7, borderRadius: 3.5 },
  legendLabel: { fontSize: 11, color: C.fg3 },
});
