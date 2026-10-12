import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Palette, BorderRadius, Spacing } from '../../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({
  label,
  variant = 'neutral',
  size = 'md',
  icon,
  style,
  textStyle,
}: BadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: Palette.primaryLight, text: Palette.primaryDark, border: Palette.primaryMuted };
      case 'success':
        return { bg: Palette.successLight, text: '#065F46', border: '#A7F3D0' };
      case 'warning':
        return { bg: Palette.warningLight, text: '#92400E', border: '#FDE68A' };
      case 'info':
        return { bg: Palette.secondaryLight, text: '#0369A1', border: '#BAE6FD' };
      case 'danger':
        return { bg: Palette.dangerLight, text: '#991B1B', border: '#FECACA' };
      case 'neutral':
      default:
        return { bg: Palette.slate100, text: Palette.slate700, border: Palette.slate200 };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: size === 'sm' ? 2 : 4,
          paddingHorizontal: size === 'sm' ? Spacing.two : Spacing.two + 4,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: size === 'sm' ? 11 : 12,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  iconWrapper: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
  },
});
