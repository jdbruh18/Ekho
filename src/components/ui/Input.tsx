import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Palette, BorderRadius, Spacing } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  helperText?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  required,
  ...rest
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.requiredStar}> *</Text>}
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          error ? styles.inputError : null,
          rest.multiline ? styles.multilineContainer : null,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={Palette.slate400}
          style={[styles.input, inputStyle]}
          {...rest}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.slate700,
  },
  requiredStar: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.slate300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
    minHeight: 46,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    paddingVertical: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Palette.slate900,
    paddingVertical: Spacing.two,
  },
  inputError: {
    borderColor: Palette.danger,
    backgroundColor: '#FEF2F2',
  },
  leftIcon: {
    marginRight: Spacing.two,
  },
  rightIcon: {
    marginLeft: Spacing.two,
  },
  errorText: {
    marginTop: Spacing.one,
    fontSize: 12,
    color: Palette.danger,
    fontWeight: '500',
  },
  helperText: {
    marginTop: Spacing.one,
    fontSize: 12,
    color: Palette.slate500,
  },
});
