import React, { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { DisclaimerBanner } from '../../components/DisclaimerBanner';
import { MOCK_CLINICS } from '../../lib/mock-data';
import { ClinicWithDistance, DEFAULT_USER_LOCATION, withDistances } from '../../lib/geo';

const CLINIC_TYPES = [
  'All',
  'Speech Clinic',
  'Pediatric Rehab Center',
  'Hospital Department',
  'Child Development Center',
];

const CITY_FILTERS = [
  'All Cities',
  'Mysuru',
  'Bengaluru',
  'Kochi',
  'Thiruvananthapuram',
  'Mangaluru',
  'Kozhikode',
];

// Distances are computed once from each clinic's lat/long relative to the user's location.
const CLINICS_WITH_DISTANCE = withDistances(MOCK_CLINICS);

export default function ClinicsScreen() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClinic, setSelectedClinic] = useState<ClinicWithDistance>(CLINICS_WITH_DISTANCE[0]);

  const filteredClinics = CLINICS_WITH_DISTANCE.filter((c) => {
    const matchesType = selectedType === 'All' || c.type === selectedType;
    const matchesCity = selectedCity === 'All Cities' || c.city === selectedCity;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.services.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesCity && matchesSearch;
  });

  const handleCallClinic = (phone: string, name: string) => {
    Alert.alert('Call Clinic', `Dial ${phone} for ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call Now',
        onPress: () => {
          Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`).catch(() => {
            Alert.alert('Contact Notice', `Clinic Phone: ${phone}`);
          });
        },
      },
    ]);
  };

  const handleGetDirections = (clinic: ClinicWithDistance) => {
    Alert.alert(
      'Navigation Directions',
      `Opening directions to ${clinic.name} (${clinic.address}). Distance: ${clinic.distanceLabel}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Maps',
          onPress: () => {
            const query = encodeURIComponent(`${clinic.name}, ${clinic.address}`);
            Linking.openURL(`https://maps.google.com/?q=${query}`).catch(() => {
              Alert.alert('Address', `${clinic.name}\n${clinic.address}`);
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Nearby Speech Clinics" />

      {/* View Mode Toggle & Search Header */}
      <View style={styles.topControlSection}>
        {/* Toggle Bar */}
        <View style={styles.toggleBar}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list"
              size={16}
              color={viewMode === 'list' ? Palette.primaryDark : Palette.slate500}
            />
            <Text
              style={[
                styles.toggleBtnText,
                viewMode === 'list' && styles.toggleBtnTextActive,
              ]}
            >
              List View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons
              name="map"
              size={16}
              color={viewMode === 'map' ? Palette.primaryDark : Palette.slate500}
            />
            <Text
              style={[
                styles.toggleBtnText,
                viewMode === 'map' && styles.toggleBtnTextActive,
              ]}
            >
              Interactive Map
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={Palette.slate400} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clinics by name, address, or service..."
            placeholderTextColor={Palette.slate400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={Palette.slate400} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsScroll}
        >
          {CLINIC_TYPES.map((type) => {
            const isSelected = selectedType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.typePill, isSelected && styles.typePillActive]}
                onPress={() => setSelectedType(type)}
              >
                <Text
                  style={[styles.typePillText, isSelected && styles.typePillTextActive]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* City / District Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.categoryPillsScroll, { marginTop: 6 }]}
        >
          {CITY_FILTERS.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                style={[styles.cityPill, isSelected && styles.cityPillActive]}
                onPress={() => setSelectedCity(city)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Ionicons
                  name={city === 'All Cities' ? 'globe-outline' : 'location-outline'}
                  size={12}
                  color={isSelected ? Palette.white : Palette.secondary}
                />
                <Text style={[styles.cityPillText, isSelected && styles.typePillTextActive]}>
                  {city}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* CONTENT: MAP VIEW vs LIST VIEW */}
      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          {/* Simulated Stylized Map Canvas */}
          <View style={styles.mapCanvas}>
            {/* Grid & Map graphic accents */}
            <View style={styles.mapRoadH1} />
            <View style={styles.mapRoadH2} />
            <View style={styles.mapRoadV1} />
            <View style={styles.mapRoadV2} />
            <View style={styles.mapWaterArea}>
              <Text style={styles.mapWaterText}>Arabian Sea</Text>
            </View>

            {/* User Location Pulse Indicator */}
            <View style={styles.userLocationMarker}>
              <View style={styles.userPulse} />
              <View style={styles.userDot} />
              <Text style={styles.userLabel}>You Are Here</Text>
            </View>

            {/* Interactive Clinic Pins */}
            {filteredClinics.map((clinic, index) => {
              const isSelected = selectedClinic.id === clinic.id;
              // Deterministic spread coordinates on the interactive mock canvas
              const topPositions = [120, 240, 80, 200, 290];
              const leftPositions = [60, 220, 210, 80, 160];
              const top = topPositions[index % topPositions.length];
              const left = leftPositions[index % leftPositions.length];

              return (
                <TouchableOpacity
                  key={clinic.id}
                  style={[
                    styles.pinContainer,
                    { top, left },
                    isSelected && styles.pinContainerSelected,
                  ]}
                  onPress={() => setSelectedClinic(clinic)}
                >
                  <View
                    style={[
                      styles.pinIconCircle,
                      isSelected && { backgroundColor: Palette.primaryDark },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        clinic.type === 'Hospital Department'
                          ? 'hospital-box'
                          : clinic.type === 'Pediatric Rehab Center'
                          ? 'human-child'
                          : 'hospital-marker'
                      }
                      size={18}
                      color="#FFF"
                    />
                  </View>
                  <View style={styles.pinLabelBox}>
                    <Text style={styles.pinDistanceText}>{clinic.distanceLabel}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Recenter Control Button */}
            <TouchableOpacity
              style={styles.recenterBtn}
              onPress={() => {
                Alert.alert('Recenter', `Map centered to your current location (${DEFAULT_USER_LOCATION.label}).`);
              }}
            >
              <Ionicons name="locate" size={20} color={Palette.primaryDark} />
            </TouchableOpacity>
          </View>

          {/* Bottom Sheet Card for Selected Clinic */}
          {selectedClinic && (
            <Card style={styles.selectedClinicCard} variant="elevated">
              <View style={styles.selectedCardHeader}>
                <View style={{ flex: 1 }}>
                  <Badge label={selectedClinic.type} variant="info" size="sm" />
                  <Text style={styles.selectedClinicName}>{selectedClinic.name}</Text>
                  <Text style={styles.selectedClinicAddress}>{selectedClinic.address}</Text>
                </View>
                <View style={styles.selectedDistanceBadge}>
                  <Ionicons name="navigate-circle" size={16} color={Palette.primary} />
                  <Text style={styles.selectedDistanceText}>{selectedClinic.distanceLabel}</Text>
                </View>
              </View>

              <View style={styles.selectedMetaRow}>
                <View style={styles.selectedMetaItem}>
                  <Ionicons name="time-outline" size={14} color={Palette.slate500} />
                  <Text style={styles.selectedMetaText}>{selectedClinic.opening_hours}</Text>
                </View>
                <View style={styles.selectedRatingRow}>
                  <Ionicons name="star" size={14} color={Palette.accent} />
                  <Text style={styles.selectedRatingText}>
                    {selectedClinic.rating.toFixed(2)} ({selectedClinic.reviews_count} reviews)
                  </Text>
                </View>
              </View>

              <View style={styles.selectedActionsRow}>
                <Button
                  title="Call Clinic"
                  size="sm"
                  variant="outline"
                  leftIcon={<Ionicons name="call" size={14} color={Palette.primary} />}
                  onPress={() => handleCallClinic(selectedClinic.phone, selectedClinic.name)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Get Directions"
                  size="sm"
                  variant="primary"
                  leftIcon={<Ionicons name="navigate" size={14} color="#FFF" />}
                  onPress={() => handleGetDirections(selectedClinic)}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          )}
        </View>
      ) : (
        /* LIST VIEW */
        <ScrollView
          contentContainerStyle={styles.listScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listHeaderRow}>
            <Text style={styles.listCountText}>
              Found {filteredClinics.length} speech & language centres · distances from{' '}
              {DEFAULT_USER_LOCATION.label}
            </Text>
          </View>

          {filteredClinics.map((clinic) => (
            <Card key={clinic.id} style={styles.clinicCard} variant="elevated">
              {clinic.image_url && (
                <Image source={{ uri: clinic.image_url }} style={styles.clinicImage} />
              )}

              <View style={styles.clinicCardBody}>
                <View style={styles.clinicHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Badge label={clinic.type} variant="info" size="sm" />
                    <Text style={styles.clinicName}>{clinic.name}</Text>
                  </View>
                  <View style={styles.distanceBadge}>
                    <Ionicons name="location" size={14} color={Palette.primary} />
                    <Text style={styles.distanceText}>{clinic.distanceLabel}</Text>
                  </View>
                </View>

                <View style={styles.clinicAddressRow}>
                  <Ionicons name="map-outline" size={14} color={Palette.slate400} />
                  <Text style={styles.clinicAddressText}>
                    {clinic.address}, {clinic.city}
                  </Text>
                </View>

                <View style={styles.clinicHoursRow}>
                  <Ionicons name="time-outline" size={14} color={Palette.slate400} />
                  <Text style={styles.clinicHoursText}>{clinic.opening_hours}</Text>
                </View>

                <View style={styles.servicesWrap}>
                  {clinic.services.map((svc) => (
                    <Badge key={svc} label={svc} variant="neutral" size="sm" />
                  ))}
                </View>

                <View style={styles.ratingAndContactRow}>
                  <View style={styles.ratingBox}>
                    <Ionicons name="star" size={14} color={Palette.accent} />
                    <Text style={styles.ratingScore}>{clinic.rating.toFixed(2)}</Text>
                    <Text style={styles.ratingReviews}>({clinic.reviews_count} reviews)</Text>
                  </View>
                  <Text style={styles.phoneText}>{clinic.phone}</Text>
                </View>

                <View style={styles.actionsBtnRow}>
                  <Button
                    title="Call Clinic"
                    size="sm"
                    variant="outline"
                    leftIcon={<Ionicons name="call" size={14} color={Palette.primary} />}
                    onPress={() => handleCallClinic(clinic.phone, clinic.name)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Get Directions"
                    size="sm"
                    variant="primary"
                    leftIcon={<Ionicons name="navigate" size={14} color="#FFF" />}
                    onPress={() => handleGetDirections(clinic)}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            </Card>
          ))}

          <DisclaimerBanner />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  topControlSection: {
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
  },
  toggleBar: {
    flexDirection: 'row',
    backgroundColor: Palette.slate100,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.two,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.md - 2,
  },
  toggleBtnActive: {
    backgroundColor: Palette.white,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate500,
  },
  toggleBtnTextActive: {
    color: Palette.primaryDark,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.slate50,
    borderWidth: 1,
    borderColor: Palette.slate300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.two + 2,
    height: 40,
    marginBottom: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Palette.slate900,
  },
  categoryPillsScroll: {
    gap: 6,
    paddingBottom: 2,
  },
  typePill: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Palette.slate300,
    backgroundColor: Palette.slate50,
  },
  typePillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  typePillText: {
    fontSize: 12,
    color: Palette.slate600,
    fontWeight: '500',
  },
  typePillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  cityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Palette.secondary + '55',
    backgroundColor: Palette.secondaryLight,
  },
  cityPillActive: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.secondary,
  },
  cityPillText: {
    fontSize: 12,
    color: Palette.secondary,
    fontWeight: '600',
  },
  listScrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  listHeaderRow: {
    marginBottom: Spacing.two,
  },
  listCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate500,
  },
  clinicCard: {
    marginBottom: Spacing.four,
    overflow: 'hidden',
    padding: 0,
  },
  clinicImage: {
    width: '100%',
    height: 140,
    backgroundColor: Palette.slate200,
  },
  clinicCardBody: {
    padding: Spacing.three,
  },
  clinicHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.one,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.slate900,
    marginTop: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Palette.primaryMuted,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
  clinicAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  clinicAddressText: {
    fontSize: 12,
    color: Palette.slate600,
  },
  clinicHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.two,
  },
  clinicHoursText: {
    fontSize: 12,
    color: Palette.slate500,
  },
  servicesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.two,
  },
  ratingAndContactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    paddingTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.slate800,
  },
  ratingReviews: {
    fontSize: 11,
    color: Palette.slate500,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.primaryDark,
  },
  actionsBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    overflow: 'hidden',
  },
  mapRoadH1: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: '#CBD5E1',
  },
  mapRoadH2: {
    position: 'absolute',
    top: '65%',
    left: 0,
    right: 0,
    height: 22,
    backgroundColor: '#CBD5E1',
  },
  mapRoadV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '35%',
    width: 18,
    backgroundColor: '#CBD5E1',
  },
  mapRoadV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '70%',
    width: 14,
    backgroundColor: '#CBD5E1',
  },
  mapWaterArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 60,
    backgroundColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapWaterText: {
    transform: [{ rotate: '9deg' }],
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
    letterSpacing: 1,
  },
  userLocationMarker: {
    position: 'absolute',
    top: '48%',
    left: '46%',
    alignItems: 'center',
  },
  userPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(13, 148, 136, 0.25)',
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Palette.primary,
    borderWidth: 2,
    borderColor: '#FFF',
    marginTop: 9,
  },
  userLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: Palette.primaryDark,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 4,
    borderRadius: 4,
    marginTop: 2,
  },
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinContainerSelected: {
    transform: [{ scale: 1.15 }],
    zIndex: 10,
  },
  pinIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pinLabelBox: {
    backgroundColor: Palette.white,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Palette.slate300,
    marginTop: 2,
  },
  pinDistanceText: {
    fontSize: 9,
    fontWeight: '700',
    color: Palette.slate700,
  },
  recenterBtn: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedClinicCard: {
    position: 'absolute',
    bottom: Spacing.three,
    left: Spacing.three,
    right: Spacing.three,
    backgroundColor: Palette.white,
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  selectedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  selectedClinicName: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.slate900,
    marginTop: 2,
  },
  selectedClinicAddress: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 1,
  },
  selectedDistanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Palette.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.full,
  },
  selectedDistanceText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.primaryDark,
  },
  selectedMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Palette.slate50,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.two,
  },
  selectedMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedMetaText: {
    fontSize: 11,
    color: Palette.slate600,
  },
  selectedRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  selectedRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate800,
  },
  selectedActionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
