# Table Rename Feature - Testing Guide

## Pre-Testing Setup

### 1. Verify Backend Changes

```bash
# Check route was added
grep -n "rename" backend/routes/api.php
# Expected: Route::patch('/tables/{table}/rename', [TableController::class, 'renameTable']);

# Check controller method exists
grep -n "renameTable" backend/app/Http/Controllers/Api/TableController.php
# Expected: public function renameTable(Request $request, Table $table)
```

### 2. Verify Frontend Changes

```bash
# Check API service method added
grep -n "renameTable" frontend/src/services/apiService.ts
# Expected: async renameTable(id: number, newName: string, tableData?: any)

# Check component uses new prop
grep -n "onRenameTab" frontend/src/app/components/InspectionTabs.tsx
# Expected: onRenameTab?: (tabId: string, newName: string) => Promise<void>;

# Check handler in App
grep -n "handleRenameTable" frontend/src/app/App.tsx
# Expected: const handleRenameTable = async (tableId: string, newName: string) =>
```

---

## Test Case 1: Basic Rename (Happy Path)

### Steps

1. Login to application
2. Navigate to **عمارة 1** (Building 1)
3. **Double-click** on first table tab labeled "جدول 1"
4. Tab should become an editable input field
5. Input should be focused and text selected
6. Type new name: "جدول الفحص"
7. Press **Enter**
8. Wait for API call to complete

### Expected Results

- ✓ Input field appears when double-clicking
- ✓ Input text is auto-selected
- ✓ Network request: `PATCH /api/tables/{id}/rename` (Status 200)
- ✓ Success message: "تم تحديث اسم الجدول بنجاح"
- ✓ Tab name updates to "جدول الفحص"
- ✓ Success message disappears after 1.5 seconds
- ✓ Database reflects new name

### Verification

```sql
-- Check database
SELECT id, label FROM tables WHERE id = {tableId};
-- Should show: | id | label |
--            | {tableId} | جدول الفحص |
```

---

## Test Case 2: Cancel Edit with Escape

### Steps

1. Navigate to any category with tables
2. Double-click table tab to enter edit mode
3. Type: "تغيير جديد"
4. Press **Escape** key
5. Observe tab behavior

### Expected Results

- ✓ Input field disappears
- ✓ Tab shows original name
- ✓ No API call made
- ✓ No error messages shown

---

## Test Case 3: Empty Name Validation

### Steps

1. Double-click table tab to edit
2. Clear all text in input
3. Press **Enter**
4. Observe validation

### Expected Results

- ✓ Error message: "اسم الجدول لا يمكن أن يكون فارغاً"
- ✓ Input remains in edit mode
- ✓ Original name visible after error timeout
- ✓ No API call made
- ✓ Error auto-dismisses after 3 seconds

---

## Test Case 4: Click Away to Save

### Steps

1. Double-click table tab
2. Type new name: "اختبار التحديث"
3. Click elsewhere on page (outside the tab)
4. Observe save behavior

### Expected Results

- ✓ Blur event triggers save
- ✓ API call made: `PATCH /api/tables/{id}/rename`
- ✓ Loading state shows during API call
- ✓ Success message appears
- ✓ Tab name updated

---

## Test Case 5: API Error Handling

### Steps

1. Start API server normally
2. Double-click table tab
3. Type new name: "جدول اختبار الخطأ"
4. Press Enter
5. **While API call is pending**, stop the API server
6. Observe error handling

### Expected Results

- ✓ Input shows loading state (opacity reduced)
- ✓ Error message displays: "حدث خطأ أثناء تحديث الجدول"
- ✓ Tab name **reverts to original**
- ✓ Error message auto-dismisses
- ✓ Edit mode exits gracefully
- ✓ Database unchanged

---

## Test Case 6: Arabic RTL Text

### Steps

1. Double-click table tab
2. Type long Arabic name: "جدول فحص الحالة الهندسية للعمارة"
3. Press Enter
4. Observe text direction and display

### Expected Results

- ✓ Text displays RTL correctly
- ✓ Input field has `dir="rtl"` attribute
- ✓ Text alignment is right-to-left
- ✓ Name saves correctly
- ✓ Tab displays RTL name correctly

---

## Test Case 7: Multiple Rapid Edits

### Steps

1. Rename first table to "جدول أول"
2. Immediately (before success message) rename second table
3. Observe multiple edit states

### Expected Results

- ✓ First edit completes successfully
- ✓ Second edit can proceed independently
- ✓ Both edits save correctly
- ✓ No race conditions
- ✓ State remains consistent

---

## Test Case 8: Permission Check

### Test 8a: User Can Rename Own Table

**Steps:**

1. Login as user A
2. Create table
3. Rename table
4. Observe success

**Expected Results:**

- ✓ Rename succeeds
- ✓ No 403 error

