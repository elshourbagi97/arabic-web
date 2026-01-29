# Table Rename Feature - Quick Reference

## How It Works for Users

1. **Open any category** (عمارة 1, عمارة 2, etc.)
2. **Double-click a table tab** (e.g., جدول 1)
3. **Type new name** (supports Arabic RTL)
4. **Press Enter** or click away to save
5. **See confirmation** - Success message or error with rollback

## API Endpoint

```
PATCH /api/tables/{tableId}/rename
Content-Type: application/json

{
  "table_name": "new name",
  "table_data": [...]  // optional
}
```

**Response (Success):**

```json
{
  "success": true,
  "message": "تم تحديث اسم الجدول بنجاح",
  "data": {
    /* updated table */
  }
}
```

## Code Locations

| Component              | File                                                           | Purpose                   |
| ---------------------- | -------------------------------------------------------------- | ------------------------- |
| **Backend Route**      | `backend/routes/api.php:31`                                    | Define PATCH endpoint     |
| **Backend Handler**    | `backend/app/Http/Controllers/Api/TableController.php:157-200` | Process rename request    |
| **Frontend API**       | `frontend/src/services/apiService.ts:255-261`                  | Make HTTP call            |
| **Frontend Component** | `frontend/src/app/components/InspectionTabs.tsx`               | UI with edit mode         |
| **Frontend Handler**   | `frontend/src/app/App.tsx:514-548`                             | Manage rename state & API |

## Key Features

✓ **Double-click to edit** - No button needed
✓ **Optimistic UI** - Updates instantly, rollback on error
✓ **Arabic support** - Full RTL text input
✓ **Validation** - Empty names prevented
✓ **Loading state** - User sees feedback during save
✓ **Error handling** - Clear messages with automatic rollback
✓ **Keyboard support** - Enter to save, Escape to cancel
✓ **Database transaction** - Ensures data integrity
✓ **Authorization** - Only user or admin can rename

## Example Usage in App

```tsx
<InspectionTabs
  tabs={userData.tables} // Array of { id, label }
  activeTab={userData.activeTableId}
  onTabChange={setActiveTableId}
  onRemoveTab={handleRemoveTable}
  onRenameTab={handleRenameTable} // ← Rename handler
  canRemove={userData.tables.length > 1}
/>
```

## Error Messages (Arabic)

- "اسم الجدول لا يمكن أن يكون فارغاً" → Empty name error
- "تم تحديث اسم الجدول بنجاح" → Success message
- "حدث خطأ أثناء تحديث الجدول" → Server error
- "غير مصرح" → Unauthorized (403)

## Database Changes

Updates in `tables` table:

```
UPDATE tables
SET
  label = ?,
  last_updated = NOW()
WHERE id = ? AND user_id = ?
```

## Testing

```bash
# Test rename API
curl -X PATCH http://localhost:8000/api/tables/1/rename \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "table_name": "جدول جديد",
    "table_data": []
  }'
```

## Browser Developer Tools

Watch network tab during rename:

```
PATCH /api/tables/1/rename
Status: 200 OK
Response: { "success": true, "message": "...", "data": {...} }
```

## Troubleshooting

| Issue               | Solution                                      |
| ------------------- | --------------------------------------------- |
| Rename doesn't save | Check network tab for API errors              |
| Name reverted       | Check console for error message               |
| Input not focused   | Check if already in edit mode for another tab |
| RTL text wrong      | Verify `dir="rtl"` attribute in input         |
| Authorization error | Verify user token and table ownership         |

## Security

✓ User authorization enforced
✓ Database transactions prevent corruption
✓ Input validation on both sides
✓ No sensitive data in error messages
✓ Sanctum authentication middleware

---

**Implementation Date:** January 29, 2026
**Status:** Complete and Ready for Testing
