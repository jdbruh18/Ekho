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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../lib/auth-context';

const CONCERN_OPTIONS = [
  'Speech sound disorders',
  'Language delays',
  'Fluency/stuttering',
  'Social communication',
  'Autism-related communication',
  'Childhood apraxia of speech',
  'Feeding and swallowing',
  'Early intervention',
];

export default function ParentSignUpScreen() {
  const { signUpParent, isLoading } = useAuth();

  // Parent account state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Child profile state
  const [childFirstName, setChildFirstName] = useState('');
  const [childLastName, setChildLastName] = useState('');
  const [childDob, setChildDob] = useState('2021-04-15');
  const [childGender, setChildGender] = useState<'Boy' | 'Girl' | 'Other'>('Boy');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([
    'Speech sound disorders',
  ]);
  const [developmentalHistory, setDevelopmentalHistory] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleConcern = (concern: string) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter((c) => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  const handleSignUp = async () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Parent full name is required';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid email is required';
    if (!password || password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (!childFirstName.trim()) newErrors.childFirstName = 'Child first name is required';
    if (!childLastName.trim()) newErrors.childLastName = 'Child last name is required';
    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!childDob.trim()) {
      newErrors.childDob = 'Child date of birth is required';
    } else if (!dobRegex.test(childDob.trim())) {
      newErrors.childDob = 'Date of birth must be in YYYY-MM-DD format';
    }
    if (selectedConcerns.length === 0)
      newErrors.concerns = 'Please select at least one communication concern';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Incomplete Form', 'Please review the highlighted fields to continue.');
      return;
    }

    setErrors({});

    const { error } = await signUpParent({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim(),
      childFirstName: childFirstName.trim(),
      childLastName: childLastName.trim(),
      childDob: childDob.trim(),
      childGender,
      communicationConcerns: selectedConcerns,
      developmentalHistory: developmentalHistory.trim(),
    });

    if (error) {
      Alert.alert('Registration Failed', error.message);
    } else {
      router.replace('/(parent)');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Parent & Child Setup" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Section 1: Parent Details */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Parent / Caregiver Account</Text>
              <Text style={styles.sectionSubtitle}>
                Your personal details to manage appointments and billing
              </Text>
            </View>
          </View>

          <Card style={styles.card}>
            <Input
              label="Full Name"
              required
              placeholder="e.g. Emily Watson"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              leftIcon={<Ionicons name="person-outline" size={18} color={Palette.slate400} />}
            />

            <Input
              label="Email Address"
              required
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="emily@example.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              leftIcon={<Ionicons name="mail-outline" size={18} color={Palette.slate400} />}
            />

            <Input
              label="Password"
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
              label="Phone Number (Optional)"
              keyboardType="phone-pad"
              placeholder="+1 (555) 012-3456"
              value={phone}
              onChangeText={setPhone}
              leftIcon={<Ionicons name="call-outline" size={18} color={Palette.slate400} />}
            />
          </Card>

          {/* Section 2: Child Details */}
          <View style={[styles.sectionHeaderRow, { marginTop: Spacing.four }]}>
            <View style={[styles.stepCircle, { backgroundColor: Palette.primary }]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Child Profile Information</Text>
              <Text style={styles.sectionSubtitle}>
                Helps therapists evaluate developmental background
              </Text>
            </View>
          </View>

          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: Spacing.two }}>
                <Input
                  label="Child First Name"
                  required
                  placeholder="Leo"
                  value={childFirstName}
                  onChangeText={setChildFirstName}
                  error={errors.childFirstName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Child Last Name"
                  required
                  placeholder="Watson"
                  value={childLastName}
                  onChangeText={setChildLastName}
                  error={errors.childLastName}
                />
              </View>
            </View>

            <Input
              label="Date of Birth"
              required
              placeholder="YYYY-MM-DD (e.g. 2021-04-15)"
              value={childDob}
              onChangeText={setChildDob}
              error={errors.childDob}
              leftIcon={<Ionicons name="calendar-outline" size={18} color={Palette.slate400} />}
              helperText="Format: YYYY-MM-DD"
            />

            {/* Gender Selection */}
            <View style={styles.genderContainer}>
              <Text style={styles.genderLabel}>Gender</Text>
              <View style={styles.genderRow}>
                {(['Boy', 'Girl', 'Other'] as const).map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      childGender === gender && styles.genderOptionActive,
                    ]}
                    onPress={() => setChildGender(gender)}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        childGender === gender && styles.genderOptionTextActive,
                      ]}
                    >
                      {gender}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Communication Concerns */}
            <View style={styles.concernsContainer}>
              <View style={styles.concernsHeader}>
                <Text style={styles.concernsLabel}>Primary Communication Concerns *</Text>
                <Text style={styles.concernsSub}>Select all that apply</Text>
              </View>

              <View style={styles.chipsContainer}>
                {CONCERN_OPTIONS.map((concern) => {
                  const isSelected = selectedConcerns.includes(concern);
                  return (
                    <TouchableOpacity
                      key={concern}
                      onPress={() => toggleConcern(concern)}
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
                        {concern}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.concerns ? (
                <Text style={styles.errorText}>{errors.concerns}</Text>
              ) : null}
            </View>

            <Input
              label="Developmental History or Notes"
              placeholder="e.g. Milestones, words child uses, previous evaluations or specific speech sounds of concern..."
              multiline
              numberOfLines={4}
              value={developmentalHistory}
              onChangeText={setDevelopmentalHistory}
              inputStyle={{ height: 80, textAlignVertical: 'top' }}
            />
          </Card>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <MaterialCommunityIcons
              name="lock-check"
              size={18}
              color={Palette.primary}
            />
            <Text style={styles.privacyText}>
              Child healthcare data is encrypted and only shared with licensed SLPs you authorize.
            </Text>
          </View>

          {/* Submit CTA */}
          <Button
            title="Create Parent Account & Child Profile"
            size="lg"
            variant="primary"
            loading={isLoading}
            onPress={handleSignUp}
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
    backgroundColor: Palette.primaryDark,
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
  genderContainer: {
    marginBottom: Spacing.three,
  },
  genderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.slate700,
    marginBottom: Spacing.one,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  genderOption: {
    flex: 1,
    paddingVertical: Spacing.two,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.slate300,
    backgroundColor: Palette.white,
    alignItems: 'center',
  },
  genderOptionActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryLight,
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Palette.slate700,
  },
  genderOptionTextActive: {
    fontWeight: '700',
    color: Palette.primaryDark,
  },
  concernsContainer: {
    marginBottom: Spacing.three,
  },
  concernsHeader: {
    marginBottom: Spacing.one + 2,
  },
  concernsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.slate700,
  },
  concernsSub: {
    fontSize: 12,
    color: Palette.slate500,
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
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Palette.primaryLight,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.primaryMuted,
    marginTop: Spacing.two,
    marginBottom: Spacing.four,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    color: Palette.primaryDark,
    lineHeight: 16,
  },
  submitBtn: {
    marginBottom: Spacing.four,
  },
});
