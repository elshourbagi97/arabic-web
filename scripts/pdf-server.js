import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";

const app = express();

// Try to load dotenv (synchronously) if available so .env works in ESM
try {
  const require = createRequire(import.meta.url);
  require("dotenv").config();
} catch (e) {
  // dotenv not installed or failed to load; continue without it
}

// Read allowed origins from env (comma-separated). Support wildcards and ensure localhost dev origin is allowed.
const rawAllowed =
  process.env.ALLOWED_ORIGINS ||
  "https://cheerier-zina-snappable.ngrok-free.dev";
const allowedEntries = rawAllowed
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

let allowAllOrigins = false;
const exactOrigins = [];
const regexOrigins = [];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
for (const entry of allowedEntries) {
  if (entry === "*") {
    allowAllOrigins = true;
    break;
  }
  if (entry.includes("*")) {
    const pattern = "^" + escapeRegex(entry).replace(/\\\*/g, ".*") + "$";
    try {
      regexOrigins.push(new RegExp(pattern));
    } catch (e) {
      // ignore invalid patterns
    }
  } else {
    exactOrigins.push(entry);
  }
}

if (
  process.env.NODE_ENV !== "production" &&
  !exactOrigins.includes("http://localhost:5175") &&
  !allowAllOrigins
) {
  exactOrigins.push("http://localhost:5175");
}

const originAllowed = (origin) => {
  if (!origin) return true; // non-browser requests
  if (allowAllOrigins) return true;
  if (exactOrigins.includes(origin)) return true;
  return regexOrigins.some((r) => r.test(origin));
};

const corsOptions = {
  origin: (origin, callback) => {
    if (originAllowed(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-API-KEY",
    "Accept",
  ],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
// Ensure preflight answers for all routes
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "20mb" }));

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

const readFileSafe = (p) => {
  try {
    return fs.readFileSync(path.resolve(p), "utf8");
  } catch (e) {
    return null;
  }
};

// Healthcheck endpoint for orchestration and readiness
app.get("/health", (req, res) => {
  // Basic checks: ensure Puppeteer required binary will be available when called.
  // We respond quickly here; the real check is when /generate-pdf is used.
  res.json({ status: "ok", timestamp: Date.now() });
});

app.post("/generate-pdf", async (req, res) => {
  // API key auth (optional): set env PDF_API_KEY to require Bearer or x-api-key
  const expectedKey = process.env.PDF_API_KEY || null;
  if (expectedKey) {
    const authHeader =
      req.headers["authorization"] || req.headers["Authorization"] || "";
    const xkey = req.headers["x-api-key"] || req.headers["X-API-KEY"] || "";
    const token = String(authHeader).replace(/^Bearer\s+/i, "") || xkey;
    if (!token || token !== expectedKey) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const data = req.body || {};
  const filename = (data.filename || "output") + ".pdf";
  const responseMode = data.response || "attachment"; // 'attachment' | 'inline' | 'base64'

  let cssFonts = readFileSafe("src/styles/fonts.css");
  if (!cssFonts)
    cssFonts =
      "@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');\n.font-arabic { font-family: 'Cairo', Tahoma, Arial, sans-serif; }";

  let cssTable = readFileSafe("src/app/components/printable-table.css");
  if (!cssTable)
    cssTable = `@page { size: A4 landscape; margin: 18mm; } .record-table { width:100%; border-collapse:collapse; } .record-table th, .record-table td { border:1px solid #e0e0e0; padding:8px; text-align:center; } .record-table thead th { background:#f5f5f5; } .row-number, .col-number { width:56px; }`;

  const html = buildHtml(data, cssFonts, cssTable);

  // Simple file-cache: hashed payload -> cached pdf
  const cacheDir =
    process.env.PDF_CACHE_DIR || path.resolve("scripts/.pdf-cache");
  const cacheTtl = Number(process.env.PDF_CACHE_TTL || 3600); // seconds
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const crypto = await import("crypto");
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
  const cacheFile = path.join(cacheDir, `${hash}.pdf`);

  // If cache hit and fresh, return cached PDF
  try {
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile);
      const age = (Date.now() - stats.mtimeMs) / 1000;
      if (age <= cacheTtl) {
        const cached = fs.readFileSync(cacheFile);
        if (responseMode === "base64") {
          return res.json({
            filename,
            mime: "application/pdf",
            content_base64: cached.toString("base64"),
          });
        }
        const disposition = responseMode === "inline" ? "inline" : "attachment";
        res.set({
          "Content-Type": "application/pdf",
          "Content-Length": String(cached.length),
          "Content-Disposition": `${disposition}; filename="${filename}"`,
        });
        return res.send(cached);
      }
    }
  } catch (e) {
    console.warn("PDF cache check failed:", e.message);
  }

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.evaluateHandle("document.fonts.ready");
    const buffer = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      margin: { top: "18mm", right: "18mm", bottom: "18mm", left: "18mm" },
    });

    if (responseMode === "base64") {
      return res.json({
        filename,
        mime: "application/pdf",
        content_base64: buffer.toString("base64"),
      });
    }

    const disposition = responseMode === "inline" ? "inline" : "attachment";
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": String(buffer.length),
      "Content-Disposition": `${disposition}; filename="${filename}"`,
    });
    res.send(buffer);

    // Save to cache asynchronously
    try {
      fs.writeFile(cacheFile, buffer, (err) => {
        if (err) console.warn("Failed to write PDF cache:", err.message);
      });
    } catch (e) {
      console.warn("PDF cache write failed:", e.message);
    }
  } catch (err) {
    console.error("PDF generation failed:", err);
    res.status(500).json({ error: "PDF generation failed" });
  } finally {
    await browser.close();
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`PDF server listening on http://localhost:${port}`);
});
