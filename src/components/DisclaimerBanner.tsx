import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette, BorderRadius, Spacing } from '../constants/theme';

export function DisclaimerBanner() {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <MaterialCommunityIcons
          name="shield-alert-outline"
          size={18}
          color={Palette.slate700}
        />
        <Text style={styles.title}>Important Clinical & Emergency Notice</Text>
      </View>
      <Text style={styles.text}>
        This platform connects users with qualified Speech-Language Pathologists for professional
        consultation and therapy. Online therapy may not be appropriate for every individual or
        condition. Clinical decisions, diagnosis, assessment, and treatment recommendations remain
        the responsibility of the treating professional.
      </Text>
      <Text style={styles.emergencyText}>
        ⚠️ This platform is NOT an emergency medical service. In the event of a medical or airway
        emergency, contact your local emergency services immediately.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate300,
    padding: Spacing.three,
    marginVertical: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
  },
  text: {
    fontSize: 12,
    color: Palette.slate600,
    lineHeight: 17,
  },
  emergencyText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.danger,
    marginTop: Spacing.two,
    lineHeight: 16,
  },
});
