import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppAlert, setAlertListener } from '../../services/feedback/AlertService';
import { Colors, Spacing, Typography, BorderRadius } from '../../styles/theme';

const BG: Record<string, string> = {
  warning: Colors.warningLight,
  success: Colors.successLight,
  error: Colors.errorLight,
  info: Colors.accentLight,
};

const BORDER: Record<string, string> = {
  warning: Colors.warning,
  success: Colors.success,
  error: Colors.error,
  info: Colors.accent,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState<AppAlert | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAlertListener(alert => {
      if (timer.current) clearTimeout(timer.current);
      setCurrent(alert);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timer.current = setTimeout(() => dismiss(), alert.duration ?? 3500);
    });
  }, []);

  const dismiss = () => {
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
      setCurrent(null)
    );
  };

  return (
    <>
      {children}
      {current && (
        <Animated.View
          style={[
            styles.banner,
            {
              top: insets.top + Spacing.md,
              backgroundColor: BG[current.type],
              borderLeftColor: BORDER[current.type],
              opacity,
            },
          ]}
        >
          <Text style={styles.text} numberOfLines={4}>
            {current.message}
          </Text>
          <TouchableOpacity onPress={dismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.dismiss, { color: BORDER[current.type] }]}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: Spacing.md,
    right: Spacing.md,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 4,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  text: {
    ...Typography.bodySecondary,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  dismiss: {
    ...Typography.bodySecondary,
    fontWeight: '600',
  },
});
