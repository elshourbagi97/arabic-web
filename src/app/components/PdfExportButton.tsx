import React, { useState } from "react";
import { PrimaryButton } from "./PrimaryButton";
import apiService from "../../services/apiService";

interface PdfExportButtonProps {
  tableId: number;
  tableLabel: string;
}

export function PdfExportButton({ tableId, tableLabel }: PdfExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExportPdf = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await apiService.exportTableToPdf(tableId);
    } catch (err: any) {
      setError(err.response?.data?.message || "فشل تصدير ملف PDF");
      console.error("PDF Export Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <PrimaryButton onClick={handleExportPdf} disabled={isLoading}>
        {isLoading ? "جاري التصدير..." : "تصدير إلى PDF"}
      </PrimaryButton>
      {error && (
        <p
          style={{
            color: "var(--error-red)",
            fontSize: "var(--font-size-sm)",
            marginTop: "8px",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
