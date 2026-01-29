import React, { useState, useEffect } from "react";
import apiService from "../../services/apiService";

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

export function GeneralNotes() {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)] mx-auto"></div>
          <p className="mt-4 text-[var(--text-dark)]">
            جاري تحميل الملاحظات...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-700 text-center">{error}</p>
        <button
          onClick={loadAllNotes}
          className="mt-4 mx-auto block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          إعادة محاولة
        </button>
      </div>
    );
  }

  if (groupedNotes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-medium)] text-lg">
          لا توجد ملاحظات حالياً
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8" dir="rtl">
      <button
        onClick={loadAllNotes}
        className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded hover:opacity-90 transition"
      >
        تحديث الملاحظات
      </button>

      {groupedNotes.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="border-t border-[var(--light-gray)] pt-6"
        >
          {/* Table Name Header */}
          <h3
            className="text-xl font-bold mb-6"
            style={{ color: "var(--text-dark)" }}
          >
            {group.table_name}
          </h3>

          {/* Notes List */}
          <div className="space-y-4">
            {group.notes.map((note, noteIndex) => (
              <div
                key={noteIndex}
                className="bg-white border border-[var(--light-gray)] rounded-lg p-6 hover:shadow-md transition"
              >
                {/* Note Content */}
                <p
                  className="whitespace-pre-wrap mb-4"
                  style={{
                    color: "var(--text-dark)",
                    fontSize: "var(--font-size-md)",
                  }}
                >
                  {note.content}
                </p>

                {/* Metadata and Actions */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-[var(--text-medium)]">
                    <span>
                      <strong>تاريخ الإنشاء:</strong>{" "}
                      {formatDateTime(note.created_at)}
                    </span>
                    {note.updated_at !== note.created_at && (
                      <span>
                        <strong>آخر تحديث:</strong>{" "}
                        {formatDateTime(note.updated_at)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
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
  );
}
