"use client";

import React, { useState } from "react";
import { ResumeData, ExperienceItem, ProjectItem, EducationItem, SkillGroup } from "@/types/resume";
import {
  User,
  Briefcase,
  GraduationCap,
  Code2,
  Sparkles,
  Award,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

interface LiveResumeEditorProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
}

export const LiveResumeEditor: React.FC<LiveResumeEditorProps> = ({ resume, onChange }) => {
  const [activeSection, setActiveSection] = useState<string>("summary");

  const updateContact = (field: keyof ResumeData["contact"], value: string) => {
    onChange({
      ...resume,
      contact: {
        ...resume.contact,
        [field]: value,
      },
    });
  };

  const updateSummary = (value: string) => {
    onChange({ ...resume, summary: value });
  };

  // Skill Groups (Gemini style)
  const updateSkillGroup = (idx: number, field: keyof SkillGroup, val: string) => {
    const nextGroups = [...(resume.skillGroups || [])];
    nextGroups[idx] = { ...nextGroups[idx], [field]: val };
    onChange({ ...resume, skillGroups: nextGroups });
  };

  const addSkillGroup = () => {
    const nextGroups = [
      ...(resume.skillGroups || []),
      { category: "New Competency", skills: "Skill 1, Skill 2, Skill 3" },
    ];
    onChange({ ...resume, skillGroups: nextGroups });
  };

  const removeSkillGroup = (idx: number) => {
    const nextGroups = (resume.skillGroups || []).filter((_, i) => i !== idx);
    onChange({ ...resume, skillGroups: nextGroups });
  };

  // Experience updates
  const updateExpField = (idx: number, field: keyof ExperienceItem, val: any) => {
    const nextExp = [...resume.experience];
    nextExp[idx] = { ...nextExp[idx], [field]: val };
    onChange({ ...resume, experience: nextExp });
  };

  const updateExpBullet = (expIdx: number, bIdx: number, text: string) => {
    const nextExp = [...resume.experience];
    const nextBullets = [...nextExp[expIdx].bullets];
    nextBullets[bIdx] = text;
    nextExp[expIdx] = { ...nextExp[expIdx], bullets: nextBullets };
    onChange({ ...resume, experience: nextExp });
  };

  const addExpBullet = (expIdx: number) => {
    const nextExp = [...resume.experience];
    nextExp[expIdx].bullets.push("Collaborated across teams to achieve measurable impact.");
    onChange({ ...resume, experience: nextExp });
  };

  const removeExpBullet = (expIdx: number, bIdx: number) => {
    const nextExp = [...resume.experience];
    nextExp[expIdx].bullets = nextExp[expIdx].bullets.filter((_, i) => i !== bIdx);
    onChange({ ...resume, experience: nextExp });
  };

  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      company: "Company Name",
      role: "Position / Role",
      location: "City, State",
      startDate: "01/2023",
      endDate: "Present",
      bullets: ["Achieved targeted deliverables and reduced cycle time."],
    };
    onChange({ ...resume, experience: [newExp, ...resume.experience] });
  };

  const removeExperience = (idx: number) => {
    const nextExp = resume.experience.filter((_, i) => i !== idx);
    onChange({ ...resume, experience: nextExp });
  };

  // Education updates
  const updateEduField = (idx: number, field: keyof EducationItem, val: any) => {
    const nextEdu = [...resume.education];
    nextEdu[idx] = { ...nextEdu[idx], [field]: val };
    onChange({ ...resume, education: nextEdu });
  };

  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: "University / Institution",
      degree: "Bachelor of Science",
      field: "Discipline",
      startDate: "2018",
      endDate: "2022",
    };
    onChange({ ...resume, education: [...resume.education, newEdu] });
  };

  const removeEducation = (idx: number) => {
    const nextEdu = resume.education.filter((_, i) => i !== idx);
    onChange({ ...resume, education: nextEdu });
  };

  // Certifications
  const updateCert = (idx: number, val: string) => {
    const nextCerts = [...(resume.certifications || [])];
    nextCerts[idx] = val;
    onChange({ ...resume, certifications: nextCerts });
  };

  const addCert = () => {
    const nextCerts = [...(resume.certifications || []), "New Professional Certification"];
    onChange({ ...resume, certifications: nextCerts });
  };

  const removeCert = (idx: number) => {
    const nextCerts = (resume.certifications || []).filter((_, i) => i !== idx);
    onChange({ ...resume, certifications: nextCerts });
  };

  const sections = [
    { id: "contact", label: "Contact & Title", icon: User },
    { id: "summary", label: "Summary", icon: Sparkles },
    { id: "skills", label: "Core Skills", icon: Code2 },
    { id: "experience", label: "Work Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "certifications", label: "Certifications", icon: Award },
  ];

  const currentSectionIndex = sections.findIndex((s) => s.id === activeSection);

  return (
    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/40 dark:border-zinc-800 rounded-3xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Live Interactive Resume Editor</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Select any section below to edit. Changes reflect live on the sheet preview immediately.
          </p>
        </div>
      </div>

      {/* Responsive Grid for All 6 Sections - No Horizontal Scrolling Required */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-102 ring-2 ring-indigo-400/40"
                  : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Contact & Title */}
      {activeSection === "contact" && (
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={resume.fullName}
                onChange={(e) => onChange({ ...resume, fullName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Target Subtitle / Title
              </label>
              <input
                type="text"
                value={resume.subtitle || ""}
                onChange={(e) => onChange({ ...resume, subtitle: e.target.value })}
                placeholder="e.g. Associate Product Manager"
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={resume.contact.email}
                onChange={(e) => updateContact("email", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={resume.contact.phone}
                onChange={(e) => updateContact("phone", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Location
              </label>
              <input
                type="text"
                value={resume.contact.location}
                onChange={(e) => updateContact("location", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                LinkedIn URL
              </label>
              <input
                type="text"
                value={resume.contact.linkedin || ""}
                onChange={(e) => updateContact("linkedin", e.target.value)}
                placeholder="linkedin.com/in/username"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                GitHub / Portfolio URL
              </label>
              <input
                type="text"
                value={resume.contact.github || ""}
                onChange={(e) => updateContact("github", e.target.value)}
                placeholder="github.com/username"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Professional Summary */}
      {activeSection === "summary" && (
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Executive / Professional Summary
            </label>
            <span className="text-[10px] text-zinc-400">
              {resume.summary.length} characters (recommended: 250 - 450)
            </span>
          </div>
          <textarea
            rows={5}
            value={resume.summary}
            onChange={(e) => updateSummary(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-white leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            placeholder="Write a concise 3-4 line summary highlighting cross-functional leadership, technical depth, and quantifiable metrics..."
          />
        </div>
      )}

      {/* 3. Core Competencies / Skills (Gemini format) */}
      {activeSection === "skills" && (
        <div className="space-y-4 pt-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Skill Categories (Gemini ATS Format: Category: Skill List)
            </span>
            <button
              type="button"
              onClick={addSkillGroup}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          </div>

          <div className="space-y-2.5">
            {(resume.skillGroups || []).map((grp, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row gap-2.5 items-start sm:items-center"
              >
                <input
                  type="text"
                  value={grp.category}
                  onChange={(e) => updateSkillGroup(idx, "category", e.target.value)}
                  placeholder="Category Name"
                  className="w-full sm:w-1/3 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white"
                />
                <input
                  type="text"
                  value={grp.skills}
                  onChange={(e) => updateSkillGroup(idx, "skills", e.target.value)}
                  placeholder="Comma separated skills (e.g. Agile, SQL, Figma)"
                  className="w-full sm:flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200"
                />
                <button
                  type="button"
                  onClick={() => removeSkillGroup(idx)}
                  className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-colors shrink-0"
                  title="Remove Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Experience & Bullets */}
      {activeSection === "experience" && (
        <div className="space-y-4 pt-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Work Experience ({resume.experience.length} roles)
            </span>
            <button
              type="button"
              onClick={addExperience}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Experience Role
            </button>
          </div>

          <div className="space-y-4">
            {resume.experience.map((exp, expIdx) => (
              <div
                key={exp.id || expIdx}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExpField(expIdx, "company", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                      Job Role / Designation
                    </label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => updateExpField(expIdx, "role", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExpField(expIdx, "startDate", e.target.value)}
                      placeholder="03/2023"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => updateExpField(expIdx, "endDate", e.target.value)}
                      placeholder="Present"
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-between">
                    <div className="w-full pr-2">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={exp.location || ""}
                        onChange={(e) => updateExpField(expIdx, "location", e.target.value)}
                        placeholder="City, State"
                        className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExperience(expIdx)}
                      className="p-1.5 mt-4 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete this role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bullets for this role */}
                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                      Achievement Bullets (Google X-Y-Z Formula)
                    </span>
                    <button
                      type="button"
                      onClick={() => addExpBullet(expIdx)}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Bullet
                    </button>
                  </div>

                  {exp.bullets.map((bText, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="text-zinc-400 mt-2 text-xs">•</span>
                      <textarea
                        rows={2}
                        value={bText}
                        onChange={(e) => updateExpBullet(expIdx, bIdx, e.target.value)}
                        className="flex-1 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs leading-relaxed"
                      />
                      <button
                        type="button"
                        onClick={() => removeExpBullet(expIdx, bIdx)}
                        className="p-1.5 text-zinc-400 hover:text-red-500"
                        title="Remove Bullet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Education */}
      {activeSection === "education" && (
        <div className="space-y-4 pt-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Education & Degrees
            </span>
            <button
              type="button"
              onClick={addEducation}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Degree
            </button>
          </div>

          <div className="space-y-3">
            {resume.education.map((edu, eduIdx) => (
              <div
                key={edu.id || eduIdx}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
              >
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                    Degree & Field
                  </label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEduField(eduIdx, "degree", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEduField(eduIdx, "institution", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                    Dates
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) => updateEduField(eduIdx, "startDate", e.target.value)}
                      className="w-1/2 px-2 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
                    />
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => updateEduField(eduIdx, "endDate", e.target.value)}
                      className="w-1/2 px-2 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeEducation(eduIdx)}
                    className="p-1.5 text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Certifications */}
      {activeSection === "certifications" && (
        <div className="space-y-4 pt-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Certifications & Credentials
            </span>
            <button
              type="button"
              onClick={addCert}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Certification
            </button>
          </div>

          <div className="space-y-2">
            {(resume.certifications || []).map((cert, cIdx) => (
              <div key={cIdx} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={cert}
                  onChange={(e) => updateCert(cIdx, e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => removeCert(cIdx)}
                  className="p-2 text-zinc-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation Buttons: Easily switch sections without scrolling */}
      <div className="flex justify-between items-center pt-4 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <button
          type="button"
          disabled={currentSectionIndex === 0}
          onClick={() => setActiveSection(sections[currentSectionIndex - 1].id)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Section</span>
        </button>

        <span className="text-[11px] font-bold text-zinc-400">
          Section {currentSectionIndex + 1} of {sections.length}
        </span>

        <button
          type="button"
          disabled={currentSectionIndex === sections.length - 1}
          onClick={() => setActiveSection(sections[currentSectionIndex + 1].id)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          <span>Next Section</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
