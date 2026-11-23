"use client";

import React from "react";
import { ResumeData } from "@/types/resume";

interface TemplateProps {
  resume: ResumeData;
  isEditing?: boolean;
  onUpdate?: (updated: ResumeData) => void;
}

export const ModernTechTemplate: React.FC<TemplateProps> = ({ resume, isEditing, onUpdate }) => {
  const contactParts: string[] = [];
  if (resume.contact?.email) contactParts.push(resume.contact.email);
  if (resume.contact?.phone) contactParts.push(resume.contact.phone);
  if (resume.contact?.location) contactParts.push(resume.contact.location);
  if (resume.contact?.linkedin) contactParts.push(resume.contact.linkedin);
  if (resume.contact?.github) contactParts.push(resume.contact.github);

  return (
    <div className="bg-white text-slate-800 p-8 sm:p-10 font-sans shadow-sm leading-relaxed text-[13px] print:p-0 print:shadow-none min-h-[1050px]">
      {/* Header */}
      {(resume.fullName || contactParts.length > 0) && (
        <div className="border-b-2 border-indigo-600 pb-4 mb-5">
          {resume.fullName && (
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1.5 uppercase">
              {resume.fullName}
            </h1>
          )}
          {contactParts.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600 text-xs font-medium">
              {contactParts.join(" • ")}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {resume.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
            Professional Summary
          </h2>
          <p className="text-slate-700 leading-normal">{resume.summary}</p>
        </div>
      )}

      {/* Skills */}
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
          Technical Skills
        </h2>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <div>
            <span className="font-semibold text-slate-900">Languages: </span>
            <span className="text-slate-700">{resume.skills.languages.join(", ")}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900">Frameworks: </span>
            <span className="text-slate-700">{resume.skills.frameworks.join(", ")}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900">Developer Tools: </span>
            <span className="text-slate-700">{resume.skills.developerTools.join(", ")}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900">Libraries & Cloud: </span>
            <span className="text-slate-700">{resume.skills.librariesOrCloud.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
          Work Experience
        </h2>
        <div className="space-y-4">
          {resume.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-bold text-slate-900 text-sm">{exp.role}</span>
                <span className="text-xs font-medium text-slate-500">
                  {exp.startDate} – {exp.endDate}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs text-indigo-600 font-semibold mb-1.5">
                <span>{exp.company}</span>
                <span className="text-slate-500 font-normal">{exp.location}</span>
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

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
            Featured Engineering Projects
          </h2>
          <div className="space-y-3">
            {resume.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-900 text-xs">
                    {proj.title}
                    <span className="font-normal text-slate-500 text-[11px] ml-2">
                      | {proj.techStack.join(", ")}
                    </span>
                  </span>
                  {proj.link && (
                    <span className="text-[11px] text-indigo-600">{proj.link}</span>
                  )}
                </div>
                <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-700 text-xs">
                  {proj.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
          Education & Credentials
        </h2>
        <div className="space-y-2">
          {resume.education.map((edu) => (
            <div key={edu.id} className="flex justify-between items-baseline text-xs">
              <div>
                <span className="font-bold text-slate-900">{edu.institution}</span>
                <span className="text-slate-700 ml-1.5">
                  — {edu.degree} {edu.field && `in ${edu.field}`}
                </span>
                {edu.gpa && <span className="text-slate-500 ml-1">({edu.gpa})</span>}
              </div>
              <span className="text-slate-500">
                {edu.startDate} – {edu.endDate}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
