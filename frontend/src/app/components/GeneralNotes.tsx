import React, { useState, useEffect } from "react";
import apiService from "../../services/apiService";
import { NotesTextarea } from "./NotesTextarea";

interface Note {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

interface GroupedNotes {
  table_name: string;
  notes: Note[];
}

interface GeneralNotesProps {
  value?: string;
  onChange?: (value: string) => void;
  onSave?: () => Promise<void>;
}

export function GeneralNotes({ value, onChange, onSave }: GeneralNotesProps) {
  const [groupedNotes, setGroupedNotes] = useState<GroupedNotes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllNotes();
  }, []);

  const loadAllNotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAllNotes();
      if (response.success) {
        setGroupedNotes(response.data || []);
      } else {
        setError(response.message || "فشل في تحميل الملاحظات");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "خطأ في تحميل الملاحظات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الملاحظة؟")) {
      return;
    }

    try {
      const response = await apiService.deleteNote(noteId);
      if (response.success) {
        // Reload notes after deletion
        await loadAllNotes();
      } else {
        alert(response.message || "فشل حذف الملاحظة");
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "خطأ في حذف الملاحظة");
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const otherNotes = groupedNotes.filter(
    (g) => g.table_name !== "ملاحظات عامة"
  );

  return (
    <div className="w-full space-y-8" dir="rtl">
      {/* Input Section for General Notes */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3
          className="mb-4"
          style={{
            fontSize: "var(--font-size-md)",
            fontWeight: 600,
            color: "var(--text-dark)",
          }}
        >
          ملاحظات عامة
        </h3>
        <NotesTextarea
          value={value}
          onChange={onChange}
          tableName="ملاحظات عامة"
          placeholder="أدخل الملاحظات العامة هنا..."
          showSaveButton={true}
        />
        {onSave && (
          <div className="mt-6">
            <button
              onClick={onSave}
              className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded hover:opacity-90 transition"
            >
              حفظ الملاحظات (تحديث كمسودة)
            </button>
          </div>
        )}
      </div>

      {/* Summary of Other Tables */}
      {otherNotes.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3
              className="text-xl font-bold"
              style={{ color: "var(--text-dark)" }}
            >
              ملخص ملاحظات الجداول الأخرى
            </h3>
            <button
              onClick={loadAllNotes}
              className="px-4 py-2 bg-[var(--light-blue)] text-[var(--primary-blue)] rounded hover:bg-blue-100 transition text-sm"
            >
              تحديث الملخص
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-blue)] mx-auto"></div>
              <p className="mt-2 text-sm text-[var(--text-medium)]">
                جاري التحميل...
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {otherNotes.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="border-t border-[var(--light-gray)] pt-6 first:border-0 first:pt-0"
                >
                  <h4
                    className="font-semibold mb-4 text-[var(--text-medium)]"
                  >
                    {group.table_name}
                  </h4>
                  <div className="space-y-4">
                    {group.notes.map((note, noteIndex) => (
                      <div
                        key={noteIndex}
                        className="bg-gray-50 border border-[var(--light-gray)] rounded p-4"
                      >
                        <p className="whitespace-pre-wrap mb-2 text-[var(--text-dark)]">
                          {note.content}
                        </p>
                        <div className="flex justify-between items-center text-xs text-[var(--text-medium)]">
                          <span>{formatDateTime(note.created_at)}</span>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
