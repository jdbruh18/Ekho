import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { useAuth } from '../../lib/auth-context';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import {
  MOCK_APPOINTMENTS,
  MOCK_FAQS,
  MOCK_SLP_PROFILES,
  MOCK_TESTIMONIALS,
} from '../../lib/mock-data';

const THERAPY_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Speech sound disorders',
    shortName: 'Speech Sound',
    icon: 'volume-high',
    color: Palette.primary,
    bgColor: Palette.primaryLight,
  },
  {
    id: 'cat-2',
    name: 'Language disorders',
    shortName: 'Language Delays',
    icon: 'chat-processing',
    color: Palette.secondary,
    bgColor: Palette.secondaryLight,
  },
  {
    id: 'cat-3',
    name: 'Autism-related communication difficulties',
    shortName: 'Autism & AAC',
    icon: 'puzzle',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
  },
  {
    id: 'cat-4',
    name: 'Fluency/stuttering',
    shortName: 'Fluency / Stutter',
    icon: 'waves',
    color: '#0284C7',
    bgColor: '#F0F9FF',
  },
  {
    id: 'cat-5',
    name: 'Childhood apraxia of speech',
    shortName: 'Apraxia of Speech',
    icon: 'brain',
    color: '#EC4899',
    bgColor: '#FDF2F8',
  },
  {
    id: 'cat-6',
    name: 'Early intervention',
    shortName: 'Early Intervention',
    icon: 'baby-carriage',
    color: Palette.accent,
    bgColor: Palette.accentLight,
  },
  {
    id: 'cat-7',
    name: 'Voice disorders',
    shortName: 'Voice & Pitch',
    icon: 'microphone',
    color: '#10B981',
    bgColor: '#ECFDF5',
  },
  {
    id: 'cat-8',
    name: 'Feeding and swallowing',
    shortName: 'Feeding & Oral',
    icon: 'silverware-fork-knife',
    color: '#F97316',
    bgColor: '#FFF7ED',
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Find Your Specialist',
    desc: 'Browse verified pediatric SLPs filtered by clinical specialization, fees, and language.',
    icon: 'account-search',
    color: Palette.primary,
  },
  {
    step: '02',
    title: 'Book Online or Offline',
    desc: 'Select convenient teletherapy slots or discover accredited nearby physical speech clinics.',
    icon: 'calendar-check',
    color: Palette.secondary,
  },
  {
    step: '03',
    title: 'Live Interactive Session',
    desc: 'Join secure HD video therapy with interactive digital materials and parent coaching.',
    icon: 'video-account',
    color: Palette.accent,
  },
  {
    step: '04',
    title: 'Track Child Growth',
    desc: 'Receive clinical SOAP reports, milestone accuracy graphs, and daily home exercises.',
    icon: 'chart-line',
    color: '#10B981',
  },
];

