import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { parseResumeText } from "@/lib/parser";
import mammoth from "mammoth";
import path from "path";
import fs from "fs";
import os from "os";
import { execFileSync } from "child_process";
import { ResumeData } from "@/types/resume";

export async function POST(req: NextRequest) {
  try {
    let rawText = "";
    let userApiKey = req.headers.get("x-gemini-api-key") || "";

    const contentType = req.headers.get("content-type") || "";

    // 1. Handle Multipart Form Data (File Upload)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const formKey = formData.get("apiKey") as string | null;
      if (formKey) userApiKey = formKey;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const fileName = file.name.toLowerCase();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // JSON Direct Upload
      if (fileName.endsWith(".json")) {
        try {
          const jsonParsed = JSON.parse(buffer.toString("utf-8"));
          return NextResponse.json({
            success: true,
            resume: jsonParsed,
            engine: "json-direct",
            stats: {
              experienceCount: jsonParsed.experience?.length || 0,
              skillsCount: jsonParsed.skillGroups?.length || 0,
              educationCount: jsonParsed.education?.length || 0,
            },
          });
        } catch {
          return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
        }
      }

      // PDF File Extraction via out-of-process Node worker
      if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
        const tempPdfPath = path.join(
          os.tmpdir(),
          `resume-parse-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`
        );
        try {
          fs.writeFileSync(tempPdfPath, buffer);
          const extractorScript = path.join(process.cwd(), "src", "lib", "pdfExtractor.cjs");
          const stdout = execFileSync(process.execPath, [extractorScript, tempPdfPath], {
            encoding: "utf-8",
            maxBuffer: 15 * 1024 * 1024,
            timeout: 10000,
          });
          rawText = stdout ? stdout.trim() : "";
        } catch (pdfErr: any) {
          console.error("PDF extractor error:", pdfErr);
          return NextResponse.json(
            { error: "Failed to extract text from PDF: " + (pdfErr.stderr || pdfErr.message || "Unreadable PDF") },
            { status: 500 }
          );
        } finally {
          try {
            if (fs.existsSync(tempPdfPath)) {
              fs.unlinkSync(tempPdfPath);
            }
          } catch (e) {
            console.warn("Temp cleanup warning:", e);
          }
        }
      }
      // Word (.docx) Extraction
      else if (
        fileName.endsWith(".docx") ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        try {
          const result = await mammoth.extractRawText({ buffer });
          rawText = result.value || "";
        } catch (docxErr: any) {
          return NextResponse.json(
            { error: "Failed to extract text from Word document: " + (docxErr.message || "Invalid DOCX") },
            { status: 500 }
          );
        }
      }
      // Text / Markdown
      else {
        rawText = buffer.toString("utf-8");
      }
    }
    // 2. Handle JSON Payload (Pasted text)
    else {
      const body = await req.json().catch(() => ({}));
      rawText = body.rawText || "";
      if (body.apiKey) userApiKey = body.apiKey;
    }

    // Safety checks against empty text or raw binary streams
    if (!rawText || rawText.trim().length < 15) {
      return NextResponse.json(
        { error: "No readable text found in document. Please paste your resume text directly." },
        { status: 422 }
      );
    }

    if (rawText.includes("%PDF-") || rawText.includes("/Filter/FlateDecode")) {
      return NextResponse.json(
        { error: "Raw binary PDF stream detected. Could not extract text layer. Please paste your resume text." },
        { status: 422 }
      );
    }

    const effectiveApiKey =
      userApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "";

    // 3. Attempt AI Semantic Parsing if API key is present
    if (effectiveApiKey.trim()) {
      try {
        const aiParsed = await parseWithGemini(rawText, effectiveApiKey.trim());
        if (aiParsed && aiParsed.fullName && aiParsed.experience?.length) {
          return NextResponse.json({
            success: true,
            resume: aiParsed,
            engine: "gemini-ai",
            stats: {
              experienceCount: aiParsed.experience.length,
              skillsCount: aiParsed.skillGroups?.length || 0,
              educationCount: aiParsed.education?.length || 0,
            },
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini resume parsing failed, falling back to algorithmic parser:", geminiErr);
      }
    }

    // 4. Fallback to High-Precision Algorithmic Parser
    const algorithmicParsed = parseResumeText(rawText);

    return NextResponse.json({
      success: true,
      resume: algorithmicParsed,
      engine: "high-precision-algorithmic",
      stats: {
        experienceCount: algorithmicParsed.experience.length,
        skillsCount: algorithmicParsed.skillGroups?.length || 0,
        educationCount: algorithmicParsed.education.length,
      },
    });
  } catch (err: any) {
    console.error("Parse resume route error:", err);
    return NextResponse.json(
      { error: "Unexpected error parsing resume: " + (err.message || String(err)) },
      { status: 500 }
    );
  }
}

async function parseWithGemini(rawText: string, apiKey: string): Promise<ResumeData> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert resume parsing and restructuring engine.
Parse the following raw resume text into the exact JSON format required.

RULES:
1. Extract the candidate's exact full name and professional role/subtitle.
2. Extract email, phone number, location, and LinkedIn/GitHub links.
3. Extract professional summary into a cohesive paragraph.
4. Extract all skills into structured categories (e.g. "Languages & Tools", "Frameworks & Architecture", "Cloud & DevOps", "Domain Competencies").
5. Extract each work experience role with:
   - company (clean company name, without trailing location/date)
   - role (job title)
   - location
   - startDate and endDate (e.g. "Jul 2024", "Present", "2021", "2023")
   - bullets: array of all accomplishment bullets belonging to that role
6. Extract all education degrees with:
   - institution (university or college name)
   - degree (exact degree title, e.g. "Master of Science in Mechanical Engineering", "Bachelor of Engineering")
   - startDate and endDate
7. Extract certifications and technical projects.

RAW RESUME TEXT:
${rawText}

OUTPUT STRICT JSON MATCHING THIS EXACT SCHEMA:
{
  "fullName": "Candidate Name",
  "subtitle": "Professional Role Title",
  "contact": {
    "email": "candidate@email.com",
    "phone": "(555) 000-0000",
    "location": "City, State",
    "linkedin": "linkedin.com/in/candidate",
    "github": "github.com/candidate"
  },
  "summary": "Cohesive summary text...",
  "skills": { "languages": [], "frameworks": [], "developerTools": [], "librariesOrCloud": [] },
  "skillGroups": [
    { "category": "Category Name", "skills": "Skill 1, Skill 2, Skill 3" }
  ],
  "experience": [
    {
      "id": "exp-1",
      "company": "Company Name",
      "role": "Role Title",
      "location": "Location",
      "startDate": "Date",
      "endDate": "Date",
      "bullets": ["Bullet 1", "Bullet 2"]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "institution": "University Name",
      "degree": "Degree Title",
      "startDate": "Date",
      "endDate": "Date"
    }
  ],
  "projects": [],
  "certifications": ["Certification 1"]
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const responseText = response.text || "";
  const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned) as ResumeData;
}
