import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isConfiguredSupabase } from './supabase';
import {
  MOCK_PARENT_PROFILE,
  MOCK_SLP_PROFILES,
  MOCK_CHILDREN,
  MOCK_APPOINTMENTS,
  MOCK_SESSION_REPORTS,
} from './mock-data';
import {
  Profile,
  SlpProfile,
  ChildProfile,
  UserRole,
  Appointment,
  SessionReport,
} from '../types/database';
import {
  UserSession,
  ParentSignUpData,
  SlpRegistrationData,
} from '../types/auth';
import { generateUUID } from './uuid';

const STORAGE_SESSION_KEY = '@slp_app_session_v1';
const STORAGE_APPOINTMENTS_KEY = '@slp_app_appointments_v1';
const STORAGE_SESSION_REPORTS_KEY = '@ekho_session_reports_v1';

interface AuthContextType {
  session: UserSession | null;
  profile: Profile | null;
  slpProfile: SlpProfile | null;
  children: ChildProfile[];
  activeChild: ChildProfile | null;
  setActiveChild: (child: ChildProfile | null) => void;
  addChild: (child: ChildProfile) => Promise<void>;
  isLoading: boolean;
  appointments: Appointment[];
  signIn: (
    email: string,
    password: string,
    roleHint?: UserRole
  ) => Promise<{ error: Error | null; session: UserSession | null }>;
  signUpParent: (data: ParentSignUpData) => Promise<{ error: Error | null }>;
  signUpSlp: (data: SlpRegistrationData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  switchRoleDemo: (role: UserRole) => Promise<void>;
  refreshProfile: () => Promise<void>;
  bookAppointment: (
    newAppt: Appointment
  ) => Promise<{ error: Error | null; appointment: Appointment | null }>;
  cancelAppointment: (id: string) => Promise<void>;
  rescheduleAppointment: (id: string, newDate: string) => Promise<void>;
  acceptAppointmentRequest: (id: string) => Promise<void>;
  declineAppointmentRequest: (id: string) => Promise<void>;
  sessionReports: SessionReport[];
  saveSessionReport: (report: SessionReport) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [sessionReports, setSessionReports] = useState<SessionReport[]>(MOCK_SESSION_REPORTS);

  // Load existing session & appointments on mount
  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedSession = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
        if (storedSession) {
          const parsed: UserSession = JSON.parse(storedSession);
          setSession(parsed);
          if (parsed.children && parsed.children.length > 0) {
            setActiveChild(parsed.children[0]);
          }
        }

        const storedAppts = await AsyncStorage.getItem(STORAGE_APPOINTMENTS_KEY);
        if (storedAppts) {
          setAppointments(JSON.parse(storedAppts));
        }

        const storedReports = await AsyncStorage.getItem(STORAGE_SESSION_REPORTS_KEY);
        if (storedReports) {
          setSessionReports(JSON.parse(storedReports));
        }
      } catch (err) {
        console.warn('Failed to load data from storage', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredData();
  }, []);

