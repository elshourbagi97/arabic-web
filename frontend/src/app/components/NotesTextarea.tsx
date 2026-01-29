import React, { useState } from "react";
import apiService from "../../services/apiService";

interface NotesTextareaProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  tableName?: string;
  onSave?: (content: string) => Promise<void>;
  showSaveButton?: boolean;
}

export function NotesTextarea({
  value = "",
  onChange,
  label = "ملاحظات",
  placeholder = "أدخل ملاحظاتك هنا...",
  tableName,
  onSave,
  showSaveButton = true,
}: NotesTextareaProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSave = async () => {
    if (!value.trim()) {
      setSaveMessage({ type: "error", text: "الرجاء إدخال محتوى الملاحظة" });
      return;
    }

    if (!tableName) {
      setSaveMessage({ type: "error", text: "اسم الجدول مطلوب" });
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage(null);

      if (onSave) {
        await onSave(value);
      } else {
        await apiService.saveNote(tableName, value);
      }

      setSaveMessage({ type: "success", text: "تم حفظ الملاحظة بنجاح" });
      onChange?.("");

      // Clear success message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      const errorText =
        error.response?.data?.message || "حدث خطأ في حفظ الملاحظة";
      setSaveMessage({ type: "error", text: errorText });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full">
      <label
        className="block mb-2 text-[var(--text-dark)]"
        style={{ fontSize: "var(--font-size-md)", fontWeight: 500 }}
      >
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full px-4 py-3 border border-[var(--light-gray)] rounded-lg bg-white 
          focus:outline-none focus:border-[var(--primary-blue)] focus:ring-2 focus:ring-[var(--light-blue)] 
          transition-all duration-150 resize-none"
        style={{ fontSize: "var(--font-size-md)" }}
        dir="rtl"
        disabled={isSaving}
      />

      {/* Save Message */}
      {saveMessage && (
        <div
          className={`mt-2 p-3 rounded text-center ${
            saveMessage.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Save Button */}
      {showSaveButton && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="mt-3 w-full px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg
            hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed
            font-semibold"
        >
          {isSaving ? "جاري الحفظ..." : "حفظ الملاحظة"}
        </button>
      )}
    </div>
  );
}
