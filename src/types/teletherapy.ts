export type TargetPhoneme = '/s/' | '/r/' | '/l/' | '/th/';

export type SoundPosition = 'initial' | 'medial' | 'final' | 'blends';

export interface ArticulationCard {
  id: string;
  phoneme: TargetPhoneme;
  word: string;
  image_url: string;
  position: SoundPosition;
  syllables: number;
  cue_prompt: string;
  example_sentence: string;
}

export interface MinimalPair {
  id: string;
  target_word: string;
  contrast_word: string;
  target_phoneme: string;
  contrast_phoneme: string;
  pattern_name: string; // e.g. "Fronting (/s/ vs /t/)", "Gliding (/r/ vs /w/)"
  target_image: string;
  contrast_image: string;
  clinical_tip: string;
}

export interface ClinicalTrialScore {
  total_trials: number;
  correct_count: number;
  accuracy_percentage: number;
  minimal_cue_count: number;
  moderate_cue_count: number;
  maximal_cue_count: number;
}

export interface InSessionNote {
  id: string;
  timestamp: string;
  elapsed_seconds: number;
  note: string;
  category: 'observation' | 'accuracy' | 'behavior' | 'cue';
}

export interface InSessionChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'parent' | 'slp';
  text: string;
  timestamp: string;
  is_stimulus_prompt?: boolean;
  reward_sticker?: 'star' | 'dino' | 'balloon' | 'trophy';
}
