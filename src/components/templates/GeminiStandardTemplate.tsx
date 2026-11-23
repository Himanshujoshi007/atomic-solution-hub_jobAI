"use client";

import React from "react";
import { ResumeData } from "@/types/resume";
import { formatShortMonthRange } from "@/data/atsMonochromeSpec";

interface TemplateProps {
  resume: ResumeData;
  highlightChanges?: boolean;
  tailoredBullets?: string[];
  isSummaryChanged?: boolean;
  onInlineEdit?: (field: string, value: any) => void;
}

/**
 * Single-Page Compact ATS Monochrome Layout
 * Fully conforms to the specification:
 * - Margins: 4mm top/bottom, 5mm left/right
 * - Monochrome: #000000 text and 1.5pt solid divider lines, #FFFFFF background
 * - Sans-Serif: Calibri, Arial, Inter
 * - Name: 16pt bold, centered, no underline
 * - Contact Bar: 9pt centered with " | ", no divider, 6pt bottom spacing
 * - Section Headings: 11pt bold, Title Case, left aligned, 1.5pt black bottom border
 * - Body & Bullets: 9pt justified, line-height 1.15, 10pt bullet indent, 1.5pt spacing
 * - Section Order: Header -> Summary -> Technical Skills -> Certifications & Achievements -> Professional Experience -> Education
 */
