"use client";

import React from "react";
import { ResumeData } from "@/types/resume";

interface TemplateProps {
  resume: ResumeData;
  isEditing?: boolean;
  onUpdate?: (updated: ResumeData) => void;
}

export const ClassicATSTemplate: React.FC<TemplateProps> = ({ resume }) => {
  return (
    <div className="bg-white text-black p-8 sm:p-10 font-serif leading-normal text-[13px] shadow-sm print:p-0 print:shadow-none min-h-[1050px]">
      {/* Header */}
      <div className="text-center border-b border-black pb-3 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">
          {resume.fullName}
        </h1>
        <div className="text-xs text-gray-800 space-x-2">
          <span>{resume.contact.location}</span>
          <span>|</span>
          <span>{resume.contact.phone}</span>
          <span>|</span>
          <span>{resume.contact.email}</span>
          {resume.contact.linkedin && (
            <>
              <span>|</span>
              <span>{resume.contact.linkedin}</span>
            </>
          )}
          {resume.contact.github && (
            <>
              <span>|</span>
              <span>{resume.contact.github}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {resume.summary && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase border-b border-gray-400 pb-0.5 mb-1.5 tracking-wider">
            Professional Summary
          </h2>
          <p className="text-justify text-xs leading-relaxed">{resume.summary}</p>
        </div>
      )}

      {/* Education */}
      <div className="mb-4">
        <h2 className="text-xs font-bold uppercase border-b border-gray-400 pb-0.5 mb-2 tracking-wider">
          Education
        </h2>
        {resume.education.map((edu) => {
          const displayDegree =
            edu.degree && !/^(degree|degree title)?$/i.test(edu.degree.trim())
              ? edu.degree
              : "";
          return (
            <div key={edu.id} className="mb-1.5 text-xs">
              <div className="flex justify-between font-bold">
                <span>{edu.institution}</span>
                <span>{edu.startDate} – {edu.endDate}</span>
              </div>
              {displayDegree && (
                <div className="flex justify-between italic">
                  <span>{displayDegree}{edu.field && !displayDegree.includes(edu.field) ? `, ${edu.field}` : ""}</span>
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Technical Skills */}
      <div className="mb-4 text-xs">
        <h2 className="text-xs font-bold uppercase border-b border-gray-400 pb-0.5 mb-1.5 tracking-wider">
          Technical Skills
        </h2>
        <div className="space-y-0.5">
          <p>
            <span className="font-bold">Languages: </span>
            {resume.skills.languages.join(", ")}
          </p>
          <p>
            <span className="font-bold">Frameworks & Libraries: </span>
            {resume.skills.frameworks.join(", ")}
          </p>
          <p>
            <span className="font-bold">Developer Tools: </span>
            {resume.skills.developerTools.join(", ")}
          </p>
          <p>
            <span className="font-bold">Databases & Cloud: </span>
            {resume.skills.librariesOrCloud.join(", ")}
          </p>
        </div>
      </div>

      {/* Experience */}
      <div className="mb-4">
        <h2 className="text-xs font-bold uppercase border-b border-gray-400 pb-0.5 mb-2 tracking-wider">
          Professional Experience
        </h2>
        <div className="space-y-3">
          {resume.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between text-xs font-bold">
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>
              <div className="flex justify-between text-xs italic mb-1">
                <span>{exp.role}</span>
                <span>{exp.startDate} – {exp.endDate}</span>
              </div>
              <ul className="list-disc list-outside ml-4 space-y-1 text-xs">
                {exp.bullets.map((bullet, idx) => (
                  <li key={idx} className="text-justify">{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase border-b border-gray-400 pb-0.5 mb-2 tracking-wider">
            Key Projects
          </h2>
          <div className="space-y-2">
            {resume.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between text-xs font-bold">
                  <span>
                    {proj.title}{" "}
                    <span className="font-normal italic">
                      | {proj.techStack.join(", ")}
                    </span>
                  </span>
                  {proj.link && <span className="font-normal underline">{proj.link}</span>}
                </div>
                <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-xs">
                  {proj.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
