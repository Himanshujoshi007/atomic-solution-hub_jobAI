"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ResumeData,
  JobDescription,
  TailoredResumeRecord,
  UserAccount,
} from "@/types/resume";
import {
  SAMPLE_BASE_RESUME,
  SAMPLE_JOB_DESCRIPTIONS,
  EMPTY_RESUME,
  EMPTY_JOB_DESCRIPTIONS,
} from "@/data/sampleData";
import { storage } from "@/lib/storage";
import { tailorResumeWithAI } from "@/lib/tailorEngine";
import { exportElementToPDF, triggerNativePrint } from "@/lib/pdfExport";
import { ResumeUploader } from "@/components/ResumeUploader";
import { MultiJDInput } from "@/components/MultiJDInput";
import { LiveResumeEditor } from "@/components/LiveResumeEditor";
import { ATSScoreBadge } from "@/components/ATSScoreBadge";
import { ResumeRecordsHistory } from "@/components/ResumeRecordsHistory";
import { GeminiStandardTemplate } from "@/components/templates/GeminiStandardTemplate";
import { ModernTechTemplate } from "@/components/templates/ModernTechTemplate";
import { ClassicATSTemplate } from "@/components/templates/ClassicATSTemplate";
import { ExecutiveImpactTemplate } from "@/components/templates/ExecutiveImpactTemplate";
import { AdminModal } from "@/components/AdminModal";
import { LoginModal } from "@/components/LoginModal";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Download,
  Printer,
  History,
  Shield,
  User,
  LogOut,
  RefreshCw,
  Edit3,
  CheckCircle,
  FileText,
  Briefcase,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Eye,
  Columns2,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronRight,
  Zap,
  FolderArchive,
} from "lucide-react";

type WorkspaceTab = "resume" | "jds" | "tailor" | "editor" | "records";

