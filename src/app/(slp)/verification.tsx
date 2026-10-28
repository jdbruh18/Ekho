import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BorderRadius, Palette, Spacing } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useEngagement } from '../../lib/engagement-store';
import { MOCK_UPLOAD_FILES } from '../../lib/engagement-mock';
import { CredentialDocType, CredentialDocument, CredentialStatus } from '../../types/engagement';

const CREDENTIAL_STATUS_META: Record<
  CredentialStatus,
  { label: string; variant: 'success' | 'warning' | 'danger' | 'neutral'; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  verified: { label: 'Verified', variant: 'success', icon: 'checkmark-circle', color: Palette.success },
  pending_review: { label: 'Pending Review', variant: 'warning', icon: 'time', color: Palette.warning },
  action_required: { label: 'Action Required', variant: 'danger', icon: 'alert-circle', color: Palette.danger },
  not_submitted: { label: 'Not Submitted', variant: 'neutral', icon: 'cloud-upload-outline', color: Palette.slate400 },
};

const DOC_ICONS: Record<CredentialDocType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  rci_license: 'card-account-details-star-outline',
  state_certificate: 'certificate-outline',
  degree: 'school-outline',
  identity: 'badge-account-horizontal-outline',
};

// RCI CRR numbers are an alphabet followed by 5 digits (e.g. A18392).
const RCI_PATTERN = /^[A-Z]\d{5}$/;

