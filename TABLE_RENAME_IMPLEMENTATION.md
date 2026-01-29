# Table Renaming Functionality - Implementation Complete

## Overview

Full table renaming functionality has been implemented with bidirectional communication between frontend and Laravel backend, including optimistic UI updates, error handling, and Arabic RTL support.

## Backend Implementation

### 1. API Endpoint

**Route:** `PATCH /api/tables/{table}/rename`
**Location:** [backend/routes/api.php](backend/routes/api.php#L29)

### 2. Controller Method

**File:** [backend/app/Http/Controllers/Api/TableController.php](backend/app/Http/Controllers/Api/TableController.php#L157-L200)

#### Method: `renameTable(Request $request, Table $table)`

**Features:**

- Authorization check (validates user owns table or is admin)
- Request validation:
  - `table_name`: required|string|max:255
  - `table_data`: optional|array
- Database transaction for data integrity
- Error handling with Arabic error messages
- Returns JSON with:
  ```json
  {
    "success": true,
    "message": "تم تحديث اسم الجدول بنجاح",
    "data": {
      "id": 1,
      "label": "new_name",
      "table_data": [...],
      ...
    }
  }
  ```

## Frontend Implementation

### 1. API Service

**File:** [frontend/src/services/apiService.ts](frontend/src/services/apiService.ts#L255-L261)

#### Method: `renameTable(id: number, newName: string, tableData?: any)`

```typescript
async renameTable(id: number, newName: string, tableData?: any) {
  const response = await this.api.patch(`/tables/${id}/rename`, {
    table_name: newName,
    table_data: tableData || null,
  });
  return response.data;
}
```

### 2. Enhanced InspectionTabs Component

**File:** [frontend/src/app/components/InspectionTabs.tsx](frontend/src/app/components/InspectionTabs.tsx)

#### Features:

- **Double-click to edit:** Users double-click a table tab to rename it
- **Edit mode:** Input field appears with auto-focus and text selection
- **Validation:**
  - Empty name validation (shows Arabic error message)
  - Name must not be empty before sending to server
- **Loading state:** Disabled input during API call with opacity change
- **Error handling:** Shows error message for 3 seconds before rollback
- **Success message:** Shows "تم تحديث اسم الجدول بنجاح" for 1.5 seconds
- **Keyboard shortcuts:**
  - `Enter`: Save rename
  - `Escape`: Cancel rename
- **Arabic RTL:** Full RTL support with `dir="rtl"` attribute
- **Status messages:** Color-coded feedback (green for success, red for error)

### 3. App Component Integration

**File:** [frontend/src/app/App.tsx](frontend/src/app/App.tsx)

#### Handler: `handleRenameTable(tableId: string, newName: string)`

**Features:**

- Optimistic UI update (updates UI immediately)
- Rollback on error (reverts to original name if API call fails)
- Only sends to server if table has numeric ID (persisted in database)
- Skips local-only tables (those with "table-" prefix)
- Proper error propagation with user-friendly messages

**Integration:**

```tsx
<InspectionTabs
  tabs={userData.tables}
  activeTab={userData.activeTableId}
  onTabChange={setActiveTableId}
  onRemoveTab={handleRemoveTable}
  onRenameTab={handleRenameTable} // ← New handler
  canRemove={userData.tables.length > 1}
/>
```

## User Experience Flow

1. **Edit Trigger:** User double-clicks a table tab name
2. **Edit Mode:** Tab label transforms into an editable input field
3. **Edit:** User types new name with Arabic RTL support
4. **Save:** User presses Enter or clicks away
5. **Validation:** Frontend validates non-empty name
6. **API Call:** PATCH request sent to `/api/tables/{id}/rename`
7. **Loading:** Input shows loading state during API call
8. **Response:**
   - **Success:** Shows success message, updates tab name
   - **Error:** Shows error message, reverts to original name
9. **Confirmation:** Status message auto-disappears after timeout

## Data Flow

### Frontend State Updates

```
User Action
    ↓
handleRenameTable()
    ↓
Optimistic UI Update (instant)
    ↓
API Call to /api/tables/{id}/rename
    ↓
Success? → Update complete
    └─ Error? → Rollback to original name
```

### Database Updates

```
API Request
    ↓
Authorization Check
    ↓
Validation
    ↓
Database Transaction Begin
    ↓
Update table.label
Update table.last_updated
    ↓
Transaction Commit
    ↓
JSON Response
```

## Validation

### Frontend Validation

- ✓ Non-empty table name
- ✓ Arabic RTL text support
- ✓ Input focus and selection on edit mode

### Backend Validation

- ✓ Required `table_name` field
- ✓ String type check
- ✓ Maximum 255 characters
- ✓ User authorization (owns table or is admin)
- ✓ Optional `table_data` array

### Error Handling

- ✓ Database transaction rollback on error
- ✓ Authorization denial (403)
- ✓ Validation errors with Arabic messages
- ✓ Try-catch with user-friendly error messages

## Response Examples

### Success Response (200)

```json
{
  "success": true,
  "message": "تم تحديث اسم الجدول بنجاح",
  "data": {
    "id": 1,
    "label": "جدول جديد",
    "user_id": 1,
    "section": "building1",
    "data": [...],
    "column_headers": [...],
    "notes": null,
    "last_updated": "2026-01-29T...",
    "created_at": "2026-01-29T...",
    "updated_at": "2026-01-29T...",
    "rows": []
  }
}
```

### Error Response (500)

```json
{
  "success": false,
  "message": "حدث خطأ أثناء تحديث الجدول",
  "error": "Error details..."
}
```

### Unauthorized Response (403)

```json
{
  "message": "غير مصرح",
  "error": "Unauthorized"
}
```

## Files Modified

1. **Backend:**
   - `backend/app/Http/Controllers/Api/TableController.php` - Added renameTable() method
   - `backend/routes/api.php` - Added PATCH route for rename

2. **Frontend:**
   - `frontend/src/services/apiService.ts` - Added renameTable() method
   - `frontend/src/app/components/InspectionTabs.tsx` - Complete rewrite with edit functionality
   - `frontend/src/app/App.tsx` - Added handleRenameTable() handler and passed to InspectionTabs

## Testing Checklist

- [ ] Double-click tab to enter edit mode
- [ ] Type new Arabic table name
- [ ] Press Enter to save
- [ ] Verify database table name is updated
- [ ] Verify success message displays
- [ ] Test error scenario (disconnect network)
- [ ] Verify error message displays
- [ ] Verify name reverts on error
- [ ] Test escape key to cancel edit
- [ ] Test empty name validation
- [ ] Verify RTL text alignment
- [ ] Test with multiple tables
- [ ] Test admin user can rename other users' tables

## Security Considerations

✓ Authorization check ensures users can only rename their own tables
✓ Database transactions prevent partial updates
✓ Input validation prevents injection attacks
✓ Laravel validation rules applied
✓ Error messages don't expose sensitive data
✓ Sanctum middleware protects endpoint

## Performance Considerations

✓ Optimistic UI updates provide instant feedback
✓ Error rollback ensures data consistency
✓ Database transactions ensure atomicity
✓ PATCH method is appropriate for partial updates
✓ Indexed table IDs for fast lookups

## Accessibility

✓ Double-click to edit is intuitive
✓ Keyboard support (Enter, Escape)
✓ Arabic RTL fully supported
✓ Error messages clearly displayed
✓ Focus management on input field
✓ Loading states prevent user confusion

## Future Enhancements

- [ ] Add edit icon button for accessibility
- [ ] Add keyboard shortcut to edit (e.g., F2)
- [ ] Add bulk rename functionality
- [ ] Add rename history/audit log
- [ ] Add undo/redo functionality
- [ ] Add real-time sync across browser tabs
