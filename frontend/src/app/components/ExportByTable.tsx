import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

async function loadAmiriFonts(doc: jsPDF) {
  const load = async (name: string) => {
    const res = await fetch(`/fonts/${name}`);
    const buf = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    (doc as any).addFileToVFS(name, base64);
  };

  await load("Amiri-Regular.ttf");
  await load("Amiri-Bold.ttf");

  (doc as any).addFont("Amiri-Regular.ttf", "Amiri", "normal");
  (doc as any).addFont("Amiri-Bold.ttf", "Amiri", "bold");
}


export async function exportTableToPDF(tableId: string): Promise<void> {
  const elem = document.getElementById(tableId);
  if (!elem) {
    alert("Table wrapper not found: " + tableId);
    return;
  }

  // Build header and rows arrays to avoid html parsing (prevents CSS parsing errors)
  let headers: string[] = [];
  let rows: string[][] = [];
  let tableNameAttr =
    elem.getAttribute("data-name") || elem.id || tableId || "table";
  let displayTitle =
    elem.getAttribute("data-title") ||
    elem.getAttribute("data-name") ||
    tableId;

  if (elem.tagName.toLowerCase() === "table") {
    const t = elem as HTMLTableElement;
    // headers
    const thead = t.querySelector("thead");
    if (thead) {
      const ths = Array.from(thead.querySelectorAll("th"));
      headers = ths.map((th) => (th.textContent || "").trim());
    } else {
      const firstRow = t.querySelector("tr");
      if (firstRow) {
        const cells = Array.from(firstRow.querySelectorAll("th,td"));
        headers = cells.map((c) => (c.textContent || "").trim());
      }
    }

    // rows
    const tbody = t.querySelector("tbody") || t;
    const trList = Array.from(tbody.querySelectorAll("tr"));
    for (const tr of trList) {
      // skip header row if there was no thead and we used first row as header
      if (!t.querySelector("thead") && tr === t.querySelector("tr")) continue;
      const cells = Array.from(tr.querySelectorAll("td,th"));
      const rowData = cells.map((c) => (c.textContent || "").trim());
      // pad
      while (rowData.length < headers.length) rowData.push("");
      rows.push(rowData);
    }
  } else {
    // read from data-table-json
    const json = elem.getAttribute("data-table-json");
    if (!json) {
      alert(
        "Selected element is not a table and has no `data-table-json`. Cannot export.",
      );
      return;
    }
    let payload: { headers: string[]; data: string[][]; name?: string };
    try {
      payload = JSON.parse(json) as {
        headers: string[];
        data: string[][];
        name?: string;
      };
    } catch (e) {
      alert("Invalid table JSON on element.");
      return;
    }
    headers = payload.headers || [];
    rows = payload.data || [];
    if (payload.name) {
      tableNameAttr = payload.name;
      displayTitle = payload.name;
    }
  }

const doc = new jsPDF({
  unit: "pt",
  format: "a4",
  orientation: "landscape", // 👈 خلي الجدول من اليمين للشمال ومريح
});

await loadAmiriFonts(doc);
doc.setFont("Amiri", "normal");


  // Prepare column styles (right-align for Arabic by default)
  const columnStyles: { [key: string]: any } = {};
  for (let i = 0; i < headers.length; i++)
    columnStyles[i] = { halign: "right" };

  const margin = { left: 40, right: 40 };
  const startY = 60;

  // Draw title at top (RTL, right-aligned)
  const pageWidth = (doc as any).internal.pageSize.getWidth();
  // set PDF font (fontName will be the base filename like 'Amiri-Regular' when embedded)
 doc.setFont("Amiri", "normal");

  doc.setFontSize(14);
  doc.setTextColor(20);
  if (displayTitle) {
    doc.text(String(displayTitle), pageWidth - margin.right, 36, {
      align: "right",
    });
  }

  // ===== RTL FIX: make first column appear on the RIGHT =====
const rtlHeaders =
  headers && headers.length > 0 ? [...headers].reverse() : [];

const rtlRows = rows.map(row => [...row].reverse());

  (autoTable as any)(doc, {
  head: rtlHeaders.length > 0 ? [rtlHeaders] : [],
  body: rtlRows,
  theme: "grid",
  styles: {
    font: "Amiri",
    fontSize: 11,
    cellPadding: 6,
    valign: "middle",
    halign: "right",
    overflow: "linebreak",
    lineColor: [200, 200, 200],
    lineWidth: 0.5,
  },
  headStyles: {
    fillColor: [250, 250, 250],
    font: "Amiri",
    fontStyle: "bold",
    textColor: 30,
    halign: "center",
  },
  columnStyles,
  startY,
  margin,
  tableWidth: "auto",
  showHead: rtlHeaders.length > 0 ? "everyPage" : "firstPage",
});

  const dateStr = new Date().toISOString().slice(0, 10);
  const safeName = `${tableNameAttr}-${dateStr}`.replace(/\s+/g, "-");
  doc.save(`${safeName}.pdf`);
  // No temporary DOM cleanup required when using head/body export
}

export default function ExportByTableExample() {
  return (
    <div
      style={{ padding: 16, direction: "rtl", fontFamily: "Amiri, Cairo, sans-serif" }}
    >
      <button
        onClick={() => exportTableToPDF("inspectionTable")}
        style={{
          marginBottom: 12,
          padding: "8px 12px",
          background: "#0b74da",
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
