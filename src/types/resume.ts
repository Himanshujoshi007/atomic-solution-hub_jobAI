export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  highlights?: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  techStack: string[];
  link?: string;
  bullets: string[];
}

export interface SkillGroup {
  category: string;
  skills: string; // Comma-separated or description
}

export interface ResumeData {
  fullName: string;
  subtitle?: string; // e.g. "Associate Product Manager" or "Senior Full Stack Engineer"
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    developerTools: string[];
    librariesOrCloud: string[];
  };
  skillGroups?: SkillGroup[]; // For the exact Gemini Core Competencies layout
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications?: string[];
}

export interface JobDescription {
  id: string;
  companyName: string;
  roleTitle: string;
  jdText: string;
  targetKeywords?: string[];
}

export interface TailoredResumeRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  associatedJDs: {
    companyName: string;
    roleTitle: string;
    jdSnippet: string;
  }[];
  formatStyle: "gemini-standard" | "modern-tech" | "classic-ats" | "executive-impact";
  atsScore: number;
  atsFeedback: {
    matchingKeywords: string[];
    missingKeywords: string[];
    strengths: string[];
    improvements: string[];
  };
  resume: ResumeData;
  changedItems?: {
    summaryChanged: boolean;
    tailoredBullets: string[]; // text of bullets that were tailored
    addedKeywords: string[];
  };
}

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  role: "admin" | "user";
  apiKey?: string;
  subscriptionPlan: "1-month" | "6-month" | "12-month" | "unlimited";
  expiresAt: string; // ISO String
  isActive: boolean;
  usageCount: number;
  maxUsageLimit: number;
  createdAt: string;
}

export interface AdminSettings {
  defaultAiApiKey: string;
  aiProvider: "gemini" | "groq" | "custom";
  geminiModel: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}
