import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ChatMessage,
  CredentialDocType,
  CredentialDocument,
  CredentialStatus,
  MessageAttachment,
  MessageSender,
  MessageThread,
  PracticeLogEntry,
  SubmittedReview,
} from '../types/engagement';
import { Review, SlpProfile } from '../types/database';
import {
  INITIAL_CREDENTIAL_DOCS,
  MOCK_HOME_EXERCISES,
  MOCK_MESSAGES,
  MOCK_THREADS,
} from './engagement-mock';
import { generateUUID } from './uuid';

const STORAGE_KEY = '@ekho_engagement_v1';

/** Local calendar date as YYYY-MM-DD (avoids UTC drift in IST evenings). */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysAgoKey(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return localDateKey(d);
}

// Seed: Arjun's caregiver practised on each of the previous 3 days.
const SEED_PRACTICE_LOG: PracticeLogEntry[] = [1, 2, 3].flatMap((n) => [
  { exerciseId: 'hp-1', date: daysAgoKey(n) },
  { exerciseId: 'hp-2', date: daysAgoKey(n) },
]);

interface PersistedState {
  threads: MessageThread[];
  messages: ChatMessage[];
  practiceLog: PracticeLogEntry[];
  reviews: SubmittedReview[];
  credentials: CredentialDocument[];
}

const INITIAL_STATE: PersistedState = {
  threads: MOCK_THREADS,
  messages: MOCK_MESSAGES,
  practiceLog: SEED_PRACTICE_LOG,
  reviews: [],
  credentials: INITIAL_CREDENTIAL_DOCS,
};

interface EngagementContextType extends PersistedState {
  // Messaging
  sendMessage: (threadId: string, sender: MessageSender, text: string, attachment?: MessageAttachment) => void;
  markThreadRead: (threadId: string, viewer: 'parent' | 'slp') => void;
  // Home practice
  isDoneToday: (exerciseId: string) => boolean;
  markDoneToday: (exerciseId: string) => void;
  getStreak: (childId: string) => number;
  // Reviews
  submitReview: (review: Omit<SubmittedReview, 'id' | 'createdAt'>) => void;
  hasReviewed: (appointmentId: string) => boolean;
  getSlpRating: (slp: SlpProfile) => { rating: number; totalReviews: number; reviews: Review[] };
  // Verification
  submitCredential: (type: CredentialDocType, fileName: string, referenceNumber?: string) => void;
  setCredentialStatus: (type: CredentialDocType, status: CredentialStatus, reviewerNote?: string) => void;
}

const EngagementContext = createContext<EngagementContextType | undefined>(undefined);

