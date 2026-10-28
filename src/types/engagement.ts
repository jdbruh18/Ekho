// Types for parent–SLP engagement features: messaging, home practice,
// post-session reviews and SLP credential verification.

export type MessageSender = 'parent' | 'slp' | 'system';

export type MessageAttachment =
  | { kind: 'photo'; label: string }
  | { kind: 'audio'; label: string; durationSec: number };

export interface ChatMessage {
  id: string;
  threadId: string;
  sender: MessageSender;
  text: string;
  sentAt: string; // ISO
  attachment?: MessageAttachment;
}

export interface MessageThread {
  id: string;
  slpId: string;
  slpName: string;
  slpAvatarUrl?: string | null;
  parentId: string;
  parentName: string;
  childId: string;
  childName: string;
  /** Short clinical context shown under the name, e.g. "Articulation · /s/ goal" */
  patientContext: string;
  /** Unread counts per side so both roles see accurate badges */
  unreadForParent: number;
  unreadForSlp: number;
}

export type CueingLevel = 'independent' | 'minimal_cueing' | 'moderate_cueing' | 'maximal_prompting';

export interface PracticeWord {
  word: string;
  /** Simple caregiver-readable phonetic hint, e.g. "sss-un" */
  phonetic: string;
  emoji: string;
}

export interface HomePracticeExercise {
  id: string;
  childId: string;
  slpId: string;
  sourceReportId: string;
  title: string;
  targetSound: string;
  description: string;
  repetitions: string; // e.g. "10 words × 2 rounds"
  durationMinutes: number;
  frequency: string;
  cueingLevel: CueingLevel;
  words: PracticeWord[];
  prompts: string[];
}

export interface CoachingTip {
  id: string;
  slpId: string;
  slpName: string;
  childId: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface PracticeLogEntry {
  exerciseId: string;
  date: string; // YYYY-MM-DD (local)
}

export interface ReviewCategoryScores {
  communication: number;
  punctuality: number;
  engagement: number;
}

export interface SubmittedReview {
  id: string;
  appointmentId: string;
  slpId: string;
  parentName: string;
  scores: ReviewCategoryScores;
  overall: number;
  tags: string[];
  comment: string;
  createdAt: string;
}

export type CredentialDocType = 'rci_license' | 'state_certificate' | 'degree' | 'identity';

export type CredentialStatus = 'not_submitted' | 'pending_review' | 'verified' | 'action_required';

export interface CredentialDocument {
  type: CredentialDocType;
  label: string;
  description: string;
  status: CredentialStatus;
  fileName?: string;
  referenceNumber?: string;
  submittedAt?: string;
  reviewerNote?: string;
}
