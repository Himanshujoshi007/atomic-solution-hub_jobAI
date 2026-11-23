const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

async function main() {
  const filePath = process.argv[2];
  if (!filePath || !fs.existsSync(filePath)) {
    console.error("Error: Input file does not exist: " + filePath);
    process.exit(1);
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    if (parser.destroy) {
      await parser.destroy();
    }
    const text = (result.text || "").replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "").trim();
    process.stdout.write(text);
    process.exit(0);
  } catch (err) {
    console.error("Extraction error: " + (err.message || err));
    process.exit(1);
  }
}

main();
