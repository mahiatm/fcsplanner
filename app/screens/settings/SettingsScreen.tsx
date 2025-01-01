import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../../context/AppContext';
import { DAY_LABELS } from '../../services/data/DataModels';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../styles/theme';

const DAYS = [1, 2, 3, 4, 5, 6, 7];

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

interface Props {
  navigation?: any;
}

export function SettingsScreen({ navigation }: Props) {
  const { user, availability, upsertAvailability, deleteAvailability, assignments, studyBlocks } = useApp();

  const [addingDay, setAddingDay] = useState<number | null>(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [pickingStart, setPickingStart] = useState(false);
  const [pickingEnd, setPickingEnd] = useState(false);

  const slotsByDay = DAYS.map(d => ({
    day: d,
    slots: availability.filter(s => s.day_of_week === d),
  }));

  const handleAddSlot = async () => {
    if (!addingDay) return;
    const sh = startTime.getHours(), sm = startTime.getMinutes();
    const eh = endTime.getHours(), em = endTime.getMinutes();
    if (sh * 60 + sm >= eh * 60 + em) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }
    await upsertAvailability({
      day_of_week: addingDay,
      start_time: minutesToTime(sh * 60 + sm),
      end_time: minutesToTime(eh * 60 + em),
    });
    setAddingDay(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Slot', 'Remove this study time slot?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteAvailability(id) },
    ]);
  };

  const totalActive = assignments.filter(a => a.completion_status !== 'Completed').length;
  const totalCompleted = assignments.filter(a => a.completion_status === 'Completed').length;
  const totalBlocks = studyBlocks.filter(b => b.status === 'Completed').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        {/* User info */}
        {user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <View style={[styles.card, Shadow.card]}>
              <Text style={styles.cardLabel}>Name</Text>
              <Text style={styles.cardValue}>{user.username}</Text>
            </View>
          </View>
        )}

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, Shadow.card]}>
              <Text style={styles.statNum}>{totalActive}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={[styles.statCard, Shadow.card]}>
              <Text style={[styles.statNum, { color: Colors.success }]}>{totalCompleted}</Text>
              <Text style={styles.statLabel}>Done</Text>
            </View>
            <View style={[styles.statCard, Shadow.card]}>
              <Text style={[styles.statNum, { color: Colors.accent }]}>{totalBlocks}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
        </View>

        {/* Study Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Hours</Text>
          <Text style={styles.sectionSubtitle}>
            Define when you're available to study each week.
          </Text>

          {slotsByDay.map(({ day, slots }) => (
            <View key={day} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayLabel}>{DAY_LABELS[day]}</Text>
                <TouchableOpacity
                  style={styles.addSlotBtn}
                  onPress={() => {
                    const now = new Date();
                    now.setHours(16, 0, 0, 0);
                    setStartTime(new Date(now));
                    now.setHours(18, 0, 0, 0);
                    setEndTime(new Date(now));
                    setAddingDay(day);
                  }}
                >
                  <Text style={styles.addSlotBtnText}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {slots.length === 0 && (
                <Text style={styles.noSlots}>No study time set</Text>
              )}

              {slots.map(slot => (
                <View key={slot.availability_id} style={[styles.slotRow, Shadow.card]}>
                  <Text style={styles.slotTime}>
                    {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                  </Text>
                  <TouchableOpacity onPress={() => handleDelete(slot.availability_id)}>
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Add slot time picker */}
        {addingDay && (
          <View style={[styles.section, styles.pickerSection]}>
            <Text style={styles.sectionTitle}>
              New slot — {DAY_LABELS[addingDay]}
            </Text>

            <TouchableOpacity style={styles.timeRow} onPress={() => setPickingStart(true)}>
              <Text style={styles.timeLabel}>Start</Text>
              <Text style={styles.timeValue}>{formatTime(minutesToTime(startTime.getHours() * 60 + startTime.getMinutes()))}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.timeRow} onPress={() => setPickingEnd(true)}>
              <Text style={styles.timeLabel}>End</Text>
              <Text style={styles.timeValue}>{formatTime(minutesToTime(endTime.getHours() * 60 + endTime.getMinutes()))}</Text>
            </TouchableOpacity>

            {pickingStart && (
              <DateTimePicker
                value={startTime}
                mode="time"
                minuteInterval={15}
                onChange={(_, d) => { setPickingStart(false); if (d) setStartTime(d); }}
              />
            )}
            {pickingEnd && (
              <DateTimePicker
                value={endTime}
                mode="time"
                minuteInterval={15}
                onChange={(_, d) => { setPickingEnd(false); if (d) setEndTime(d); }}
              />
            )}

            <View style={styles.pickerActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddingDay(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveSlotBtn} onPress={handleAddSlot}>
                <Text style={styles.saveSlotBtnText}>Save Slot</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg },
  title: { ...Typography.h1, color: Colors.textPrimary, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { ...Typography.h2, color: Colors.textPrimary, marginBottom: Spacing.sm },
  sectionSubtitle: { ...Typography.bodySecondary, color: Colors.textSecondary, marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: { ...Typography.bodySecondary, color: Colors.textSecondary },
  cardValue: { ...Typography.bodyPrimary, color: Colors.textPrimary, fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statNum: { ...Typography.h2, color: Colors.textPrimary },
  statLabel: { ...Typography.caption, color: Colors.textSecondary },
  daySection: { marginBottom: Spacing.md },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  dayLabel: { ...Typography.bodyPrimary, color: Colors.textPrimary, fontWeight: '500' },
  addSlotBtn: { backgroundColor: Colors.accentLight, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: BorderRadius.full },
  addSlotBtnText: { ...Typography.caption, color: Colors.accent, fontWeight: '600' },
  noSlots: { ...Typography.caption, color: Colors.textDisabled, paddingVertical: 4 },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: 4,
  },
  slotTime: { ...Typography.bodySecondary, color: Colors.textPrimary },
  deleteText: { ...Typography.bodySecondary, color: Colors.error },
  pickerSection: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
  },
  timeLabel: { ...Typography.bodySecondary, color: Colors.textSecondary },
  timeValue: { ...Typography.bodySecondary, color: Colors.accent, fontWeight: '600' },
  pickerActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  cancelBtn: {
    flex: 1, backgroundColor: Colors.divider, padding: Spacing.sm,
    borderRadius: BorderRadius.sm, alignItems: 'center',
  },
  cancelBtnText: { ...Typography.button, color: Colors.textSecondary },
  saveSlotBtn: {
    flex: 1, backgroundColor: Colors.accent, padding: Spacing.sm,
    borderRadius: BorderRadius.sm, alignItems: 'center',
  },
  saveSlotBtnText: { ...Typography.button, color: '#fff' },
});
