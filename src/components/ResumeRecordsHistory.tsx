"use client";

import React, { useState } from "react";
import { TailoredResumeRecord } from "@/types/resume";
import { History, Search, Download, Trash2, Building, Calendar, ArrowRight, Eye } from "lucide-react";

interface ResumeRecordsHistoryProps {
  records: TailoredResumeRecord[];
  onSelectRecord: (record: TailoredResumeRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDownloadRecord: (record: TailoredResumeRecord) => void;
}

export const ResumeRecordsHistory: React.FC<ResumeRecordsHistoryProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onDownloadRecord,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = records.filter((rec) => {
    const term = searchTerm.toLowerCase();
    const matchesTitle = rec.title.toLowerCase().includes(term);
    const matchesCompany = rec.associatedJDs.some(
      (jd) =>
        jd.companyName.toLowerCase().includes(term) ||
        jd.roleTitle.toLowerCase().includes(term)
    );
    return matchesTitle || matchesCompany;
  });

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/40 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              Saved Tailored Resumes
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Stores up to 2,000+ tailored versions linked with company name & matched JDs.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {records.length === 0
              ? "No tailored resumes generated yet. Tailor your first resume above!"
              : "No resumes found matching your search term."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
          {filteredRecords.map((record) => {
            const dateStr = new Date(record.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={record.id}
                className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/50 hover:bg-zinc-100/90 dark:hover:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/60 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {record.title}
                    </span>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {record.atsScore}% ATS
                    </span>
                  </div>

                  {/* Company Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {record.associatedJDs.map((jd, jIdx) => (
                      <span
                        key={jIdx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-700/60 text-[11px] font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        <Building className="w-2.5 h-2.5 text-indigo-500" />
                        {jd.companyName || "Target JD"}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{dateStr}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectRecord(record)}
                      className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                      title="Load into Editor"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadRecord(record)}
                      className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                      title="Quick Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