export default function Home() {
  // Dedicated Workspace Tab Navigation
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("resume");

  // Session & Auth
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Resume & JDs State - Completely blank by default
  const [baseResume, setBaseResume] = useState<ResumeData>(EMPTY_RESUME);
  const [activeResume, setActiveResume] = useState<ResumeData>(EMPTY_RESUME);
  const [jds, setJds] = useState<JobDescription[]>(EMPTY_JOB_DESCRIPTIONS);
  const [selectedFormat, setSelectedFormat] = useState<
    "gemini-standard" | "modern-tech" | "classic-ats" | "executive-impact"
  >("gemini-standard");

  // Tailoring & ATS Diff State - Default empty until tailored
  const [isTailoring, setIsTailoring] = useState(false);
  const [highlightChanges, setHighlightChanges] = useState<boolean>(true);
  const [tailoredBullets, setTailoredBullets] = useState<string[]>([]);
  const [isSummaryChanged, setIsSummaryChanged] = useState<boolean>(false);
  const [atsScore, setAtsScore] = useState<number>(0);
  const [atsFeedback, setAtsFeedback] = useState({
    matchingKeywords: [] as string[],
    missingKeywords: [] as string[],
    strengths: [] as string[],
    improvements: [] as string[],
  });

  // Stage 4 View Mode & Zoom (Split / Full Editor / Full Preview)
  const [stage4ViewMode, setStage4ViewMode] = useState<"split" | "editor" | "preview">("split");
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Records & Download State
  const [records, setRecords] = useState<TailoredResumeRecord[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const user = storage.getCurrentUser();
    if (user) setCurrentUser(user);

    const savedRecords = storage.getRecords();
    setRecords(savedRecords);

    // Clean up any stale Alluri Sumanth profile from localStorage if present
    try {
      const savedBase = storage.getBaseResume();
      if (savedBase) {
        const parsed = JSON.parse(savedBase);
        if (parsed?.fullName === "Alluri Sumanth") {
          localStorage.removeItem("resume_tailor_base_resume");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // "New Start"
  const handleNewStart = () => {
    if (confirm("Start fresh from Step 1? Your saved records will remain in History.")) {
      setBaseResume(EMPTY_RESUME);
      setActiveResume(EMPTY_RESUME);
      setJds(EMPTY_JOB_DESCRIPTIONS);
      setTailoredBullets([]);
      setIsSummaryChanged(false);
      setAtsScore(0);
      setAtsFeedback({
        matchingKeywords: [],
        missingKeywords: [],
        strengths: [],
        improvements: [],
      });
      setActiveTab("resume");
    }
  };

  // Step 3: Trigger AI Tailoring
  const handleGenerateTailoredResume = async () => {
    if (!baseResume.fullName && (!baseResume.experience || baseResume.experience.length === 0)) {
      alert("Please paste your resume in Step 1 before tailoring.");
      setActiveTab("resume");
      return;
    }

    const hasAnyJd = jds.some((j) => j.jdText && j.jdText.trim().length > 20);
    if (!hasAnyJd) {
      alert("Please paste at least one target job description in Step 2 before tailoring.");
      setActiveTab("jds");
      return;
    }

    if (currentUser) {
      if (!currentUser.isActive) {
        alert("Your account is currently disabled. Please contact Admin.");
        return;
      }
      if (new Date(currentUser.expiresAt) < new Date()) {
        alert("Your subscription has expired. Please contact Admin to extend.");
        return;
      }
      if (currentUser.usageCount >= currentUser.maxUsageLimit) {
        alert(
          `Usage limit reached (${currentUser.maxUsageLimit} generations). Please contact Admin.`
        );
        return;
      }
    }

    setIsTailoring(true);

    try {
      const adminSettings = storage.getAdminSettings();
      const apiKey = currentUser?.apiKey || adminSettings.defaultAiApiKey || "";

      const res = await tailorResumeWithAI({
        baseResume,
        jds,
        targetStyle: selectedFormat,
        apiKey,
      });

      setActiveResume(res.tailoredResume);
      setAtsScore(res.atsScore);
      setAtsFeedback(res.atsFeedback);
      setTailoredBullets(res.changedItems?.tailoredBullets || []);
      setIsSummaryChanged(res.changedItems?.summaryChanged || false);
      setHighlightChanges(true);

      // Save Record with Company & Role metadata
      const companyNames = jds.map((j) => j.companyName).filter(Boolean);
      const roleTitles = jds.map((j) => j.roleTitle).filter(Boolean);
      const title =
        companyNames.length > 0
          ? `${companyNames.join(" & ")} – ${roleTitles[0] || "Tailored Role"}`
          : `Tailored Resume (${new Date().toLocaleDateString()})`;

      const newRecord: TailoredResumeRecord = {
        id: `rec-${Date.now()}`,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        associatedJDs: jds.map((j) => ({
          companyName: j.companyName || "Company",
          roleTitle: j.roleTitle || "Role",
          jdSnippet: j.jdText.slice(0, 150),
        })),
        formatStyle: selectedFormat,
        atsScore: res.atsScore,
        atsFeedback: res.atsFeedback,
        resume: res.tailoredResume,
        changedItems: res.changedItems,
      };

      storage.saveRecord(newRecord);
      setRecords(storage.getRecords());

      // Update user usage count
      if (currentUser) {
        const nextUser = { ...currentUser, usageCount: currentUser.usageCount + 1 };
        storage.setCurrentUser(nextUser);
        setCurrentUser(nextUser);
        const accounts = storage.getAccounts().map((a) => (a.id === nextUser.id ? nextUser : a));
        storage.saveAccounts(accounts);
      }

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      alert("Failed to tailor resume: " + err.message);
    } finally {
      setIsTailoring(false);
    }
  };

  // Add missing keyword to resume skillGroups
  const handleAddMissingKeyword = (keyword: string) => {
    const updated = { ...activeResume };
    if (updated.skillGroups && updated.skillGroups.length > 0) {
      updated.skillGroups[0] = {
        ...updated.skillGroups[0],
        skills: `${updated.skillGroups[0].skills}, ${keyword}`,
      };
    } else {
      updated.skills.languages.push(keyword);
    }
    setActiveResume(updated);
  };

  // Download PDF using html-to-image (safe against lab() / oklch() color issues)
  const handleDownloadPDF = async (recordToPrint?: TailoredResumeRecord) => {
    setIsDownloading(true);
    const prevHighlight = highlightChanges;
    setHighlightChanges(false);

    try {
      const filename = recordToPrint
        ? `${recordToPrint.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`
        : `${activeResume.fullName.replace(/\s+/g, "_")}_Resume.pdf`;

      setTimeout(async () => {
        try {
          await exportElementToPDF("resume-preview-sheet", filename);
        } catch (e: any) {
          console.warn("Direct PDF export warning:", e);
        } finally {
          setHighlightChanges(prevHighlight);
          setIsDownloading(false);
        }
      }, 150);
    } catch (err: any) {
      setHighlightChanges(prevHighlight);
      setIsDownloading(false);
      console.warn("PDF export notice:", err);
      triggerNativePrint("resume-preview-sheet");
    }
  };

  const handleNativePrint = () => {
    triggerNativePrint("resume-preview-sheet");
  };

  const handleSelectRecord = (rec: TailoredResumeRecord) => {
    setActiveResume(rec.resume);
    setSelectedFormat(rec.formatStyle);
    setAtsScore(rec.atsScore);
    setAtsFeedback(rec.atsFeedback);
    setTailoredBullets(rec.changedItems?.tailoredBullets || []);
    setIsSummaryChanged(rec.changedItems?.summaryChanged || false);
    setActiveTab("editor");
  };

  const handleDeleteRecord = (id: string) => {
    storage.deleteRecord(id);
    setRecords(storage.getRecords());
  };

  const navTabs = [
    { id: "resume", label: "1. Master Resume", icon: FileText },
    { id: "jds", label: `2. Target JDs (${jds.length})`, icon: Briefcase },
    { id: "tailor", label: "3. AI Tailor & ATS", icon: Sparkles },
    { id: "editor", label: "4. Live Editor & PDF", icon: Edit3 },
    { id: "records", label: `5. Records (${records.length})`, icon: FolderArchive },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#000000] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. FIXED TOP iOS APP BAR */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-2.5 backdrop-blur-3xl bg-white/80 dark:bg-zinc-900/80 border-b border-black/5 dark:border-white/10 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 shadow-md shadow-indigo-600/30 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-zinc-900 dark:text-white lowercase">
                resumetailoring system
              </h1>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                Apple Minimalist ATS Engine
              </p>
            </div>
          </div>

          {/* iOS Segmented Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-zinc-200/60 dark:bg-zinc-800/60 backdrop-blur-md">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm scale-102"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleNewStart}
              className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Reset flow to Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">New Start</span>
            </button>

            {currentUser?.role === "admin" && (
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <div className="px-3 py-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  <span>{currentUser.username}</span>
                  <span className="text-[10px] text-zinc-400 ml-1">
                    ({currentUser.usageCount}/{currentUser.maxUsageLimit})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    storage.setCurrentUser(null);
                    setCurrentUser(null);
                  }}
                  className="p-1.5 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between overflow-x-auto gap-1 pt-2 pb-0.5 border-t border-zinc-200/50 dark:border-zinc-800/50 mt-2">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as WorkspaceTab)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label.split(" ")[1]}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* MAIN DEDICATED WORKSPACE PAGES */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-24 sm:pt-28 pb-16">
        {/* ========================================================================= */}
        {/* TAB 1: MASTER RESUME WORKSPACE */}
        {/* ========================================================================= */}
        {activeTab === "resume" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Section Inspector & Editor */}
              <div className="lg:col-span-6 space-y-4">
                <ResumeUploader
                  currentResume={activeResume}
                  apiKey={currentUser?.apiKey || (typeof window !== "undefined" ? storage.getAdminSettings().defaultAiApiKey : "") || ""}
                  onLoaded={(parsed) => {
                    setBaseResume(parsed);
                    setActiveResume(parsed);
                    storage.saveBaseResume(JSON.stringify(parsed));
                  }}
                  onNext={() => setActiveTab("jds")}
                />
              </div>

              {/* Right Column: Formatted Gemini ATS Sheet Preview */}
              <div className="lg:col-span-6">
                <div className="rounded-3xl overflow-hidden border border-zinc-300 dark:border-zinc-800 shadow-2xl bg-zinc-200/40 dark:bg-zinc-800/40 max-h-[82vh] flex flex-col">
                  <div className="sticky top-0 z-10 px-5 py-3 bg-zinc-100/90 dark:bg-zinc-800/90 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                      Master Resume Formatted Preview (Gemini ATS)
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium">Single-Page A4</span>
                  </div>

                  <div className="overflow-x-auto overflow-y-auto flex-1 p-4 flex justify-center items-start">
                    {activeResume.fullName || (activeResume.experience && activeResume.experience.length > 0) || activeResume.summary ? (
                      <div className="shadow-xl bg-white mb-6 scale-90 sm:scale-100 origin-top">
                        <GeminiStandardTemplate resume={activeResume} highlightChanges={false} />
                      </div>
                    ) : (
                      <div className="w-full max-w-[210mm] min-h-[460px] border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-white/60 dark:bg-zinc-900/60">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
                          <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-zinc-800 dark:text-white">
                          Blank Resume Canvas Ready
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-2 leading-relaxed">
                          Paste your resume on the left to immediately inspect decoded sections and see your single-page ATS formatted document live here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TARGET JDs (MULTI-JD MANAGER) */}
        {/* ========================================================================= */}
        {activeTab === "jds" && (
          <div className="space-y-6">
            <MultiJDInput
              jds={jds}
              onChange={setJds}
              onNext={() => setActiveTab("tailor")}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AI TAILOR & ATS DIFF STUDIO */}
        {/* ========================================================================= */}
        {activeTab === "tailor" && (
          <div className="space-y-6">
            {/* Top AI Action Card */}
            <div className="p-5 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/40 dark:border-zinc-800 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-md">
                    <Zap className="w-5 h-5" />
                  </span>
                  <h2 className="text-base font-black text-zinc-900 dark:text-white">
                    Step 3: AI Tailoring & ATS Keyword Optimization
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Engineers your authentic resume to achieve 95%+ ATS qualification match across all target JDs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateTailoredResume}
                  disabled={isTailoring}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isTailoring ? "Synthesizing Tailored Resume..." : "Tailor Resume Now (AI)"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("editor")}
                  className="px-5 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Step 4: Live Edit</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split Screen: Left ATS Badge & Changelog, Right Sheet Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 space-y-4">
                <ATSScoreBadge
                  score={atsScore}
                  matchingKeywords={atsFeedback.matchingKeywords}
                  missingKeywords={atsFeedback.missingKeywords}
                  strengths={atsFeedback.strengths}
                  improvements={atsFeedback.improvements}
                  tailoredBullets={tailoredBullets}
                  isSummaryChanged={isSummaryChanged}
                  onAddMissingKeyword={handleAddMissingKeyword}
                />
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-3xl overflow-hidden border border-zinc-300 dark:border-zinc-800 shadow-2xl bg-zinc-200/40 dark:bg-zinc-800/40 max-h-[82vh] flex flex-col">
                  <div className="sticky top-0 z-10 px-5 py-3 bg-zinc-100/90 dark:bg-zinc-800/90 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        Tailored Resume Preview (Changes Highlighted in Green)
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-500">A4 Single-Page Fit</span>
                  </div>

                  <div className="overflow-x-auto overflow-y-auto flex-1 p-4 flex justify-center items-start">
                    {activeResume.fullName || (activeResume.experience && activeResume.experience.length > 0) || activeResume.summary ? (
                      <div className="shadow-xl bg-white mb-6 scale-90 sm:scale-100 origin-top">
                        <GeminiStandardTemplate
                          resume={activeResume}
                          highlightChanges={highlightChanges}
                          tailoredBullets={tailoredBullets}
                          isSummaryChanged={isSummaryChanged}
                        />
                      </div>
                    ) : (
                      <div className="w-full max-w-[210mm] min-h-[460px] border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-white/60 dark:bg-zinc-900/60">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
                          <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-bold text-zinc-800 dark:text-white">
                          No Tailored Resume Generated Yet
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mt-2 leading-relaxed">
                          Paste your resume in Step 1 and target JDs in Step 2, then click &ldquo;Tailor Resume Now (AI)&rdquo; above to generate and inspect your tailored ATS resume here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: LIVE EDITOR & EXPORT STUDIO */}
        {/* ========================================================================= */}
        {activeTab === "editor" && (
          <div className="space-y-4">
            {/* Stage 4 Control & Switcher Bar */}
            <div className="p-4 rounded-3xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/40 dark:border-zinc-800 shadow-xl flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Template Format Selector */}
                <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedFormat("gemini-standard")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedFormat === "gemini-standard"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Compact ATS Monochrome (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFormat("modern-tech")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedFormat === "modern-tech"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Modern Tech
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFormat("classic-ats")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedFormat === "classic-ats"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    Classic ATS
                  </button>
                </div>

                {/* View Mode Selector (Split / Full Editor / Full Preview) */}
                <div className="flex items-center gap-1 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                  <button
                    type="button"
                    onClick={() => setStage4ViewMode("split")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      stage4ViewMode === "split"
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                    title="Side-by-side view"
                  >
                    <Columns2 className="w-3.5 h-3.5" />
                    <span>Split View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage4ViewMode("editor")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      stage4ViewMode === "editor"
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                    title="Full Width Editor"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Full Editor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage4ViewMode("preview")}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      stage4ViewMode === "preview"
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400"
                    }`}
                    title="Full Width Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Full Preview</span>
                  </button>
                </div>

                {/* Zoom Controls for Sheet */}
                {(stage4ViewMode === "split" || stage4ViewMode === "preview") && (
                  <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-2xl text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                      className="p-1 hover:text-indigo-600 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono text-[11px]">{zoomLevel}%</span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                      className="p-1 hover:text-indigo-600 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(75)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        zoomLevel === 75
                          ? "bg-indigo-600 text-white"
                          : "bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                      }`}
                      title="Fit to Width (No horizontal scroll needed)"
                    >
                      Fit Width
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(100)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        zoomLevel === 100
                          ? "bg-indigo-600 text-white"
                          : "bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                      }`}
                      title="100% standard size"
                    >
                      100%
                    </button>
                  </div>
                )}
              </div>

              {/* Direct PDF Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNativePrint}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  title="Print or Save via Browser Native Print"
                >
                  <Printer className="w-4 h-4 text-zinc-500" />
                  <span>Print Vector PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadPDF()}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? "Generating PDF..." : "Download Clean PDF"}</span>
                </button>
              </div>
            </div>

            {/* Stage 4 Dynamic Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Live Editor */}
              {stage4ViewMode !== "preview" && (
                <div
                  className={`${
                    stage4ViewMode === "editor" ? "lg:col-span-12" : "lg:col-span-6"
                  } max-h-[82vh] overflow-y-auto pr-1 space-y-4`}
                >
                  <LiveResumeEditor resume={activeResume} onChange={setActiveResume} />
                </div>
              )}

              {/* Right Column: Sheet Preview with independent scroll and zoom */}
              {stage4ViewMode !== "editor" && (
                <div
                  className={`${
                    stage4ViewMode === "preview" ? "lg:col-span-12" : "lg:col-span-6"
                  } rounded-3xl overflow-hidden border border-zinc-300 dark:border-zinc-800 shadow-2xl bg-zinc-200/40 dark:bg-zinc-800/40 max-h-[82vh] flex flex-col`}
                >
                  <div className="sticky top-0 z-10 px-5 py-3 bg-zinc-100/90 dark:bg-zinc-800/90 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      Interactive Sheet Preview ({selectedFormat})
                    </span>
                    <span className="text-[11px] text-zinc-500">
                      Standard A4 Print Dimensions
                    </span>
                  </div>

                  <div className="overflow-x-auto overflow-y-auto flex-1 p-4 flex justify-center items-start">
                    <div
                      style={{
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: "top center",
                        transition: "transform 0.15s ease-out",
                      }}
                      className="shadow-xl bg-white mb-8"
                    >
                      <div id="resume-preview-sheet" ref={printRef}>
                        {selectedFormat === "gemini-standard" && (
                          <GeminiStandardTemplate resume={activeResume} highlightChanges={false} />
                        )}
                        {selectedFormat === "modern-tech" && (
                          <ModernTechTemplate resume={activeResume} />
                        )}
                        {selectedFormat === "classic-ats" && (
                          <ClassicATSTemplate resume={activeResume} />
                        )}
                        {selectedFormat === "executive-impact" && (
                          <ExecutiveImpactTemplate resume={activeResume} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: RECORDS & LIBRARY WORKSPACE */}
        {/* ========================================================================= */}
        {activeTab === "records" && (
          <div className="space-y-6">
            <ResumeRecordsHistory
              records={records}
              onSelectRecord={handleSelectRecord}
              onDeleteRecord={handleDeleteRecord}
              onDownloadRecord={handleDownloadPDF}
            />
          </div>
        )}
      </main>

      {/* Admin Center Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        currentUser={currentUser}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
