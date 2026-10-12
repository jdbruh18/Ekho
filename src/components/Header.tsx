import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Palette, Spacing } from '../constants/theme';
import { Badge } from './ui/Badge';
import { useAuth } from '../lib/auth-context';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
  showRoleBadge?: boolean;
}

export function Header({
  title,
  showBack = false,
  rightElement,
  showRoleBadge = false,
}: HeaderProps) {
  const { session } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={Palette.slate800} />
          </TouchableOpacity>
        )}
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>

      <View style={styles.rightRow}>
        {showRoleBadge && session && (
          <Badge
            label={session.role.toUpperCase()}
            variant={
              session.role === 'slp'
                ? 'primary'
                : session.role === 'admin'
                ? 'danger'
                : 'info'
            }
            size="sm"
          />
        )}
        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 4,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  backButton: {
    paddingRight: Spacing.one,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.slate900,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
