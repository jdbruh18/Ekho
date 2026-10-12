export type UserRole = 'parent' | 'slp' | 'admin';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type GoalStatus = 'not_started' | 'in_progress' | 'achieved' | 'discontinued';

export type AppointmentStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export type ConsultationType = 'online' | 'in_person';

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'waived';

export type AssistanceLevel =
  | 'independent'
  | 'minimal_cueing'
  | 'moderate_cueing'
  | 'maximal_prompting';

export type ChildPerformanceRating =
  | 'emerging'
  | 'developing'
  | 'consistent'
  | 'mastered';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  slp_id: string;
  parent_name: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Clinic {
  id: string;
  name: string;
  type: 'Speech Clinic' | 'Pediatric Rehab Center' | 'Hospital Department' | 'Child Development Center';
  address: string;
  city: string;
  distance: string;
  latitude: number;
  longitude: number;
  phone: string;
  opening_hours: string;
  services: string[];
  rating: number;
  reviews_count: number;
  verified: boolean;
  image_url?: string;
}

export interface Testimonial {
  id: string;
  parent_name: string;
  child_info: string;
  rating: number;
  quote: string;
  therapist_name: string;
  avatar_url?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SlpProfile {
  id: string; // foreign key to profiles.id
  title: string;
  degrees: string[];
  certifications: string[];
  license_number: string;
  years_of_experience: number;
  specializations: string[];
  languages_spoken: string[];
  bio: string;
  hourly_rate: number;
  is_verified: boolean;
  verification_status: VerificationStatus;
  verification_notes?: string | null;
  available_online: boolean;
  working_hours?: Record<string, { start: string; end: string }> | null;
  rating: number;
  total_reviews: number;
  total_sessions: number;
  institutions?: string[];
  age_groups_treated?: string[];
  therapy_approaches?: string[];
  next_available_slot?: string;
  reviews?: Review[];
  created_at: string;
  updated_at: string;
  // joined profile info
  profile?: Profile;
}

export interface ChildProfile {
  id: string;
  parent_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string | null;
  communication_concerns: string[];
  developmental_history?: string | null;
  previous_assessments?: string | null;
  notes?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChildAuthorization {
  id: string;
  child_id: string;
  slp_id: string;
  parent_id: string;
  status: 'active' | 'revoked';
  granted_at: string;
  revoked_at?: string | null;
}

export interface ChildGoal {
  id: string;
  child_id: string;
  slp_id?: string | null;
  title: string;
  category: string;
  baseline_accuracy: number;
  current_accuracy: number;
  target_accuracy: number;
  status: GoalStatus;
  target_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  parent_id: string;
  slp_id: string;
  child_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  consultation_type: ConsultationType;
  meeting_link?: string | null;
  amount_paid: number;
  payment_status: PaymentStatus;
  booking_reference?: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  // joined fields
  slp?: SlpProfile;
  child?: ChildProfile;
  parent?: Profile;
}

export interface Transaction {
  id: string;
  appointment_id: string;
  slp_id: string;
  parent_id: string;
  child_name: string;
  date: string;
  duration_minutes: number;
  gross_amount: number;
  service_fee: number;
  net_earnings: number;
  payment_method: 'Card' | 'UPI' | 'NetBanking' | 'Bank Transfer';
  status: 'paid' | 'processing' | 'refunded' | 'withdrawn';
}

export interface SlpEarnings {
  total_earnings: number;
  withdrawable_balance: number;
  pending_payouts: number;
  total_sessions: number;
}

export interface SessionReport {
  id: string;
  appointment_id: string;
  child_id: string;
  slp_id: string;
  session_date: string;
  duration_minutes: number;
  activities_completed: string[];
  child_performance_rating?: ChildPerformanceRating | null;
  accuracy_percentage?: number | null;
  assistance_level?: AssistanceLevel | null;
  strengths?: string | null;
  difficulties_observed?: string | null;
  behavior_participation?: string | null;
  clinical_notes: string;
  home_practice_instructions?: string | null;
  home_practice_exercises?: {
    title: string;
    description: string;
    target_frequency?: string;
  }[] | null;
  created_at: string;
  updated_at: string;
}
