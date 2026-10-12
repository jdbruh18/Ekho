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
import {
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../lib/auth-context';

const SLP_SPECIALIZATIONS = [
  'Speech sound disorders',
  'Language disorders',
  'Autism-related communication',
  'Fluency/stuttering',
  'Early intervention',
  'Childhood apraxia of speech',
  'Social communication',
  'Feeding and swallowing',
  'Voice disorders',
];

const LANGUAGE_OPTIONS = ['English', 'Spanish', 'Mandarin', 'French', 'Arabic', 'Hindi'];

export default function SlpRegisterScreen() {
  const { signUpSlp, isLoading } = useAuth();

  // Basic Account
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Credentials Intake
  const [title, setTitle] = useState('Pediatric Speech-Language Pathologist');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('5');
  const [degrees, setDegrees] = useState('M.S. in Speech-Language Pathology');
  const [certifications, setCertifications] = useState('ASHA CCC-SLP');
  const [hourlyRate, setHourlyRate] = useState('85');
  const [bio, setBio] = useState('');

  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([
    'Speech sound disorders',
    'Early intervention',
  ]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleSpecialization = (spec: string) => {
    if (selectedSpecializations.includes(spec)) {
      setSelectedSpecializations(selectedSpecializations.filter((s) => s !== spec));
    } else {
      setSelectedSpecializations([...selectedSpecializations, spec]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleRegister = async () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full clinician name is required';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid email is required';
    if (!password || password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (!licenseNumber.trim())
      newErrors.licenseNumber = 'Professional license / registration number is required';
    if (!degrees.trim()) newErrors.degrees = 'Degree qualifications are required';
    if (selectedSpecializations.length === 0)
      newErrors.specializations = 'Select at least one clinical specialization';

    const parsedRate = parseFloat(hourlyRate);
    if (isNaN(parsedRate) || parsedRate <= 0) {
      newErrors.hourlyRate = 'Enter a valid hourly rate';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Incomplete Form', 'Please fill in all required clinical credentials.');
      return;
    }

    setErrors({});

    const { error } = await signUpSlp({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
      title: title.trim(),
      licenseNumber: licenseNumber.trim(),
      yearsOfExperience: parseInt(yearsOfExperience, 10) || 1,
      degrees: degrees.split(',').map((d) => d.trim()),
      certifications: certifications.split(',').map((c) => c.trim()),
      specializations: selectedSpecializations,
      languagesSpoken: selectedLanguages,
      hourlyRate: parsedRate,
      bio: bio.trim(),
    });

    if (error) {
      Alert.alert('Registration Failed', error.message);
    } else {
      router.replace('/(slp)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="SLP Clinician Registration" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Section 1: Account Info */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Clinician Account</Text>
              <Text style={styles.sectionSubtitle}>
                Your platform credentials and direct contact
              </Text>
            </View>
          </View>

          <Card style={styles.card}>
            <Input
              label="Full Legal / Professional Name"
              required
              placeholder="e.g. Dr. Maya Lin, Ph.D., CCC-SLP"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              leftIcon={<FontAwesome5 name="user-md" size={16} color={Palette.slate400} />}
            />

            <Input
              label="Professional Email"
              required
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="dr.maya@example.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              leftIcon={<Ionicons name="mail-outline" size={18} color={Palette.slate400} />}
            />

            <Input
              label="Account Password"
              required
              secureTextEntry
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              leftIcon={
                <Ionicons name="lock-closed-outline" size={18} color={Palette.slate400} />
              }
            />

            <Input
              label="Contact Phone"
              keyboardType="phone-pad"
              placeholder="+1 (555) 234-5678"
              value={phone}
              onChangeText={setPhone}
              leftIcon={<Ionicons name="call-outline" size={18} color={Palette.slate400} />}
              helperText="Kept private from clients; used for security & platform notices."
            />
          </Card>

          {/* Section 2: Clinical Credentials & Freelance Profile */}
          <View style={[styles.sectionHeaderRow, { marginTop: Spacing.four }]}>
            <View style={[styles.stepCircle, { backgroundColor: Palette.secondary }]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Credentials & Clinical Profile</Text>
              <Text style={styles.sectionSubtitle}>
                Verified by platform administrators before client booking
              </Text>
            </View>
          </View>

          <Card style={styles.card}>
            <Input
              label="Professional Headline / Title"
              placeholder="e.g. Senior Pediatric Speech-Language Pathologist"
              value={title}
              onChangeText={setTitle}
            />

            <Input
              label="State License / Board Registration Number"
              required
              placeholder="e.g. SLP-CA-92841"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
              error={errors.licenseNumber}
              leftIcon={
                <MaterialCommunityIcons
                  name="certificate-outline"
                  size={18}
                  color={Palette.slate400}
                />
              }
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: Spacing.two }}>
                <Input
                  label="Years Experience"
                  keyboardType="numeric"
                  placeholder="e.g. 8"
                  value={yearsOfExperience}
                  onChangeText={setYearsOfExperience}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Consultation Fee ($/hr)"
                  required
                  keyboardType="numeric"
                  placeholder="85"
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  error={errors.hourlyRate}
                  leftIcon={<Ionicons name="cash-outline" size={18} color={Palette.slate400} />}
                />
              </View>
            </View>

            <Input
              label="Academic Degrees"
              required
              placeholder="e.g. M.S. in Speech-Language Pathology, B.S. Cognitive Science"
              value={degrees}
              onChangeText={setDegrees}
              error={errors.degrees}
              helperText="Separate multiple degrees with commas"
            />

            <Input
              label="Certifications & Memberships"
              placeholder="e.g. ASHA CCC-SLP, PROMPT Trained, CAS"
              value={certifications}
              onChangeText={setCertifications}
              helperText="Separate multiple certifications with commas"
            />

            {/* Specializations Multi-select */}
            <View style={styles.chipsSection}>
              <Text style={styles.chipsLabel}>Clinical Specializations *</Text>
              <Text style={styles.chipsSub}>Select your core areas of pediatric expertise</Text>
              <View style={styles.chipsContainer}>
                {SLP_SPECIALIZATIONS.map((spec) => {
                  const isSelected = selectedSpecializations.includes(spec);
                  return (
                    <TouchableOpacity
                      key={spec}
                      onPress={() => toggleSpecialization(spec)}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelected,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color="#FFF"
                          style={{ marginRight: 4 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {spec}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.specializations ? (
                <Text style={styles.errorText}>{errors.specializations}</Text>
              ) : null}
            </View>

            {/* Languages */}
            <View style={styles.chipsSection}>
              <Text style={styles.chipsLabel}>Languages Spoken</Text>
              <View style={styles.chipsContainer}>
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang);
                  return (
                    <TouchableOpacity
                      key={lang}
                      onPress={() => toggleLanguage(lang)}
                      style={[
                        styles.chip,
                        isSelected && styles.chipSelectedSecondary,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextSelected,
                        ]}
                      >
                        {lang}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Input
              label="Professional Bio & Therapy Philosophy"
              placeholder="Tell parents about your clinical background, therapy approach, and experience..."
              multiline
              numberOfLines={4}
              value={bio}
              onChangeText={setBio}
              inputStyle={{ height: 80, textAlignVertical: 'top' }}
            />
          </Card>

          {/* Verification Badge Notice */}
          <View style={styles.noticeBox}>
            <MaterialCommunityIcons
              name="shield-check"
              size={22}
              color={Palette.secondary}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>Admin Verification Process</Text>
              <Text style={styles.noticeText}>
                Your registration will be submitted in ‹Pending› status. Once our clinical team
                confirms your state license, your profile receives the &quot;Verified SLP&quot; badge and
                appears in search results.
              </Text>
            </View>
          </View>

          {/* Submit */}
          <Button
            title="Submit Clinician Application"
            size="lg"
            variant="secondary"
            loading={isLoading}
            onPress={handleRegister}
            style={styles.submitBtn}
          />
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
    marginBottom: Spacing.two,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate900,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Palette.slate500,
  },
  card: {
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
  },
  chipsSection: {
    marginBottom: Spacing.three,
  },
  chipsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.slate700,
    marginBottom: 2,
  },
  chipsSub: {
    fontSize: 12,
    color: Palette.slate500,
    marginBottom: Spacing.one + 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one + 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Palette.slate300,
    backgroundColor: Palette.white,
  },
  chipSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primary,
  },
  chipSelectedSecondary: {
    borderColor: Palette.secondary,
    backgroundColor: Palette.secondary,
  },
  chipText: {
    fontSize: 12,
    color: Palette.slate700,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  errorText: {
    marginTop: Spacing.one,
    fontSize: 12,
    color: Palette.danger,
    fontWeight: '500',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    backgroundColor: Palette.secondaryLight,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 12,
    color: '#0C4A6E',
    lineHeight: 17,
  },
  submitBtn: {
    marginBottom: Spacing.four,
  },
});