### Test 8b: User Cannot Rename Other User's Table

**Steps:**

1. Login as user A, create table
2. Login as user B
3. Try to directly call API with user A's table ID
4. Observe error

**Expected Results:**

- ✓ API returns 403 Unauthorized
- ✓ Error message: "غير مصرح"

### Test 8c: Admin Can Rename Any Table

**Steps:**

1. Login as admin
2. Navigate to any user's table
3. Rename table
4. Observe success

**Expected Results:**

- ✓ Rename succeeds
- ✓ No permission errors

---

## Test Case 9: Long Names

### Steps

1. Double-click table tab
2. Type 250-character Arabic name
3. Press Enter

### Expected Results

- ✓ Name saves successfully (max 255)
- ✓ Tab displays name correctly
- ✓ No truncation in UI

### Steps (Too Long)

1. Type 260-character name
2. Press Enter

### Expected Results

- ✓ Validation error from backend
- ✓ Name reverts to original
- ✓ No save occurs

---

## Test Case 10: Special Characters

### Steps

1. Enter table name with: "جدول 1 - الفحص (2024)"
2. Press Enter
3. Verify save and display

### Expected Results

- ✓ Special characters saved correctly
- ✓ Display shows exact text
- ✓ No encoding issues

---

## Network Testing

### Slow Network (Throttle to 3G)

1. Rename table
2. Observe loading state persists during slow save
3. Eventually completes

**Expected:**

- ✓ Loading state prevents user interaction
- ✓ Eventually completes or errors

### Offline Scenario

1. Rename table
2. Browser immediately goes offline
3. See error

**Expected:**

- ✓ Error message: "حدث خطأ أثناء تحديث الجدول"
- ✓ Name reverts
- ✓ Graceful error handling

---

## Database Verification

### After Each Successful Rename

```sql
SELECT
  id,
  label,
  user_id,
  section,
  last_updated,
  updated_at
FROM tables
WHERE id = {tableId};
```

**Verify:**

- ✓ `label` contains new name
- ✓ `last_updated` is current timestamp
- ✓ `updated_at` is current timestamp
- ✓ `user_id` unchanged
- ✓ Other columns unchanged

---

## Browser Console Testing

### Open Developer Tools (F12)

1. Go to **Console** tab
2. Go to **Network** tab
3. Perform rename
4. Check console for errors
5. Check network for PATCH request

### Expected Network Request

```
Method: PATCH
URL: /api/tables/1/rename
Status: 200
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json
Body:
{
  "table_name": "جدول جديد",
  "table_data": null
}
Response:
{
  "success": true,
  "message": "تم تحديث اسم الجدول بنجاح",
  "data": { /* full table object */ }
}
```

---

## Performance Testing

### Rename Multiple Tables

1. Rename 5 tables in sequence
2. Monitor browser performance
3. Check for memory leaks

**Expected:**

- ✓ All renames complete successfully
- ✓ No lag or performance degradation
- ✓ Memory stable after each rename

---

## Accessibility Testing

### Keyboard Navigation

1. Tab to table area
2. Tab through tabs
3. Double-click to edit (or implement keyboard shortcut)
4. Use Enter/Escape

**Expected:**

- ✓ Keyboard support works
- ✓ Focus visible
- ✓ No trapped focus

### Screen Reader Testing

1. Use screen reader (NVDA/JAWS)
2. Navigate to tab
3. Activate edit mode
4. Read input field

**Expected:**

- ✓ Screen reader announces "editable input"
- ✓ Success messages announced
- ✓ Error messages announced

---

## Regression Testing

### Verify Existing Functionality Works

- ✓ Tables still display correctly
- ✓ Table switching still works
- ✓ Adding tables still works
- ✓ Deleting tables still works
- ✓ Column header editing still works
- ✓ Cell data editing still works
- ✓ PDF export still works
- ✓ Table notes still work

---

## Final Checklist

- [ ] All 10 test cases passed
- [ ] No console errors
- [ ] No network errors
- [ ] Database changes verified
- [ ] Arabic text displays correctly
- [ ] Error handling works
- [ ] Success messages show
- [ ] Optimistic updates work
- [ ] Rollback on error works
- [ ] Performance acceptable
- [ ] No regressions
- [ ] Code review completed
- [ ] Ready for production

---

## Reporting Issues

If issues found, document:

1. **Test Case**: Which test failed?
2. **Steps to Reproduce**: Exact steps taken
3. **Expected Result**: What should happen
4. **Actual Result**: What actually happened
5. **Screenshots/Video**: Visual evidence
6. **Browser/OS**: Testing environment
7. **Network State**: Online/Offline/Throttled
8. **Error Messages**: Any messages shown
9. **Console Errors**: Any JS errors
10. **Network Requests**: Any failed API calls
