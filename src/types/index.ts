// User and Auth types
export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'STUDENT';
  phoneNumber?: string;
  fullName?: string;
  education?: string;
  skills?: string;
  resumeUrl?: string;
  experience?: string;
  company?: string;
  jobTitle?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
}

// Driver types
export interface Driver {
  id?: number;
  name: string;
  email: string;
  cabType: string;
  available?: boolean;
}

// Booking types
export interface Booking {
  id?: number;
  employeeName: string;
  pickup: string;
  dropLocation: string;
  pickupTime: string;
  cabType: string;
  bookingDate?: string;
  status?: string;
  hrEmail: string;
  driverEmail?: string;
  driverName?: string;
  createdAt?: string;
  durationMin: number;
  completed?: boolean;
}

// Job types
export interface Job {
  id?: number;
  title: string;
  description: string;
  company: string;
  location: string;
  jobType: string;
  requiredSkills: string;
  educationRequired?: string;
  experienceRequired?: string;
  postedBy: string;
  postedDate: string;
  approved: boolean;
  salary?: string;
}

// Application types
export interface Application {
  id?: number;
  jobId: number;
  studentEmail: string;
  studentName: string;
  status: string;
  appliedDate: string;
  coverLetter?: string;
  resumeUrl?: string;
  feedback?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (user: User) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Types for Hugging Face AI Resume Ranking
export interface HuggingFaceRankedApplication {
  application: Application;
  score: number;
  scorePercentage: string;
  cgpa: string;
  skills: string;
  education: string;
}

export interface HuggingFaceResumeAnalysis {
  cgpa: string;
  skills: string;
  education: string;
  experience: string;
}

export interface HuggingFaceApplicationData {
  application: Application;
  resumeContent: string;
  cgpa: string;
  skills: string;
  education: string;
}

