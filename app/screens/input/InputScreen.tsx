import React, { useState } from 'react';
import {
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { useApp } from '../../context/AppContext';
import { Assignment } from '../../services/data/DataModels';
import { alerts } from '../../services/feedback/AlertService';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../styles/theme';

const COURSES = [
  'AP Calculus AB', 'AP Calculus BC', 'AP Physics 1', 'AP Physics C',
  'AP Chemistry', 'AP Biology', 'AP English Language', 'AP English Literature',
  'AP US History', 'AP World History', 'AP Psychology', 'AP Statistics',
  'AP Computer Science A', 'AP Computer Science Principles', 'AP Economics',
  'AP Government', 'AP Environmental Science', 'AP Spanish', 'AP French',
  'Honors English', 'Honors Math', 'Other',
];

interface Props {
  navigation: any;
  route?: { params?: { assignment?: Assignment } };
}

export function InputScreen({ navigation, route }: Props) {
  const { addAssignment, updateAssignment } = useApp();
  const existing = route?.params?.assignment;

  const [name, setName] = useState(existing?.name ?? '');
  const [course, setCourse] = useState(existing?.course ?? '');
  const [deadline, setDeadline] = useState(
    existing ? new Date(existing.deadline) : (() => {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      d.setHours(23, 59, 0, 0);
      return d;
    })()
  );
  const [difficulty, setDifficulty] = useState(existing?.difficulty_rating ?? 5);
  const [estimatedHours, setEstimatedHours] = useState(
    existing ? String(existing.estimated_workload_hours) : ''
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Assignment name is required.';
    if (!course.trim()) e.course = 'Course is required.';
    if (deadline <= new Date()) e.deadline = 'Deadline must be in the future.';
    if (difficulty < 1 || difficulty > 10) e.difficulty = 'Difficulty must be between 1 and 10.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      alerts.missingFields();
      return;
    }
    setSaving(true);
    try {
      const hours = estimatedHours ? parseFloat(estimatedHours) : 0;
      if (existing) {
        await updateAssignment({
          ...existing,
          name: name.trim(),
          course,
          deadline: deadline.toISOString(),
          difficulty_rating: difficulty,
          estimated_workload_hours: hours,
        });
      } else {
        await addAssignment({
          name: name.trim(),
          course,
          deadline: deadline.toISOString(),
          difficulty_rating: difficulty,
          estimated_workload_hours: hours,
        });
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const formatDeadline = () =>
    deadline.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    }) + ' at ' + deadline.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Assignment Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Assignment Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={t => { setName(t); setErrors(e => ({ ...e, name: '' })); }}
              placeholder="e.g. AP Calc Chapter 5 Test Review"
              placeholderTextColor={Colors.textDisabled}
              returnKeyType="next"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Course */}
          <View style={styles.field}>
            <Text style={styles.label}>Course *</Text>
            <TouchableOpacity
              style={[styles.input, styles.picker, errors.course && styles.inputError]}
              onPress={() => setShowCourses(!showCourses)}
            >
              <Text style={course ? styles.pickerValue : styles.pickerPlaceholder}>
                {course || 'Select a course…'}
              </Text>
              <Text style={styles.chevron}>{showCourses ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {errors.course ? <Text style={styles.errorText}>{errors.course}</Text> : null}

            {showCourses && (
              <View style={[styles.dropdown, Shadow.card]}>
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {COURSES.map(c => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.dropdownItem, course === c && styles.dropdownItemActive]}
                      onPress={() => { setCourse(c); setShowCourses(false); setErrors(e => ({ ...e, course: '' })); }}
                    >
                      <Text style={[styles.dropdownText, course === c && styles.dropdownTextActive]}>
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Deadline */}
          <View style={styles.field}>
            <Text style={styles.label}>Deadline *</Text>
            <TouchableOpacity
              style={[styles.input, styles.picker, errors.deadline && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.pickerValue}>{formatDeadline()}</Text>
              <Text style={styles.chevron}>📅</Text>
            </TouchableOpacity>
            {errors.deadline ? <Text style={styles.errorText}>{errors.deadline}</Text> : null}

            {showDatePicker && (
              <DateTimePicker
                value={deadline}
                mode="date"
                minimumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    const d = new Date(deadline);
                    d.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                    setDeadline(d);
                    setShowTimePicker(true);
                  }
                }}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={deadline}
                mode="time"
                onChange={(_, time) => {
                  setShowTimePicker(false);
                  if (time) {
                    const d = new Date(deadline);
                    d.setHours(time.getHours(), time.getMinutes());
                    setDeadline(d);
                    setErrors(e => ({ ...e, deadline: '' }));
                  }
                }}
              />
            )}
          </View>

          {/* Difficulty Slider */}
          <View style={styles.field}>
            <Text style={styles.label}>Difficulty *  <Text style={styles.diffValue}>{difficulty}/10</Text></Text>
            <View style={styles.sliderRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.diffBtn, n <= difficulty && styles.diffBtnActive]}
                  onPress={() => setDifficulty(n)}
                >
                  <Text style={[styles.diffBtnText, n <= difficulty && styles.diffBtnTextActive]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.diffTrack}>
              <View style={[styles.diffFill, { width: `${difficulty * 10}%` }]} />
            </View>
            <View style={styles.diffLabels}>
              <Text style={styles.diffLabel}>Easy</Text>
              <Text style={styles.diffLabel}>Hard</Text>
            </View>
          </View>

          {/* Estimated Hours (optional) */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Estimated Study Hours{' '}
              <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={estimatedHours}
              onChangeText={setEstimatedHours}
              placeholder="e.g. 3.5 (auto-calculated if blank)"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="decimal-pad"
            />
            <Text style={styles.helper}>
              If left blank, study hours will be estimated from the difficulty rating.
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving…' : existing ? 'Update Assignment' : 'Save Assignment'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  field: { gap: Spacing.xs },
  label: { ...Typography.bodySecondary, color: Colors.textPrimary, fontWeight: '500' },
  optional: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '400' },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    ...Typography.bodyPrimary,
    color: Colors.textPrimary,
  },
  inputError: { borderBottomColor: Colors.error },
  errorText: { ...Typography.caption, color: Colors.error },
  helper: { ...Typography.caption, color: Colors.textSecondary },
  picker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerValue: { ...Typography.bodyPrimary, color: Colors.textPrimary, flex: 1 },
  pickerPlaceholder: { ...Typography.bodyPrimary, color: Colors.textDisabled, flex: 1 },
  chevron: { ...Typography.caption, color: Colors.textSecondary },
  dropdown: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xs,
    zIndex: 100,
  },
  dropdownItem: { padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  dropdownItemActive: { backgroundColor: Colors.accentLight },
  dropdownText: { ...Typography.bodySecondary, color: Colors.textPrimary },
  dropdownTextActive: { color: Colors.accent, fontWeight: '600' },
  sliderRow: { flexDirection: 'row', gap: 4, marginTop: Spacing.xs },
  diffBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffBtnActive: { backgroundColor: Colors.accent },
  diffBtnText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600' },
  diffBtnTextActive: { color: '#fff' },
  diffValue: { color: Colors.accent, fontWeight: '700' },
  diffTrack: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  diffFill: { height: '100%', backgroundColor: Colors.accent, borderRadius: BorderRadius.full },
  diffLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  diffLabel: { ...Typography.caption, color: Colors.textSecondary },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { ...Typography.button, color: '#fff' },
});
