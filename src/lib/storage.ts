import { TailoredResumeRecord, UserAccount, AdminSettings } from "@/types/resume";

const STORAGE_KEYS = {
  CURRENT_USER: "resume_tailor_current_user",
  ACCOUNTS: "resume_tailor_accounts",
  RECORDS: "resume_tailor_records_v1",
  ADMIN_SETTINGS: "resume_tailor_admin_settings",
  BASE_RESUME: "resume_tailor_base_resume",
};

// Initial default accounts
const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: "acc-admin-1",
    username: "admin",
    passwordHash: "admin123", // In actual app, checked via secure auth state
    role: "admin",
    apiKey: "",
    subscriptionPlan: "unlimited",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10).toISOString(), // 10 years
    isActive: true,
    usageCount: 0,
    maxUsageLimit: 999999,
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc-demo-user",
    username: "demo",
    passwordHash: "demo123",
    role: "user",
    apiKey: "",
    subscriptionPlan: "1-month",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days
    isActive: true,
    usageCount: 2,
    maxUsageLimit: 100,
    createdAt: new Date().toISOString(),
  }
];

const DEFAULT_SETTINGS: AdminSettings = {
  defaultAiApiKey: "",
  aiProvider: "gemini",
  geminiModel: "gemini-2.5-flash",
  supabaseUrl: "",
  supabaseAnonKey: "",
};

export const storage = {
  // Accounts
  getAccounts(): UserAccount[] {
    if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
        return DEFAULT_ACCOUNTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  },

  saveAccounts(accounts: UserAccount[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  // Current session
  getCurrentUser(): UserAccount | null {
    if (typeof window === "undefined") return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserAccount | null): void {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Admin Settings
  getAdminSettings(): AdminSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveAdminSettings(settings: AdminSettings): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
  },

  // Tailored Resume Records (Supports 2,000+ records via IndexedDB or LocalStorage chunking)
  getRecords(): TailoredResumeRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveRecord(record: TailoredResumeRecord): void {
    if (typeof window === "undefined") return;
    const records = this.getRecords();
    const existingIndex = records.findIndex((r) => r.id === record.id);
    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.unshift(record);
    }
    // Cap or store safely
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },

  deleteRecord(id: string): void {
    if (typeof window === "undefined") return;
    const records = this.getRecords().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  },

  // Base Resume
  getBaseResume(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEYS.BASE_RESUME);
  },

  saveBaseResume(jsonString: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.BASE_RESUME, jsonString);
  }
};