export function EngagementProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...INITIAL_STATE, ...(JSON.parse(raw) as Partial<PersistedState>) });
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  // ── Messaging ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback<EngagementContextType['sendMessage']>((threadId, sender, text, attachment) => {
    const msg: ChatMessage = {
      id: generateUUID(),
      threadId,
      sender,
      text,
      sentAt: new Date().toISOString(),
      attachment,
    };
    setState((s) => ({
      ...s,
      messages: [...s.messages, msg],
      threads: s.threads.map((t) =>
        t.id !== threadId
          ? t
          : sender === 'parent'
          ? { ...t, unreadForSlp: t.unreadForSlp + 1 }
          : sender === 'slp'
          ? { ...t, unreadForParent: t.unreadForParent + 1 }
          : t
      ),
    }));
  }, []);

  const markThreadRead = useCallback<EngagementContextType['markThreadRead']>((threadId, viewer) => {
    setState((s) => ({
      ...s,
      threads: s.threads.map((t) =>
        t.id !== threadId ? t : viewer === 'parent' ? { ...t, unreadForParent: 0 } : { ...t, unreadForSlp: 0 }
      ),
    }));
  }, []);

  // ── Home practice ──────────────────────────────────────────────────────────
  const isDoneToday = useCallback(
    (exerciseId: string) => {
      const today = localDateKey();
      return state.practiceLog.some((e) => e.exerciseId === exerciseId && e.date === today);
    },
    [state.practiceLog]
  );

  const markDoneToday = useCallback((exerciseId: string) => {
    const today = localDateKey();
    setState((s) =>
      s.practiceLog.some((e) => e.exerciseId === exerciseId && e.date === today)
        ? s
        : { ...s, practiceLog: [...s.practiceLog, { exerciseId, date: today }] }
    );
  }, []);

  /**
   * Consecutive days (ending today, or yesterday if nothing logged yet today)
   * on which at least one of the child's exercises was completed.
   */
  const getStreak = useCallback(
    (childId: string) => {
      const ids = new Set(MOCK_HOME_EXERCISES.filter((e) => e.childId === childId).map((e) => e.id));
      const days = new Set(state.practiceLog.filter((e) => ids.has(e.exerciseId)).map((e) => e.date));
      let offset = days.has(daysAgoKey(0)) ? 0 : 1;
      let streak = 0;
      while (days.has(daysAgoKey(offset))) {
        streak += 1;
        offset += 1;
      }
      return streak;
    },
    [state.practiceLog]
  );

  // ── Reviews ────────────────────────────────────────────────────────────────
  const submitReview = useCallback<EngagementContextType['submitReview']>((review) => {
    setState((s) => ({
      ...s,
      reviews: [{ ...review, id: generateUUID(), createdAt: new Date().toISOString() }, ...s.reviews],
    }));
  }, []);

  const hasReviewed = useCallback(
    (appointmentId: string) => state.reviews.some((r) => r.appointmentId === appointmentId),
    [state.reviews]
  );

  const getSlpRating = useCallback<EngagementContextType['getSlpRating']>(
    (slp) => {
      const mine = state.reviews.filter((r) => r.slpId === slp.id);
      const totalReviews = slp.total_reviews + mine.length;
      const sum = slp.rating * slp.total_reviews + mine.reduce((acc, r) => acc + r.overall, 0);
      const rating = totalReviews > 0 ? sum / totalReviews : 0;
      const asReviews: Review[] = mine.map((r) => ({
        id: r.id,
        slp_id: r.slpId,
        parent_name: r.parentName,
        rating: r.overall,
        date: 'Just now',
        comment: [r.tags.join(' · '), r.comment].filter(Boolean).join('\n'),
      }));
      return { rating, totalReviews, reviews: [...asReviews, ...(slp.reviews ?? [])] };
    },
    [state.reviews]
  );

  // ── Verification ───────────────────────────────────────────────────────────
  const submitCredential = useCallback<EngagementContextType['submitCredential']>(
    (type, fileName, referenceNumber) => {
      setState((s) => ({
        ...s,
        credentials: s.credentials.map((d) =>
          d.type !== type
            ? d
            : {
                ...d,
                fileName,
                referenceNumber: referenceNumber ?? d.referenceNumber,
                status: 'pending_review',
                submittedAt: new Date().toISOString(),
                reviewerNote: undefined,
              }
        ),
      }));
    },
    []
  );

  const setCredentialStatus = useCallback<EngagementContextType['setCredentialStatus']>(
    (type, status, reviewerNote) => {
      setState((s) => ({
        ...s,
        credentials: s.credentials.map((d) => (d.type === type ? { ...d, status, reviewerNote } : d)),
      }));
    },
    []
  );

  const value = useMemo<EngagementContextType>(
    () => ({
      ...state,
      sendMessage,
      markThreadRead,
      isDoneToday,
      markDoneToday,
      getStreak,
      submitReview,
      hasReviewed,
      getSlpRating,
      submitCredential,
      setCredentialStatus,
    }),
    [
      state,
      sendMessage,
      markThreadRead,
      isDoneToday,
      markDoneToday,
      getStreak,
      submitReview,
      hasReviewed,
      getSlpRating,
      submitCredential,
      setCredentialStatus,
    ]
  );

  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>;
}

export function useEngagement() {
  const ctx = useContext(EngagementContext);
  if (!ctx) throw new Error('useEngagement must be used within an EngagementProvider');
  return ctx;
}
