import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Helper: convert ArrayBuffer -> base64
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
}

/**
 * Export an HTML table (by id) to PDF using jsPDF + jspdf-autotable.
 * - Selects table by id
 * - Exports all rows/columns text exactly as shown
 * - Attempts to embed an Arabic TTF from /fonts/Amiri-Regular.ttf (optional)
 * - Uses grid theme to preserve borders and right-aligns columns for Arabic
 */
export async function exportHtmlTableToPdf(tableId: string) {
  const table = document.getElementById(tableId) as HTMLTableElement | null;
  if (!table) {
    alert("Table not found: " + tableId);
    return;
  }

  // Extract headers
  const thead = table.querySelector("thead");
  const headers: string[] = [];
  if (thead) {
    const ths = Array.from(thead.querySelectorAll("th"));
    for (const th of ths) headers.push((th.textContent || "").trim());
  } else {
    const firstRow = table.querySelector("tr");
    if (firstRow) {
      const cells = Array.from(firstRow.querySelectorAll("th,td"));
      for (const c of cells) headers.push((c.textContent || "").trim());
    }
  }

  // Extract body rows
  const rows: string[][] = [];
  const tbody = table.querySelector("tbody") || table;
  const trList = Array.from(tbody.querySelectorAll("tr"));
  for (const tr of trList) {
    // If no thead and this is the first row used as header, skip it
    if (!thead && tr === table.querySelector("tr")) continue;
    const cells = Array.from(tr.querySelectorAll("td,th"));
    if (cells.length === 0) {
      rows.push(headers.map(() => ""));
      continue;
    }
    const rowData = cells.map((c) => (c.textContent || "").trim());
    while (rowData.length < headers.length) rowData.push("");
    rows.push(rowData);
  }

  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });

  // Try to embed Arabic font from public folder; fallback to default
  try {
    const fontUrl = "/fonts/Amiri-Regular.ttf";
    const resp = await fetch(fontUrl);
    if (resp.ok) {
      const buffer = await resp.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);
      (doc as any).addFileToVFS("Amiri-Regular.ttf", base64);
      (doc as any).addFont("Amiri-Regular.ttf", "Amiri", "normal");
      doc.setFont("Amiri");
    }
  } catch (e) {
    // ignore — continue with default font
    // console.warn('Arabic font load failed', e);
  }

  const fontName = (doc.getFont()?.key as string) || "Amiri";
  const fontSize = 12;

  // Right-align all columns for Arabic readability
  const columnStyles: { [key: string]: any } = {};
  for (let i = 0; i < headers.length; i++)
    columnStyles[i] = { halign: "right" };

  (doc as any).autoTable({
    head: [headers],
    body: rows,
    theme: "grid",
    styles: {
      font: fontName,
      fontSize,
      cellPadding: 6,
      valign: "middle",
      halign: "right",
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: 30,
      fontStyle: "normal",
      halign: "center",
    },
    columnStyles,
    startY: 40,
    margin: { left: 40, right: 40 },
    didDrawPage: (data: any) => {
      const tableName = table.getAttribute("data-name") || table.id || "table";
      const dateStr = new Date().toISOString().slice(0, 10);
      doc.setFontSize(14);
      doc.setFont(fontName);
      const pageWidth = doc.internal.pageSize.getWidth();
      const rightMargin = 40;
      const title = `${tableName} - ${dateStr}`;
      doc.text(title, pageWidth - rightMargin, 24, { align: "right" as any });
      doc.setFontSize(fontSize);
    },
  });

  const tableNameAttr = table.getAttribute("data-name") || table.id || "table";
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeName = `${tableNameAttr}-${dateStr}`.replace(/\s+/g, "-");
  doc.save(`${safeName}.pdf`);
}

// Example component exposing an inspectionTable with Arabic content
export default function ExportAutoTableExample() {
  return (
    <div
      style={{ padding: 16, direction: "rtl", fontFamily: "Cairo, sans-serif" }}
    >
      <button
        onClick={() => exportHtmlTableToPdf("inspectionTable")}
        style={{
          marginBottom: 12,
          padding: "8px 12px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        تصدير إلى PDF
      </button>

      <div style={{ overflowX: "auto" }}>
        <table
          id="inspectionTable"
          data-name="inspection-table"
          dir="rtl"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                البند
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                الوصف
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                ملاحظات
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                1
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                تفقد القواطع الكهربائية
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                تم الفحص بنجاح
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                2
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                فحص تمديدات المياه
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                تسرب بسيط في الطابق الثاني
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
