import React, { useState, useRef, useEffect } from "react";

interface Tab {
  id: string;
  label: string;
}

interface InspectionTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onRemoveTab?: (tabId: string) => void;
  onRenameTab?: (tabId: string, newName: string) => Promise<void>;
  canRemove?: boolean;
}

export function InspectionTabs({
  tabs,
  activeTab,
  onTabChange,
  onRemoveTab,
  onRenameTab,
  canRemove = true,
}: InspectionTabsProps) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTabId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabId]);

  const handleDoubleClick = (tabId: string, currentLabel: string) => {
    if (editingTabId) return; // Already editing
    setEditingTabId(tabId);
    setEditingValue(currentLabel);
    setError(null);
    setSuccess(null);
  };

  const handleBlur = async () => {
    if (!editingTabId) return;

    const originalValue = tabs.find((t) => t.id === editingTabId)?.label || "";

    // If value didn't change, just exit edit mode
    if (editingValue === originalValue) {
      setEditingTabId(null);
      return;
    }

    // Validate input
    if (!editingValue.trim()) {
      setError("اسم الجدول لا يمكن أن يكون فارغاً");
      setEditingValue(originalValue);
      setTimeout(() => setEditingTabId(null), 2000);
      return;
    }

    // Call rename handler
    if (onRenameTab) {
      setIsLoading(true);
      setError(null);
      try {
        await onRenameTab(editingTabId, editingValue);
        setSuccess("تم تحديث اسم الجدول بنجاح");
        setTimeout(() => {
          setSuccess(null);
          setEditingTabId(null);
        }, 1500);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "حدث خطأ أثناء تحديث اسم الجدول";
        setError(errorMessage);
        setEditingValue(originalValue);
        setTimeout(() => {
          setError(null);
          setEditingTabId(null);
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    } else {
      setEditingTabId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setEditingTabId(null);
      setError(null);
    }
  };

  return (
    <div>
      <div
        className="flex gap-2 border-b border-[var(--light-gray)] mb-6"
        dir="rtl"
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-6 py-3 cursor-pointer transition-all duration-200 relative
              ${
                activeTab === tab.id
                  ? "border-b-2 border-[var(--primary-blue)] text-[var(--primary-blue)] bg-[var(--light-blue)]"
                  : "text-[var(--text-medium)] hover:text-[var(--primary-blue)] hover:bg-gray-50"
              }`}
            style={{ fontSize: "var(--font-size-md)", fontWeight: 500 }}
          >
            {editingTabId === tab.id ? (
              <input
                ref={inputRef}
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="bg-white border-2 border-[var(--primary-blue)] rounded px-2 py-1 text-center outline-none"
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: 500,
                  opacity: isLoading ? 0.6 : 1,
                }}
                dir="rtl"
              />
            ) : (
              <span
                onClick={() => onTabChange(tab.id)}
                onDoubleClick={() => handleDoubleClick(tab.id, tab.label)}
                title="انقر مرتين لتعديل اسم الجدول"
                className="hover:opacity-80 transition-opacity"
              >
                {tab.label}
              </span>
            )}
            {canRemove && tabs.length > 1 && !editingTabId && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTab?.(tab.id);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Status messages */}
      {error && (
        <div
          className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-right"
          dir="rtl"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm text-right"
          dir="rtl"
        >
          {success}
        </div>
      )}
    </div>
  );
}
