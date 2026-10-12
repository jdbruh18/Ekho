import React from 'react';
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
import { Button } from '../../components/ui/Button';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';

export default function LandingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navbar */}
        <View style={styles.navBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <MaterialCommunityIcons
                name="account-voice"
                size={22}
                color={Palette.primary}
              />
            </View>
            <View>
              <Text style={styles.brandTitle}>Ekho</Text>
              <Text style={styles.brandSub}>Speech & Language Therapy</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={styles.signInLink}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.badgePill}>
            <Ionicons name="sparkles" size={14} color={Palette.primaryDark} />
            <Text style={styles.badgePillText}>Pediatric & Freelance SLP Network</Text>
          </View>

          <Text style={styles.heroTitle}>Better Communication Starts Here.</Text>

          <Text style={styles.heroSubhead}>
            Connect with qualified Speech-Language Pathologists, access personalized online therapy,
            track your child&apos;s progress, and find trusted speech and language clinics near you.
          </Text>

          {/* Core Action CTAs */}
          <View style={styles.ctaGroup}>
            <Button
              title="Get Started • Choose Role"
              size="lg"
              variant="primary"
              rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
              onPress={() => router.push('/(auth)/role-select')}
              style={styles.primaryCta}
            />

            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/(parent)/find-slp')}
              >
                <FontAwesome5 name="user-md" size={18} color={Palette.primary} />
                <Text style={styles.quickActionText}>Find an SLP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/(auth)/role-select')}
              >
                <Ionicons name="videocam-outline" size={20} color={Palette.secondary} />
                <Text style={styles.quickActionText}>Online Therapy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => router.push('/(parent)/clinics')}
              >
                <Ionicons name="location-outline" size={20} color={Palette.accent} />
                <Text style={styles.quickActionText}>Nearby Clinics</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Value Pillars */}
        <View style={styles.pillarsSection}>
          <Text style={styles.sectionHeader}>Why Families & Clinicians Trust Us</Text>

          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconBox, { backgroundColor: Palette.primaryLight }]}>
              <MaterialCommunityIcons name="shield-check" size={24} color={Palette.primary} />
            </View>
            <View style={styles.pillarContent}>
              <Text style={styles.pillarTitle}>Verified Professional SLPs</Text>
              <Text style={styles.pillarDesc}>
                Licensed speech pathologists rigorously credential-checked for peace of mind.
              </Text>
            </View>
          </View>

          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconBox, { backgroundColor: Palette.secondaryLight }]}>
              <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={24} color={Palette.secondary} />
            </View>
            <View style={styles.pillarContent}>
              <Text style={styles.pillarTitle}>Visual Progress Tracking</Text>
              <Text style={styles.pillarDesc}>
                Clear milestone tracking for speech accuracy, vocabulary, fluency, and home exercises.
              </Text>
            </View>
          </View>

          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconBox, { backgroundColor: Palette.accentLight }]}>
              <Ionicons name="chatbubbles-outline" size={24} color={Palette.accent} />
            </View>
            <View style={styles.pillarContent}>
              <Text style={styles.pillarTitle}>Integrated Online Video & Practice</Text>
              <Text style={styles.pillarDesc}>
                Conduct live interactive sessions, receive structured session summaries, and parent guidance.
              </Text>
            </View>
          </View>
        </View>

        {/* Medical & Emergency Disclaimer Banner */}
        <DisclaimerBanner />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Speech-Language Pathology Healthcare & Freelancing Platform • V1 Foundation
          </Text>
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    marginBottom: Spacing.three,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.primaryMuted,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '500',
    color: Palette.slate500,
  },
  signInLink: {
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate300,
    backgroundColor: Palette.white,
  },
  signInText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate700,
  },
  heroSection: {
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Palette.slate200,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: Spacing.four,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Palette.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 6,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.primaryMuted,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.primaryDark,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.slate900,
    lineHeight: 34,
    letterSpacing: -0.5,
    marginBottom: Spacing.two,
  },
  heroSubhead: {
    fontSize: 15,
    color: Palette.slate600,
    lineHeight: 22,
    marginBottom: Spacing.four,
  },
  ctaGroup: {
    gap: Spacing.three,
  },
  primaryCta: {
    width: '100%',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Palette.slate50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
    paddingVertical: Spacing.two + 4,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    gap: 6,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate700,
    textAlign: 'center',
  },
  pillarsSection: {
    marginBottom: Spacing.three,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: Spacing.two + 2,
    marginTop: Spacing.one,
  },
  pillarCard: {
    flexDirection: 'row',
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.two,
    alignItems: 'center',
    gap: Spacing.three,
  },
  pillarIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarContent: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate900,
    marginBottom: 2,
  },
  pillarDesc: {
    fontSize: 12,
    color: Palette.slate500,
    lineHeight: 17,
  },
  footer: {
    marginTop: Spacing.two,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: Palette.slate400,
    textAlign: 'center',
  },
});
