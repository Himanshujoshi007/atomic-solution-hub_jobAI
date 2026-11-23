import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

/**
 * High-precision PDF exporter using html-to-image with vector native print fallback.
 * Natively supports modern CSS color spaces (lab, oklch, color-mix) without crashing.
 */
export async function exportElementToPDF(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // Generate crisp 300 DPI image via browser native rasterizer
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2.5,
      backgroundColor: "#ffffff",
      cacheBust: true,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains("no-print")) {
          return false;
        }
        return true;
      },
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error("Failed to load rendered image into memory"));
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (img.height * imgWidth) / img.width;
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= pageHeight;

    // Multi-page support if resume content spans past single page
    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;
    }

    const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
  } catch (err: any) {
    console.warn("Direct raster download encountered error, triggering vector print dialog:", err);
    // Smooth fallback: Open vector browser print dialog with full CSS styling
    triggerNativePrint(elementId);
  }
}

/**
 * Triggers native browser print with vector fidelity, selectable text, and full cloned styles.
 */
export function triggerNativePrint(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printIframe = document.createElement("iframe");
  printIframe.style.position = "fixed";
  printIframe.style.right = "0";
  printIframe.style.bottom = "0";
  printIframe.style.width = "0";
  printIframe.style.height = "0";
  printIframe.style.border = "0";
  document.body.appendChild(printIframe);

  const doc = printIframe.contentDocument || printIframe.contentWindow?.document;
  if (!doc) return;

  // Clone all styles and links from main document so Tailwind and typography are exact
  const styleNodes = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"));
  const clonedStyles = styleNodes.map((s) => s.outerHTML).join("\n");

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Resume</title>
        ${clonedStyles}
        <style>
          @page { size: A4 portrait; margin: 4mm 5mm; }
          body { margin: 0; padding: 0; background: #ffffff !important; color: #000000 !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
          .no-print { display: none !important; }
        </style>
      </head>
      <body>
        <div style="width: 200mm; margin: 0 auto; background: #fff;">
          ${element.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      document.body.removeChild(printIframe);
    } catch {}
  }, 3500);
}
