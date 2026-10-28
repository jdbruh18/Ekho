import {
  ChatMessage,
  CoachingTip,
  CredentialDocument,
  HomePracticeExercise,
  MessageThread,
} from '../types/engagement';
import { MOCK_SLP_PROFILES } from './mock-data';

const PARENT_ID = '44444444-4444-4444-a444-444444444444';
const ARJUN_ID = 'aaaaaaa1-aaaa-4aaa-aaaa-aaaaaaaaaaa1';
const NILA_ID = 'aaaaaaa2-aaaa-4aaa-aaaa-aaaaaaaaaaa2';
const MEERA_ID = '11111111-1111-4111-a111-111111111111';
const ANANYA_ID = '22222222-2222-4222-a222-222222222222';
const PRIYA_ID = '33333333-3333-4333-a333-333333333333';

const slpName = (id: string) =>
  (MOCK_SLP_PROFILES.find((s) => s.id === id)?.profile?.full_name ?? 'Your SLP').split(',')[0];
const slpAvatar = (id: string) => MOCK_SLP_PROFILES.find((s) => s.id === id)?.profile?.avatar_url ?? null;

const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGING
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_THREADS: MessageThread[] = [
  {
    id: 'thr-meera-arjun',
    slpId: MEERA_ID,
    slpName: slpName(MEERA_ID),
    slpAvatarUrl: slpAvatar(MEERA_ID),
    parentId: PARENT_ID,
    parentName: 'Anitha Rajan',
    childId: ARJUN_ID,
    childName: 'Arjun',
    patientContext: 'Articulation · /s/ initial position',
    unreadForParent: 2,
    unreadForSlp: 0,
  },
  {
    id: 'thr-ananya-nila',
    slpId: ANANYA_ID,
    slpName: slpName(ANANYA_ID),
    slpAvatarUrl: slpAvatar(ANANYA_ID),
    parentId: PARENT_ID,
    parentName: 'Anitha Rajan',
    childId: NILA_ID,
    childName: 'Nila',
    patientContext: 'Early intervention · expressive language',
    unreadForParent: 0,
    unreadForSlp: 1,
  },
  {
    id: 'thr-priya-arjun',
    slpId: PRIYA_ID,
    slpName: slpName(PRIYA_ID),
    slpAvatarUrl: slpAvatar(PRIYA_ID),
    parentId: PARENT_ID,
    parentName: 'Anitha Rajan',
    childId: ARJUN_ID,
    childName: 'Arjun',
    patientContext: 'Consultation enquiry · fluency screen',
    unreadForParent: 0,
    unreadForSlp: 0,
  },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    threadId: 'thr-meera-arjun',
    sender: 'system',
    text: 'Secure conversation started for Arjun Rajan. Only you and Dr. Meera Nair can see these messages.',
    sentAt: minutesAgo(60 * 24 * 4),
  },
  {
    id: 'm2',
    threadId: 'thr-meera-arjun',
    sender: 'parent',
    text: 'Hi Doctor, Arjun did the mirror snake practice twice yesterday. He still says "tun" for "sun" when he is excited.',
    sentAt: minutesAgo(60 * 20),
  },
  {
    id: 'm3',
    threadId: 'thr-meera-arjun',
    sender: 'slp',
    text: 'That is completely expected at this stage — great job keeping it consistent! When he gets excited, pause, smile, and model "sssun" slowly once. No need to make him repeat.',
    sentAt: minutesAgo(60 * 3),
  },
  {
    id: 'm4',
    threadId: 'thr-meera-arjun',
    sender: 'slp',
    text: 'I have added two new words to his home practice list (soap, seal). See you Thursday at 10:00 AM.',
    sentAt: minutesAgo(45),
  },
  {
    id: 'm5',
    threadId: 'thr-ananya-nila',
    sender: 'slp',
    text: 'Namaskara! Before our first session, could you share a short video of Nila playing with her favourite toy? It helps me understand her natural communication.',
    sentAt: minutesAgo(60 * 30),
  },
  {
    id: 'm6',
    threadId: 'thr-ananya-nila',
    sender: 'parent',
    text: 'Sure, I will record one this evening.',
    sentAt: minutesAgo(60 * 26),
    attachment: { kind: 'photo', label: 'nila_playtime.jpg' },
  },
  {
    id: 'm7',
    threadId: 'thr-priya-arjun',
    sender: 'parent',
    text: 'Do you offer weekend slots for a fluency screening?',
    sentAt: minutesAgo(60 * 24 * 6),
  },
  {
    id: 'm8',
    threadId: 'thr-priya-arjun',
    sender: 'slp',
    text: 'Yes — Saturdays 9 AM to 1 PM. You can book directly from my profile.',
    sentAt: minutesAgo(60 * 24 * 6 - 90),
  },
];

