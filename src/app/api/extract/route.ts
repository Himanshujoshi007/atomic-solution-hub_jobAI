import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import path from "path";
import fs from "fs";
import os from "os";
import { execFileSync } from "child_process";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = "";

    // 1. PDF File Extraction using out-of-process native Node worker to prevent Turbopack bundle conflicts
    if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
      const tempPdfPath = path.join(os.tmpdir(), `resume-parse-${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`);
      try {
        fs.writeFileSync(tempPdfPath, buffer);

        const extractorScript = path.join(process.cwd(), "src", "lib", "pdfExtractor.cjs");
        const stdout = execFileSync(
          process.execPath,
          [extractorScript, tempPdfPath],
          {
            encoding: "utf-8",
            maxBuffer: 15 * 1024 * 1024,
            timeout: 10000,
          }
        );

        extractedText = stdout ? stdout.trim() : "";
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
        } catch (cleanupErr) {
          console.warn("Temp file cleanup warning:", cleanupErr);
        }
      }
    }
    // 2. Microsoft Word (DOCX) File
    else if (
      fileName.endsWith(".docx") ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || "";
      } catch (docxErr: any) {
        console.error("Server mammoth error:", docxErr);
        return NextResponse.json(
          { error: "Failed to extract text from DOCX: " + (docxErr.message || "Invalid Word document") },
          { status: 500 }
        );
      }
    }
    // 3. Plain text / Markdown / JSON
    else {
      extractedText = buffer.toString("utf-8");
    }

    // Safety guard against binary stream gibberish
    if (extractedText.includes("%PDF-") || extractedText.includes("/Filter/FlateDecode")) {
      return NextResponse.json(
        { error: "Could not decode text layer from PDF. Please copy and paste your resume text." },
        { status: 422 }
      );
    }

    if (!extractedText || extractedText.trim().length < 5) {
      return NextResponse.json(
        { error: "No selectable text found in file. If this is an image-only scanned PDF, please paste your resume text." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      text: extractedText.trim(),
      fileName: file.name,
    });
  } catch (err: any) {
    console.error("API extract error:", err);
    return NextResponse.json(
      { error: "Extraction error: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
