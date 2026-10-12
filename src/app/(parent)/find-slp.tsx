import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MOCK_SLP_PROFILES } from '../../lib/mock-data';

const ALL_SPECIALIZATIONS = [
  'Speech sound disorders',
  'Language disorders',
  'Autism-related communication difficulties',
  'Fluency/stuttering',
  'Childhood apraxia of speech',
  'Early intervention',
  'Feeding and swallowing',
  'Voice disorders',
];

const EXPERIENCE_OPTIONS = ['Any', '<3 yrs', '3-7 yrs', '8+ yrs'];
const LANGUAGE_OPTIONS = ['English', 'Spanish', 'Mandarin', 'Hindi'];
const FEE_OPTIONS = ['Any', '$50 - $80', '$80 - $110', '$110+'];
const AGE_GROUP_OPTIONS = [
  'Toddlers (0-3)',
  'Preschool (3-5)',
  'School-age (6-12)',
  'Adolescents (13+)',
];

export default function FindSlpScreen() {
  const params = useLocalSearchParams<{ specialty?: string; search?: string }>();

  const [searchQuery, setSearchQuery] = useState(params.search || '');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filter States
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    params.specialty ? [params.specialty] : []
  );
  const [selectedExperience, setSelectedExperience] = useState<string>('Any');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedFee, setSelectedFee] = useState<string>('Any');
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);

  // Booking state modal
  const [bookingSlp, setBookingSlp] = useState<any | null>(null);

  const toggleSpecialty = (item: string) => {
    if (selectedSpecialties.includes(item)) {
      setSelectedSpecialties(selectedSpecialties.filter((s) => s !== item));
    } else {
      setSelectedSpecialties([...selectedSpecialties, item]);
    }
  };

  const toggleLanguage = (item: string) => {
    if (selectedLanguages.includes(item)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== item));
    } else {
      setSelectedLanguages([...selectedLanguages, item]);
    }
  };

  const toggleAgeGroup = (item: string) => {
    if (selectedAgeGroups.includes(item)) {
      setSelectedAgeGroups(selectedAgeGroups.filter((a) => a !== item));
    } else {
      setSelectedAgeGroups([...selectedAgeGroups, item]);
    }
  };

  const resetFilters = () => {
    setSelectedSpecialties([]);
    setSelectedExperience('Any');
    setSelectedLanguages([]);
    setSelectedFee('Any');
    setSelectedAgeGroups([]);
    setVerifiedOnly(true);
  };

  // Filter Logic
  const filteredSlps = MOCK_SLP_PROFILES.filter((slp) => {
    // Search query by name, title, or specialization
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = slp.profile?.full_name.toLowerCase().includes(q);
      const titleMatch = slp.title.toLowerCase().includes(q);
      const specMatch = slp.specializations.some((s) => s.toLowerCase().includes(q));
      const bioMatch = slp.bio.toLowerCase().includes(q);
      if (!nameMatch && !titleMatch && !specMatch && !bioMatch) return false;
    }

    // Verified only filter
    if (verifiedOnly && !slp.is_verified) return false;

    // Specializations filter
    if (selectedSpecialties.length > 0) {
      const hasSpecialty = selectedSpecialties.some((s) => slp.specializations.includes(s));
      if (!hasSpecialty) return false;
    }

    // Languages filter
    if (selectedLanguages.length > 0) {
      const hasLang = selectedLanguages.some((l) => slp.languages_spoken.includes(l));
      if (!hasLang) return false;
    }

    // Experience filter
    if (selectedExperience === '<3 yrs' && slp.years_of_experience >= 3) return false;
    if (
      selectedExperience === '3-7 yrs' &&
      (slp.years_of_experience < 3 || slp.years_of_experience > 7)
    )
      return false;
    if (selectedExperience === '8+ yrs' && slp.years_of_experience < 8) return false;

    // Fee filter
    if (selectedFee === '$50 - $80' && (slp.hourly_rate < 50 || slp.hourly_rate > 80)) return false;
    if (selectedFee === '$80 - $110' && (slp.hourly_rate < 80 || slp.hourly_rate > 110))
      return false;
    if (selectedFee === '$110+' && slp.hourly_rate < 110) return false;

    // Age groups filter
    if (selectedAgeGroups.length > 0 && slp.age_groups_treated) {
      const hasAge = selectedAgeGroups.some((ag) => slp.age_groups_treated?.includes(ag));
      if (!hasAge) return false;
    }

    return true;
  });

  const activeFilterCount =
    selectedSpecialties.length +
    (selectedExperience !== 'Any' ? 1 : 0) +
    selectedLanguages.length +
    (selectedFee !== 'Any' ? 1 : 0) +
    selectedAgeGroups.length +
    (!verifiedOnly ? 1 : 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Speech Specialists" />

      {/* Top Search & Filter Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Palette.slate400} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by therapist name or condition..."
            placeholderTextColor={Palette.slate400}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={16} color={Palette.slate400} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={activeFilterCount > 0 ? '#FFF' : Palette.slate700}
          />
          <Text
            style={[styles.filterBtnText, activeFilterCount > 0 && styles.filterBtnTextActive]}
          >
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Filter Tags */}
      {selectedSpecialties.length > 0 && (
        <View style={styles.activeFiltersRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {selectedSpecialties.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.activeFilterChip}
                onPress={() => toggleSpecialty(s)}
              >
                <Text style={styles.activeFilterChipText}>{s}</Text>
                <Ionicons name="close" size={14} color={Palette.primaryDark} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={resetFilters} style={styles.clearAllBtn}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsInfoRow}>
        <Text style={styles.resultsCountText}>
          {filteredSlps.length} {filteredSlps.length === 1 ? 'specialist' : 'specialists'} available for online therapy
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredSlps.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-search-outline" size={48} color={Palette.slate400} />
            <Text style={styles.emptyTitle}>No Specialists Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your filter options or clearing search keywords.
            </Text>
            <Button
              title="Reset All Filters"
              size="sm"
              variant="outline"
              onPress={resetFilters}
              style={{ marginTop: Spacing.three }}
            />
          </View>
        ) : (
          filteredSlps.map((slp) => (
            <Card key={slp.id} style={styles.slpCard} variant="elevated">
              <View style={styles.cardHeader}>
                <Image
                  source={{
                    uri:
                      slp.profile?.avatar_url ||
                      'https://images.unsplash.com/photo-1594824813626-d35d97f2597b?w=400&fit=crop&q=80',
                  }}
                  style={styles.avatar}
                />
                <View style={styles.cardHeaderContent}>
                  <View style={styles.nameRow}>
                    <Text style={styles.slpName}>{slp.profile?.full_name}</Text>
                  </View>
                  <Text style={styles.slpTitle}>{slp.title}</Text>

                  <View style={styles.badgesRow}>
                    {slp.is_verified ? (
                      <Badge
                        label="Verified SLP"
                        variant="success"
                        size="sm"
                        icon={
                          <MaterialCommunityIcons
                            name="check-decagram"
                            size={12}
                            color="#065F46"
                          />
                        }
                      />
                    ) : (
                      <Badge label="Pending Verification" variant="warning" size="sm" />
                    )}

                    <View style={styles.ratingBox}>
                      <Ionicons name="star" size={12} color={Palette.accent} />
                      <Text style={styles.ratingScore}>{slp.rating.toFixed(2)}</Text>
                      <Text style={styles.reviewCount}>({slp.total_reviews})</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Next slot & Experience badge */}
              <View style={styles.slotBox}>
                <View style={styles.slotRow}>
                  <Ionicons name="time-outline" size={14} color={Palette.primaryDark} />
                  <Text style={styles.slotText}>
                    Next Available: {slp.next_available_slot || 'Tomorrow at 10:00 AM'}
                  </Text>
                </View>
                <Text style={styles.expText}>{slp.years_of_experience} yrs clinical exp</Text>
              </View>

              {/* Bio summary */}
              <Text style={styles.bioText} numberOfLines={2}>
                {slp.bio}
              </Text>

              {/* Specializations & Languages */}
              <View style={styles.chipsSection}>
                <View style={styles.chipsRow}>
                  {slp.specializations.map((spec) => (
                    <Badge key={spec} label={spec} variant="neutral" size="sm" />
                  ))}
                </View>
                <View style={styles.langRow}>
                  <Ionicons name="globe-outline" size={12} color={Palette.slate500} />
                  <Text style={styles.langText}>
                    Languages: {slp.languages_spoken.join(', ')}
                  </Text>
                </View>
              </View>

              {/* Footer with Price and Actions */}
              <View style={styles.cardFooter}>
                <View style={styles.feeCol}>
                  <Text style={styles.feeLabel}>CONSULTATION FEE</Text>
                  <Text style={styles.feeAmount}>
                    ${slp.hourly_rate}
                    <Text style={styles.feeUnit}> / session</Text>
                  </Text>
                </View>

                <View style={styles.actionButtonGroup}>
                  <Button
                    title="View Profile"
                    size="sm"
                    variant="outline"
                    onPress={() => router.push(`/(parent)/slp/${slp.id}`)}
                  />
                  <Button
                    title="Book Session"
                    size="sm"
                    variant="primary"
                    onPress={() =>
                      router.push({
                        pathname: '/(parent)/book-session',
                        params: { slpId: slp.id },
                      })
                    }
                  />
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalDrawer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Filter Speech Pathologists</Text>
                <Text style={styles.modalSub}>Customize by clinical specialty, experience, and fee</Text>
              </View>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Palette.slate700} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Verified Only Toggle */}
              <View style={styles.filterSectionToggle}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.filterSectionTitle}>Verified SLPs Only</Text>
                  <Text style={styles.toggleSub}>Only show clinicians with verified state licenses</Text>
                </View>
                <Switch
                  value={verifiedOnly}
                  onValueChange={setVerifiedOnly}
                  trackColor={{ false: Palette.slate300, true: Palette.primary }}
                  thumbColor="#FFF"
                />
              </View>

              {/* Clinical Specializations */}
              <Text style={styles.filterSectionTitle}>Clinical Specializations</Text>
              <View style={styles.modalChipsWrap}>
                {ALL_SPECIALIZATIONS.map((sp) => {
                  const isSelected = selectedSpecialties.includes(sp);
                  return (
                    <TouchableOpacity
                      key={sp}
                      style={[styles.modalChip, isSelected && styles.modalChipActive]}
                      onPress={() => toggleSpecialty(sp)}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          isSelected && styles.modalChipTextActive,
                        ]}
                      >
                        {sp}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Years of Experience */}
              <Text style={styles.filterSectionTitle}>Years of Experience</Text>
              <View style={styles.modalChipsWrap}>
                {EXPERIENCE_OPTIONS.map((exp) => (
                  <TouchableOpacity
                    key={exp}
                    style={[
                      styles.modalChip,
                      selectedExperience === exp && styles.modalChipActive,
                    ]}
                    onPress={() => setSelectedExperience(exp)}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        selectedExperience === exp && styles.modalChipTextActive,
                      ]}
                    >
                      {exp}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Fee Range */}
              <Text style={styles.filterSectionTitle}>Consultation Fee Range</Text>
              <View style={styles.modalChipsWrap}>
                {FEE_OPTIONS.map((fee) => (
                  <TouchableOpacity
                    key={fee}
                    style={[
                      styles.modalChip,
                      selectedFee === fee && styles.modalChipActive,
                    ]}
                    onPress={() => setSelectedFee(fee)}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        selectedFee === fee && styles.modalChipTextActive,
                      ]}
                    >
                      {fee}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Spoken Languages */}
              <Text style={styles.filterSectionTitle}>Spoken Languages</Text>
              <View style={styles.modalChipsWrap}>
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <TouchableOpacity
                      key={lang}
                      style={[styles.modalChip, isSelected && styles.modalChipActive]}
                      onPress={() => toggleLanguage(lang)}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          isSelected && styles.modalChipTextActive,
                        ]}
                      >
                        {lang}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Age Groups Treated */}
              <Text style={styles.filterSectionTitle}>Age Groups Treated</Text>
              <View style={styles.modalChipsWrap}>
                {AGE_GROUP_OPTIONS.map((age) => {
                  const isSelected = selectedAgeGroups.includes(age);
                  return (
                    <TouchableOpacity
                      key={age}
                      style={[styles.modalChip, isSelected && styles.modalChipActive]}
                      onPress={() => toggleAgeGroup(age)}
                    >
                      <Text
                        style={[
                          styles.modalChipText,
                          isSelected && styles.modalChipTextActive,
                        ]}
                      >
                        {age}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Reset Filters"
                size="md"
                variant="outline"
                onPress={resetFilters}
                style={{ flex: 1 }}
              />
              <Button
                title={`Show ${filteredSlps.length} Results`}
                size="md"
                variant="primary"
                onPress={() => setFilterModalVisible(false)}
                style={{ flex: 1.5 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Quick Booking Modal */}
      {bookingSlp && (
        <Modal visible={Boolean(bookingSlp)} animationType="fade" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.bookingModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book Teletherapy Session</Text>
                <TouchableOpacity onPress={() => setBookingSlp(null)}>
                  <Ionicons name="close" size={24} color={Palette.slate700} />
                </TouchableOpacity>
              </View>

              <View style={styles.bookingSlpInfo}>
                <Image
                  source={{
                    uri:
                      bookingSlp.profile?.avatar_url ||
                      'https://images.unsplash.com/photo-1594824813626-d35d97f2597b?w=400&fit=crop&q=80',
                  }}
                  style={styles.bookingAvatar}
                />
                <View>
                  <Text style={styles.bookingName}>{bookingSlp.profile?.full_name}</Text>
                  <Text style={styles.bookingTitle}>{bookingSlp.title}</Text>
                  <Text style={styles.bookingRate}>${bookingSlp.hourly_rate} / 45-min Session</Text>
                </View>
              </View>

              <View style={styles.bookingSlotsBox}>
                <Text style={styles.bookingSlotsTitle}>Select Preferred Consultation Slot:</Text>
                <TouchableOpacity style={styles.bookingSlotOptionSelected}>
                  <Ionicons name="radio-button-on" size={18} color={Palette.primary} />
                  <Text style={styles.bookingSlotText}>{bookingSlp.next_available_slot || 'Tomorrow at 10:00 AM'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bookingSlotOption}>
                  <Ionicons name="radio-button-off" size={18} color={Palette.slate400} />
                  <Text style={styles.bookingSlotText}>Thursday at 2:00 PM</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bookingSlotOption}>
                  <Ionicons name="radio-button-off" size={18} color={Palette.slate400} />
                  <Text style={styles.bookingSlotText}>Saturday at 11:30 AM</Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Continue to Booking & Checkout"
                size="lg"
                variant="primary"
                onPress={() => {
                  const slpId = bookingSlp.id;
                  setBookingSlp(null);
                  router.push({
                    pathname: '/(parent)/book-session',
                    params: { slpId },
                  });
                }}
                style={{ marginTop: Spacing.two }}
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
    gap: Spacing.two,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.slate100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.two + 2,
    height: 42,
  },
  searchIcon: {
    marginRight: Spacing.one + 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Palette.slate900,
  },
  clearBtn: {
    padding: 2,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.slate100,
  },
  filterBtnActive: {
    backgroundColor: Palette.primary,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate700,
  },
  filterBtnTextActive: {
    color: '#FFF',
  },
  activeFiltersRow: {
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.one + 2,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.primaryLight,
    borderWidth: 1,
    borderColor: Palette.primaryMuted,
  },
  activeFilterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.primaryDark,
  },
  clearAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  clearAllText: {
    fontSize: 11,
    color: Palette.slate500,
    fontWeight: '600',
  },
  resultsInfoRow: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate500,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.slate800,
    marginTop: Spacing.two,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Palette.slate500,
    textAlign: 'center',
    marginTop: 4,
  },
  slpCard: {
    marginBottom: Spacing.three,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  cardHeaderContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slpName: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
  },
  slpTitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 1,
    marginBottom: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingScore: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.slate800,
  },
  reviewCount: {
    fontSize: 11,
    color: Palette.slate500,
  },
  slotBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Palette.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.primaryMuted,
    marginBottom: Spacing.two,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
  expText: {
    fontSize: 11,
    color: Palette.slate600,
    fontWeight: '500',
  },
  bioText: {
    fontSize: 12,
    color: Palette.slate600,
    lineHeight: 17,
    marginBottom: Spacing.two,
  },
  chipsSection: {
    marginBottom: Spacing.two,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  langText: {
    fontSize: 11,
    color: Palette.slate500,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    paddingTop: Spacing.two,
    marginTop: Spacing.one,
  },
  feeCol: {},
  feeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Palette.slate400,
    letterSpacing: 0.5,
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
  },
  feeUnit: {
    fontSize: 11,
    color: Palette.slate500,
    fontWeight: '500',
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDrawer: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '85%',
    padding: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
  },
  modalSub: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
  modalBody: {
    marginBottom: Spacing.three,
  },
  filterSectionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate100,
    marginBottom: Spacing.two,
  },
  toggleSub: {
    fontSize: 11,
    color: Palette.slate500,
  },
  filterSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
    marginTop: Spacing.two,
    marginBottom: Spacing.one + 2,
  },
  modalChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.two,
  },
  modalChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Palette.slate300,
    backgroundColor: Palette.slate50,
  },
  modalChipActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  modalChipText: {
    fontSize: 12,
    color: Palette.slate700,
    fontWeight: '500',
  },
  modalChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
  },
  bookingModalContent: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  bookingSlpInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    backgroundColor: Palette.slate50,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  bookingAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  bookingName: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
  },
  bookingTitle: {
    fontSize: 11,
    color: Palette.slate500,
  },
  bookingRate: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.primaryDark,
    marginTop: 2,
  },
  bookingSlotsBox: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  bookingSlotsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
    marginBottom: 4,
  },
  bookingSlotOptionSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryLight,
  },
  bookingSlotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate200,
    backgroundColor: Palette.white,
  },
  bookingSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate800,
  },
});
