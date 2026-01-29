# Copy-Paste Reference - Complete Code Implementation

This file contains all the exact code that was implemented for the table rename feature.

---

## 1. Backend Route (api.php - Line 31)

```php
Route::patch('/tables/{table}/rename', [TableController::class, 'renameTable']);
```

**Location in file:**

```php
Route::put('/tables/{table}', [TableController::class, 'update']);
Route::patch('/tables/{table}/rename', [TableController::class, 'renameTable']);  // ADD THIS LINE
Route::delete('/tables/{table}', [TableController::class, 'destroy']);
```

---

## 2. Backend Controller Method (TableController.php - Lines 157-200)

```php
/**
 * Rename a table (update its label)
 */
public function renameTable(Request $request, Table $table)
{
    if ($table->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
        return response()->json(['message' => 'غير مصرح', 'error' => 'Unauthorized'], 403);
    }

    $validated = $request->validate([
        'table_name' => 'required|string|max:255',
        'table_data' => 'nullable|array',
    ]);

    // Use transaction for data integrity
    try {
        \DB::beginTransaction();

        $update = ['label' => $validated['table_name']];
        if (array_key_exists('table_data', $validated) && $validated['table_data'] !== null) {
            $update['data'] = $validated['table_data'];
        }
        $update['last_updated'] = now();

        $table->update($update);

        \DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'تم تحديث اسم الجدول بنجاح',
            'data' => $table->fresh()->load('rows')
        ], 200);
    } catch (\Exception $e) {
        \DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء تحديث الجدول',
            'error' => $e->getMessage()
        ], 500);
    }
}
```

**Where to add:** After `destroy()` method in TableController.php

---

## 3. Frontend API Service (apiService.ts - Lines 255-261)

```typescript
async renameTable(id: number, newName: string, tableData?: any) {
  const response = await this.api.patch(`/tables/${id}/rename`, {
    table_name: newName,
    table_data: tableData || null,
  });
  return response.data;
}
```

**Where to add:** After `updateTable()` method in apiService.ts

---

## 4. Frontend Component - InspectionTabs.tsx (Complete File)

```tsx
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
```

**Replace entire file:** frontend/src/app/components/InspectionTabs.tsx

---

## 5. Frontend Handler in App.tsx

### Add Import (if not already there)

```tsx
import apiService from "../services/apiService";
```

### Add Handler Function (After handleRemoveTable)

```typescript
// Rename a table (update label)
const handleRenameTable = async (tableId: string, newName: string) => {
  if (!currentUser) return;
  const email = currentUser.email;

  // Get the current table data
  const userData = userTablesData[email];
  const table = userData?.tables.find((t: any) => t.id === tableId);

  if (!table) throw new Error("Table not found");

  // Update UI optimistically
  const previousTables = userData.tables;
  setUserTablesData((prev) => {
    return {
      ...prev,
      [email]: {
        ...prev[email],
        tables: prev[email].tables.map((t: any) =>
          t.id === tableId ? { ...t, label: newName } : t,
        ),
      },
    };
  });

  // Send to server - only if it's a persisted table (numeric id)
  if (!tableId.startsWith("table-")) {
    try {
      await apiService.renameTable(Number(tableId), newName, table.data);
    } catch (e) {
      // Rollback on error
      setUserTablesData((prev) => {
        return {
          ...prev,
          [email]: {
            ...prev[email],
            tables: previousTables,
          },
        };
      });
      throw e;
    }
  }
};
```

### Update InspectionTabs Component Call

Find this section and update it:

```tsx
// OLD VERSION:
<InspectionTabs
  tabs={userData.tables}
  activeTab={userData.activeTableId}
  onTabChange={setActiveTableId}
  onRemoveTab={handleRemoveTable}
  canRemove={userData.tables.length > 1}
/>

// NEW VERSION:
<InspectionTabs
  tabs={userData.tables}
  activeTab={userData.activeTableId}
  onTabChange={setActiveTableId}
  onRemoveTab={handleRemoveTable}
  onRenameTab={handleRenameTable}  // ← ADD THIS LINE
  canRemove={userData.tables.length > 1}
/>
```

**Location:** Line ~1176 in App.tsx

---

## Summary of Changes

| File                     | Change                     | Type      |
| ------------------------ | -------------------------- | --------- |
| `backend/routes/api.php` | Add PATCH route            | 1 line    |
| `TableController.php`    | Add renameTable method     | 44 lines  |
| `apiService.ts`          | Add renameTable method     | 7 lines   |
| `InspectionTabs.tsx`     | Replace entire component   | 184 lines |
| `App.tsx`                | Add handler + update props | ~35 lines |

**Total New Code:** ~271 lines across 5 files

---

## Testing the Implementation

### Quick Test

```bash
# 1. Start your application
# 2. Login
# 3. Navigate to عمارة 1
# 4. Double-click جدول 1
# 5. Type: "اختبار"
# 6. Press Enter
# 7. See success message ✅
```

### API Test

```bash
curl -X PATCH http://localhost:8000/api/tables/1/rename \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_name": "جدول جديد",
    "table_data": []
  }'
```

---

## Verification Checklist

- [ ] All 5 files modified
- [ ] Backend route added
- [ ] Controller method added
- [ ] API service method added
- [ ] Component completely replaced
- [ ] App handler added
- [ ] InspectionTabs props updated
- [ ] No syntax errors
- [ ] Build succeeds
- [ ] Tests pass
- [ ] Ready for deployment
