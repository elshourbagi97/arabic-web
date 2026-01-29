/\*\*

- HOW TO INTEGRATE NOTES INTO YOUR EXISTING APP.TSX
-
- This is a step-by-step guide to add notes to your current App.tsx
  \*/

// ============================================================================
// STEP 1: Import the notes components at the top of your App.tsx
// ============================================================================

import { NotesTextarea } from './components/NotesTextarea';
import { GeneralNotes } from './components/GeneralNotes';

// Your existing imports:
// import { InspectionTabs } from './components/InspectionTabs';
// etc...

// ============================================================================
// STEP 2: Add state for the current table's notes (in your App component)
// ============================================================================

export function App() {
// Your existing state...
const [userTablesData, setUserTablesData] = useState<UserTableData>({});
const [currentUser, setCurrentUser] = useState<string>('');
const [activeTabId, setActiveTabId] = useState<string>('');

// ADD THIS NEW STATE:
const [currentTableNotes, setCurrentTableNotes] = useState<string>('');

// ============================================================================
// STEP 3: Modify your tabs array to include a "ملاحظات عامة" tab
// ============================================================================

// Find this section where you create your tabs:
const tabs: Tab[] = userTablesData[currentUser]?.tables.map((table) => ({
id: table.id,
label: table.label,
})) || [];

// ADD THIS:
// Add the General Notes tab at the end
const tabsWithGeneralNotes: Tab[] = [
...tabs,
{
id: 'general_notes',
label: 'ملاحظات عامة',
},
];

// ============================================================================
// STEP 4: Update your onTabChange handler
// ============================================================================

// Find your existing onTabChange handler (or create if doesn't exist):
const handleTabChange = (tabId: string) => {
setActiveTabId(tabId);
setCurrentTableNotes(''); // Clear notes when switching tabs

    // Your existing tab change logic...

};

// ============================================================================
// STEP 5: Get current table info (find this logic in your component)
// ============================================================================

const currentTable = userTablesData[currentUser]?.tables.find(
(t) => t.id === activeTabId
);

// ============================================================================
// STEP 6: Update your JSX render to include notes
// ============================================================================

return (
<div>
{/_ Your existing header/nav _/}

      {/* Replace your existing tabs with this: */}
      <InspectionTabs
        tabs={tabsWithGeneralNotes}  {/* Use tabs WITH general notes */}
        activeTab={activeTabId}
        onTabChange={handleTabChange}
        canRemove={true}
      />

      {/* Update your content area - ADD THIS: */}
      <div className="content-area">
        {activeTabId === 'general_notes' ? (
          // SHOW GENERAL NOTES TAB
          <div style={{ padding: '20px' }}>
            <h2>ملاحظات عامة</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              عرض جميع الملاحظات من جميع الجداول:
            </p>
            <GeneralNotes />
          </div>
        ) : (
          // SHOW TABLE CONTENT WITH NOTES
          <>
            {/* Your existing table content here */}
            {currentTable && (
              <div>
                {/* Your existing table/content rendering */}

                {/* ADD NOTES SECTION AT THE END OF YOUR CONTENT: */}
                <div style={{ marginTop: '40px', borderTop: '2px solid #e0e0e0', paddingTop: '20px' }}>
                  <NotesTextarea
                    value={currentTableNotes}
                    onChange={setCurrentTableNotes}
                    tableName={currentTable.label} {/* Pass the table name */}
                    label={`ملاحظات - ${currentTable.label}`}
                    placeholder="أضف ملاحظات تتعلق بهذا الجدول..."
                    showSaveButton={true}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>

);
}

// ============================================================================
// ALTERNATIVE INTEGRATION (If you use different structure)
// ============================================================================

/\*\*

- If your tabs are rendered differently, you can add the general notes
- tab separately in your tab rendering logic:
  \*/

// In your existing tab map function:
{tabs.map((tab) => (
<button
key={tab.id}
onClick={() => handleTabChange(tab.id)}
className={activeTabId === tab.id ? 'active' : ''}

>

    {tab.label}

  </button>
))}

{/_ ADD THIS BUTTON: _/}
<button
onClick={() => handleTabChange('general_notes')}
className={activeTabId === 'general_notes' ? 'active' : ''}

> ملاحظات عامة
> </button>

// ============================================================================
// COMPLETE MINIMAL EXAMPLE
// ============================================================================

/\*\*

- If you want to just add notes without major refactoring,
- add this simple component where you want it:
  \*/

function NotesSection() {
const [notes, setNotes] = useState('');

return (
<div style={{ padding: '20px', borderTop: '1px solid #ccc', marginTop: '20px' }}>
<h3>ملاحظات هذا الجدول</h3>
<NotesTextarea
        value={notes}
        onChange={setNotes}
        tableName="اسم الجدول"
        showSaveButton={true}
      />
</div>
);
}

// Use it like: <NotesSection />

// ============================================================================
// COMPONENT PROPS REFERENCE
// ============================================================================

/\*\*

- NotesTextarea Props:
-
- value: string - Current textarea value
- onChange: (value: string) => void - Called when text changes
- label: string - Label above textarea (default: "ملاحظات")
- placeholder: string - Placeholder text
- tableName: string - Name of table (required for save)
- onSave: (content: string) => Promise<void> - Custom save handler (optional)
- showSaveButton: boolean - Show save button (default: true)
  \*/

<NotesTextarea 
  value={noteContent}
  onChange={setNoteContent}
  label="ملاحظات هذا المشروع"
  placeholder="أدخل ملاحظاتك..."
  tableName="عمارة 1"
  showSaveButton={true}
/>

/\*\*

- GeneralNotes Props:
-
- None - component manages its own state
- Displays all notes grouped by table_name
- Includes refresh button and delete functionality
  \*/

<GeneralNotes />

// ============================================================================
// STYLING NOTES
// ============================================================================

/\*\*

- The components use these CSS variables from your theme:
- - var(--primary-blue) - Primary button color
- - var(--text-dark) - Main text color
- - var(--text-medium) - Secondary text color
- - var(--light-gray) - Border color
- - var(--light-blue) - Focus ring color
- - var(--font-size-md) - Standard font size
-
- If these aren't defined, the components will still work
- but may not match your exact theme colors.
  \*/

// ============================================================================
// ERROR HANDLING
// ============================================================================

/\*\*

- The NotesTextarea component handles:
- - Empty content validation
- - Network errors
- - Server errors
- - Success/error messages
-
- The GeneralNotes component handles:
- - Loading state
- - Error state with retry button
- - Empty state
- - Delete confirmation
-
- Both display Arabic error messages automatically.
  \*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/\*\*

- If notes don't save:
- 1.  Check that tableName is not empty
- 2.  Verify API token is valid (check browser console)
- 3.  Verify backend is running (php artisan serve)
- 4.  Check network tab for 422/500 errors
-
- If GeneralNotes is empty:
- 1.  Make sure notes were actually saved
- 2.  Check browser console for errors
- 3.  Try clicking the refresh button
-
- If styling doesn't match:
- 1.  Check that CSS variables are defined
- 2.  Check for conflicting CSS rules
- 3.  Use browser dev tools to inspect element
      \*/

// ============================================================================
// FULL WORKING EXAMPLE
// ============================================================================

import React, { useState } from 'react';
import { NotesTextarea } from './components/NotesTextarea';
import { GeneralNotes } from './components/GeneralNotes';

interface Table {
id: string;
label: string;
}

export function AppWithNotes() {
const [tables] = useState<Table[]>([
{ id: '1', label: 'عمارة 1' },
{ id: '2', label: 'عمارة 2' },
{ id: '3', label: 'مدرسة' },
]);

const [activeTable, setActiveTable] = useState<string>('1');
const [notes, setNotes] = useState<string>('');

const currentTable = tables.find(t => t.id === activeTable);

return (
<div dir="rtl" style={{ padding: '20px' }}>
{/_ Tab buttons _/}
<div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
{tables.map(table => (
<button
key={table.id}
onClick={() => setActiveTable(table.id)}
style={{
              padding: '10px 20px',
              backgroundColor: activeTable === table.id ? '#007bff' : '#e0e0e0',
              color: activeTable === table.id ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }} >
{table.label}
</button>
))}
<button
onClick={() => setActiveTable('general')}
style={{
            padding: '10px 20px',
            backgroundColor: activeTable === 'general' ? '#007bff' : '#e0e0e0',
            color: activeTable === 'general' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }} >
ملاحظات عامة
</button>
</div>

      {/* Tab content */}
      <div>
        {activeTable === 'general' ? (
          <GeneralNotes />
        ) : currentTable ? (
          <>
            <h2>{currentTable.label}</h2>
            <p>محتوى الجدول هنا...</p>

            <NotesTextarea
              value={notes}
              onChange={setNotes}
              tableName={currentTable.label}
              label={`ملاحظات ${currentTable.label}`}
              placeholder="أدخل ملاحظاتك هنا..."
              showSaveButton={true}
            />
          </>
        ) : null}
      </div>
    </div>

);
}

export default AppWithNotes;
