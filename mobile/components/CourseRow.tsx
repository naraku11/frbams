import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, radius } from '../lib/colors';
import type { CourseSessionStatus } from '../lib/types';
import { CheckIcon } from './Icons';
import { Pill } from './Pill';

interface Props {
  time: string;
  courseName: string;
  teacher: string;
  sessionStatus: CourseSessionStatus;
}

export function CourseRow({ time, courseName, teacher, sessionStatus }: Props) {
  const isNext = sessionStatus === 'next';
  return (
    <View style={[styles.row, isNext && styles.nextRow]}>
      <Text style={styles.time}>{time}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{courseName}</Text>
        <Text style={styles.teacher}>{teacher}</Text>
      </View>
      {sessionStatus === 'done' && <CheckIcon size={16} color={C.fg3} />}
      {isNext && <Pill label="NEXT" variant="live" />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.card,
  },
  nextRow: {
    backgroundColor: C.accentSoft,
    borderColor: C.accentSoft,
  },
  time: {
    fontFamily: 'Courier',
    fontSize: 13,
    fontWeight: '600',
    width: 48,
    color: C.fg,
  },
  info: { flex: 1 },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: C.fg,
  },
  teacher: {
    fontSize: 11.5,
    color: C.fg3,
    marginTop: 1,
  },
});