export const GeminiStandardTemplate: React.FC<TemplateProps> = ({
  resume,
  highlightChanges = false,
  tailoredBullets = [],
  isSummaryChanged = false,
}) => {
  const isBulletTailored = (text: string) => {
    if (!highlightChanges) return false;
    return tailoredBullets.some(
      (b) => b.trim().toLowerCase() === text.trim().toLowerCase() || text.includes(b.slice(0, 30))
    );
  };

  // Build clean contact items
  const contactParts: string[] = [];
  if (resume.contact?.email) contactParts.push(resume.contact.email);
  if (resume.contact?.phone) contactParts.push(resume.contact.phone);
  if (resume.contact?.location) contactParts.push(resume.contact.location);
  if (resume.contact?.linkedin) contactParts.push(resume.contact.linkedin);
  if (resume.contact?.github && !resume.contact?.linkedin) contactParts.push(resume.contact.github);

  // Certifications inline list
  const certificationsList = resume.certifications && resume.certifications.length > 0
    ? resume.certifications.filter(Boolean)
    : [];

  return (
    <div
      className="bg-white text-black p-[4mm_5mm] font-['Calibri',Arial,'Inter',sans-serif] leading-[1.15] text-[9pt] max-w-[210mm] mx-auto min-h-[297mm] shadow-sm print:p-0 print:shadow-none print:max-w-none print:min-h-0"
      style={{
        boxSizing: "border-box",
        color: "#000000",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* 1. Header (Name + Contact Bar — no underline, 6pt spacing below) */}
      {(resume.fullName || contactParts.length > 0) && (
        <header className="mb-[6pt]">
          {resume.fullName && (
            <h1 className="text-[16pt] font-bold text-center m-0 leading-tight text-black tracking-normal">
              {resume.fullName}
            </h1>
          )}

          {contactParts.length > 0 && (
            <div className="text-center text-[9pt] leading-tight text-black mt-[2pt]">
              {contactParts.join(" | ")}
            </div>
          )}
        </header>
      )}

      {/* 2. Summary (show_title: true, single paragraph, justified) */}
      {resume.summary && (
        <section className="mb-[2pt]">
          <h2 className="text-[11pt] font-bold text-left text-black border-b-[1.5pt] border-black pb-0.5 mt-[5pt] mb-[3pt] tracking-normal">
            Summary
          </h2>
          <p
            className={`text-justify text-[9pt] leading-[1.15] m-0 mb-[3pt] text-black transition-all ${
              highlightChanges && isSummaryChanged
                ? "bg-emerald-50 text-emerald-950 p-1 rounded border border-emerald-300 font-medium"
                : ""
            }`}
          >
            {resume.summary}
          </p>
        </section>
      )}

      {/* 3. Technical Skills (categorized_lines, category_label bold, justified) */}
      {((resume.skillGroups && resume.skillGroups.length > 0) ||
        resume.skills?.languages?.length > 0 ||
        resume.skills?.frameworks?.length > 0) && (
        <section className="mb-[2pt]">
          <h2 className="text-[11pt] font-bold text-left text-black border-b-[1.5pt] border-black pb-0.5 mt-[5pt] mb-[3pt] tracking-normal">
            Technical Skills
          </h2>
          <div className="space-y-[1.5pt] text-[9pt] leading-[1.15] text-justify text-black mb-[3pt]">
            {resume.skillGroups && resume.skillGroups.length > 0 ? (
              resume.skillGroups.map((sg, idx) => (
                <div key={idx}>
                  <strong className="font-bold text-black">{sg.category}: </strong>
                  <span>{sg.skills}</span>
                </div>
              ))
            ) : (
              <>
                {resume.skills.languages?.length > 0 && (
                  <div>
                    <strong className="font-bold text-black">Languages: </strong>
                    <span>{resume.skills.languages.join(", ")}</span>
                  </div>
                )}
                {resume.skills.frameworks?.length > 0 && (
                  <div>
                    <strong className="font-bold text-black">Frameworks & Systems: </strong>
                    <span>{resume.skills.frameworks.join(", ")}</span>
                  </div>
                )}
                {resume.skills.developerTools?.length > 0 && (
                  <div>
                    <strong className="font-bold text-black">Tools & Platforms: </strong>
                    <span>{resume.skills.developerTools.join(", ")}</span>
                  </div>
                )}
                {resume.skills.librariesOrCloud?.length > 0 && (
                  <div>
                    <strong className="font-bold text-black">Cloud & Databases: </strong>
                    <span>{resume.skills.librariesOrCloud.join(", ")}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* 4. Certifications & Achievements (inline_single_block, separator: " | ", justified) */}
      {certificationsList.length > 0 && (
        <section className="mb-[2pt]">
          <h2 className="text-[11pt] font-bold text-left text-black border-b-[1.5pt] border-black pb-0.5 mt-[5pt] mb-[3pt] tracking-normal">
            Certifications & Achievements
          </h2>
          <div className="text-justify text-[9pt] leading-[1.15] text-black mb-[3pt]">
            {certificationsList.join(" | ")}
          </div>
        </section>
      )}

      {/* 5. Professional Experience */}
      {/* Header Row: Role Title | Company Name (Left) — Short-Month Date Range | Location (Right) */}
      {/* Sub Header Row: Project: Project Title (Bold/Italic) */}
      {/* Date Format: MMM YYYY – MMM YYYY (e.g., Aug 2025 – Present) */}
      {/* Bullet Alignment: Justified */}
      {resume.experience && resume.experience.length > 0 && (
        <section className="mb-[2pt]">
          <h2 className="text-[11pt] font-bold text-left text-black border-b-[1.5pt] border-black pb-0.5 mt-[5pt] mb-[3pt] tracking-normal">
            Professional Experience
          </h2>
          <div className="space-y-[3pt]">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                {/* Experience Header Row: Role Title | Company Name (Left) — Date Range | Location (Right) */}
                <div className="flex justify-between items-baseline text-[9pt] font-bold text-black mb-[1pt]">
                  <span>
                    {exp.role} | {exp.company}
                  </span>
                  <span className="font-bold shrink-0 ml-2">
                    {formatShortMonthRange(exp.startDate, exp.endDate)}
                    {exp.location ? ` | ${exp.location}` : ""}
                  </span>
                </div>

                {/* Bullets: 9pt, line-height 1.15, text-alignment justify, 10pt indent, 1.5pt spacing */}
                <ul className="m-0 pl-[10pt] mb-[2pt] space-y-[1.5pt] list-disc">
                  {exp.bullets.map((bullet, idx) => {
                    const isTailored = isBulletTailored(bullet);
                    return (
                      <li
                        key={idx}
                        className={`text-[9pt] leading-[1.15] text-justify text-black transition-all ${
                          isTailored
                            ? "bg-emerald-50 text-emerald-950 p-1 rounded border-l-2 border-emerald-500 font-medium"
                            : ""
                        }`}
                      >
                        {bullet}
                        {isTailored && (
                          <span className="ml-1.5 text-[8pt] font-bold uppercase text-emerald-700 bg-emerald-100/80 px-1 py-0.2 rounded print:hidden">
                            ✨ Tailored
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects (if any extra strategic project exists) */}
      {resume.projects && resume.projects.length > 0 && (
        <section className="mb-[2pt]">
          <h2 className="text-[11pt] font-bold text-left text-black border-b-[1.5pt] border-black pb-0.5 mt-[5pt] mb-[3pt] tracking-normal">
            Key Projects
          </h2>
          <div className="space-y-[2pt]">
            {resume.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline text-[9pt] font-bold text-black">
                  <span>
                    Project: <span className="italic">{proj.title}</span>
                  </span>
                  {proj.link && (
                    <span className="font-normal text-[8pt] text-black underline">
                      {proj.link}
                    </span>
                  )}
                </div>
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="m-0 pl-[10pt] mt-0.5 mb-[2pt] list-disc space-y-[1.5pt]">
                    {proj.bullets.map((b, idx) => (
                      <li key={idx} className="text-[9pt] leading-[1.15] text-justify text-black">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Education */}
      {/* Header Row: Institution Name — Location (Left) — Short-Month Date Range (Right) */}
      {/* Sub Row: Degree Title */}
      {/* Date Format: MMM YYYY – MMM YYYY */}
      {resume.education && resume.education.length > 0 && (
        <section className="mb-[2pt]">
          <h2 className="text-[11pt] font-bold text-left text-black border-b-[1.5pt] border-black pb-0.5 mt-[5pt] mb-[3pt] tracking-normal">
            Education
          </h2>
          <div className="space-y-[2pt]">
            {resume.education.map((edu) => {
              const displayDegree =
                edu.degree && !/^(degree|degree title)?$/i.test(edu.degree.trim())
                  ? edu.degree
                  : "";
              const dateRange = formatShortMonthRange(edu.startDate, edu.endDate);

              return (
                <div key={edu.id} className="mb-[2pt]">
                  {/* Header Row: Institution Name — Location (Left) — Date Range (Right) */}
                  <div className="flex justify-between items-baseline text-[9pt] font-bold text-black">
                    <span>
                      {edu.institution}
                      {edu.field && !displayDegree.includes(edu.field) ? ` — ${edu.field}` : ""}
                    </span>
                    {dateRange && (
                      <span className="font-bold shrink-0 ml-2">
                        {dateRange}
                      </span>
                    )}
                  </div>
                  {/* Sub Row: Degree Title */}
                  {displayDegree && (
                    <div className="text-[9pt] text-black">
                      {displayDegree}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
