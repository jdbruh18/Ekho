import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../../constants/theme';
import { Header } from '../../../components/Header';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { DisclaimerBanner } from '../../../components/DisclaimerBanner';
import { MOCK_SLP_PROFILES } from '../../../lib/mock-data';

const SAMPLE_SLOTS = [
  { day: 'Tomorrow', time: '10:00 AM - 10:45 AM', type: 'Video' },
  { day: 'Tomorrow', time: '2:30 PM - 3:15 PM', type: 'Video' },
  { day: 'Thursday', time: '11:00 AM - 11:45 AM', type: 'Video' },
  { day: 'Friday', time: '4:00 PM - 4:45 PM', type: 'Video' },
];

export default function SlpDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Find SLP or fallback to first
  const slp = MOCK_SLP_PROFILES.find((s) => s.id === id) || MOCK_SLP_PROFILES[0];
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  const handleBookAppointment = () => {
    router.push({
      pathname: '/(parent)/book-session',
      params: { slpId: slp.id },
    });
  };

  const handleMessage = () => {
    Alert.alert(
      'Secure Messaging',
      `A direct, HIPAA-compliant chat channel with ${slp.profile?.full_name} is being initiated.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        showBack
        title="Clinician Profile"
        rightElement={
          <TouchableOpacity
            style={styles.headerShareBtn}
            onPress={() => Alert.alert('Share Profile', `Link copied for ${slp.profile?.full_name}`)}
          >
            <Ionicons name="share-social-outline" size={20} color={Palette.slate700} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Clinician Hero Card */}
        <Card style={styles.heroCard} variant="elevated">
          <View style={styles.heroTopRow}>
            <Image
              source={{
                uri:
                  slp.profile?.avatar_url ||
                  'https://images.unsplash.com/photo-1594824813626-d35d97f2597b?w=400&fit=crop&q=80',
              }}
              style={styles.heroAvatar}
            />
            <View style={styles.heroInfoCol}>
              <Text style={styles.heroName}>{slp.profile?.full_name}</Text>
              <Text style={styles.heroTitle}>{slp.title}</Text>

              <View style={styles.heroBadges}>
                {slp.is_verified ? (
                  <Badge
                    label="Verified SLP"
                    variant="success"
                    size="sm"
                    icon={
                      <MaterialCommunityIcons
                        name="check-decagram"
                        size={13}
                        color="#065F46"
                      />
                    }
                  />
                ) : (
                  <Badge label="Verification Pending" variant="warning" size="sm" />
                )}
                <Badge
                  label={`${slp.years_of_experience} Yrs Exp`}
                  variant="info"
                  size="sm"
                />
              </View>
            </View>
          </View>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <View style={styles.metricValueRow}>
                <Ionicons name="star" size={16} color={Palette.accent} />
                <Text style={styles.metricBigText}>{slp.rating.toFixed(2)}</Text>
              </View>
              <Text style={styles.metricLabel}>{slp.total_reviews} Reviews</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={styles.metricBigText}>{slp.total_sessions}+</Text>
              <Text style={styles.metricLabel}>Sessions</Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricItem}>
              <Text style={[styles.metricBigText, { color: Palette.primaryDark }]}>
                ${slp.hourly_rate}
              </Text>
              <Text style={styles.metricLabel}>Per Session</Text>
            </View>
          </View>
        </Card>

        {/* Professional Bio */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Professional Biography</Text>
          <Text style={styles.bioBody}>{slp.bio}</Text>
        </Card>

        {/* Qualifications, Degrees & Institutions */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <MaterialCommunityIcons name="school-outline" size={20} color={Palette.primary} />
            <Text style={styles.sectionHeading}>Education & Credentials</Text>
          </View>

          <View style={styles.credentialsList}>
            {slp.degrees.map((degree) => (
              <View key={degree} style={styles.credItem}>
                <Ionicons name="ribbon-outline" size={16} color={Palette.secondary} />
                <Text style={styles.credText}>{degree}</Text>
              </View>
            ))}

            {slp.certifications.map((cert) => (
              <View key={cert} style={styles.credItem}>
                <MaterialCommunityIcons name="certificate" size={16} color={Palette.accent} />
                <Text style={styles.credText}>{cert}</Text>
              </View>
            ))}
          </View>

          {/* Verification Registration Badge */}
          <View style={styles.licenseBox}>
            <View style={styles.licenseRow}>
              <Ionicons name="shield-checkmark" size={16} color={Palette.primary} />
              <Text style={styles.licenseLabel}>State Board License Number:</Text>
            </View>
            <Text style={styles.licenseCode}>{slp.license_number}</Text>
            <Text style={styles.privacyNote}>
              Private contact details (personal telephone and physical residence) are protected under
              Ekho HIPAA privacy standards.
            </Text>
          </View>
        </Card>

        {/* Clinical Specializations */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <FontAwesome5 name="stethoscope" size={16} color={Palette.primary} />
            <Text style={styles.sectionHeading}>Specializations & Areas of Practice</Text>
          </View>

          <View style={styles.chipsWrap}>
            {slp.specializations.map((spec) => (
              <Badge key={spec} label={spec} variant="neutral" size="md" />
            ))}
          </View>
        </Card>

        {/* Therapy Approaches & Techniques */}
        {slp.therapy_approaches && slp.therapy_approaches.length > 0 && (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeadingRow}>
              <MaterialCommunityIcons
                name="puzzle-check-outline"
                size={20}
                color={Palette.secondary}
              />
              <Text style={styles.sectionHeading}>Therapy Techniques & Frameworks</Text>
            </View>
            <View style={styles.chipsWrap}>
              {slp.therapy_approaches.map((approach) => (
                <Badge key={approach} label={approach} variant="info" size="md" />
              ))}
            </View>
          </Card>
        )}

        {/* Age Groups & Languages Spoken */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <MaterialCommunityIcons name="human-male-female-child" size={20} color={Palette.accent} />
            <Text style={styles.sectionHeading}>Patient Age Groups & Languages</Text>
          </View>

          <View style={styles.subDetailGroup}>
            <Text style={styles.subDetailLabel}>Age Groups Treated:</Text>
            <View style={styles.chipsWrap}>
              {(slp.age_groups_treated || ['Toddlers (0-3)', 'Preschool (3-5)', 'School-age (6-12)']).map(
                (age) => (
                  <Badge key={age} label={age} variant="neutral" size="sm" />
                )
              )}
            </View>
          </View>

          <View style={styles.subDetailGroup}>
            <Text style={styles.subDetailLabel}>Languages Spoken:</Text>
            <View style={styles.chipsWrap}>
              {slp.languages_spoken.map((lang) => (
                <Badge key={lang} label={lang} variant="primary" size="sm" />
              ))}
            </View>
          </View>
        </Card>

        {/* Availability Calendar & Next Slots */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeadingRow}>
            <Ionicons name="calendar-outline" size={20} color={Palette.primary} />
            <Text style={styles.sectionHeading}>Upcoming Teletherapy Slots</Text>
          </View>
          <Text style={styles.slotSubtitle}>
            Select a slot to schedule your 45-minute live interactive session:
          </Text>

          <View style={styles.slotList}>
            {SAMPLE_SLOTS.map((slot, index) => {
              const isSelected = selectedSlotIndex === index;
              return (
                <TouchableOpacity
                  key={`${slot.day}-${slot.time}`}
                  style={[styles.slotOption, isSelected && styles.slotOptionActive]}
                  onPress={() => setSelectedSlotIndex(index)}
                >
                  <View style={styles.slotLeft}>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={18}
                      color={isSelected ? Palette.primary : Palette.slate400}
                    />
                    <View>
                      <Text style={[styles.slotDay, isSelected && styles.slotDayActive]}>
                        {slot.day}
                      </Text>
                      <Text style={styles.slotTime}>{slot.time}</Text>
                    </View>
                  </View>
                  <Badge label="Online Video" variant={isSelected ? 'primary' : 'neutral'} size="sm" />
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Parent Reviews & Feedback */}
        <Card style={styles.sectionCard}>
          <View style={styles.reviewsHeadingRow}>
            <View>
              <Text style={styles.sectionHeading}>Parent Reviews & Outcomes</Text>
              <Text style={styles.reviewsCountSub}>
                Verified ratings from completed therapy sessions
              </Text>
            </View>
            <View style={styles.scoreBadge}>
              <Ionicons name="star" size={14} color={Palette.accent} />
              <Text style={styles.scoreBadgeText}>{slp.rating.toFixed(2)}</Text>
            </View>
          </View>

          {slp.reviews && slp.reviews.length > 0 ? (
            slp.reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{rev.parent_name}</Text>
                  <Text style={styles.reviewDate}>{rev.date}</Text>
                </View>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                      key={i}
                      name="star"
                      size={12}
                      color={i <= rev.rating ? Palette.accent : Palette.slate300}
                    />
                  ))}
                </View>
                <Text style={styles.reviewComment}>&ldquo;{rev.comment}&rdquo;</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noReviews}>No reviews yet for this clinician.</Text>
          )}
        </Card>

        {/* Clinical Disclaimer */}
        <DisclaimerBanner />
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomRateCol}>
          <Text style={styles.bottomRateLabel}>Session Fee</Text>
          <Text style={styles.bottomRateVal}>${slp.hourly_rate}</Text>
        </View>

        <View style={styles.bottomBtnGroup}>
          <Button
            title="Message"
            size="md"
            variant="outline"
            leftIcon={<Ionicons name="chatbubble-ellipses-outline" size={16} color={Palette.primary} />}
            onPress={handleMessage}
            style={styles.messageBtn}
          />
          <Button
            title="Book Appointment"
            size="md"
            variant="primary"
            leftIcon={<Ionicons name="calendar" size={16} color="#FFF" />}
            onPress={handleBookAppointment}
            style={styles.bookBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  headerShareBtn: {
    padding: Spacing.one + 2,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.slate100,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: 110, // room for fixed bottom bar
  },
  heroCard: {
    marginBottom: Spacing.three,
  },
  heroTopRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Palette.slate200,
  },
  heroInfoCol: {
    flex: 1,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 13,
    color: Palette.slate500,
    marginBottom: Spacing.two,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  metricsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Palette.slate50,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.two + 2,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricBigText: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
  },
  metricLabel: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: Palette.slate200,
  },
  sectionCard: {
    marginBottom: Spacing.three,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  bioBody: {
    fontSize: 13,
    color: Palette.slate700,
    lineHeight: 20,
    marginTop: Spacing.one,
  },
  credentialsList: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  credItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  credText: {
    fontSize: 13,
    color: Palette.slate800,
    flex: 1,
    lineHeight: 18,
  },
  licenseBox: {
    backgroundColor: Palette.primaryLight,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.primaryMuted,
  },
  licenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  licenseLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.primaryDark,
    textTransform: 'uppercase',
  },
  licenseCode: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.slate900,
    marginTop: 2,
  },
  privacyNote: {
    fontSize: 11,
    color: Palette.slate500,
    lineHeight: 15,
    marginTop: Spacing.one,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: Spacing.one,
  },
  subDetailGroup: {
    marginBottom: Spacing.two,
  },
  subDetailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate700,
    marginBottom: 4,
  },
  slotSubtitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginBottom: Spacing.two,
  },
  slotList: {
    gap: Spacing.two,
  },
  slotOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
    backgroundColor: Palette.white,
  },
  slotOptionActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryLight,
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  slotDay: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
  },
  slotDayActive: {
    color: Palette.primaryDark,
  },
  slotTime: {
    fontSize: 11,
    color: Palette.slate500,
  },
  reviewsHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  reviewsCountSub: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.accentLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  scoreBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  reviewItem: {
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    paddingTop: Spacing.two,
    marginBottom: Spacing.three,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate900,
  },
  reviewDate: {
    fontSize: 11,
    color: Palette.slate400,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 12,
    color: Palette.slate600,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  noReviews: {
    fontSize: 12,
    color: Palette.slate500,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: Palette.white,
    borderTopWidth: 1,
    borderTopColor: Palette.slate200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomRateCol: {},
  bottomRateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.slate400,
    textTransform: 'uppercase',
  },
  bottomRateVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
  },
  bottomBtnGroup: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  messageBtn: {
    paddingHorizontal: Spacing.three,
  },
  bookBtn: {
    paddingHorizontal: Spacing.four,
  },
});
