/**
 * EXAMPLE INTEGRATION GUIDE
 *
 * This file shows how to integrate the notes system into your existing components.
 * Copy and adapt the patterns shown here to your actual App.tsx or table components.
 */

import React, { useState, useEffect } from "react";
import { NotesTextarea } from "./NotesTextarea";
import { GeneralNotes } from "./GeneralNotes";
import { InspectionTabs } from "./InspectionTabs";

interface Tab {
  id: string;
  label: string;
}

/**
 * EXAMPLE 1: Integration in a Table Detail Component
 * Use this pattern when displaying a single table and allowing notes for it
 */
export function TableDetailWithNotes({ tableName }: { tableName: string }) {
  const [noteContent, setNoteContent] = useState("");

  return (
    <div style={{ padding: "20px" }}>
      {/* Your table content here */}

      {/* Add this to allow users to add notes to the table */}
      <div
        style={{
          marginTop: "30px",
          borderTop: "2px solid #e0e0e0",
          paddingTop: "20px",
        }}
      >
        <NotesTextarea
          value={noteContent}
          onChange={setNoteContent}
          tableName={tableName} // Pass the table name
          label="ملاحظات لهذا الجدول"
          placeholder="أضف ملاحظات تتعلق بهذا الجدول..."
          showSaveButton={true}
        />
      </div>
    </div>
  );
}

/**
 * EXAMPLE 2: Integration with Tabs (Sections)
 * Use this pattern when you have multiple sections/tables with tabs
 */
export function SectionsWithNotesAndGeneralNotes({
  sections,
}: {
  sections: Array<{ id: string; name: string }>;
}) {
  const [activeTab, setActiveTab] = useState(sections[0]?.id || "");
  const [noteContent, setNoteContent] = useState("");

  // Create tabs: one for each section + one for general notes
  const tabs: Tab[] = [
    ...sections.map((s) => ({
      id: s.id,
      label: s.name,
    })),
    {
      id: "general_notes",
      label: "ملاحظات عامة", // General Notes tab
    },
  ];

  const currentSection = sections.find((s) => s.id === activeTab);

  return (
    <div>
      {/* Tabs navigation */}
      <InspectionTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        canRemove={false}
      />

      {/* Tab content */}
      <div style={{ marginTop: "20px" }}>
        {activeTab === "general_notes" ? (
          // Show general notes (all notes from all tables)
          <div>
            <h2>ملاحظات عامة</h2>
            <p style={{ marginBottom: "20px", color: "#666" }}>
              جميع الملاحظات من جميع الجداول:
            </p>
            <GeneralNotes />
          </div>
        ) : (
          // Show specific section content with notes
          <div>
            <h2>{currentSection?.name}</h2>

            {/* Your section content goes here */}
            <div style={{ marginBottom: "30px" }}>
              {/* Section table/content */}
            </div>

            {/* Notes section for this table */}
            <div style={{ borderTop: "2px solid #e0e0e0", paddingTop: "20px" }}>
              <NotesTextarea
                value={noteContent}
                onChange={setNoteContent}
                tableName={currentSection?.name} // Pass section name
                label="ملاحظات هذا القسم"
                placeholder="أدخل ملاحظاتك عن هذا القسم..."
                showSaveButton={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * EXAMPLE 3: Advanced Integration with State Management
 * Use this pattern if you want more control over the notes lifecycle
 */
export function AdvancedNotesIntegration() {
  const [sections, setSections] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [activeTab, setActiveTab] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load sections on mount (from your API)
  useEffect(() => {
    // const sections = await apiService.getSections();
    // setSections(sections);
    // setActiveTab(sections[0]?.id);
  }, []);

  const handleSaveNote = async (content: string) => {
    const currentSection = sections.find((s) => s.id === activeTab);
    if (!currentSection) return;

    setIsLoading(true);
    try {
      // Save note via API
      // await apiService.saveNote(currentSection.name, content);

      // Optionally clear the input
      setNoteContent("");

      // Optionally show success message
      alert("تم حفظ الملاحظة بنجاح!");
    } catch (error) {
      alert("فشل حفظ الملاحظة");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        {/* Your section tabs */}
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveTab(section.id)}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              backgroundColor: activeTab === section.id ? "#007bff" : "#e0e0e0",
              color: activeTab === section.id ? "white" : "black",
              border: "none",
              cursor: "pointer",
            }}
          >
            {section.name}
          </button>
        ))}
        <button
          onClick={() => setActiveTab("general")}
          style={{
            padding: "10px 20px",
            marginRight: "10px",
            backgroundColor: activeTab === "general" ? "#007bff" : "#e0e0e0",
            color: activeTab === "general" ? "white" : "black",
            border: "none",
            cursor: "pointer",
          }}
        >
          ملاحظات عامة
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {activeTab === "general" ? (
          <GeneralNotes />
        ) : (
          <NotesTextarea
            value={noteContent}
            onChange={setNoteContent}
            tableName={sections.find((s) => s.id === activeTab)?.name}
            onSave={handleSaveNote}
            showSaveButton={true}
          />
        )}
      </div>
    </div>
  );
}

/**
 * EXAMPLE 4: Minimal Integration (Copy-Paste)
 * Use this if you just want to add notes to your existing code with minimal changes
 */
export function MinimalIntegration() {
  const [noteContent, setNoteContent] = useState("");

  // Add this to your existing component JSX:
  return (
    <div>
      <h1>ملاحظات النظام</h1>

      {/* Just add the NotesTextarea component where you want it */}
      <NotesTextarea
        value={noteContent}
        onChange={setNoteContent}
        tableName="اسم الجدول أو القسم" // Change this to your table/section name
        showSaveButton={true}
      />

      {/* And add GeneralNotes where you want to show all notes */}
      <div style={{ marginTop: "40px" }}>
        <h2>ملاحظات عامة</h2>
        <GeneralNotes />
      </div>
    </div>
  );
}

/**
 * EXAMPLE 5: How to use in App.tsx
 *
 * In your existing App.tsx, after the sections are loaded:
 * Create tabs with your tables plus a general notes tab
 *
 * Then in your render, check the activeTabId:
 * - If 'general_notes': show GeneralNotes component
 * - Otherwise: show NotesTextarea with the table name
 *
 * See NOTES_INTEGRATION_EXAMPLES.tsx for the full working example
 */
