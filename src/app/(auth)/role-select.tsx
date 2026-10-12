import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Button } from '../../components/ui/Button';

export default function RoleSelectScreen() {
  const [selectedRole, setSelectedRole] = useState<'parent' | 'slp'>('parent');

  const handleProceed = () => {
    if (selectedRole === 'parent') {
      router.push('/(auth)/parent-signup');
    } else {
      router.push('/(auth)/slp-register');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Choose Your Role" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBox}>
          <Text style={styles.headline}>How will you use Ekho?</Text>
          <Text style={styles.subheadline}>
            Select the profile that fits your needs to personalize your onboarding experience.
          </Text>
        </View>

        {/* Option 1: Parent / Caregiver */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.roleCard,
            selectedRole === 'parent' && styles.roleCardSelected,
          ]}
          onPress={() => setSelectedRole('parent')}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconBox,
                selectedRole === 'parent'
                  ? { backgroundColor: Palette.primaryLight }
                  : { backgroundColor: Palette.slate100 },
              ]}
            >
              <MaterialCommunityIcons
                name="human-male-female-child"
                size={28}
                color={selectedRole === 'parent' ? Palette.primary : Palette.slate600}
              />
            </View>
            <View style={styles.radioCircle}>
              {selectedRole === 'parent' && <View style={styles.radioInner} />}
            </View>
          </View>

          <Text style={styles.roleTitle}>Parent or Caregiver</Text>
          <Text style={styles.roleDescription}>
            Book specialized online therapy sessions, track your child&apos;s communication milestones,
            access home practice, and discover verified therapists and nearby clinics.
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={Palette.primary} />
              <Text style={styles.featureText}>Dedicated child profile & milestone tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={Palette.primary} />
              <Text style={styles.featureText}>Direct booking with verified pediatric SLPs</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={Palette.primary} />
              <Text style={styles.featureText}>Session reports & home exercise assignments</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Option 2: Speech-Language Pathologist */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.roleCard,
            selectedRole === 'slp' && styles.roleCardSelected,
          ]}
          onPress={() => setSelectedRole('slp')}
        >
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconBox,
                selectedRole === 'slp'
                  ? { backgroundColor: Palette.secondaryLight }
                  : { backgroundColor: Palette.slate100 },
              ]}
            >
              <FontAwesome5
                name="user-md"
                size={24}
                color={selectedRole === 'slp' ? Palette.secondary : Palette.slate600}
              />
            </View>
            <View style={styles.radioCircle}>
              {selectedRole === 'slp' && <View style={styles.radioInner} />}
            </View>
          </View>

          <Text style={styles.roleTitle}>Speech-Language Pathologist (SLP)</Text>
          <Text style={styles.roleDescription}>
            Offer freelance online therapy, set your own hourly rates, manage child clinical records,
            publish structured session notes, and build your digital practice.
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={Palette.secondary} />
              <Text style={styles.featureText}>Set custom consultation fees & schedule</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={Palette.secondary} />
              <Text style={styles.featureText}>Integrated video sessions & structured SOAP notes</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color={Palette.secondary} />
              <Text style={styles.featureText}>Professional verified credential badge</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Continue Button */}
        <Button
          title={
            selectedRole === 'parent'
              ? 'Continue as Parent / Caregiver'
              : 'Continue as SLP Clinician'
          }
          variant="primary"
          size="lg"
          rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
          onPress={handleProceed}
          style={styles.continueButton}
        />

        {/* Login redirect */}
        <View style={styles.loginRow}>
          <Text style={styles.loginLabel}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginAction}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    fontSize: 22,
    fontWeight: '800',
    color: Palette.slate900,
    marginBottom: Spacing.one,
  },
  subheadline: {
    fontSize: 14,
    color: Palette.slate600,
    lineHeight: 20,
  },
  roleCard: {
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    borderWidth: 1.5,
    borderColor: Palette.slate200,
    marginBottom: Spacing.three,
  },
  roleCardSelected: {
    borderColor: Palette.primary,
    backgroundColor: '#FAFDFD',
    shadowColor: Palette.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Palette.primary,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.slate900,
    marginBottom: Spacing.one,
  },
  roleDescription: {
    fontSize: 13,
    color: Palette.slate600,
    lineHeight: 18,
    marginBottom: Spacing.three,
  },
  featuresList: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    paddingTop: Spacing.two,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    color: Palette.slate700,
    fontWeight: '500',
  },
  continueButton: {
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.one,
  },
  loginLabel: {
    fontSize: 14,
    color: Palette.slate600,
  },
  loginAction: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
});
