import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Palette, Spacing } from '../../constants/theme';

export const MESSAGING_SCOPE_TEXT =
  'Direct messaging is for scheduling and home practice guidance. In emergencies, consult your local pediatrician.';

export function MessagingScopeBanner({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.banner, compact && styles.compact]} accessibilityRole="alert">
      <Ionicons name="information-circle" size={compact ? 14 : 16} color={Palette.warning} />
      <Text style={[styles.text, compact && { fontSize: 11 }]}>{MESSAGING_SCOPE_TEXT}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    backgroundColor: Palette.warningLight,
    borderWidth: 1,
    borderColor: Palette.accent + '55',
    borderRadius: BorderRadius.md,
    padding: Spacing.two + 2,
    marginBottom: Spacing.three,
  },
  compact: { marginBottom: 0, borderRadius: 0, borderWidth: 0, borderBottomWidth: 1, paddingVertical: 6 },
  text: { flex: 1, fontSize: 12, color: Palette.slate700, lineHeight: 17 },
});
