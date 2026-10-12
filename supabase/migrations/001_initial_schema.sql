-- ==============================================================================
-- SPEECH-LANGUAGE PATHOLOGY (SLP) THERAPY PLATFORM
-- Migration 001: Initial Schema, Core Tables, RLS Policies & Indexes
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. PROFILES (Base user table linked to auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('parent', 'slp', 'admin')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for role and email
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ==============================================================================
-- 2. SLP PROFILES (Detailed credentials and marketplace info)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.slp_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Speech-Language Pathologist',
    degrees TEXT[] DEFAULT '{}'::text[] NOT NULL,
    certifications TEXT[] DEFAULT '{}'::text[] NOT NULL,
    license_number TEXT NOT NULL,
    years_of_experience INTEGER DEFAULT 0 NOT NULL,
    specializations TEXT[] DEFAULT '{}'::text[] NOT NULL,
    languages_spoken TEXT[] DEFAULT '{"English"}'::text[] NOT NULL,
    bio TEXT DEFAULT '' NOT NULL,
    hourly_rate NUMERIC(10, 2) DEFAULT 60.00 NOT NULL CHECK (hourly_rate >= 0),
    is_verified BOOLEAN DEFAULT false NOT NULL,
    verification_status TEXT DEFAULT 'pending' NOT NULL CHECK (verification_status IN ('pending', 'approved', 'rejected')),
    verification_notes TEXT,
    available_online BOOLEAN DEFAULT true NOT NULL,
    working_hours JSONB DEFAULT '{
      "monday": {"start": "09:00", "end": "17:00"},
      "tuesday": {"start": "09:00", "end": "17:00"},
      "wednesday": {"start": "09:00", "end": "17:00"},
      "thursday": {"start": "09:00", "end": "17:00"},
      "friday": {"start": "09:00", "end": "17:00"}
    }'::jsonb,
    rating NUMERIC(3, 2) DEFAULT 5.00 NOT NULL CHECK (rating >= 1.00 AND rating <= 5.00),
    total_reviews INTEGER DEFAULT 0 NOT NULL CHECK (total_reviews >= 0),
    total_sessions INTEGER DEFAULT 0 NOT NULL CHECK (total_sessions >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_slp_verified ON public.slp_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_slp_status ON public.slp_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_slp_rating ON public.slp_profiles(rating DESC);

-- ==============================================================================
-- 3. CHILD PROFILES (Parent ownership and pediatric clinical history)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.child_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT,
    communication_concerns TEXT[] DEFAULT '{}'::text[] NOT NULL,
    developmental_history TEXT,
    previous_assessments TEXT,
    notes TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_child_parent ON public.child_profiles(parent_id);

-- ==============================================================================
-- 4. CHILD AUTHORIZATIONS (Consent & Authorization between Parent, Child & SLP)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.child_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    slp_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    granted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    revoked_at TIMESTAMPTZ,
    CONSTRAINT uq_child_slp_authorization UNIQUE (child_id, slp_id)
);

CREATE INDEX IF NOT EXISTS idx_child_auth_slp ON public.child_authorizations(slp_id, status);
CREATE INDEX IF NOT EXISTS idx_child_auth_child ON public.child_authorizations(child_id, status);

