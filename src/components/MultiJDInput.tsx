"use client";

import React, { useState, useRef } from "react";
import { JobDescription } from "@/types/resume";
import { extractCompanyAndRoleFromJD, cleanCompanyName } from "@/lib/parser";
import {
  Plus,
  Trash2,
  Building,
  Briefcase,
  FileText,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
} from "lucide-react";

interface MultiJDInputProps {
  jds: JobDescription[];
  onChange: (jds: JobDescription[]) => void;
  maxJds?: number;
  onNext?: () => void;
}

export const MultiJDInput: React.FC<MultiJDInputProps> = ({
  jds,
  onChange,
  maxJds = 10,
  onNext,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [autoDetected, setAutoDetected] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const scrollDeckRef = useRef<HTMLDivElement>(null);

  const addJd = () => {
    if (jds.length >= maxJds) return;
    const newJd: JobDescription = {
      id: `jd-${Date.now()}`,
      companyName: "",
      roleTitle: "",
      jdText: "",
    };
    const nextJds = [...jds, newJd];
    onChange(nextJds);
    setActiveTab(nextJds.length - 1);
  };

  const removeJd = (index: number) => {
    if (jds.length <= 1) {
      alert("At least one target job description is required.");
      return;
    }
    const nextJds = jds.filter((_, idx) => idx !== index);
    onChange(nextJds);
    if (activeTab >= nextJds.length) {
      setActiveTab(Math.max(0, nextJds.length - 1));
    }
  };

  const updateCurrentJd = (field: keyof JobDescription, value: string) => {
    const updated = [...jds];
    updated[activeTab] = {
      ...updated[activeTab],
      [field]: field === "companyName" ? cleanCompanyName(value) : value,
    };
    onChange(updated);
  };

  // Automatic Extraction on paste/typing into JD textarea
  const handleJdTextChange = (text: string) => {
    const updated = [...jds];
    const current = { ...updated[activeTab], jdText: text };

    if (text.trim().length > 25) {
      const extracted = extractCompanyAndRoleFromJD(text);
      let changed = false;

      if (extracted.companyName) {
        current.companyName = cleanCompanyName(extracted.companyName);
        changed = true;
      }

      if (extracted.roleTitle) {
        current.roleTitle = extracted.roleTitle;
        changed = true;
      }

      if (changed) {
        setAutoDetected(true);
        setTimeout(() => setAutoDetected(false), 3000);
      }
    }

    updated[activeTab] = current;
    onChange(updated);
  };

  const triggerManualExtraction = () => {
    const current = jds[activeTab];
    if (!current?.jdText) return;
    const extracted = extractCompanyAndRoleFromJD(current.jdText);
    const updated = [...jds];
    updated[activeTab] = {
      ...current,
      companyName: cleanCompanyName(extracted.companyName) || current.companyName,
      roleTitle: extracted.roleTitle || current.roleTitle,
    };
    onChange(updated);
    setAutoDetected(true);
    setTimeout(() => setAutoDetected(false), 3000);
  };

  const currentJd = jds[activeTab] || jds[0];

  return (
    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-white/40 dark:border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
              Step 2: Target Job Descriptions
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Target 1 to 10 JDs simultaneously. Role Title and Company Name are automatically parsed on paste.
          </p>
        </div>

        {/* Counter Badge, View Switcher & Add Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-xs">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === "card"
                  ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-300 font-bold"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
              title="Editor View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-300 font-bold"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
              title="All JDs Overview List"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-semibold px-3 py-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60">
            {jds.length} / {maxJds} JDs Loaded
          </span>

          <button
            type="button"
            onClick={addJd}
            disabled={jds.length >= maxJds}
            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95 transition-all disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another JD</span>
          </button>
        </div>
      </div>

            {/* 1. Horizontal Scrollable JD Deck Selector with Quick Navigation */}
      <div className="relative flex items-center gap-1.5">
        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => scrollDeckRef.current?.scrollBy({ left: -220, behavior: "smooth" })}
          className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all shrink-0 cursor-pointer shadow-xs"
          title="Scroll JDs Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Pills Deck */}
        <div
          ref={scrollDeckRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth flex-1"
        >
          {jds.map((jd, idx) => {
            const isActive = idx === activeTab;
            const cleanedCompany = cleanCompanyName(jd.companyName);
            const companyDisplay = cleanedCompany.trim()
              ? cleanedCompany.length > 16
                ? `${cleanedCompany.slice(0, 16)}...`
                : cleanedCompany
              : `JD #${idx + 1}`;

            return (
              <div
                key={jd.id || idx}
                onClick={() => {
                  setActiveTab(idx);
                  setViewMode("card");
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-md scale-102"
                    : "bg-zinc-100/80 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80"
                }`}
              >
                <div className="flex flex-col text-left">
                  <span className="truncate max-w-[120px]">{companyDisplay}</span>
                  {jd.roleTitle && (
                    <span className="text-[10px] font-normal opacity-75 truncate max-w-[120px]">
                      {jd.roleTitle}
                    </span>
                  )}
                </div>

                {jds.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeJd(idx);
                    }}
                    className="p-1 rounded-xl hover:bg-red-500 hover:text-white transition-colors"
                    title="Delete this JD"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => scrollDeckRef.current?.scrollBy({ left: 220, behavior: "smooth" })}
          className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all shrink-0 cursor-pointer shadow-xs"
          title="Scroll JDs Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. All JDs Overview List (When List view mode is selected) */}
      {viewMode === "list" && (
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
            <span>All Target JDs Overview ({jds.length})</span>
            <span className="text-[11px] text-zinc-400">Click any card to edit its details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
            {jds.map((jd, idx) => (
              <div
                key={jd.id || idx}
                onClick={() => {
                  setActiveTab(idx);
                  setViewMode("card");
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  idx === activeTab
                    ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-400 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-xs font-black text-zinc-900 dark:text-white block">
                      {idx + 1}. {jd.companyName || "Company Name Pending"}
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                      {jd.roleTitle || "Target Role Pending"}
                    </span>
                  </div>

                  {jds.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeJd(idx);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded-xl"
                      title="Delete this JD"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                  {jd.jdText ? jd.jdText : "(No job description text pasted yet)"}
                </p>

                <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1">
                  <span>{jd.jdText.split(/\s+/).filter(Boolean).length} words</span>
                  <span className="text-indigo-500 font-bold flex items-center gap-0.5">
                    Click to edit <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Active JD Card Editor */}
      {viewMode === "card" && currentJd && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-500" />
                  Company Name (Auto-Extracted)
                </span>
                {autoDetected && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                    <Check className="w-3 h-3" /> Auto-Detected
                  </span>
                )}
              </label>
              <input
                type="text"
                placeholder="e.g. Laminar, UnitedHealth, Evernorth, Google"
                value={currentJd.companyName}
                onChange={(e) => updateCurrentJd("companyName", e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  Target Role Title (Auto-Extracted)
                </span>
                {autoDetected && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                    <Check className="w-3 h-3" /> Auto-Detected
                  </span>
                )}
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Software Engineer, Associate Product Manager"
                value={currentJd.roleTitle}
                onChange={(e) => updateCurrentJd("roleTitle", e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                Paste Job Description Text (JD #{activeTab + 1})
              </label>
              <button
                type="button"
                onClick={triggerManualExtraction}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Re-Extract Company & Role</span>
              </button>
            </div>
            <textarea
              rows={8}
              placeholder="Paste the job description here. Company name and role title will be extracted instantly without clutter..."
              value={currentJd.jdText}
              onChange={(e) => handleJdTextChange(e.target.value)}
              className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 leading-relaxed font-mono resize-y"
            />
          </div>

          {/* Bottom Card Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeTab === 0}
                onClick={() => setActiveTab(activeTab - 1)}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous JD
              </button>
              <button
                type="button"
                disabled={activeTab === jds.length - 1}
                onClick={() => setActiveTab(activeTab + 1)}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
              >
                Next JD <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {jds.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeJd(activeTab)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete this JD
                </button>
              )}
            </div>

            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <span>Proceed to Step 3: Tailor & Diff</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