export const QUICK_INQUIRY_PROMPTS = [
  'Can we reschedule our next session?',
  'Is there a slot available this week?',
  'Quick question about home practice',
  'Running 5 minutes late today',
];

export const SLP_QUICK_REPLIES = [
  'Thanks for the update!',
  'Please check the Home Practice tab.',
  'Let us discuss this in our next session.',
];

// ─────────────────────────────────────────────────────────────────────────────
// HOME PRACTICE (derived from the latest SOAP reports in MOCK_SESSION_REPORTS)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_HOME_EXERCISES: HomePracticeExercise[] = [
  {
    id: 'hp-1',
    childId: ARJUN_ID,
    slpId: MEERA_ID,
    sourceReportId: 'rep-1',
    title: 'Mirror Snake Sound Practice',
    targetSound: '/s/',
    description:
      'Sit together in front of a mirror. Make a long "sssss" snake sound, then say each picture word aloud.',
    repetitions: '10 words × 2 rounds',
    durationMinutes: 5,
    frequency: 'Twice daily',
    cueingLevel: 'minimal_cueing',
    words: [
      { word: 'Sun', phonetic: 'sss-un', emoji: '☀️' },
      { word: 'Soap', phonetic: 'sss-ohp', emoji: '🧼' },
      { word: 'Sock', phonetic: 'sss-ok', emoji: '🧦' },
      { word: 'Seal', phonetic: 'sss-eel', emoji: '🦭' },
      { word: 'Sand', phonetic: 'sss-and', emoji: '🏖️' },
      { word: 'Six', phonetic: 'sss-iks', emoji: '6️⃣' },
    ],
    prompts: [
      'Smile and keep your teeth close together.',
      'Tongue tip stays behind the top teeth.',
      'Let the air flow out like a snake — no tongue between the teeth.',
    ],
  },
  {
    id: 'hp-2',
    childId: ARJUN_ID,
    slpId: MEERA_ID,
    sourceReportId: 'rep-1',
    title: 'Story Book /s/ Word Hunt',
    targetSound: '/s/',
    description: 'During the bedtime story, find 3 words starting with "S" and say them clearly together.',
    repetitions: '3 words × 3 times',
    durationMinutes: 5,
    frequency: 'Nightly',
    cueingLevel: 'moderate_cueing',
    words: [
      { word: 'Star', phonetic: 'sss-tar', emoji: '⭐' },
      { word: 'Sleep', phonetic: 'sss-leep', emoji: '😴' },
      { word: 'Snake', phonetic: 'sss-nayk', emoji: '🐍' },
    ],
    prompts: ['Point to the picture first, then say the word.', 'Praise the try, not just the perfect sound.'],
  },
  {
    id: 'hp-3',
    childId: ARJUN_ID,
    slpId: MEERA_ID,
    sourceReportId: 'rep-1',
    title: '3-Word Sentence Builder',
    targetSound: 'Language',
    description: 'Use the picture cards to build agent–action–object sentences, e.g. "Sun is bright."',
    repetitions: '5 sentences',
    durationMinutes: 5,
    frequency: 'After school',
    cueingLevel: 'minimal_cueing',
    words: [
      { word: 'Sun is hot', phonetic: 'sun · iz · hot', emoji: '🌞' },
      { word: 'Seal is swimming', phonetic: 'seel · iz · swim-ing', emoji: '🦭' },
      { word: 'I see sand', phonetic: 'eye · see · sand', emoji: '🏝️' },
    ],
    prompts: ['Model the full sentence once, then pause and wait 5 seconds.'],
  },
  {
    id: 'hp-4',
    childId: NILA_ID,
    slpId: ANANYA_ID,
    sourceReportId: 'intake-nila',
    title: 'Two-Word Bubble Play',
    targetSound: 'Expressive',
    description: 'Blow bubbles and pause. Wait for Nila to request with a word or two before blowing again.',
    repetitions: '8 requests',
    durationMinutes: 6,
    frequency: 'Once daily',
    cueingLevel: 'maximal_prompting',
    words: [
      { word: 'More bubbles', phonetic: 'mor · bub-uls', emoji: '🫧' },
      { word: 'Big bubble', phonetic: 'big · bub-ul', emoji: '🔵' },
      { word: 'Pop!', phonetic: 'pop', emoji: '💥' },
    ],
    prompts: ['Get down to her eye level.', 'Accept any attempt — a sound, sign or word.'],
  },
];

