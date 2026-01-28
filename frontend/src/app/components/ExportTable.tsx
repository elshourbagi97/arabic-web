import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportTableToPDF(tableId: string): Promise<void> {
  try {
    const table = document.getElementById(tableId);
    if (!table) {
      console.error("Table not found:", tableId);
      return;
    }

    // Clone the table so page layout isn't modified
    const clone = table.cloneNode(true) as HTMLElement;
    clone.style.background = "white";
    clone.setAttribute("dir", "rtl");
    clone.style.width = getComputedStyle(table).width || "auto";

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-9999px";
    wrapper.style.top = "0";
    wrapper.style.background = "white";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const pxToMm = (px: number) => px * 0.264583;

    const imgWidthMm = pageWidth;
    const imgHeightMm =
      (pxToMm(canvas.height) * imgWidthMm) / pxToMm(canvas.width);

    let heightLeft = imgHeightMm;
    let position = 0;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      position,
      imgWidthMm,
      imgHeightMm,
      undefined,
      "FAST",
    );
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        imgWidthMm,
        imgHeightMm,
        undefined,
        "FAST",
      );
      heightLeft -= pageHeight;
    }

    const tableNameAttr =
      table.getAttribute("data-name") || table.id || "table";
    const dateStr = new Date().toISOString().slice(0, 10);
    const safeName = tableNameAttr.replace(/\s+/g, "-");
    const fileName = `${safeName}-${dateStr}.pdf`;

    pdf.save(fileName);

    document.body.removeChild(wrapper);
  } catch (err) {
    console.error("Failed to export table to PDF", err);
    alert("خطأ أثناء تصدير PDF. تحقق من وحدة التحكم للمزيد من التفاصيل.");
  }
}

export default function ExportTableExample() {
  return (
    <div style={{ padding: 16 }}>
      <button
        onClick={() => exportTableToPDF("users-table")}
        style={{
          marginBottom: 12,
          padding: "8px 12px",
          background: "#2563eb",
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
          id="users-table"
          data-name="users-table"
          style={{
            borderCollapse: "collapse",
            width: "100%",
            direction: "rtl",
            fontFamily: 'Arial, "Noto Naskh Arabic", sans-serif',
          }}
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
                الاسم
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                البريد الإلكتروني
              </th>
              <th
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                ملاحظة
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
                أحمد
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                ahmed@example.com
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                مثال نص عربي طويل للاختبار
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
                ليلى
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                laila@example.com
              </td>
              <td
                style={{
                  border: "1px solid #ddd",
                  padding: 8,
                  textAlign: "center",
                }}
              >
                ملاحظة أخرى باللغة العربية
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
