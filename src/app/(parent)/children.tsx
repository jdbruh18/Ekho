import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Header } from '../../components/Header';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../lib/auth-context';
import { generateUUID } from '../../lib/uuid';
import { ChildProfile } from '../../types/database';

export default function ChildrenScreen() {
  const { session, children, activeChild, setActiveChild, addChild } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  // New child form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [concern, setConcern] = useState('');
  const [localChildren, setLocalChildren] = useState<ChildProfile[]>(
    children && children.length > 0
      ? children
      : [
          {
            id: 'demo-child-1',
            parent_id: 'parent-1',
            first_name: 'Leo',
            last_name: 'Watson',
            date_of_birth: '2021-04-15',
            gender: 'Male',
            communication_concerns: ['Speech sound disorders', 'Articulation /s/ and /r/'],
            developmental_history: 'Motor milestones normal. Difficulty with blends and /s/ sound.',
            notes: 'Enjoys dinosaur games and interactive naming tasks.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]
  );

  const displayChildren = children && children.length > 0 ? children : localChildren;

  const handleAddChild = async () => {
    if (!firstName.trim() || !lastName.trim() || !dob.trim()) {
      Alert.alert('Incomplete Form', 'Please enter first name, last name, and date of birth.');
      return;
    }

    const dobRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dobRegex.test(dob.trim())) {
      Alert.alert('Invalid Date Format', 'Please enter date of birth in YYYY-MM-DD format (e.g. 2021-04-15).');
      return;
    }

    const newChild: ChildProfile = {
      id: generateUUID(),
      parent_id: session?.id || 'demo-parent-1',
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      date_of_birth: dob.trim(),
      gender: 'Child',
      communication_concerns: concern.trim() ? [concern.trim()] : ['General speech evaluation'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await addChild(newChild);
      setLocalChildren((prev) => [...prev, newChild]);
      setActiveChild(newChild);
      setFirstName('');
      setLastName('');
      setDob('');
      setConcern('');
      setModalVisible(false);
      Alert.alert('Success', `${newChild.first_name}'s profile has been saved.`);
    } catch {
      Alert.alert('Error', 'Failed to save child profile. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="Child Profiles" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topInfoRow}>
          <Text style={styles.subtext}>
            Manage and update pediatric records. Authorized speech therapists access these clinical
            notes during therapy sessions.
          </Text>
        </View>

        {displayChildren.map((child) => {
          const isSelected = activeChild?.id === child.id || (!activeChild && child === displayChildren[0]);
          return (
            <Card
              key={child.id}
              style={[styles.childCard, isSelected && styles.selectedChildCard]}
              variant={isSelected ? 'elevated' : 'outlined'}
            >
              <View style={styles.cardHeader}>
                <View style={styles.childHeaderLeft}>
                  <View style={styles.avatarCircle}>
                    <MaterialCommunityIcons
                      name="human-child"
                      size={24}
                      color={Palette.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.childName}>
                      {child.first_name} {child.last_name}
                    </Text>
                    <Text style={styles.childAge}>
                      DOB: {child.date_of_birth} • {child.gender || 'Child'}
                    </Text>
                  </View>
                </View>

                {isSelected ? (
                  <Badge label="Active" variant="success" size="sm" />
                ) : (
                  <Button
                    title="Select"
                    size="sm"
                    variant="outline"
                    onPress={() => setActiveChild(child)}
                  />
                )}
              </View>

              <View style={styles.detailsBox}>
                <Text style={styles.detailLabel}>Communication Concerns:</Text>
                <View style={styles.chipsRow}>
                  {child.communication_concerns.map((c) => (
                    <Badge key={c} label={c} variant="info" size="sm" />
                  ))}
                </View>

                {child.developmental_history ? (
                  <View style={{ marginTop: Spacing.two }}>
                    <Text style={styles.detailLabel}>Developmental Background:</Text>
                    <Text style={styles.detailValue}>{child.developmental_history}</Text>
                  </View>
                ) : null}
              </View>
            </Card>
          );
        })}

        <Button
          title="+ Add Another Child Profile"
          variant="secondary"
          size="md"
          onPress={() => setModalVisible(true)}
          style={styles.addBtn}
        />
      </ScrollView>

      {/* Add Child Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Child Profile</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={Palette.slate600} />
                </TouchableOpacity>
              </View>

            <Input
              label="First Name"
              required
              placeholder="e.g. Maya"
              value={firstName}
              onChangeText={setFirstName}
            />

            <Input
              label="Last Name"
              required
              placeholder="e.g. Harris"
              value={lastName}
              onChangeText={setLastName}
            />

            <Input
              label="Date of Birth"
              required
              placeholder="YYYY-MM-DD"
              value={dob}
              onChangeText={setDob}
            />

            <Input
              label="Primary Concern"
              placeholder="e.g. Fluency / Stuttering"
              value={concern}
              onChangeText={setConcern}
            />

            <Button
              title="Save Child Profile"
              size="lg"
              variant="primary"
              onPress={handleAddChild}
              style={{ marginTop: Spacing.two }}
            />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  topInfoRow: {
    marginBottom: Spacing.three,
  },
  subtext: {
    fontSize: 13,
    color: Palette.slate600,
    lineHeight: 18,
  },
  childCard: {
    marginBottom: Spacing.three,
  },
  selectedChildCard: {
    borderColor: Palette.primary,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  childHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatarCircle: {
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
  childAge: {
    fontSize: 12,
    color: Palette.slate500,
  },
  detailsBox: {
    backgroundColor: Palette.slate50,
    borderRadius: BorderRadius.md,
    padding: Spacing.three,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate600,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 12,
    color: Palette.slate800,
    lineHeight: 17,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  addBtn: {
    marginTop: Spacing.two,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.slate900,
  },
});