export const MOCK_COACHING_TIPS: CoachingTip[] = [
  {
    id: 'tip-1',
    slpId: MEERA_ID,
    slpName: slpName(MEERA_ID),
    childId: ARJUN_ID,
    title: 'Keep it short and playful',
    body: 'Five focused minutes beat twenty tired ones. Stop while Arjun is still enjoying it.',
    createdAt: minutesAgo(60 * 24 * 3),
  },
  {
    id: 'tip-2',
    slpId: MEERA_ID,
    slpName: slpName(MEERA_ID),
    childId: ARJUN_ID,
    title: 'Recast, do not correct',
    body: 'If he says "tun", reply naturally: "Yes, the sssun is bright!" — stress the sound without saying "wrong".',
    createdAt: minutesAgo(60 * 24 * 3),
  },
  {
    id: 'tip-3',
    slpId: MEERA_ID,
    slpName: slpName(MEERA_ID),
    childId: ARJUN_ID,
    title: 'Use Malayalam too',
    body: 'Practising /s/ in Malayalam words like "സൂര്യൻ" (sooryan) and "സോപ്പ്" (soppu) reinforces the same placement.',
    createdAt: minutesAgo(60 * 24 * 2),
  },
  {
    id: 'tip-4',
    slpId: ANANYA_ID,
    slpName: slpName(ANANYA_ID),
    childId: NILA_ID,
    title: 'Wait time is magic',
    body: 'Count to five silently after offering a choice. Grandparents can join in Kannada.',
    createdAt: minutesAgo(60 * 24),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────────────
export const REVIEW_TAGS = [
  'Patient & Encouraging',
  'Great Visual Aids',
  'Clear Home Steps',
  'Bilingual Support',
  'Child Loved It',
  'On Time',
  'Explains Progress Well',
];

// ─────────────────────────────────────────────────────────────────────────────
// SLP CREDENTIAL VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
export const INITIAL_CREDENTIAL_DOCS: CredentialDocument[] = [
  {
    type: 'rci_license',
    label: 'RCI License (CRR Number)',
    description: 'Rehabilitation Council of India Central Rehabilitation Register certificate.',
    status: 'verified',
    referenceNumber: 'A18392',
    fileName: 'rci_crr_A18392.pdf',
    submittedAt: minutesAgo(60 * 24 * 40),
    reviewerNote: 'Cross-checked against the RCI public register.',
  },
  {
    type: 'state_certificate',
    label: 'State Board / Council Certificate',
    description: 'State paramedical or allied health council registration, where applicable.',
    status: 'action_required',
    referenceNumber: 'KSAHC-2019-4471',
    fileName: 'state_cert_scan.jpg',
    submittedAt: minutesAgo(60 * 24 * 6),
    reviewerNote: 'Image is blurred and the expiry date is unreadable. Please upload a clearer scan.',
  },
  {
    type: 'degree',
    label: 'Degree Certificate (M.Sc. / MASLP / Ph.D.)',
    description: 'Highest qualifying degree in Speech-Language Pathology.',
    status: 'pending_review',
    fileName: 'masl_degree_manipal.pdf',
    submittedAt: minutesAgo(60 * 20),
  },
  {
    type: 'identity',
    label: 'Government Photo ID',
    description: 'Aadhaar (masked), PAN, passport or driving licence.',
    status: 'not_submitted',
  },
];

export const MOCK_UPLOAD_FILES = [
  'scan_from_camera.jpg',
  'certificate_2026.pdf',
  'document_photo.png',
  'registration_copy.pdf',
];