-- ==============================================================================
-- 5. APPOINTMENTS (Booking, Calendar, Online Video Session Link)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    slp_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 45 NOT NULL CHECK (duration_minutes > 0),
    status TEXT DEFAULT 'scheduled' NOT NULL CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled', 'rescheduled')),
    consultation_type TEXT DEFAULT 'online' NOT NULL CHECK (consultation_type IN ('online', 'in_person')),
    meeting_link TEXT,
    amount_paid NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (amount_paid >= 0),
    payment_status TEXT DEFAULT 'pending' NOT NULL CHECK (payment_status IN ('pending', 'paid', 'refunded', 'waived')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_parent ON public.appointments(parent_id);
CREATE INDEX IF NOT EXISTS idx_appointments_slp ON public.appointments(slp_id);
CREATE INDEX IF NOT EXISTS idx_appointments_child ON public.appointments(child_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON public.appointments(scheduled_at);

-- ==============================================================================
-- 6. CHILD GOALS (Individualized Speech & Language Progress Tracking)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.child_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    slp_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    baseline_accuracy NUMERIC(5, 2) DEFAULT 0.00 NOT NULL CHECK (baseline_accuracy >= 0 AND baseline_accuracy <= 100),
    current_accuracy NUMERIC(5, 2) DEFAULT 0.00 NOT NULL CHECK (current_accuracy >= 0 AND current_accuracy <= 100),
    target_accuracy NUMERIC(5, 2) DEFAULT 80.00 NOT NULL CHECK (target_accuracy >= 0 AND target_accuracy <= 100),
    status TEXT DEFAULT 'in_progress' NOT NULL CHECK (status IN ('not_started', 'in_progress', 'achieved', 'discontinued')),
    target_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_child ON public.child_goals(child_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON public.child_goals(status);

-- ==============================================================================
-- 7. SESSION REPORTS (Structured Post-Therapy Clinical Documentation)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.session_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    child_id UUID NOT NULL REFERENCES public.child_profiles(id) ON DELETE CASCADE,
    slp_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    duration_minutes INTEGER DEFAULT 45 NOT NULL CHECK (duration_minutes > 0),
    activities_completed TEXT[] DEFAULT '{}'::text[] NOT NULL,
    child_performance_rating TEXT CHECK (child_performance_rating IN ('emerging', 'developing', 'consistent', 'mastered')),
    accuracy_percentage NUMERIC(5, 2) CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
    assistance_level TEXT CHECK (assistance_level IN ('independent', 'minimal_cueing', 'moderate_cueing', 'maximal_prompting')),
    strengths TEXT,
    difficulties_observed TEXT,
    behavior_participation TEXT,
    clinical_notes TEXT NOT NULL,
    home_practice_instructions TEXT,
    home_practice_exercises JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_appointment ON public.session_reports(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reports_child ON public.session_reports(child_id);
CREATE INDEX IF NOT EXISTS idx_reports_slp ON public.session_reports(slp_id);

-- ==============================================================================
-- 8. HELPER FUNCTIONS FOR SECURITY & AUTHORIZATION
-- ==============================================================================

-- Check if current authenticated user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Check if an SLP is explicitly authorized to view or manage a child's records
CREATE OR REPLACE FUNCTION public.is_slp_authorized_for_child(p_child_id UUID, p_slp_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    -- Direct active authorization grant
    SELECT 1 FROM public.child_authorizations
    WHERE child_id = p_child_id
      AND slp_id = p_slp_id
      AND status = 'active'
  ) OR EXISTS (
    -- Or booked appointment between SLP and this child
    SELECT 1 FROM public.appointments
    WHERE child_id = p_child_id
      AND slp_id = p_slp_id
      AND status IN ('scheduled', 'completed', 'pending')
  );
$$;

-- Automatic timestamp updater
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Trigger to automatically create active child authorization on appointment creation
CREATE OR REPLACE FUNCTION public.handle_appointment_authorization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.child_authorizations (child_id, slp_id, parent_id, status, granted_at)
  VALUES (NEW.child_id, NEW.slp_id, NEW.parent_id, 'active', timezone('utc'::text, now()))
  ON CONFLICT (child_id, slp_id) 
  DO UPDATE SET status = 'active', revoked_at = NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_appointment_authorization
AFTER INSERT OR UPDATE OF status ON public.appointments
FOR EACH ROW
WHEN (NEW.status IN ('scheduled', 'completed', 'pending'))
EXECUTE FUNCTION public.handle_appointment_authorization();

-- Attach updated_at triggers
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_slp_profiles_updated_at BEFORE UPDATE ON public.slp_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_child_profiles_updated_at BEFORE UPDATE ON public.child_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_child_goals_updated_at BEFORE UPDATE ON public.child_goals FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_session_reports_updated_at BEFORE UPDATE ON public.session_reports FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slp_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_reports ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- Anyone authenticated can view user profiles (needed for directory, therapist display)
CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can update their own profile; Admin can update any
CREATE POLICY "Users can update own profile or admin"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin(auth.uid()))
WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- B. SLP PROFILES POLICIES
-- ------------------------------------------------------------------------------
-- All authenticated users can view verified SLP profiles; SLP can view own unverified profile; Admin can view all
CREATE POLICY "SLP profiles viewable if verified or owned or admin"
ON public.slp_profiles FOR SELECT
TO authenticated
USING (
  is_verified = true 
  OR auth.uid() = id 
  OR public.is_admin(auth.uid())
);

-- SLPs can insert their own profile
CREATE POLICY "SLP can insert own profile"
ON public.slp_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- SLPs can update their own profile; Admin can update any (e.g. verification approval)
CREATE POLICY "SLP can update own profile or admin"
ON public.slp_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin(auth.uid()))
WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- C. CHILD PROFILES POLICIES (Strict Privacy: Parent & Authorized SLP only)
-- ------------------------------------------------------------------------------
-- Parents can view their own children; Authorized SLPs can view; Admin can view
CREATE POLICY "Child profiles viewable by parent or authorized SLP or admin"
ON public.child_profiles FOR SELECT
TO authenticated
USING (
  parent_id = auth.uid()
  OR public.is_slp_authorized_for_child(id, auth.uid())
  OR public.is_admin(auth.uid())
);

-- Parents can create child profiles for themselves
CREATE POLICY "Parents can insert child profiles"
ON public.child_profiles FOR INSERT
TO authenticated
WITH CHECK (parent_id = auth.uid() OR public.is_admin(auth.uid()));

-- Parents can update their child profile; Admin can update
CREATE POLICY "Parents or admin can update child profiles"
ON public.child_profiles FOR UPDATE
TO authenticated
USING (parent_id = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (parent_id = auth.uid() OR public.is_admin(auth.uid()));

-- Parents can delete their child profile
CREATE POLICY "Parents or admin can delete child profiles"
ON public.child_profiles FOR DELETE
TO authenticated
USING (parent_id = auth.uid() OR public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- D. CHILD AUTHORIZATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Child authorizations viewable by parent, slp or admin"
ON public.child_authorizations FOR SELECT
TO authenticated
USING (
  parent_id = auth.uid()
  OR slp_id = auth.uid()
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Parents or admin can manage child authorizations"
ON public.child_authorizations FOR ALL
TO authenticated
USING (parent_id = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (parent_id = auth.uid() OR public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- E. APPOINTMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Appointments viewable by involved parent, slp or admin"
ON public.appointments FOR SELECT
TO authenticated
USING (
  parent_id = auth.uid()
  OR slp_id = auth.uid()
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Parents can book appointments"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (parent_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Involved parties can update appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (
  parent_id = auth.uid()
  OR slp_id = auth.uid()
  OR public.is_admin(auth.uid())
)
WITH CHECK (
  parent_id = auth.uid()
  OR slp_id = auth.uid()
  OR public.is_admin(auth.uid())
);

-- ------------------------------------------------------------------------------
-- F. CHILD GOALS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Child goals viewable by authorized parent, slp or admin"
ON public.child_goals FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles
    WHERE id = child_goals.child_id AND parent_id = auth.uid()
  )
  OR public.is_slp_authorized_for_child(child_id, auth.uid())
  OR public.is_admin(auth.uid())
);

CREATE POLICY "Authorized SLPs, parents, or admin can manage goals"
ON public.child_goals FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.child_profiles
    WHERE id = child_goals.child_id AND parent_id = auth.uid()
  )
  OR public.is_slp_authorized_for_child(child_id, auth.uid())
  OR public.is_admin(auth.uid())
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.child_profiles
    WHERE id = child_goals.child_id AND parent_id = auth.uid()
  )
  OR public.is_slp_authorized_for_child(child_id, auth.uid())
  OR public.is_admin(auth.uid())
);

-- ------------------------------------------------------------------------------
-- G. SESSION REPORTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Session reports viewable by parent, authoring slp or admin"
ON public.session_reports FOR SELECT
TO authenticated
USING (
  slp_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.child_profiles
    WHERE id = session_reports.child_id AND parent_id = auth.uid()
  )
  OR public.is_admin(auth.uid())
);

CREATE POLICY "SLPs can create session reports for their appointments"
ON public.session_reports FOR INSERT
TO authenticated
WITH CHECK (
  slp_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.appointments
    WHERE id = appointment_id AND slp_id = auth.uid()
  )
);

CREATE POLICY "SLPs or admin can update their session reports"
ON public.session_reports FOR UPDATE
TO authenticated
USING (slp_id = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (slp_id = auth.uid() OR public.is_admin(auth.uid()));
