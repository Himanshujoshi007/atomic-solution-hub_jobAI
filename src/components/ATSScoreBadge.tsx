"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Check,
  FileDiff,
  Layers,
  Award,
  ShieldCheck,
  Target,
  ArrowRight,
} from "lucide-react";

interface ATSScoreBadgeProps {
  score: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  tailoredBullets?: string[];
  isSummaryChanged?: boolean;
  onAddMissingKeyword?: (keyword: string) => void;
  onProceedToStep4?: () => void;
}

export const ATSScoreBadge: React.FC<ATSScoreBadgeProps> = ({
  score,
  matchingKeywords,
  missingKeywords,
  strengths,
  improvements,
  tailoredBullets = [],
  isSummaryChanged = false,
  onAddMissingKeyword,
  onProceedToStep4,
}) => {
  const [activeTab, setActiveTab] = useState<"keywords" | "changelog" | "recruiter">("keywords");
  const [addedKeywords, setAddedKeywords] = useState<string[]>([]);

  const handleAddKeyword = (kw: string) => {
    if (onAddMissingKeyword) {
      onAddMissingKeyword(kw);
      setAddedKeywords((prev) => [...prev, kw]);
    }
  };

  const getScoreColor = () => {
    if (score >= 90) return "text-emerald-500 from-emerald-500/20 to-emerald-500/5 border-emerald-500/40";
    if (score >= 80) return "text-indigo-500 from-indigo-500/20 to-indigo-500/5 border-indigo-500/40";
    return "text-amber-500 from-amber-500/20 to-amber-500/5 border-amber-500/40";
  };

  const getScoreLabel = () => {
    if (score >= 90) return "Exceptional Match • High ATS Clearance Probability (>95%)";
    if (score >= 80) return "Strong Match • Exceeds Standard Recruiter Screening Threshold";
    return "Moderate Match • Recommend Adding Missing Keywords Below";
  };

  return (
    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/40 dark:border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5">
      {/* 1. Header & Score Visualizer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex items-center gap-4">
          <div
            className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${getScoreColor()} border-2 flex flex-col items-center justify-center shadow-lg transform transition-transform hover:scale-105 shrink-0`}
          >
            <span className="text-2xl font-black tracking-tight">{score}%</span>
            <span className="text-[9.5px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              ATS Match
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-500 shrink-0" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Detailed ATS Keyword & Qualification Analysis
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {getScoreLabel()}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                {matchingKeywords.length} Verified Matched
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" />
                {missingKeywords.length} Keyword Gaps Detected
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                {tailoredBullets.length + (isSummaryChanged ? 1 : 0)} Items Tailored
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Subtabs for Stage 3 Analysis */}
      <div className="flex gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("keywords")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === "keywords"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Keyword Match & Gaps ({matchingKeywords.length + missingKeywords.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("changelog")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === "changelog"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <FileDiff className="w-3.5 h-3.5" />
          <span>What Was Added & Tailored ({tailoredBullets.length + (isSummaryChanged ? 1 : 0)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("recruiter")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
            activeTab === "recruiter"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Recruiter Strategy & Strengths</span>
        </button>
      </div>

      {/* TAB 1: Matched vs Missing Keywords */}
      {activeTab === "keywords" && (
        <div className="space-y-4 pt-1">
          {/* Matched Keywords */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Verified Matched Qualifications in Resume ({matchingKeywords.length})
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Matches JD specifications
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchingKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-medium border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1.5"
                >
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>{kw}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Missing Keywords with 1-click Insertion */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2.5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                Target Keywords Missing from Master Resume ({missingKeywords.length})
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                Click "+ Add" to inject directly into Core Competencies
              </span>
            </div>

            {missingKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {missingKeywords.map((kw, idx) => {
                  const isAdded = addedKeywords.includes(kw);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddKeyword(kw)}
                      disabled={isAdded}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                        isAdded
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300"
                          : "bg-white dark:bg-zinc-800 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer active:scale-95"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{kw} (Added)</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-amber-600" />
                          <span>{kw}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                🎉 No critical keyword gaps found! Your resume covers 100% of core technical competencies from the target JDs.
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: What Was Added & Tailored (Detailed Changelog) */}
      {activeTab === "changelog" && (
        <div className="space-y-4 pt-1">
          <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              All modifications follow Google's X-Y-Z formula. Real achievements are retained with enhanced keyword phrasing—zero hallucinations.
            </span>
          </div>

          {/* 1. Summary Change */}
          {isSummaryChanged && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-1.5">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                1. Executive Summary Tailored for Target Role
              </span>
              <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
                Repositioned to mirror the target company's business domain, customer focus, and role seniority while maintaining your verified background.
              </p>
            </div>
          )}

          {/* 2. Tailored Bullets */}
          {tailoredBullets.length > 0 ? (
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                2. Enhanced Experience Bullets (Google X-Y-Z Formula):
              </span>
              {tailoredBullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border-l-4 border-emerald-500 text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 shadow-sm"
                >
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase block mb-1">
                    ✨ Enhanced Bullet #{idx + 1}
                  </span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 italic">
              Original bullets maintained exceptionally high alignment with the JD without requiring phrasing restructuring.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Recruiter Insights & Strengths */}
      {activeTab === "recruiter" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2">
            <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Verified Candidate Strengths
            </span>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2">
            <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500" />
              Recruiter Interview Suggestions
            </span>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              {improvements.map((imp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-500 font-bold mt-0.5">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
