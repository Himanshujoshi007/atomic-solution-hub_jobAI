/**
 * Robust utility to extract clean plain text from PDF, DOCX, TXT, MD files.
 * Uses the Next.js /api/extract backend endpoint with fallback to client-side parsers.
 */

export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // 1. First Attempt: Call the high-performance local server extraction endpoint (/api/extract)
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/extract", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text && data.text.trim().length > 15) {
        // Double check text doesn't contain raw stream gibberish
        if (!data.text.includes("%PDF-") && !data.text.includes("/Filter/FlateDecode")) {
          return data.text.trim();
        }
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      if (errData.error) {
        console.warn("Server extraction error message:", errData.error);
      }
    }
  } catch (apiErr) {
    console.warn("Server /api/extract unreachable, attempting client-side fallback:", apiErr);
  }

  // 2. Client-side Fallback: Word (.docx) via mammoth
  if (
    fileName.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result.value && result.value.trim().length > 10) {
        return result.value.trim();
      }
    } catch (docxErr) {
      console.warn("Client mammoth extraction failed:", docxErr);
    }
  }

  // 3. Client-side Fallback: PDF via pdfjs-dist
  if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || "5.6.205"}/build/pdf.worker.min.mjs`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        useSystemFonts: true,
      } as any);

      const pdf = await loadingTask.promise;
      const extractedPages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        let lastY: number | null = null;
        let pageText = "";

        for (const item of textContent.items as any[]) {
          const str = item.str || "";
          if (!str) continue;

          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += "\n";
          } else if (pageText.length > 0 && !pageText.endsWith(" ") && !pageText.endsWith("\n")) {
            pageText += " ";
          }
          pageText += str;
          lastY = item.transform[5];
        }

        extractedPages.push(pageText);
      }

      const combinedText = extractedPages.join("\n\n").trim();
      if (combinedText.length > 20 && !combinedText.includes("%PDF-")) {
        return combinedText;
      }
    } catch (pdfErr) {
      console.warn("Client pdfjs extraction failed:", pdfErr);
    }

    // Critical guard: Do NOT read raw binary bytes from a PDF!
    throw new Error(
      "Could not extract selectable text from this PDF. If this is an image or scanned document, please switch to 'Paste Resume Text' and paste your resume content directly."
    );
  }

  // 4. Plain Text, Markdown, JSON
  try {
    const raw = await file.text();
    // Safety check against binary stream gibberish
    if (raw.includes("%PDF-") || raw.includes("/Filter/FlateDecode")) {
      throw new Error(
        "Invalid binary stream detected. Please paste your clean resume text instead."
      );
    }
    return raw;
  } catch (err: any) {
    throw new Error("Unable to read file: " + err.message);
  }
}
