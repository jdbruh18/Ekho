import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { MOCK_CHILDREN, MOCK_GOALS } from '../../lib/mock-data';

export default function SlpClientsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Authorized Client Caseload" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.securityBox}>
          <MaterialCommunityIcons name="shield-lock-outline" size={18} color={Palette.primary} />
          <Text style={styles.securityText}>
            HIPAA & RLS Protected: Only authorized children with confirmed parental consent or booked
            appointments appear in your clinical caseload.
          </Text>
        </View>

        {MOCK_CHILDREN.map((child) => (
          <Card key={child.id} style={styles.clientCard} variant="elevated">
            <View style={styles.clientHeader}>
              <View style={styles.clientAvatar}>
                <MaterialCommunityIcons name="human-child" size={26} color={Palette.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>
                  {child.first_name} {child.last_name}
                </Text>
                <Text style={styles.childMeta}>
                  DOB: {child.date_of_birth} • Gender: {child.gender || 'Not specified'}
                </Text>
              </View>
              <Badge label="Authorized" variant="success" size="sm" />
            </View>

            <View style={styles.concernsBox}>
              <Text style={styles.boxLabel}>Communication Concerns:</Text>
              <View style={styles.chipsRow}>
                {child.communication_concerns.map((c) => (
                  <Badge key={c} label={c} variant="info" size="sm" />
                ))}
              </View>
            </View>

            {child.developmental_history ? (
              <View style={styles.historyBox}>
                <Text style={styles.boxLabel}>Developmental History:</Text>
                <Text style={styles.historyText}>{child.developmental_history}</Text>
              </View>
            ) : null}

            {/* Active Goals for this child */}
            <View style={styles.goalsSection}>
              <Text style={styles.boxLabel}>Active Clinical Therapy Goals:</Text>
              {MOCK_GOALS.map((goal) => (
                <View key={goal.id} style={styles.goalItem}>
                  <View style={styles.goalItemRow}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalAccuracy}>
                      {goal.current_accuracy}% / {goal.target_accuracy}%
                    </Text>
                  </View>
                  <View style={styles.miniBarBg}>
                    <View
                      style={[
                        styles.miniBarFill,
                        { width: `${Math.min(100, goal.current_accuracy)}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.cardActions}>
              <Button
                title="Add Clinical SOAP Note"
                size="sm"
                variant="primary"
                onPress={() => router.push('/(slp)/sessions')}
              />
              <Button
                title="Update Goals"
                size="sm"
                variant="outline"
                onPress={() =>
                  Alert.alert(
                    'Clinical Goals',
                    `Target accuracy editor for ${child.first_name} is active in session documentation.`
                  )
                }
              />
            </View>
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
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: Palette.primaryLight,
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.primaryMuted,
    marginBottom: Spacing.three,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: Palette.primaryDark,
    lineHeight: 16,
  },
  clientCard: {
    marginBottom: Spacing.three,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate900,
  },
  childMeta: {
    fontSize: 12,
    color: Palette.slate500,
    marginTop: 2,
  },
  concernsBox: {
    marginBottom: Spacing.two,
  },
  boxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate600,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  historyBox: {
    backgroundColor: Palette.slate50,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.two,
  },
  historyText: {
    fontSize: 12,
    color: Palette.slate700,
    lineHeight: 17,
  },
  goalsSection: {
    marginTop: Spacing.one,
    marginBottom: Spacing.three,
  },
  goalItem: {
    marginBottom: Spacing.two,
  },
  goalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  goalTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate800,
    flex: 1,
  },
  goalAccuracy: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.primaryDark,
    marginLeft: Spacing.two,
  },
  miniBarBg: {
    height: 6,
    backgroundColor: Palette.slate100,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    backgroundColor: Palette.primary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Palette.slate100,
    paddingTop: Spacing.two,
  },
});
