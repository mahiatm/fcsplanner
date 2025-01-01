import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../context/AppContext';
import { Colors, Typography, Spacing, BorderRadius } from '../../styles/theme';

export function LandingScreen() {
  const { createUser } = useApp();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!name.trim()) {
      setError('Please enter your name to get started.');
      return;
    }
    setError('');
    await createUser(name.trim());
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.hero}>
          <Text style={styles.logo}>FCSPLANNER</Text>
          <Text style={styles.tagline}>
            Your AP coursework, automatically organized.
          </Text>
          <Text style={styles.description}>
            Add assignments, set your study hours, and let FCSPLANNER build
            a prioritized daily study plan that keeps you on track.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>What's your name?</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={name}
            onChangeText={t => { setName(t); setError(''); }}
            placeholder="e.g. Alex"
            placeholderTextColor={Colors.textDisabled}
            returnKeyType="done"
            onSubmitEditing={handleStart}
            autoFocus
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.btn, !name.trim() && styles.btnDisabled]}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          All data stays on your device — private by design.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxl,
  },
  hero: { gap: Spacing.md },
  logo: {
    ...Typography.h1,
    color: Colors.accent,
    letterSpacing: 2,
  },
  tagline: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  description: {
    ...Typography.bodySecondary,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  form: { gap: Spacing.md },
  label: {
    ...Typography.bodyPrimary,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  input: {
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
    ...Typography.bodyPrimary,
    color: Colors.textPrimary,
  },
  inputError: {
    borderBottomColor: Colors.error,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
  },
  btn: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    ...Typography.button,
    color: '#fff',
  },
  footer: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
