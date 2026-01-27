import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface InspectionTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onRemoveTab?: (tabId: string) => void;
  canRemove?: boolean;
}

export function InspectionTabs({ tabs, activeTab, onTabChange, onRemoveTab, canRemove = true }: InspectionTabsProps) {
  return (
    <div className="flex gap-2 border-b border-[var(--light-gray)] mb-6" dir="rtl">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`flex items-center gap-2 px-6 py-3 cursor-pointer transition-all duration-200 relative
            ${
              activeTab === tab.id
                ? 'border-b-2 border-[var(--primary-blue)] text-[var(--primary-blue)] bg-[var(--light-blue)]'
                : 'text-[var(--text-medium)] hover:text-[var(--primary-blue)] hover:bg-gray-50'
            }`}
          style={{ fontSize: 'var(--font-size-md)', fontWeight: 500 }}
        >
          <span onClick={() => onTabChange(tab.id)}>{tab.label}</span>
          {canRemove && tabs.length > 1 && (
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
  );
}
