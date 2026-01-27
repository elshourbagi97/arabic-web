import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node scripts/generate-pdf.js <data.json> <output.pdf>");
  process.exit(1);
}

const [dataPath, outPath] = args;

const readFile = (p) => fs.readFileSync(path.resolve(p), "utf8");

const escapeHtml = (str) =>
  String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildHtml = (data, cssFonts, cssTable) => {
  const { title = "", headers = [], rows = [] } = data;

  const headerCells = headers
    .map((h) => `<th scope="col">${escapeHtml(h)}</th>`)
    .join("");

  const bodyRows = rows
    .map((row, rIdx) => {
      const cells = headers
        .map((h, cIdx) => {
          let value = "";
          if (row == null) value = "";
          else if (Array.isArray(row)) value = row[cIdx] ?? "";
          else if (typeof row === "object")
            value = row[h] ?? row[String(cIdx)] ?? "";
          else value = String(row);
          return `<td class="cell">${escapeHtml(value)}</td>`;
        })
        .join("");
      return `<tr><td class="row-number">${rIdx + 1}</td>${cells}</tr>`;
    })
    .join("");

  return `<!doctype html>
  <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title)}</title>
      <style>
        ${cssFonts}
      </style>
      <style>
        ${cssTable}
      </style>
    </head>
    <body class="printable-page font-arabic">
      <div class="print-area">
        <table class="record-table" role="table" aria-label="${escapeHtml(title)}">
          <caption class="table-title">${escapeHtml(title)}</caption>
          <thead>
            <tr>
              <th scope="col" class="col-number">#</th>
              ${headerCells}
            </tr>
          </thead>
          <tbody>
            ${bodyRows}
          </tbody>
        </table>
      </div>
    </body>
  </html>`;
};

async function main() {
  const jsonRaw = readFile(dataPath);
  let data;
  try {
    data = JSON.parse(jsonRaw);
  } catch (e) {
    console.error("Failed to parse JSON:", e.message);
    process.exit(2);
  }

  // Read CSS from project files if available, otherwise fallback to sensible defaults
  let cssFonts = "";
  let cssTable = "";
  try {
    cssFonts = readFile(path.resolve("src/styles/fonts.css"));
  } catch (e) {
    cssFonts =
      "@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');\n@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap');\n.font-arabic { font-family: 'Amiri', 'Cairo', Tahoma, Arial, sans-serif; }";
  }
  try {
    cssTable = readFile(path.resolve("src/app/components/printable-table.css"));
  } catch (e) {
    cssTable = `@page { size: A4 landscape; margin: 18mm; }\n*{ -webkit-print-color-adjust:exact; print-color-adjust:exact }\nbody{direction:rtl; font-family: 'Amiri','Cairo', Tahoma, Arial, sans-serif; color:#222} .record-table{width:100%;border-collapse:collapse;table-layout:fixed;border:1px solid #e0e0e0;font-size:12.5pt} .record-table caption.table-title{caption-side:top;text-align:center;font-size:16pt;font-weight:700;padding:6px 0 10px 0} .record-table thead th{background:#f5f5f5;border:1px solid #e6e6e6;padding:10px 8px;text-align:center;vertical-align:middle;font-weight:700} .record-table tbody td{border:1px solid #ececec;padding:10px 8px;text-align:center;vertical-align:middle;height:52px;white-space:normal;word-break:break-word;hyphens:auto} .row-number,.col-number{width:56px;max-width:56px;text-align:center}`;
  }

  const html = buildHtml(data, cssFonts, cssTable);

  // Launch Puppeteer dynamically (ESM)
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    // Ensure fonts loaded
    await page.evaluateHandle("document.fonts.ready");

    await page.pdf({
      path: outPath,
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "18mm", right: "18mm", bottom: "18mm", left: "18mm" },
    });
    console.log("PDF generated:", outPath);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(3);
});
