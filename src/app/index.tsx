import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth-context';
import { Palette } from '../constants/theme';

export default function IndexScreen() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name="account-voice" size={36} color={Palette.primary} />
        </View>
        <Text style={styles.appTitle}>Ekho</Text>
        <Text style={styles.appSub}>Speech & Language Therapy</Text>
        <ActivityIndicator size="large" color={Palette.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/landing" />;
  }

  switch (session.role) {
    case 'slp':
      return <Redirect href="/(slp)" />;
    case 'admin':
      return <Redirect href="/(admin)" />;
    case 'parent':
    default:
      return <Redirect href="/(parent)" />;
  }
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Palette.primaryMuted,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.slate900,
  },
  appSub: {
    fontSize: 13,
    color: Palette.slate500,
    marginTop: 4,
    textAlign: 'center',
  },
});