export default function SlpVerificationScreen() {
  const { credentials, submitCredential } = useEngagement();
  const [refDrafts, setRefDrafts] = useState<Partial<Record<CredentialDocType, string>>>({});
  const [pickedFiles, setPickedFiles] = useState<Partial<Record<CredentialDocType, string>>>({});

  const verifiedCount = credentials.filter((d) => d.status === 'verified').length;
  const overall: CredentialStatus = credentials.some((d) => d.status === 'action_required')
    ? 'action_required'
    : credentials.every((d) => d.status === 'verified')
    ? 'verified'
    : 'pending_review';
  const overallMeta = CREDENTIAL_STATUS_META[overall];

  const pickFile = (doc: CredentialDocument) => {
    // Mock picker — will be replaced by expo-document-picker / expo-image-picker.
    Alert.alert(`Upload ${doc.label}`, 'Choose a source (mock)', [
      { text: 'Cancel', style: 'cancel' },
      ...['Camera', 'Files'].map((src, i) => ({
        text: src,
        onPress: () => setPickedFiles((p) => ({ ...p, [doc.type]: MOCK_UPLOAD_FILES[i + (doc.type === 'degree' ? 1 : 0)] })),
      })),
    ]);
  };

  const submit = (doc: CredentialDocument) => {
    const file = pickedFiles[doc.type];
    const ref = (refDrafts[doc.type] ?? doc.referenceNumber ?? '').trim().toUpperCase();
    if (!file) {
      Alert.alert('File needed', 'Please attach a clear scan or photo first.');
      return;
    }
    if (doc.type === 'rci_license' && !RCI_PATTERN.test(ref)) {
      Alert.alert('Check CRR number', 'RCI CRR numbers look like A12345 (one letter followed by 5 digits).');
      return;
    }
    submitCredential(doc.type, file, ref || undefined);
    setPickedFiles((p) => ({ ...p, [doc.type]: undefined }));
    Alert.alert('Submitted for review', 'The Ekho admin team usually verifies documents within 2 working days.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Credential Verification" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Overall status */}
        <Card variant="elevated" style={[styles.summary, { borderLeftColor: overallMeta.color }]}>
          <Ionicons name={overallMeta.icon} size={32} color={overallMeta.color} />
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>
              {overall === 'verified' ? 'Verified SLP' : overall === 'action_required' ? 'Action required' : 'Verification in progress'}
            </Text>
            <Text style={styles.summarySub}>
              {verifiedCount} of {credentials.length} documents verified
            </Text>
          </View>
          <Badge label={overallMeta.label} variant={overallMeta.variant} size="sm" />
        </Card>
        <Text style={styles.policy}>
          Per Ekho policy, all documents must be verified by an admin before you can accept paid sessions. Your
          documents are stored securely and visible only to the verification team.
        </Text>

        {credentials.map((doc) => {
          const meta = CREDENTIAL_STATUS_META[doc.status];
          const editable = doc.status === 'not_submitted' || doc.status === 'action_required';
          const picked = pickedFiles[doc.type];
          return (
            <Card key={doc.type} variant="outlined" style={styles.docCard}>
              <View style={styles.docHeader}>
                <View style={styles.docIcon}>
                  <MaterialCommunityIcons name={DOC_ICONS[doc.type]} size={22} color={Palette.primaryDark} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle}>{doc.label}</Text>
                  <Text style={styles.docDesc}>{doc.description}</Text>
                </View>
              </View>

              <View style={styles.statusRow}>
                <Badge label={meta.label} variant={meta.variant} size="sm" />
                {doc.submittedAt && (
                  <Text style={styles.submittedText}>
                    Submitted {new Date(doc.submittedAt).toLocaleDateString('en-IN')}
                  </Text>
                )}
              </View>

              {doc.fileName && !picked && (
                <View style={styles.fileRow}>
                  <Ionicons name="document-attach-outline" size={14} color={Palette.slate500} />
                  <Text style={styles.fileText}>{doc.fileName}</Text>
                  {doc.referenceNumber && <Text style={styles.refText}>· {doc.referenceNumber}</Text>}
                </View>
              )}

              {doc.reviewerNote && (
                <View style={[styles.note, doc.status === 'action_required' && styles.noteDanger]}>
                  <Ionicons
                    name={doc.status === 'action_required' ? 'alert-circle-outline' : 'chatbox-ellipses-outline'}
                    size={14}
                    color={doc.status === 'action_required' ? Palette.danger : Palette.slate500}
                  />
                  <Text style={styles.noteText}>Reviewer: {doc.reviewerNote}</Text>
                </View>
              )}

              {editable && (
                <View style={styles.form}>
                  {(doc.type === 'rci_license' || doc.type === 'state_certificate') && (
                    <TextInput
                      style={styles.input}
                      placeholder={doc.type === 'rci_license' ? 'RCI CRR number (e.g. A12345)' : 'Registration number'}
                      placeholderTextColor={Palette.slate400}
                      autoCapitalize="characters"
                      defaultValue={doc.referenceNumber}
                      onChangeText={(v) => setRefDrafts((r) => ({ ...r, [doc.type]: v }))}
                    />
                  )}
                  <TouchableOpacity style={styles.uploadBox} onPress={() => pickFile(doc)}>
                    <Ionicons
                      name={picked ? 'document-text' : 'cloud-upload-outline'}
                      size={20}
                      color={picked ? Palette.primary : Palette.slate400}
                    />
                    <Text style={[styles.uploadText, picked && { color: Palette.primaryDark, fontWeight: '700' }]}>
                      {picked ?? 'Tap to attach PDF / photo (max 5 MB)'}
                    </Text>
                  </TouchableOpacity>
                  <Button
                    title={doc.status === 'action_required' ? 'Resubmit Document' : 'Submit for Review'}
                    size="md"
                    disabled={!picked}
                    onPress={() => submit(doc)}
                  />
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Palette.slate50 },
  scroll: { padding: Spacing.four, paddingBottom: Spacing.six },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderLeftWidth: 4,
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: Palette.slate900 },
  summarySub: { fontSize: 12, color: Palette.slate500, marginTop: 2 },
  policy: { fontSize: 12, color: Palette.slate500, lineHeight: 17, marginVertical: Spacing.three },
  docCard: { padding: Spacing.three, marginBottom: Spacing.three },
  docHeader: { flexDirection: 'row', gap: Spacing.two, alignItems: 'flex-start' },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: { fontSize: 14, fontWeight: '800', color: Palette.slate900 },
  docDesc: { fontSize: 12, color: Palette.slate500, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.two },
  submittedText: { fontSize: 11, color: Palette.slate400 },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.two },
  fileText: { fontSize: 12, color: Palette.slate700, fontWeight: '600' },
  refText: { fontSize: 12, color: Palette.slate500 },
  note: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: Palette.slate50,
    borderRadius: BorderRadius.md,
    padding: Spacing.two,
    marginTop: Spacing.two,
  },
  noteDanger: { backgroundColor: Palette.dangerLight },
  noteText: { flex: 1, fontSize: 12, color: Palette.slate700, lineHeight: 17 },
  form: { gap: Spacing.two, marginTop: Spacing.three },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: Palette.slate300,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.two + 2,
    fontSize: 14,
    color: Palette.slate900,
    backgroundColor: Palette.white,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Palette.slate300,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
    backgroundColor: Palette.slate50,
  },
  uploadText: { flex: 1, fontSize: 13, color: Palette.slate500 },
});
