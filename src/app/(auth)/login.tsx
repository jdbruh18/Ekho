import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../lib/auth-context';

export default function LoginScreen() {
  const { signIn, switchRoleDemo, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }

    const { error, session: userSession } = await signIn(email.trim(), password);
    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else if (userSession) {
      if (userSession.role === 'slp') {
        router.replace('/(slp)');
      } else if (userSession.role === 'admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(parent)');
      }
    } else {
      router.replace('/(parent)');
    }
  };

  const handleQuickDemo = async (role: 'parent' | 'slp' | 'admin') => {
    await switchRoleDemo(role);
    if (role === 'parent') {
      router.replace('/(parent)');
    } else if (role === 'slp') {
      router.replace('/(slp)');
    } else {
      router.replace('/(admin)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Welcome Back" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerBox}>
            <Text style={styles.headline}>Sign In to Ekho</Text>
            <Text style={styles.subhead}>
              Access therapy appointments, child progress notes, and clinician records.
            </Text>
          </View>

          <Card style={styles.card}>
            <Input
              label="Email Address"
              required
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="e.g. parent@example.com"
              value={email}
              onChangeText={setEmail}
              leftIcon={<Ionicons name="mail-outline" size={18} color={Palette.slate400} />}
            />

            <Input
              label="Password"
              required
              secureTextEntry
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              leftIcon={
                <Ionicons name="lock-closed-outline" size={18} color={Palette.slate400} />
              }
            />

            <Button
              title="Sign In"
              size="lg"
              variant="primary"
              loading={isLoading}
              onPress={handleLogin}
              style={{ marginTop: Spacing.two }}
            />
          </Card>

          {/* Quick Demo Selector for Reviewers */}
          <View style={styles.demoSection}>
            <View style={styles.demoHeader}>
              <Ionicons name="flash-outline" size={16} color={Palette.primary} />
              <Text style={styles.demoTitle}>Quick Demo Logins (Instant Test)</Text>
            </View>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => handleQuickDemo('parent')}
            >
              <MaterialCommunityIcons
                name="human-child"
                size={20}
                color={Palette.primary}
              />
              <View style={styles.demoTextCol}>
                <Text style={styles.demoRole}>Parent / Caregiver</Text>
                <Text style={styles.demoSub}>Emily Watson (Child: Leo Watson)</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.slate400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => handleQuickDemo('slp')}
            >
              <FontAwesome5 name="user-md" size={18} color={Palette.secondary} />
              <View style={styles.demoTextCol}>
                <Text style={styles.demoRole}>Verified SLP Clinician</Text>
                <Text style={styles.demoSub}>Dr. Maya Lin, Ph.D., CCC-SLP</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.slate400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={() => handleQuickDemo('admin')}
            >
              <MaterialCommunityIcons
                name="shield-account"
                size={20}
                color={Palette.purple}
              />
              <View style={styles.demoTextCol}>
                <Text style={styles.demoRole}>Platform Administrator</Text>
                <Text style={styles.demoSub}>Review SLPs & platform analytics</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Palette.slate400} />
            </TouchableOpacity>
          </View>

          {/* New to platform */}
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Don&apos;t have an account yet?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/role-select')}>
              <Text style={styles.footerLink}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  headerBox: {
    marginBottom: Spacing.four,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.slate900,
    marginBottom: Spacing.one,
  },
  subhead: {
    fontSize: 14,
    color: Palette.slate600,
    lineHeight: 20,
  },
  card: {
    marginBottom: Spacing.four,
  },
  demoSection: {
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.four,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.two,
    paddingBottom: Spacing.one,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two + 2,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
    gap: Spacing.two,
  },
  demoTextCol: {
    flex: 1,
  },
  demoRole: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate900,
  },
  demoSub: {
    fontSize: 11,
    color: Palette.slate500,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  footerLabel: {
    fontSize: 14,
    color: Palette.slate600,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
});