export default function ParentHomeScreen() {
  const { profile, children, activeChild, appointments, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');

  const currentChild = activeChild || (children && children.length > 0 ? children[0] : null);
  const featuredSlps = MOCK_SLP_PROFILES.filter((s) => s.is_verified);
  const upcomingAppointment =
    appointments.find((a) => a.status === 'scheduled' || a.status === 'pending') ||
    MOCK_APPOINTMENTS[0];

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/(parent)/find-slp',
        params: { search: searchQuery.trim() },
      });
    } else {
      router.push('/(parent)/find-slp');
    }
  };

  const handleSelectCategory = (catName: string) => {
    router.push({
      pathname: '/(parent)/find-slp',
      params: { specialty: catName },
    });
  };

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="account-voice" size={24} color={Palette.primary} />
          </View>
          <View>
            <Text style={styles.brandTitle}>Ekho</Text>
            <Text style={styles.brandSub}>
              {profile ? `Caregiver: ${profile.full_name}` : 'Pediatric Speech Platform'}
            </Text>
          </View>
        </View>

        <View style={styles.topRightActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.push('/(parent)/appointments')}
          >
            <Ionicons name="calendar-outline" size={20} color={Palette.slate700} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => router.push('/(parent)/clinics')}
          >
            <Ionicons name="location-outline" size={20} color={Palette.slate700} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={async () => {
              await signOut();
              router.replace('/(auth)/landing');
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={Palette.slate700} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Child Profile Banner (For Authenticated Parents) */}
        {currentChild && (
          <Card style={styles.childHeaderCard} variant="outlined">
            <View style={styles.childHeaderRow}>
              <View style={styles.childHeaderLeft}>
                <View style={styles.childIconCircle}>
                  <Ionicons name="happy" size={22} color={Palette.primary} />
                </View>
                <View>
                  <Text style={styles.childHeaderLabel}>ACTIVE CHILD PATIENT</Text>
                  <Text style={styles.childHeaderName}>
                    {currentChild.first_name} {currentChild.last_name}
                  </Text>
                </View>
              </View>
              <View style={styles.childHeaderActions}>
                <TouchableOpacity
                  style={styles.childActionPill}
                  onPress={() => router.push('/(parent)/appointments')}
                >
                  <Ionicons name="calendar-outline" size={14} color={Palette.primaryDark} />
                  <Text style={styles.childActionText}>Sessions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.childActionPill}
                  onPress={() => router.push('/(parent)/progress')}
                >
                  <MaterialCommunityIcons
                    name="chart-timeline-variant-shimmer"
                    size={14}
                    color={Palette.primaryDark}
                  />
                  <Text style={styles.childActionText}>Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.childActionPill}
                  onPress={() => router.push('/(parent)/children')}
                >
                  <Ionicons name="settings-outline" size={14} color={Palette.slate700} />
                  <Text style={styles.childActionText}>Profiles</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroPill}>
            <Ionicons name="shield-checkmark" size={14} color={Palette.primaryDark} />
            <Text style={styles.heroPillText}>Verified Speech-Language Pathologists</Text>
          </View>

          <Text style={styles.heroTitle}>Better Communication Starts Here.</Text>
          <Text style={styles.heroSubtitle}>
            Connect with qualified Speech-Language Pathologists, access personalized online therapy,
            track your child&apos;s progress, and find trusted speech and language clinics near you.
          </Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={Palette.slate400} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for an SLP, specialization, or condition..."
                placeholderTextColor={Palette.slate400}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <Ionicons name="close-circle" size={18} color={Palette.slate400} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.searchSubmitBtn} onPress={handleSearchSubmit}>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Quick CTA Buttons */}
          <View style={styles.heroCtaRow}>
            <Button
              title="Find an SLP Online"
              size="md"
              variant="primary"
              leftIcon={<FontAwesome5 name="user-md" size={14} color="#FFF" />}
              onPress={() => router.push('/(parent)/find-slp')}
              style={{ flex: 1 }}
            />
            <Button
              title="Find Nearby Clinics"
              size="md"
              variant="secondary"
              leftIcon={<Ionicons name="location-outline" size={16} color={Palette.secondary} />}
              onPress={() => router.push('/(parent)/clinics')}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Upcoming Session Reminder Card if exists */}
        {upcomingAppointment && (
          <Card style={styles.upcomingCard} variant="elevated">
            <View style={styles.upcomingHeader}>
              <View style={styles.upcomingLabelRow}>
                <Ionicons name="videocam" size={16} color={Palette.primary} />
                <Text style={styles.upcomingLabel}>Upcoming Confirmed Teletherapy</Text>
              </View>
              <Badge label="In 2 Days" variant="success" size="sm" />
            </View>
            <View style={styles.upcomingBody}>
              <Image
                source={{
                  uri:
                    upcomingAppointment.slp?.profile?.avatar_url ||
                    'https://images.unsplash.com/photo-1594824813626-d35d97f2597b?w=400&fit=crop&q=80',
                }}
                style={styles.upcomingAvatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.upcomingSlpName}>
                  {upcomingAppointment.slp?.profile?.full_name}
                </Text>
                <Text style={styles.upcomingFocus} numberOfLines={1}>
                  Target: {upcomingAppointment.notes || 'Articulation therapy'}
                </Text>
              </View>
              <Button
                title="Manage"
                size="sm"
                variant="outline"
                onPress={() => router.push('/(parent)/appointments')}
              />
            </View>
          </Card>
        )}

        {/* Popular Therapy Categories */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Therapy Categories</Text>
            <Text style={styles.sectionSub}>Specialized clinical areas for pediatric care</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(parent)/find-slp')}>
            <Text style={styles.sectionLink}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryGrid}>
          {THERAPY_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              style={styles.categoryCard}
              onPress={() => handleSelectCategory(cat.name)}
            >
              <View style={[styles.categoryIconWrap, { backgroundColor: cat.bgColor }]}>
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={24}
                  color={cat.color}
                />
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>
                {cat.shortName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Verified SLPs Carousel */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Featured Verified Specialists</Text>
            <Text style={styles.sectionSub}>Licensed clinicians ready for video therapy</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(parent)/find-slp')}>
            <Text style={styles.sectionLink}>Explore Directory</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredCarousel}
        >
          {featuredSlps.map((slp) => (
            <Card key={slp.id} style={styles.featuredSlpCard} variant="elevated">
              <View style={styles.featuredTopRow}>
                <Image
                  source={{
                    uri:
                      slp.profile?.avatar_url ||
                      'https://images.unsplash.com/photo-1594824813626-d35d97f2597b?w=400&fit=crop&q=80',
                  }}
                  style={styles.featuredAvatar}
                />
                <View style={styles.featuredBadgeWrap}>
                  <Badge
                    label="Verified"
                    variant="success"
                    size="sm"
                    icon={<MaterialCommunityIcons name="check-decagram" size={12} color="#065F46" />}
                  />
                  <View style={styles.featuredRatingRow}>
                    <Ionicons name="star" size={12} color={Palette.accent} />
                    <Text style={styles.featuredRatingText}>
                      {slp.rating.toFixed(2)} ({slp.total_reviews})
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.featuredName} numberOfLines={1}>
                {slp.profile?.full_name}
              </Text>
              <Text style={styles.featuredTitle} numberOfLines={1}>
                {slp.title}
              </Text>

              <View style={styles.featuredChipsRow}>
                {slp.specializations.slice(0, 2).map((sp) => (
                  <Badge key={sp} label={sp} variant="neutral" size="sm" />
                ))}
              </View>

              <View style={styles.featuredPriceRow}>
                <View>
                  <Text style={styles.featuredPriceLabel}>Session Fee</Text>
                  <Text style={styles.featuredPrice}>
                    ${slp.hourly_rate}
                    <Text style={styles.featuredUnit}> / hr</Text>
                  </Text>
                </View>

                <Button
                  title="View Profile"
                  size="sm"
                  variant="primary"
                  onPress={() => router.push(`/(parent)/slp/${slp.id}`)}
                />
              </View>
            </Card>
          ))}
        </ScrollView>

        {/* How It Works Section */}
        <View style={styles.howItWorksContainer}>
          <Text style={styles.howItWorksHeader}>How Ekho Works</Text>
          <Text style={styles.howItWorksSubtitle}>
            Four seamless steps to evidence-based communication care
          </Text>

          <View style={styles.stepsGrid}>
            {HOW_IT_WORKS_STEPS.map((step) => (
              <View key={step.step} style={styles.stepCard}>
                <View style={styles.stepHeaderRow}>
                  <View style={[styles.stepIconBox, { backgroundColor: Palette.slate100 }]}>
                    <MaterialCommunityIcons
                      name={step.icon as any}
                      size={22}
                      color={step.color}
                    />
                  </View>
                  <Text style={styles.stepNumberBadge}>{step.step}</Text>
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Nearby Clinics Callout Banner */}
        <Card style={styles.clinicsBanner} variant="elevated">
          <View style={styles.clinicsBannerContent}>
            <View style={styles.clinicsBannerIcon}>
              <MaterialCommunityIcons name="hospital-building" size={28} color={Palette.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clinicsBannerTitle}>Need Face-to-Face Evaluation?</Text>
              <Text style={styles.clinicsBannerSub}>
                Explore accredited pediatric speech clinics, audiology institutes, and rehab centers
                with interactive map directions.
              </Text>
            </View>
          </View>
          <Button
            title="Browse Nearby Clinics Map & Directory"
            variant="secondary"
            size="md"
            rightIcon={<Ionicons name="arrow-forward" size={16} color={Palette.secondary} />}
            onPress={() => router.push('/(parent)/clinics')}
            style={{ marginTop: Spacing.two }}
          />
        </Card>

        {/* Parent Testimonials Carousel */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Parent Testimonials</Text>
            <Text style={styles.sectionSub}>Real outcomes from families who use Ekho</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.testimonialsScroll}
        >
          {MOCK_TESTIMONIALS.map((item) => (
            <Card key={item.id} style={styles.testimonialCard} variant="outlined">
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons key={i} name="star" size={14} color={Palette.accent} />
                ))}
              </View>
              <Text style={styles.testimonialQuote}>&ldquo;{item.quote}&rdquo;</Text>
              <View style={styles.testimonialFooter}>
                <Image source={{ uri: item.avatar_url }} style={styles.testimonialAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.testimonialAuthor}>{item.parent_name}</Text>
                  <Text style={styles.testimonialChild}>{item.child_info}</Text>
                  <Text style={styles.testimonialSlp}>Clinician: {item.therapist_name}</Text>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>

        {/* Frequently Asked Questions Accordion */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Text style={styles.sectionSub}>Everything you need to know before your first session</Text>

          <View style={styles.faqList}>
            {MOCK_FAQS.map((faq) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <Card key={faq.id} style={styles.faqCard} variant="outlined">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.faqHeader}
                    onPress={() => toggleFaq(faq.id)}
                  >
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={Palette.slate600}
                    />
                  </TouchableOpacity>
                  {isExpanded && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
                </Card>
              );
            })}
          </View>
        </View>

        {/* Important Clinical Disclaimer */}
        <DisclaimerBanner />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
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
    color: Palette.slate500,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  headerIconButton: {
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.slate100,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  childHeaderCard: {
    marginBottom: Spacing.three,
    backgroundColor: Palette.white,
  },
  childHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  childIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childHeaderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.slate400,
    letterSpacing: 0.5,
  },
  childHeaderName: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
  },
  childHeaderActions: {
    flexDirection: 'row',
    gap: 6,
  },
  childActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.slate100,
  },
  childActionText: {
    fontSize: 11,
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
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Palette.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    gap: 6,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: Palette.primaryMuted,
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.primaryDark,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.slate900,
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: Spacing.two,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Palette.slate600,
    lineHeight: 20,
    marginBottom: Spacing.three,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.slate50,
    borderWidth: 1,
    borderColor: Palette.slate300,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.three,
    height: 48,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Palette.slate900,
    paddingVertical: 8,
  },
  clearSearchBtn: {
    padding: 4,
  },
  searchSubmitBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  upcomingCard: {
    marginBottom: Spacing.four,
    borderLeftWidth: 4,
    borderLeftColor: Palette.primary,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  upcomingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upcomingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
  upcomingBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  upcomingAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  upcomingSlpName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate900,
  },
  upcomingFocus: {
    fontSize: 12,
    color: Palette.slate500,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.two + 2,
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
  },
  sectionSub: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  categoryCard: {
    width: '23%',
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.three,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.slate200,
    gap: 6,
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.slate800,
    textAlign: 'center',
    lineHeight: 14,
  },
  featuredCarousel: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
    marginBottom: Spacing.four,
  },
  featuredSlpCard: {
    width: 250,
    padding: Spacing.three,
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  featuredAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  featuredBadgeWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  featuredRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  featuredRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate700,
  },
  featuredName: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
  },
  featuredTitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginBottom: Spacing.two,
  },
  featuredChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.three,
    minHeight: 24,
  },
  featuredPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    paddingTop: Spacing.two,
  },
  featuredPriceLabel: {
    fontSize: 10,
    color: Palette.slate400,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
  },
  featuredUnit: {
    fontSize: 11,
    color: Palette.slate500,
    fontWeight: '500',
  },
  howItWorksContainer: {
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.four,
  },
  howItWorksHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
  },
  howItWorksSubtitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
    marginBottom: Spacing.three,
  },
  stepsGrid: {
    gap: Spacing.two,
  },
  stepCard: {
    backgroundColor: Palette.slate50,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  stepIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.slate400,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.slate900,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: Palette.slate600,
    lineHeight: 17,
  },
  clinicsBanner: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    marginBottom: Spacing.four,
  },
  clinicsBannerContent: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'flex-start',
  },
  clinicsBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  clinicsBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  clinicsBannerSub: {
    fontSize: 12,
    color: '#0C4A6E',
    lineHeight: 17,
  },
  testimonialsScroll: {
    gap: Spacing.three,
    paddingBottom: Spacing.two,
    marginBottom: Spacing.four,
  },
  testimonialCard: {
    width: 280,
    backgroundColor: Palette.white,
    padding: Spacing.four,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: Spacing.two,
  },
  testimonialQuote: {
    fontSize: 13,
    color: Palette.slate700,
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: Spacing.three,
  },
  testimonialFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    paddingTop: Spacing.two,
  },
  testimonialAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  testimonialAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate900,
  },
  testimonialChild: {
    fontSize: 11,
    color: Palette.slate500,
  },
  testimonialSlp: {
    fontSize: 11,
    color: Palette.primaryDark,
    fontWeight: '600',
  },
  faqSection: {
    marginBottom: Spacing.four,
  },
  faqList: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  faqCard: {
    backgroundColor: Palette.white,
    padding: Spacing.three,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate900,
    flex: 1,
    marginRight: Spacing.two,
  },
  faqAnswer: {
    fontSize: 12,
    color: Palette.slate600,
    lineHeight: 18,
    marginTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    paddingTop: Spacing.two,
  },
});
