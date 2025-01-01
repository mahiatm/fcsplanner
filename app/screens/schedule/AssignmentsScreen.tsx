import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { AssignmentCard } from '../../components/assignment/AssignmentCard';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/theme';

type FilterType = 'Active' | 'Completed' | 'All';

interface Props {
  navigation: any;
}

export function AssignmentsScreen({ navigation }: Props) {
  const { assignments, atRiskIds, completeAssignment, deleteAssignment } = useApp();
  const [filter, setFilter] = useState<FilterType>('Active');

  const filtered = assignments.filter(a => {
    if (filter === 'Active') return a.completion_status !== 'Completed';
    if (filter === 'Completed') return a.completion_status === 'Completed';
    return true;
  });

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Assignment', `Remove "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAssignment(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Assignments</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddAssignment')}
        >
          <Text style={styles.addBtnText}>＋ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {(['Active', 'Completed', 'All'] as FilterType[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.tab, filter === f && styles.tabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={a => a.assignment_id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {filter === 'Completed' ? 'No completed assignments' : 'No assignments yet'}
            </Text>
            <Text style={styles.emptyText}>
              {filter !== 'Completed' && 'Tap + Add to create your first assignment.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View>
            <AssignmentCard
              assignment={item}
              isAtRisk={atRiskIds.includes(item.assignment_id)}
              onPress={() => navigation.navigate('AddAssignment', { assignment: item })}
              onComplete={() => completeAssignment(item.assignment_id)}
            />
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item.assignment_id, item.name)}
            >
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: { ...Typography.h1, color: Colors.textPrimary },
  addBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  addBtnText: { ...Typography.caption, color: '#fff', fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundSecondary,
  },
  tabActive: { backgroundColor: Colors.accentLight },
  tabText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Colors.accent, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl },
  empty: { alignItems: 'center', paddingTop: Spacing.xxl, gap: Spacing.sm },
  emptyTitle: { ...Typography.h2, color: Colors.textPrimary },
  emptyText: { ...Typography.bodySecondary, color: Colors.textSecondary, textAlign: 'center' },
  deleteBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.sm,
    marginTop: -Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  deleteBtnText: { ...Typography.caption, color: Colors.error },
});
