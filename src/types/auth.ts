import { Profile, SlpProfile, ChildProfile, UserRole } from './database';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  profile: Profile;
  slpProfile?: SlpProfile | null;
  children: ChildProfile[];
}

export interface ParentSignUpData {
  // Parent details
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  // Initial child details
  childFirstName: string;
  childLastName: string;
  childDob: string;
  childGender?: string;
  communicationConcerns: string[];
  developmentalHistory?: string;
}

export interface SlpRegistrationData {
  // Account details
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  // Professional details
  title: string;
  licenseNumber: string;
  yearsOfExperience: number;
  degrees: string[];
  certifications: string[];
  specializations: string[];
  languagesSpoken: string[];
  hourlyRate: number;
  bio: string;
}