  const saveSession = async (newSession: UserSession | null) => {
    setSession(newSession);
    if (newSession) {
      await AsyncStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newSession));
      if (newSession.children && newSession.children.length > 0) {
        setActiveChild(newSession.children[0]);
      } else {
        setActiveChild(null);
      }
    } else {
      await AsyncStorage.removeItem(STORAGE_SESSION_KEY);
      setActiveChild(null);
    }
  };

  const addChild = async (newChild: ChildProfile) => {
    const childWithId: ChildProfile = {
      ...newChild,
      id: newChild.id && newChild.id.length > 10 ? newChild.id : generateUUID(),
      parent_id: session?.id || newChild.parent_id || generateUUID(),
      created_at: newChild.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const currentChildren = session?.children || [];
    const updatedChildren = [...currentChildren, childWithId];

    if (session) {
      const updatedSession: UserSession = {
        ...session,
        children: updatedChildren,
      };
      await saveSession(updatedSession);
    }
    setActiveChild(childWithId);

    if (isConfiguredSupabase) {
      try {
        await supabase.from('child_profiles').insert({
          id: childWithId.id,
          parent_id: childWithId.parent_id,
          first_name: childWithId.first_name,
          last_name: childWithId.last_name,
          date_of_birth: childWithId.date_of_birth,
          gender: childWithId.gender || null,
          communication_concerns: childWithId.communication_concerns || [],
          developmental_history: childWithId.developmental_history || null,
          previous_assessments: childWithId.previous_assessments || null,
          notes: childWithId.notes || null,
        });
      } catch (err) {
        console.warn('Failed to insert child_profile to Supabase', err);
      }
    }
  };

  const persistAppointments = async (updated: Appointment[]) => {
    setAppointments(updated);
    try {
      await AsyncStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save appointments to storage', err);
    }
  };

  const bookAppointment = async (
    newAppt: Appointment
  ): Promise<{ error: Error | null; appointment: Appointment | null }> => {
    try {
      const updatedList = [newAppt, ...appointments];
      await persistAppointments(updatedList);

      if (isConfiguredSupabase) {
        await supabase.from('appointments').insert({
          id: newAppt.id,
          parent_id: newAppt.parent_id,
          slp_id: newAppt.slp_id,
          child_id: newAppt.child_id,
          scheduled_at: newAppt.scheduled_at,
          duration_minutes: newAppt.duration_minutes,
          status: newAppt.status,
          consultation_type: newAppt.consultation_type,
          amount_paid: newAppt.amount_paid,
          payment_status: newAppt.payment_status,
          notes: newAppt.notes,
        });
      }

      return { error: null, appointment: newAppt };
    } catch (err: any) {
      return {
        error: err instanceof Error ? err : new Error(String(err)),
        appointment: null,
      };
    }
  };

  const cancelAppointment = async (id: string) => {
    const updated = appointments.map((appt) =>
      appt.id === id
        ? {
            ...appt,
            status: 'cancelled' as const,
            payment_status: 'refunded' as const,
          }
        : appt
    );
    await persistAppointments(updated);

    if (isConfiguredSupabase) {
      await supabase
        .from('appointments')
        .update({ status: 'cancelled', payment_status: 'refunded' })
        .eq('id', id);
    }
  };

  const rescheduleAppointment = async (id: string, newDate: string) => {
    const updated = appointments.map((appt) =>
      appt.id === id
        ? {
            ...appt,
            scheduled_at: newDate,
            status: 'scheduled' as const,
          }
        : appt
    );
    await persistAppointments(updated);

    if (isConfiguredSupabase) {
      await supabase
        .from('appointments')
        .update({ scheduled_at: newDate, status: 'scheduled' })
        .eq('id', id);
    }
  };

  const acceptAppointmentRequest = async (id: string) => {
    const updated = appointments.map((appt) =>
      appt.id === id
        ? {
            ...appt,
            status: 'scheduled' as const,
          }
        : appt
    );
    await persistAppointments(updated);

    if (isConfiguredSupabase) {
      await supabase
        .from('appointments')
        .update({ status: 'scheduled' })
        .eq('id', id);
    }
  };

  const declineAppointmentRequest = async (id: string) => {
    const updated = appointments.map((appt) =>
      appt.id === id
        ? {
            ...appt,
            status: 'cancelled' as const,
            payment_status: 'refunded' as const,
          }
        : appt
    );
    await persistAppointments(updated);

    if (isConfiguredSupabase) {
      await supabase
        .from('appointments')
        .update({ status: 'cancelled', payment_status: 'refunded' })
        .eq('id', id);
    }
  };

  const signIn = async (
    email: string,
    password: string,
    roleHint?: UserRole
  ): Promise<{ error: Error | null; session: UserSession | null }> => {
    setIsLoading(true);
    try {
      if (isConfiguredSupabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (data.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const role = (profileData?.role || roleHint || 'parent') as UserRole;

          let slpData: SlpProfile | null = null;
          let childrenData: ChildProfile[] = [];

          if (role === 'slp') {
            const { data: sData } = await supabase
              .from('slp_profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();
            slpData = sData;
          } else if (role === 'parent') {
            const { data: cData } = await supabase
              .from('child_profiles')
              .select('*')
              .eq('parent_id', data.user.id);
            childrenData = cData || [];
          }

          const userSession: UserSession = {
            id: data.user.id,
            email: data.user.email || email,
            role,
            profile: profileData || {
              id: data.user.id,
              role,
              full_name: data.user.user_metadata?.full_name || email.split('@')[0],
              email: data.user.email || email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            slpProfile: slpData,
            children: childrenData,
          };

          await saveSession(userSession);
          return { error: null, session: userSession };
        }
      }

      // Offline / Local Simulation Mode (Matches seed data credentials)
      const normalizedEmail = email.toLowerCase().trim();
      let mockRole: UserRole = roleHint || 'parent';
      let mockProfile: Profile;
      let mockSlp: SlpProfile | null = null;
      let mockKids: ChildProfile[] = [];

      if (normalizedEmail.includes('maya') || normalizedEmail.includes('slp')) {
        mockRole = 'slp';
        mockSlp = MOCK_SLP_PROFILES[0];
        mockProfile = mockSlp.profile || {
          id: mockSlp.id,
          role: 'slp',
          full_name: 'Dr. Maya Lin, Ph.D., CCC-SLP',
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else if (normalizedEmail.includes('admin')) {
        mockRole = 'admin';
        mockProfile = {
          id: '99999999-9999-4999-a999-999999999999',
          role: 'admin',
          full_name: 'Platform Administrator',
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      } else {
        mockRole = 'parent';
        mockProfile = {
          ...MOCK_PARENT_PROFILE,
          email,
        };
        mockKids = MOCK_CHILDREN;
      }

      const simSession: UserSession = {
        id: mockProfile.id,
        email,
        role: mockRole,
        profile: mockProfile,
        slpProfile: mockSlp,
        children: mockKids,
      };

      await saveSession(simSession);
      return { error: null, session: simSession };
    } catch (err: any) {
      return {
        error: err instanceof Error ? err : new Error(String(err)),
        session: null,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpParent = async (data: ParentSignUpData): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    try {
      const generatedParentId = generateUUID();
      const newUserId = isConfiguredSupabase
        ? (await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                full_name: data.fullName,
                role: 'parent',
              },
            },
          })).data.user?.id || generatedParentId
        : generatedParentId;

      const newParentProfile: Profile = {
        id: newUserId,
        role: 'parent',
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newChild: ChildProfile = {
        id: generateUUID(),
        parent_id: newUserId,
        first_name: data.childFirstName,
        last_name: data.childLastName,
        date_of_birth: data.childDob,
        gender: data.childGender || 'Not Specified',
        communication_concerns: data.communicationConcerns,
        developmental_history: data.developmentalHistory || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isConfiguredSupabase) {
        await supabase.from('profiles').upsert(newParentProfile);
        await supabase.from('child_profiles').insert(newChild);
      }

      const newSession: UserSession = {
        id: newUserId,
        email: data.email,
        role: 'parent',
        profile: newParentProfile,
        children: [newChild],
      };

      await saveSession(newSession);
      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    } finally {
      setIsLoading(false);
    }
  };

  const signUpSlp = async (data: SlpRegistrationData): Promise<{ error: Error | null }> => {
    setIsLoading(true);
    try {
      const generatedSlpId = generateUUID();
      const newUserId = isConfiguredSupabase
        ? (await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                full_name: data.fullName,
                role: 'slp',
              },
            },
          })).data.user?.id || generatedSlpId
        : generatedSlpId;

      const newProfile: Profile = {
        id: newUserId,
        role: 'slp',
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const newSlpProfile: SlpProfile = {
        id: newUserId,
        title: data.title || 'Speech-Language Pathologist',
        license_number: data.licenseNumber,
        years_of_experience: Number(data.yearsOfExperience) || 1,
        degrees: data.degrees,
        certifications: data.certifications,
        specializations: data.specializations,
        languages_spoken: data.languagesSpoken.length > 0 ? data.languagesSpoken : ['English'],
        hourly_rate: Number(data.hourlyRate) || 75.0,
        bio: data.bio || '',
        is_verified: false,
        verification_status: 'pending',
        available_online: true,
        rating: 5.0,
        total_reviews: 0,
        total_sessions: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: newProfile,
      };

      if (isConfiguredSupabase) {
        await supabase.from('profiles').upsert(newProfile);
        await supabase.from('slp_profiles').upsert(newSlpProfile);
      }

      const newSession: UserSession = {
        id: newUserId,
        email: data.email,
        role: 'slp',
        profile: newProfile,
        slpProfile: newSlpProfile,
        children: [],
      };

      await saveSession(newSession);
      return { error: null };
    } catch (err: any) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isConfiguredSupabase) {
        await supabase.auth.signOut();
      }
    } finally {
      await saveSession(null);
      setIsLoading(false);
    }
  };

  // Allows instant switching for testing/demo purposes
  const switchRoleDemo = async (role: UserRole) => {
    setIsLoading(true);
    try {
      if (role === 'parent') {
        await saveSession({
          id: MOCK_PARENT_PROFILE.id,
          email: MOCK_PARENT_PROFILE.email,
          role: 'parent',
          profile: MOCK_PARENT_PROFILE,
          children: MOCK_CHILDREN,
        });
      } else if (role === 'slp') {
        const slp = MOCK_SLP_PROFILES[0];
        await saveSession({
          id: slp.id,
          email: slp.profile?.email || 'maya.lin@slptherapy.test',
          role: 'slp',
          profile: slp.profile!,
          slpProfile: slp,
          children: [],
        });
      } else if (role === 'admin') {
        const adminProfile: Profile = {
          id: '99999999-9999-4999-a999-999999999999',
          role: 'admin',
          full_name: 'Platform Administrator',
          email: 'admin@slptherapy.test',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await saveSession({
          id: adminProfile.id,
          email: adminProfile.email,
          role: 'admin',
          profile: adminProfile,
          children: [],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!session) return;
    try {
      if (isConfiguredSupabase) {
        const { data: pData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.id)
          .single();
        if (pData) {
          setSession((prev) => (prev ? { ...prev, profile: pData } : null));
        }
      }
    } catch (err) {
      console.warn('Failed to refresh profile', err);
    }
  };

  const saveSessionReport = async (report: SessionReport) => {
    const updatedReports = [report, ...sessionReports.filter((r) => r.id !== report.id)];
    setSessionReports(updatedReports);
    await AsyncStorage.setItem(STORAGE_SESSION_REPORTS_KEY, JSON.stringify(updatedReports));

    // Mark corresponding appointment as completed
    const updatedAppts = appointments.map((a) =>
      a.id === report.appointment_id ? { ...a, status: 'completed' as const } : a
    );
    setAppointments(updatedAppts);
    await AsyncStorage.setItem(STORAGE_APPOINTMENTS_KEY, JSON.stringify(updatedAppts));

    if (isConfiguredSupabase) {
      try {
        await supabase.from('session_reports').upsert(report);
        await supabase
          .from('appointments')
          .update({ status: 'completed' })
          .eq('id', report.appointment_id);
      } catch (err) {
        console.log('Saved session report locally', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile: session?.profile ?? null,
        slpProfile: session?.slpProfile ?? null,
        children: session?.children ?? [],
        activeChild,
        setActiveChild,
        addChild,
        isLoading,
        appointments,
        sessionReports,
        saveSessionReport,
        signIn,
        signUpParent,
        signUpSlp,
        signOut,
        switchRoleDemo,
        refreshProfile,
        bookAppointment,
        cancelAppointment,
        rescheduleAppointment,
        acceptAppointmentRequest,
        declineAppointmentRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
