"use client";

import React, { useState, useEffect } from "react";
import { UserAccount, AdminSettings } from "@/types/resume";
import { storage } from "@/lib/storage";
import { SUPABASE_SETUP_SQL } from "@/lib/supabase";
import {
  ShieldCheck,
  UserPlus,
  Key,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Database,
  Trash2,
  Copy,
  Check,
  Save,
  Lock,
} from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState<"accounts" | "settings" | "supabase">("accounts");
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [settings, setSettings] = useState<AdminSettings>(storage.getAdminSettings());
  const [copiedSql, setCopiedSql] = useState(false);

  // New account state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"user" | "admin">("user");
  const [newApiKey, setNewApiKey] = useState("");
  const [newPlan, setNewPlan] = useState<UserAccount["subscriptionPlan"]>("1-month");
  const [newUsageLimit, setNewUsageLimit] = useState<number>(100);

  useEffect(() => {
    if (isOpen) {
      setAccounts(storage.getAccounts());
      setSettings(storage.getAdminSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) return;

    // Calculate expiry based on subscription plan
    const now = new Date();
    let days = 30;
    if (newPlan === "6-month") days = 180;
    if (newPlan === "12-month") days = 365;
    if (newPlan === "unlimited") days = 3650;

    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * days).toISOString();

    const createdAccount: UserAccount = {
      id: `acc-${Date.now()}`,
      username: newUsername.trim(),
      passwordHash: newPassword.trim(),
      role: newRole,
      apiKey: newApiKey.trim(),
      subscriptionPlan: newPlan,
      expiresAt,
      isActive: true,
      usageCount: 0,
      maxUsageLimit: newUsageLimit,
      createdAt: now.toISOString(),
    };

    const nextAccounts = [...accounts, createdAccount];
    setAccounts(nextAccounts);
    storage.saveAccounts(nextAccounts);

    // Reset inputs
    setNewUsername("");
    setNewPassword("");
    setNewApiKey("");
  };

  const toggleAccountActive = (id: string) => {
    const nextAccounts = accounts.map((acc) =>
      acc.id === id ? { ...acc, isActive: !acc.isActive } : acc
    );
    setAccounts(nextAccounts);
    storage.saveAccounts(nextAccounts);
  };

  const deleteAccount = (id: string) => {
    if (accounts.length <= 1) return;
    const nextAccounts = accounts.filter((acc) => acc.id !== id);
    setAccounts(nextAccounts);
    storage.saveAccounts(nextAccounts);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveAdminSettings(settings);
    alert("Admin settings & Supabase config saved successfully!");
  };

  const copySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Admin Control Center
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                User Management, Custom AI Keys, Subscription Limits & Supabase Sync
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 rounded-2xl bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Subtabs */}
        <div className="flex gap-2 px-6 pt-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setActiveTab("accounts")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "accounts"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            User Accounts & Subscriptions ({accounts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "settings"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Global AI Keys & Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("supabase")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "supabase"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Supabase Free SQL Schema
          </button>
        </div>

        {/* Tab 1: Accounts */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === "accounts" && (
            <>
              {/* Add Account Card */}
              <form
                onSubmit={handleCreateAccount}
                className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-4"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  <UserPlus className="w-4 h-4 text-indigo-500" />
                  <span>Create New User & Set Subscription Duration</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Username / Login ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. user_john"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Password
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. pass123"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Subscription Duration
                    </label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="1-month">1 Month (30 Days)</option>
                      <option value="6-month">6 Months (180 Days)</option>
                      <option value="12-month">12 Months (1 Year)</option>
                      <option value="unlimited">Lifetime Unlimited</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Custom AI API Key (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="User's Gemini API key (optional)"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Max Generations Limit
                    </label>
                    <input
                      type="number"
                      value={newUsageLimit}
                      onChange={(e) => setNewUsageLimit(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Add User Account
                  </button>
                </div>
              </form>

              {/* Accounts List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Existing Accounts ({accounts.length})
                </h3>

                <div className="space-y-2">
                  {accounts.map((acc) => {
                    const isExpired = new Date(acc.expiresAt) < new Date();
                    return (
                      <div
                        key={acc.id}
                        className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-white">
                              {acc.username}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                acc.role === "admin"
                                  ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              }`}
                            >
                              {acc.role}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                acc.isActive && !isExpired
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              }`}
                            >
                              {!acc.isActive
                                ? "Disabled"
                                : isExpired
                                ? "Expired"
                                : "Active"}
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                            <span>Plan: <b>{acc.subscriptionPlan}</b></span>
                            <span>Usage: <b>{acc.usageCount} / {acc.maxUsageLimit}</b></span>
                            <span>Expires: <b>{new Date(acc.expiresAt).toLocaleDateString()}</b></span>
                            {acc.apiKey && (
                              <span className="text-indigo-600 dark:text-indigo-400">
                                (Custom Key Assigned)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleAccountActive(acc.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-200/80 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 font-semibold text-[11px] transition-colors"
                          >
                            {acc.isActive ? (
                              <>
                                <ToggleRight className="w-3.5 h-3.5 text-emerald-500" />
                                Disable
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-3.5 h-3.5 text-zinc-400" />
                                Enable
                              </>
                            )}
                          </button>

                          {accounts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteAccount(acc.id)}
                              className="p-1.5 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-500 transition-colors"
                              title="Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Settings */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-500" />
                  Default System Gemini API Key (Used if candidate has no personal key)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={settings.defaultAiApiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultAiApiKey: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Obtain for 100% free with generous 15 req/min rate limit from Google AI Studio.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Gemini Model Target
                </label>
                <input
                  type="text"
                  value={settings.geminiModel}
                  onChange={(e) =>
                    setSettings({ ...settings, geminiModel: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Global Configuration
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Supabase Schema */}
          {activeTab === "supabase" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex justify-between items-center">
                <div>
                  <span className="font-bold">Supabase 1-Click PostgreSQL Schema</span>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    Paste this into your free Supabase SQL Editor to manage 10,000+ accounts and resumes online.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copySql}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? "Copied!" : "Copy SQL Script"}
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-zinc-900 text-zinc-300 text-xs font-mono overflow-x-auto max-h-[300px] border border-zinc-800 leading-relaxed">
                {SUPABASE_SETUP_SQL}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
