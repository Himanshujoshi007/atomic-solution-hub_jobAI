"use client";

import React, { useState } from "react";
import { UserAccount } from "@/types/resume";
import { storage } from "@/lib/storage";
import { Lock, User, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const accounts = storage.getAccounts();
    const found = accounts.find(
      (acc) =>
        acc.username.toLowerCase() === username.trim().toLowerCase() &&
        acc.passwordHash === password.trim()
    );

    if (!found) {
      setErrorMsg("Invalid username or password. (Default Admin: admin / admin123)");
      return;
    }

    if (!found.isActive) {
      setErrorMsg("This account has been disabled by the Administrator.");
      return;
    }

    const isExpired = new Date(found.expiresAt) < new Date();
    if (isExpired) {
      setErrorMsg(
        `Subscription expired on ${new Date(
          found.expiresAt
        ).toLocaleDateString()}. Please contact Admin to extend.`
      );
      return;
    }

    storage.setCurrentUser(found);
    onLoginSuccess(found);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/40 dark:border-zinc-800 rounded-3xl w-full max-w-md p-7 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
            Account Sign In
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Sign in to load your tailored resumes, custom API key, and subscription limits.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              Username or ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. admin or demo"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-indigo-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-center text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
          <div>
            <b>Default Admin:</b> <code className="text-indigo-600">admin</code> / <code className="text-indigo-600">admin123</code>
          </div>
          <div>
            <b>Default User:</b> <code className="text-indigo-600">demo</code> / <code className="text-indigo-600">demo123</code>
          </div>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            Cancel and continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};
