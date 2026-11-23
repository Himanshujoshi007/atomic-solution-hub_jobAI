"use client";

import React, { useState } from "react";
import { ResumeData, ExperienceItem, EducationItem, SkillGroup } from "@/types/resume";
import { parseResumeText } from "@/lib/parser";
import { SAMPLE_BASE_RESUME } from "@/data/sampleData";
import {
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Building2,
  GraduationCap,
  Wrench,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  RotateCcw,
  User,
  Award,
  Layers,
} from "lucide-react";

interface ResumeUploaderProps {
  currentResume: ResumeData;
  onLoaded: (parsed: ResumeData) => void;
  onNext: () => void;
  apiKey?: string;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  currentResume,
  onLoaded,
  onNext,
  apiKey = "",
}) => {
  const [rawText, setRawText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeSectionView, setActiveSectionView] = useState<
    "all" | "header" | "summary" | "skills" | "experience" | "education" | "certifications"
  >("all");

  const hasLoadedResume =
    Boolean(currentResume?.fullName && currentResume.fullName !== "Candidate Name") ||
    currentResume?.experience?.length > 0;

  const [showPasteBox, setShowPasteBox] = useState(!hasLoadedResume);

  // Parse pasted raw resume text using server AI/Algorithmic dual-engine or local fallback
  const handleParseText = async (textToParse?: string) => {
    const text = (textToParse ?? rawText).trim();
    if (!text) {
      setErrorMessage("Please paste your resume text before parsing.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      let parsedResume: ResumeData | null = null;

      // Try server parse endpoint first
      try {
        const res = await fetch("/api/parse-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText: text, apiKey }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.resume) {
            parsedResume = data.resume;
          }
        }
      } catch (apiErr) {
        console.warn("Server parse unreachable, using local parser:", apiErr);
      }

      // Fallback to local high-precision parser
      if (!parsedResume) {
        parsedResume = parseResumeText(text);
      }

      onLoaded(parsedResume);
      setShowPasteBox(false);
    } catch (err: any) {
      console.error("Parse error:", err);
      setErrorMessage(err.message || "Failed to parse resume text.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseSample = () => {
    onLoaded(SAMPLE_BASE_RESUME);
    setShowPasteBox(false);
    setErrorMessage("");
  };

  // Updaters for individual fields in activeResume
  const updateResume = (updates: Partial<ResumeData>) => {
    onLoaded({ ...currentResume, ...updates });
  };

  const updateContact = (field: string, val: string) => {
    onLoaded({
      ...currentResume,
      contact: {
        ...currentResume.contact,
        [field]: val,
      },
    });
  };

  // Skill Groups Updaters
  const handleUpdateSkillGroup = (index: number, field: "category" | "skills", value: string) => {
    const groups = [...(currentResume.skillGroups || [])];
    if (groups[index]) {
      groups[index] = { ...groups[index], [field]: value };
      updateResume({ skillGroups: groups });
    }
  };

  const handleAddSkillGroup = () => {
    const groups = [...(currentResume.skillGroups || [])];
    groups.push({ category: "New Technical Domain", skills: "Tools, technologies, and competencies" });
    updateResume({ skillGroups: groups });
  };

  const handleRemoveSkillGroup = (index: number) => {
    const groups = (currentResume.skillGroups || []).filter((_, i) => i !== index);
    updateResume({ skillGroups: groups });
  };

  // Experience Updaters
  const handleUpdateExperience = (index: number, field: keyof ExperienceItem, value: any) => {
    const exps = [...currentResume.experience];
    if (exps[index]) {
      exps[index] = { ...exps[index], [field]: value };
      updateResume({ experience: exps });
    }
  };

  const handleUpdateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    const exps = [...currentResume.experience];
    if (exps[expIndex]) {
      const bullets = [...exps[expIndex].bullets];
      bullets[bulletIndex] = value;
      exps[expIndex] = { ...exps[expIndex], bullets };
      updateResume({ experience: exps });
    }
  };

  const handleAddBullet = (expIndex: number) => {
    const exps = [...currentResume.experience];
    if (exps[expIndex]) {
      const bullets = [...exps[expIndex].bullets, "Authored key deliverables to accelerate production outcomes."];
      exps[expIndex] = { ...exps[expIndex], bullets };
      updateResume({ experience: exps });
    }
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const exps = [...currentResume.experience];
    if (exps[expIndex]) {
      const bullets = exps[expIndex].bullets.filter((_, i) => i !== bulletIndex);
      exps[expIndex] = { ...exps[expIndex], bullets };
      updateResume({ experience: exps });
    }
  };

  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: "Enterprise Technology Co",
      role: currentResume.subtitle || "Professional Role",
      location: currentResume.contact.location || "USA",
      startDate: "Jan 2024",
      endDate: "Present",
      bullets: ["Spearheaded critical engineering initiatives resulting in 25% efficiency improvements."],
    };
    updateResume({ experience: [newExp, ...currentResume.experience] });
  };

  const handleRemoveExperience = (index: number) => {
    const exps = currentResume.experience.filter((_, i) => i !== index);
    updateResume({ experience: exps });
  };

  // Education Updaters
  const handleUpdateEducation = (index: number, field: keyof EducationItem, value: any) => {
    const edus = [...currentResume.education];
    if (edus[index]) {
      edus[index] = { ...edus[index], [field]: value };
      updateResume({ education: edus });
    }
  };

  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: "State University",
      degree: "Bachelor of Science in Engineering",
      startDate: "2018",
      endDate: "2022",
    };
    updateResume({ education: [...currentResume.education, newEdu] });
  };

  const handleRemoveEducation = (index: number) => {
    const edus = currentResume.education.filter((_, i) => i !== index);
    updateResume({ education: edus });
  };

  // Certifications Updaters
  const handleCertificationsChange = (val: string) => {
    const list = val.split("|").map((s) => s.trim()).filter(Boolean);
    updateResume({ certifications: list });
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/40 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
              Step 1: Paste & Verify Resume Sections
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Copy-paste your resume. Our engine extracts each section into editable cards for review.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!showPasteBox && (
            <button
              type="button"
              onClick={() => setShowPasteBox(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <span>Paste New Text</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleUseSample}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-xs font-bold text-indigo-600 dark:text-indigo-300 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Use Sample</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 1. Paste Input Box (Default when starting or when requested) */}
      {showPasteBox ? (
        <div className="space-y-4 p-5 rounded-3xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
              Paste Raw Resume Text
            </span>
            <span className="text-[11px] text-zinc-400">
              Plain text or markdown
            </span>
          </div>

          <textarea
            rows={10}
            placeholder={`Paste your entire resume here...\n\nExample:\nVaibhav Suresh Chaudhari\nMechanical Design Engineer\nvaibhavsuresh31@gmail.com | (203) 823-3634 | USA | LinkedIn\n\nSummary\nMechanical Design Engineer with 4+ years of experience...\n\nTechnical Skills\n• CAD Tools: PTC Creo, UG NX, SOLIDWORKS...\n\nProfessional Experience\nMechanical Design Engineer, GMB North America Jul 2024 – Present | NJ, USA\n• Designed precision gearboxes...`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-zinc-400">
              {rawText.trim().length > 0 ? `${rawText.trim().split(/\s+/).length} words ready to parse` : "Waiting for pasted text..."}
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {hasLoadedResume && (
                <button
                  type="button"
                  onClick={() => setShowPasteBox(false)}
                  className="px-4 py-2.5 rounded-2xl bg-zinc-200 dark:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={() => handleParseText()}
                disabled={!rawText.trim() || isProcessing}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span>{isProcessing ? "Extracting & Segmenting..." : "Parse & Inspect Sections →"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 2. Structured Section Inspector & Editor */
        <div className="space-y-5">
          {/* Status Bar */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-xl bg-emerald-600 text-white">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 block">
                  Resume Decoded into 6 Distinct Sections
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Verify or edit any section below. The preview sheet on the right updates live!
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onNext}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md hover:shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Confirm & Proceed to Step 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Section Filter Pills */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-bold">
            {[
              { id: "all", label: "All Sections" },
              { id: "header", label: "1. Header & Contact" },
              { id: "summary", label: "2. Summary" },
              { id: "skills", label: `3. Skills (${currentResume.skillGroups?.length || 0})` },
              { id: "certifications", label: "4. Certifications" },
              { id: "experience", label: `5. Experience (${currentResume.experience.length})` },
              { id: "education", label: `6. Education (${currentResume.education.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSectionView(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeSectionView === tab.id
                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1: HEADER & IDENTITY */}
          {/* ========================================================================= */}
          {(activeSectionView === "all" || activeSectionView === "header") && (
            <div className="p-5 rounded-3xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                <User className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Section 1: Candidate Identity & Contact Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={currentResume.fullName}
                    onChange={(e) => updateResume({ fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Target Professional Role (Subtitle)</label>
                  <input
                    type="text"
                    value={currentResume.subtitle || ""}
                    onChange={(e) => updateResume({ subtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 font-bold text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Email Address</label>
                  <input
                    type="text"
                    value={currentResume.contact.email}
                    onChange={(e) => updateContact("email", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={currentResume.contact.phone}
                    onChange={(e) => updateContact("phone", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Location (City, State / USA)</label>
                  <input
                    type="text"
                    value={currentResume.contact.location}
                    onChange={(e) => updateContact("location", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={currentResume.contact.linkedin || ""}
                    onChange={(e) => updateContact("linkedin", e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: PROFESSIONAL SUMMARY */}
          {/* ========================================================================= */}
          {(activeSectionView === "all" || activeSectionView === "summary") && (
            <div className="p-5 rounded-3xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Section 2: Professional Summary (Single Justified Paragraph)
                </h3>
              </div>

              <textarea
                rows={4}
                value={currentResume.summary}
                onChange={(e) => updateResume({ summary: e.target.value })}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: TECHNICAL SKILLS */}
          {/* ========================================================================= */}
          {(activeSectionView === "all" || activeSectionView === "skills") && (
            <div className="p-5 rounded-3xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    Section 3: Technical Skills (Categorized Lines)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddSkillGroup}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-100"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {(currentResume.skillGroups || []).map((group, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center"
                  >
                    <input
                      type="text"
                      value={group.category}
                      onChange={(e) => handleUpdateSkillGroup(idx, "category", e.target.value)}
                      placeholder="Category Title"
                      className="w-full sm:w-1/3 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={group.skills}
                      onChange={(e) => handleUpdateSkillGroup(idx, "skills", e.target.value)}
                      placeholder="Comma-separated skills (e.g. PTC Creo, SOLIDWORKS, ANSYS)"
                      className="w-full sm:flex-1 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSkillGroup(idx)}
                      className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: CERTIFICATIONS & ACHIEVEMENTS */}
          {/* ========================================================================= */}
          {(activeSectionView === "all" || activeSectionView === "certifications") && (
            <div className="p-5 rounded-3xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-3">
              <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-700 pb-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                  Section 4: Certifications & Achievements (Inline Separated by | )
                </h3>
              </div>

              <textarea
                rows={2}
                value={(currentResume.certifications || []).join(" | ")}
                onChange={(e) => handleCertificationsChange(e.target.value)}
                placeholder="CompTIA Security+ | Certified Scrum Product Owner (CSPO) | Certified Design Engineer"
                className="w-full p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500/40"
              />
              <span className="text-[10px] text-zinc-400 block">
                Items are rendered on a single justified block separated by &apos; | &apos; according to ATS monochrome specifications.
              </span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 5: PROFESSIONAL EXPERIENCE */}
          {/* ========================================================================= */}
          {(activeSectionView === "all" || activeSectionView === "experience") && (
            <div className="p-5 rounded-3xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    Section 5: Professional Experience ({currentResume.experience.length} Roles)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-100"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Role</span>
                </button>
              </div>

              <div className="space-y-4">
                {currentResume.experience.map((exp, expIdx) => (
                  <div
                    key={exp.id || expIdx}
                    className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 space-y-3 shadow-xs"
                  >
                    {/* Role Header Grid */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 flex-1 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block">Job Role Title</label>
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => handleUpdateExperience(expIdx, "role", e.target.value)}
                            placeholder="e.g. Mechanical Design Engineer"
                            className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block">Company Name</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(expIdx, "company", e.target.value)}
                            placeholder="e.g. GMB North America, Inc."
                            className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-indigo-600 dark:text-indigo-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block">Start Date</label>
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => handleUpdateExperience(expIdx, "startDate", e.target.value)}
                            placeholder="e.g. Jul 2024"
                            className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block">End Date & Location</label>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={exp.endDate}
                              onChange={(e) => handleUpdateExperience(expIdx, "endDate", e.target.value)}
                              placeholder="Present"
                              className="w-1/2 px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                            />
                            <input
                              type="text"
                              value={exp.location || ""}
                              onChange={(e) => handleUpdateExperience(expIdx, "location", e.target.value)}
                              placeholder="Location"
                              className="w-1/2 px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(expIdx)}
                        className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg cursor-pointer"
                        title="Delete Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bullets List */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">
                          Accomplishment Bullets ({exp.bullets.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddBullet(expIdx)}
                          className="text-[10px] text-indigo-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Bullet</span>
                        </button>
                      </div>

                      {exp.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-1.5">
                          <span className="text-zinc-400 text-xs mt-1">•</span>
                          <textarea
                            rows={2}
                            value={bullet}
                            onChange={(e) => handleUpdateBullet(expIdx, bIdx, e.target.value)}
                            className="flex-1 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBullet(expIdx, bIdx)}
                            className="text-zinc-400 hover:text-rose-500 p-1 rounded-lg cursor-pointer mt-1"
                            title="Remove Bullet"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 6: EDUCATION */}
          {/* ========================================================================= */}
          {(activeSectionView === "all" || activeSectionView === "education") && (
            <div className="p-5 rounded-3xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700 pb-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    Section 6: Education ({currentResume.education.length} Degrees)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-100"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Degree</span>
                </button>
              </div>

              <div className="space-y-3">
                {currentResume.education.map((edu, eduIdx) => (
                  <div
                    key={edu.id || eduIdx}
                    className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 text-xs">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase block">Degree Title</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(eduIdx, "degree", e.target.value)}
                          placeholder="e.g. Master of Science in Mechanical Engineering"
                          className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase block">Institution / University</label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleUpdateEducation(eduIdx, "institution", e.target.value)}
                          placeholder="e.g. Rowan University, Glassboro, USA"
                          className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-400 uppercase block">Date Range</label>
                        <input
                          type="text"
                          value={`${edu.startDate || ""} – ${edu.endDate || ""}`}
                          onChange={(e) => {
                            const parts = e.target.value.split(/\s*[-–]\s*/);
                            handleUpdateEducation(eduIdx, "startDate", parts[0] || "");
                            handleUpdateEducation(eduIdx, "endDate", parts[1] || "");
                          }}
                          placeholder="e.g. Sep 2023 – May 2025"
                          className="w-full px-2.5 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(eduIdx)}
                      className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg cursor-pointer"
                      title="Delete Education"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Confirmation Bar */}
          <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
            <span className="text-xs text-zinc-400">
              ✓ All modifications save in real-time to your working copy.
            </span>

            <button
              type="button"
              onClick={onNext}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>All Sections Good — Proceed to Step 2: Target JDs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
