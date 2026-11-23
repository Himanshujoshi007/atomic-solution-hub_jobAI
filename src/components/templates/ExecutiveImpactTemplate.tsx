"use client";

import React from "react";
import { ResumeData } from "@/types/resume";

interface TemplateProps {
  resume: ResumeData;
  isEditing?: boolean;
  onUpdate?: (updated: ResumeData) => void;
}

export const ExecutiveImpactTemplate: React.FC<TemplateProps> = ({ resume }) => {
  return (
    <div className="bg-white text-zinc-900 p-8 sm:p-10 font-sans leading-relaxed text-[13px] shadow-sm print:p-0 print:shadow-none min-h-[1050px]">
      {/* Top Banner Accent */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 pb-4 mb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            {resume.fullName}
          </h1>
          <p className="text-xs font-semibold tracking-wide text-slate-600 mt-0.5">
            Senior Software Engineering & System Architecture Leader
          </p>
        </div>
        <div className="text-right text-xs text-slate-600 space-y-0.5 mt-2 sm:mt-0 font-medium">
          <div>{resume.contact.email} • {resume.contact.phone}</div>
          <div>{resume.contact.location}</div>
          {resume.contact.linkedin && <div className="text-slate-800">{resume.contact.linkedin}</div>}
        </div>
      </div>

      {/* Executive Summary */}
      {resume.summary && (
        <div className="mb-5 bg-slate-50 p-3.5 rounded border-l-4 border-slate-800">
          <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-800 mb-1">
            Executive Overview
          </h2>
          <p className="text-xs leading-relaxed text-slate-700">{resume.summary}</p>
        </div>
      )}

      {/* Core Competencies & Skills */}
      <div className="mb-5">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
          Core Competencies & Technology Stack
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div>
            <span className="font-bold text-slate-900">Languages: </span>
            <span className="text-slate-700">{resume.skills.languages.join(", ")}</span>
          </div>
          <div>
            <span className="font-bold text-slate-900">Frameworks: </span>
            <span className="text-slate-700">{resume.skills.frameworks.join(", ")}</span>
          </div>
          <div>
            <span className="font-bold text-slate-900">Cloud & Data: </span>
            <span className="text-slate-700">{resume.skills.librariesOrCloud.join(", ")}</span>
          </div>
          <div>
            <span className="font-bold text-slate-900">DevOps & Tooling: </span>
            <span className="text-slate-700">{resume.skills.developerTools.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Professional Experience */}
      <div className="mb-5">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
          Demonstrated Leadership & Experience
        </h2>
        <div className="space-y-4">
          {resume.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs">
                <span>{exp.role}</span>
                <span className="font-normal text-slate-600">{exp.startDate} – {exp.endDate}</span>
              </div>
              <div className="flex justify-between items-baseline text-xs font-semibold text-slate-700 mb-1.5">
                <span>{exp.company}</span>
                <span className="font-normal text-slate-500">{exp.location}</span>
              </div>
              <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 text-xs">
                {exp.bullets.map((bullet, idx) => (
                  <li key={idx}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Key Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
            Selected Strategic Initiatives
          </h2>
          <div className="space-y-3">
            {resume.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline font-bold text-xs text-slate-900">
                  <span>{proj.title} <span className="font-normal text-slate-500">({proj.techStack.join(", ")})</span></span>
                  {proj.link && <span className="font-normal text-slate-600">{proj.link}</span>}
                </div>
                <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-xs text-slate-700">
                  {proj.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Credentials */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2">
          Education & Credentials
        </h2>
        {resume.education.map((edu) => (
          <div key={edu.id} className="flex justify-between items-baseline text-xs">
            <div>
              <span className="font-bold text-slate-900">{edu.institution}</span>
              <span className="text-slate-700 ml-1.5">— {edu.degree} {edu.field && `in ${edu.field}`}</span>
            </div>
            <span className="text-slate-500">{edu.startDate} – {edu.endDate}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
