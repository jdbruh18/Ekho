import React, { useState } from 'react';
import {
  Alert,
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
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth-context';

interface PendingApplicant {
  id: string;
  name: string;
  title: string;
  license: string;
  university: string;
  yearsExp: number;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminDashboard() {
  const { signOut } = useAuth();

  const [applicants, setApplicants] = useState<PendingApplicant[]>([
    {
      id: 'app-1',
      name: 'David Chen, M.S., CF-SLP',
      title: 'Clinical Fellow Speech Pathologist',
      license: 'SLP-WA-10928-CF',
      university: 'University of Washington',
      yearsExp: 2,
      status: 'pending',
    },
    {
      id: 'app-2',
      name: 'Elena Rostova, M.A., CCC-SLP',
      title: 'Bilingual Speech Specialist',
      license: 'SLP-IL-78214',
      university: 'Northwestern University',
      yearsExp: 6,
      status: 'pending',
    },
  ]);

  const handleApprove = (id: string, name: string) => {
    setApplicants(
      applicants.map((a) => (a.id === id ? { ...a, status: 'approved' } : a))
    );
    Alert.alert('SLP Approved', `${name} is now approved and has received the Verified SLP badge.`);
  };

  const handleReject = (id: string, name: string) => {
    setApplicants(
      applicants.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a))
    );
    Alert.alert('Application Rejected', `Notice sent to ${name}.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topRole}>ADMINISTRATIVE CONSOLE</Text>
          <Text style={styles.topTitle}>Platform Operations</Text>
        </View>

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={async () => {
            await signOut();
            router.replace('/(auth)/landing');
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={Palette.slate600} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Analytics Grid */}
        <Text style={styles.sectionHeader}>System Metrics</Text>
        <View style={styles.kpiRow}>
          <Card style={styles.kpiCard}>
            <Text style={styles.kpiNum}>148</Text>
            <Text style={styles.kpiLabel}>Verified SLPs</Text>
          </Card>
          <Card style={styles.kpiCard}>
            <Text style={styles.kpiNum}>520</Text>
            <Text style={styles.kpiLabel}>Active Children</Text>
          </Card>
          <Card style={styles.kpiCard}>
            <Text style={styles.kpiNum}>$34.2k</Text>
            <Text style={styles.kpiLabel}>Monthly GMV</Text>
          </Card>
        </View>

        {/* Pending SLP Verifications */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Pending SLP License Verifications</Text>
          <Badge
            label={`${applicants.filter((a) => a.status === 'pending').length} Action Items`}
            variant="warning"
            size="sm"
          />
        </View>

        {applicants.map((item) => (
          <Card key={item.id} style={styles.applicantCard} variant="elevated">
            <View style={styles.applicantHeader}>
              <View>
                <Text style={styles.applicantName}>{item.name}</Text>
                <Text style={styles.applicantTitle}>{item.title}</Text>
              </View>
              <Badge
                label={
                  item.status === 'approved'
                    ? 'Verified'
                    : item.status === 'rejected'
                    ? 'Rejected'
                    : 'Pending'
                }
                variant={
                  item.status === 'approved'
                    ? 'success'
                    : item.status === 'rejected'
                    ? 'danger'
                    : 'warning'
                }
                size="sm"
              />
            </View>

            <View style={styles.credentialsBox}>
              <View style={styles.credRow}>
                <Text style={styles.credLabel}>License #:</Text>
                <Text style={styles.credVal}>{item.license}</Text>
              </View>
              <View style={styles.credRow}>
                <Text style={styles.credLabel}>University:</Text>
                <Text style={styles.credVal}>{item.university}</Text>
              </View>
              <View style={styles.credRow}>
                <Text style={styles.credLabel}>Experience:</Text>
                <Text style={styles.credVal}>{item.yearsExp} Years</Text>
              </View>
            </View>

            {item.status === 'pending' ? (
              <View style={styles.actionBtnRow}>
                <Button
                  title="Approve & Verify"
                  size="sm"
                  variant="primary"
                  leftIcon={<MaterialCommunityIcons name="check" size={16} color="#FFF" />}
                  onPress={() => handleApprove(item.id, item.name)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Decline"
                  size="sm"
                  variant="outline"
                  onPress={() => handleReject(item.id, item.name)}
                />
              </View>
            ) : null}
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.slate50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: Palette.white,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
  },
  topRole: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.purple,
    letterSpacing: 0.5,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
  },
  signOutBtn: {
    padding: Spacing.one + 2,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.slate100,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
    marginTop: Spacing.three,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
    marginTop: Spacing.one,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.three,
  },
  kpiNum: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.slate900,
  },
  kpiLabel: {
    fontSize: 11,
    color: Palette.slate500,
    marginTop: 2,
    textAlign: 'center',
  },
  applicantCard: {
    marginBottom: Spacing.three,
  },
  applicantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  applicantName: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.slate900,
  },
  applicantTitle: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 1,
  },
  credentialsBox: {
    backgroundColor: Palette.slate50,
    borderRadius: BorderRadius.md,
    padding: Spacing.two,
    gap: 4,
    marginBottom: Spacing.three,
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  credLabel: {
    fontSize: 12,
    color: Palette.slate500,
  },
  credVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate800,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
