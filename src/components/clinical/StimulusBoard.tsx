import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Palette, Spacing, BorderRadius } from '../../constants/theme';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ARTICULATION_CARDS, MINIMAL_PAIRS } from '../../lib/clinical-stimulus-data';
import {
  ArticulationCard,
  ClinicalTrialScore,
  MinimalPair,
  TargetPhoneme,
} from '../../types/teletherapy';

interface StimulusBoardProps {
  onClose: () => void;
  onAwardStar: (message: string) => void;
  trialScore: ClinicalTrialScore;
  onRecordTrial: (isCorrect: boolean, cueLevel: 'independent' | 'minimal' | 'moderate' | 'maximal') => void;
  isSlpRole?: boolean;
}

export const StimulusBoard: React.FC<StimulusBoardProps> = ({
  onClose,
  onAwardStar,
  trialScore,
  onRecordTrial,
  isSlpRole = true,
}) => {
  const [boardTab, setBoardTab] = useState<'cards' | 'pairs'>('cards');
  const [selectedPhoneme, setSelectedPhoneme] = useState<TargetPhoneme>('/s/');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [selectedCueLevel, setSelectedCueLevel] = useState<
    'independent' | 'minimal' | 'moderate' | 'maximal'
  >('minimal');

  const filteredCards = ARTICULATION_CARDS.filter((c) => c.phoneme === selectedPhoneme);
  const currentCard: ArticulationCard = filteredCards[currentCardIndex] || filteredCards[0];

  const handleNextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0); // loop
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
    } else {
      setCurrentCardIndex(filteredCards.length - 1);
    }
  };

  const handleSelectPhoneme = (ph: TargetPhoneme) => {
    setSelectedPhoneme(ph);
    setCurrentCardIndex(0);
  };

  return (
    <View style={styles.container}>
      {/* Drawer Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="cards-playing-outline" size={22} color={Palette.primary} />
          <Text style={styles.headerTitle}>Clinical Stimulus Board</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={Palette.slate600} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, boardTab === 'cards' && styles.tabBtnActive]}
          onPress={() => setBoardTab('cards')}
        >
          <Text style={[styles.tabText, boardTab === 'cards' && styles.tabTextActive]}>
            Articulation Cards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, boardTab === 'pairs' && styles.tabBtnActive]}
          onPress={() => setBoardTab('pairs')}
        >
          <Text style={[styles.tabText, boardTab === 'pairs' && styles.tabTextActive]}>
            Minimal Pairs
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {boardTab === 'cards' && (
          <View>
            {/* Phoneme selector chips */}
            <View style={styles.chipsRow}>
              {(['/s/', '/r/', '/l/', '/th/'] as TargetPhoneme[]).map((ph) => {
                const isSelected = selectedPhoneme === ph;
                return (
                  <TouchableOpacity
                    key={ph}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => handleSelectPhoneme(ph)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      Target {ph}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Main Interactive Stimulus Card */}
            {currentCard && (
              <View style={styles.stimulusCard}>
                <View style={styles.cardCounterRow}>
                  <Badge
                    label={`${currentCard.position.toUpperCase()} POSITION`}
                    variant="info"
                    size="sm"
                  />
                  <Text style={styles.counterText}>
                    Card {currentCardIndex + 1} of {filteredCards.length}
                  </Text>
                </View>

                {/* Stimulus Image */}
                <Image source={{ uri: currentCard.image_url }} style={styles.stimulusImage} />

                {/* Target Word & Syllable Dots */}
                <View style={styles.wordSection}>
                  <Text style={styles.targetWord}>{currentCard.word}</Text>
                  <View style={styles.syllablesRow}>
                    {Array.from({ length: currentCard.syllables }).map((_, i) => (
                      <View key={i} style={styles.syllableDot} />
                    ))}
                    <Text style={styles.syllablesLabel}>
                      {currentCard.syllables} {currentCard.syllables === 1 ? 'Syllable' : 'Syllables'}
                    </Text>
                  </View>
                </View>

                {/* Clinician Verbal Cue Prompt */}
                <View style={styles.cueBox}>
                  <View style={styles.cueHeaderRow}>
                    <Ionicons name="bulb-outline" size={16} color="#0284C7" />
                    <Text style={styles.cueTitle}>Therapeutic Cueing Prompt:</Text>
                  </View>
                  <Text style={styles.cueText}>{currentCard.cue_prompt}</Text>
                  <Text style={styles.sentenceText}>&ldquo;{currentCard.example_sentence}&rdquo;</Text>
                </View>

                {/* Carousel Navigation Arrows */}
                <View style={styles.navRow}>
                  <Button
                    title="Previous"
                    size="sm"
                    variant="outline"
                    leftIcon={<Ionicons name="arrow-back" size={16} color={Palette.primary} />}
                    onPress={handlePrevCard}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Next Card"
                    size="sm"
                    variant="primary"
                    rightIcon={<Ionicons name="arrow-forward" size={16} color="#FFF" />}
                    onPress={handleNextCard}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {boardTab === 'pairs' && (
          <View>
            <Text style={styles.pairsSubhead}>
              Contrast minimal pairs to resolve phonological processes (stopping, fronting, gliding).
            </Text>

            {MINIMAL_PAIRS.map((pair: MinimalPair) => (
              <View key={pair.id} style={styles.pairCard}>
                <View style={styles.pairHeader}>
                  <Badge label={pair.pattern_name} variant="warning" size="sm" />
                </View>

                <View style={styles.pairImagesRow}>
                  {/* Target Word */}
                  <View style={styles.pairItem}>
                    <Image source={{ uri: pair.target_image }} style={styles.pairImg} />
                    <Text style={styles.pairWordTarget}>{pair.target_word}</Text>
                    <Text style={styles.pairPhoneme}>Target ({pair.target_phoneme})</Text>
                  </View>

                  <View style={styles.pairVsCircle}>
                    <Text style={styles.pairVsText}>VS</Text>
                  </View>

                  {/* Contrast Word */}
                  <View style={styles.pairItem}>
                    <Image source={{ uri: pair.contrast_image }} style={styles.pairImg} />
                    <Text style={styles.pairWordContrast}>{pair.contrast_word}</Text>
                    <Text style={styles.pairPhoneme}>Contrast ({pair.contrast_phoneme})</Text>
                  </View>
                </View>

                <Text style={styles.pairTip}>{pair.clinical_tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Live Clinical Trial Counter (SLP Only) */}
        {isSlpRole && (
          <View style={styles.trialSection}>
            <View style={styles.trialHeaderRow}>
              <View>
                <Text style={styles.trialTitle}>Live Articulation Trial Counter</Text>
                <Text style={styles.trialSub}>
                  Record objective production responses during call
                </Text>
              </View>
              <View style={styles.accuracyPill}>
                <Text style={styles.accuracyValue}>{trialScore.accuracy_percentage}%</Text>
                <Text style={styles.accuracyLabel}>Accuracy</Text>
              </View>
            </View>

            {/* Trial Stats Tally */}
            <View style={styles.tallyRow}>
              <Text style={styles.tallyItem}>
                Trials: <Text style={{ fontWeight: '700' }}>{trialScore.total_trials}</Text>
              </Text>
              <Text style={styles.tallyItem}>
                Correct: <Text style={{ fontWeight: '700', color: Palette.success }}>{trialScore.correct_count}</Text>
              </Text>
              <Text style={styles.tallyItem}>
                Incorrect: <Text style={{ fontWeight: '700', color: Palette.accent }}>{trialScore.total_trials - trialScore.correct_count}</Text>
              </Text>
            </View>

            {/* Cue Level Selector */}
            <Text style={styles.cueLevelLabel}>Active Assistance Level:</Text>
            <View style={styles.cueLevelRow}>
              {(['independent', 'minimal', 'moderate', 'maximal'] as const).map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[
                    styles.cueLevelBtn,
                    selectedCueLevel === lvl && styles.cueLevelBtnActive,
                  ]}
                  onPress={() => setSelectedCueLevel(lvl)}
                >
                  <Text
                    style={[
                      styles.cueLevelText,
                      selectedCueLevel === lvl && styles.cueLevelTextActive,
                    ]}
                  >
                    {lvl.slice(0, 3).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Trial Action Buttons */}
            <View style={styles.trialActionRow}>
              <TouchableOpacity
                style={[styles.scoreButton, styles.incorrectBtn]}
                onPress={() => onRecordTrial(false, selectedCueLevel)}
              >
                <Ionicons name="close-circle" size={20} color="#DC2626" />
                <Text style={styles.incorrectBtnText}>Incorrect / Cue Failed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.scoreButton, styles.correctBtn]}
                onPress={() => onRecordTrial(true, selectedCueLevel)}
              >
                <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                <Text style={styles.correctBtnText}>+ Correct Target</Text>
              </TouchableOpacity>
            </View>

            {/* Positive Reinforcement Star Award */}
            <TouchableOpacity
              style={styles.starAwardBtn}
              onPress={() => onAwardStar('Great speech sound articulation! ⭐')}
            >
              <Ionicons name="star" size={18} color="#D97706" />
              <Text style={styles.starAwardText}>Award Positive Star to Child ⭐</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Palette.slate200,
    backgroundColor: Palette.white,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.slate900,
  },
  closeBtn: {
    padding: Spacing.one,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Palette.slate100,
    padding: Spacing.one,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two,
    borderRadius: BorderRadius.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabBtnActive: {
    backgroundColor: Palette.white,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.slate600,
  },
  tabTextActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
    justifyContent: 'center',
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.slate300,
  },
  chipActive: {
    backgroundColor: Palette.primaryLight,
    borderColor: Palette.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slate700,
  },
  chipTextActive: {
    color: Palette.primaryDark,
    fontWeight: '700',
  },
  stimulusCard: {
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.slate200,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: Spacing.three,
  },
  cardCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  counterText: {
    fontSize: 12,
    color: Palette.slate500,
    fontWeight: '500',
  },
  stimulusImage: {
    width: '100%',
    height: 180,
    borderRadius: BorderRadius.md,
    backgroundColor: Palette.slate100,
    marginBottom: Spacing.three,
  },
  wordSection: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  targetWord: {
    fontSize: 28,
    fontWeight: '800',
    color: Palette.slate900,
    letterSpacing: 0.5,
  },
  syllablesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  syllableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.primary,
  },
  syllablesLabel: {
    fontSize: 12,
    color: Palette.slate500,
    marginLeft: 4,
  },
  cueBox: {
    backgroundColor: '#F0F9FF',
    padding: Spacing.three,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
    marginBottom: Spacing.three,
  },
  cueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  cueTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
    textTransform: 'uppercase',
  },
  cueText: {
    fontSize: 12,
    color: Palette.slate800,
    lineHeight: 17,
  },
  sentenceText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Palette.slate600,
    marginTop: 4,
  },
  navRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pairsSubhead: {
    fontSize: 13,
    color: Palette.slate600,
    marginBottom: Spacing.two,
    lineHeight: 18,
  },
  pairCard: {
    backgroundColor: Palette.white,
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Palette.slate200,
    marginBottom: Spacing.two,
  },
  pairHeader: {
    marginBottom: Spacing.two,
  },
  pairImagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  pairItem: {
    flex: 1,
    alignItems: 'center',
  },
  pairImg: {
    width: 100,
    height: 80,
    borderRadius: BorderRadius.md,
    marginBottom: 4,
  },
  pairWordTarget: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.primary,
  },
  pairWordContrast: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.accent,
  },
  pairPhoneme: {
    fontSize: 11,
    color: Palette.slate500,
  },
  pairVsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.slate100,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  pairVsText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate600,
  },
  pairTip: {
    fontSize: 12,
    color: Palette.slate700,
    backgroundColor: Palette.slate50,
    padding: Spacing.two,
    borderRadius: BorderRadius.sm,
    fontStyle: 'italic',
  },
  trialSection: {
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1.5,
    borderColor: Palette.primaryLight,
    marginTop: Spacing.two,
  },
  trialHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  trialTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.slate900,
  },
  trialSub: {
    fontSize: 11,
    color: Palette.slate500,
  },
  accuracyPill: {
    backgroundColor: Palette.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  accuracyValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.primaryDark,
  },
  accuracyLabel: {
    fontSize: 9,
    color: Palette.primaryDark,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  tallyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Palette.slate50,
    padding: Spacing.two,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.two,
  },
  tallyItem: {
    fontSize: 12,
    color: Palette.slate700,
  },
  cueLevelLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate600,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cueLevelRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.three,
  },
  cueLevelBtn: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    backgroundColor: Palette.slate100,
    borderWidth: 1,
    borderColor: Palette.slate200,
  },
  cueLevelBtnActive: {
    backgroundColor: Palette.primaryDark,
    borderColor: Palette.primaryDark,
  },
  cueLevelText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slate600,
  },
  cueLevelTextActive: {
    color: Palette.white,
  },
  trialActionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  scoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  incorrectBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  incorrectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  correctBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  correctBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  starAwardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  starAwardText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
});
