# Notes System - Testing Guide

## Quick Start Testing

### Step 1: Verify Backend Routes

```bash
cd backend
php artisan route:list --path=notes
```

Expected output:

```
POST   /api/notes              Api\NotesController@store
GET    /api/notes              Api\NotesController@index
GET    /api/notes/{table_name} Api\NotesController@show
PUT    /api/notes/{id}         Api\NotesController@update
DELETE /api/notes/{id}         Api\NotesController@destroy
```

### Step 2: Check Database Schema

```bash
# Connect to your database and run:
DESCRIBE notes;
```

Expected columns:

```
- id (INT, PRIMARY KEY)
- table_name (VARCHAR)
- content (LONGTEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Step 3: Test Endpoints via Postman or cURL

#### Get Authentication Token

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"your@email.com","password":"password"}'
```

Copy the token from the response.

#### Test 1: Save a Note

```bash
curl -X POST http://127.0.0.1:8000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "table_name":"عمارة 1",
    "content":"هذه ملاحظة تجريبية للاختبار"
  }'
```

Expected response (201):

```json
{
  "success": true,
  "message": "تم حفظ الملاحظة بنجاح",
  "data": {
    "id": 1,
    "table_name": "عمارة 1",
    "content": "هذه ملاحظة تجريبية للاختبار",
    "created_at": "2026-01-29 15:30:00",
    "updated_at": "2026-01-29 15:30:00"
  }
}
```

#### Test 2: Get All Notes (Grouped)

```bash
curl -X GET http://127.0.0.1:8000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

Expected response (200):

```json
{
  "success": true,
  "message": "تم استرجاع الملاحظات بنجاح",
  "data": [
    {
      "table_name": "عمارة 1",
      "notes": [
        {
          "id": 1,
          "content": "هذه ملاحظة تجريبية",
          "created_at": "2026-01-29 15:30:00",
          "updated_at": "2026-01-29 15:30:00"
        }
      ]
    }
  ]
}
```

#### Test 3: Get Notes for Specific Table

```bash
curl -X GET "http://127.0.0.1:8000/api/notes/عمارة%201" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

Expected response (200):

```json
{
  "success": true,
  "message": "تم استرجاع ملاحظات الجدول بنجاح",
  "data": [
    {
      "id": 1,
      "content": "هذه ملاحظة تجريبية",
      "created_at": "2026-01-29 15:30:00",
      "updated_at": "2026-01-29 15:30:00"
    }
  ]
}
```

#### Test 4: Update a Note

```bash
curl -X PUT http://127.0.0.1:8000/api/notes/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"content":"محتوى الملاحظة المحدث"}'
```

Expected response (200):

```json
{
  "success": true,
  "message": "تم تحديث الملاحظة بنجاح",
  "data": {
    "id": 1,
    "table_name": "عمارة 1",
    "content": "محتوى الملاحظة المحدث",
    "created_at": "2026-01-29 15:30:00",
    "updated_at": "2026-01-29 15:31:00"
  }
}
```

#### Test 5: Delete a Note

```bash
curl -X DELETE http://127.0.0.1:8000/api/notes/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

Expected response (200):

```json
{
  "success": true,
  "message": "تم حذف الملاحظة بنجاح"
}
```

## Frontend Testing

### Step 1: Verify Components Import

```typescript
import { NotesTextarea } from "./components/NotesTextarea";
import { GeneralNotes } from "./components/GeneralNotes";
```

Both components should import without errors.

### Step 2: Verify API Service Methods

```typescript
import { apiService } from "./services/apiService";

// Test 1: Save note
await apiService.saveNote("عمارة 1", "ملاحظة تجريبية");

// Test 2: Get all notes
const allNotes = await apiService.getAllNotes();
console.log(allNotes);

// Test 3: Get notes for table
const tableNotes = await apiService.getNotesByTable("عمارة 1");
console.log(tableNotes);
```

### Step 3: Test Components in Browser

#### Test NotesTextarea

```tsx
<NotesTextarea
  value={noteContent}
  onChange={setNoteContent}
  tableName="عمارة 1"
  showSaveButton={true}
/>
```

Expected behavior:

- Textarea appears with RTL direction
- Save button is clickable
- Clicking save shows success/error message
- Textarea clears after successful save

#### Test GeneralNotes

```tsx
<GeneralNotes />
```

Expected behavior:

- Component loads and shows loading spinner
- Notes are grouped by table_name
- Each group shows table name as header
- Notes display with content and timestamps
- Delete button works

## Error Testing

### Test 1: Missing Required Fields

```bash
curl -X POST http://127.0.0.1:8000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"ملاحظة بدون اسم جدول"}'
```

Expected: 422 status with validation error

### Test 2: Unauthorized Request

```bash
curl -X GET http://127.0.0.1:8000/api/notes
```

Expected: 401 Unauthorized

### Test 3: Empty Content

```bash
curl -X POST http://127.0.0.1:8000/api/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"table_name":"عمارة 1","content":""}'
```

Expected: 422 status with validation error

### Test 4: Non-existent Note ID

```bash
curl -X PUT http://127.0.0.1:8000/api/notes/99999 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"محتوى جديد"}'
```

Expected: 404 status "الملاحظة غير موجودة"

## Checklist

✅ **Backend Checklist**

- [ ] Migration ran successfully: `2026_01_29_000020_update_notes_table_to_use_table_name`
- [ ] Note model exists and has correct $fillable array
- [ ] NotesController created with all methods
- [ ] Routes registered and visible in `php artisan route:list`
- [ ] All endpoints return 401 without token
- [ ] All endpoints return proper JSON responses
- [ ] Arabic error messages display correctly

✅ **Frontend Checklist**

- [ ] apiService methods added: saveNote, getAllNotes, getNotesByTable, updateNote, deleteNote
- [ ] NotesTextarea component updated with save functionality
- [ ] GeneralNotes component created and displays correctly
- [ ] Components import without TypeScript errors
- [ ] API calls use correct endpoints and headers
- [ ] Error messages display in Arabic
- [ ] Loading states work properly

✅ **Integration Checklist**

- [ ] NotesTextarea added to table/section components
- [ ] GeneralNotes tab appears in tab navigation
- [ ] Saving notes works end-to-end
- [ ] Loading all notes works end-to-end
- [ ] Deleting notes works
- [ ] UI is responsive and RTL-friendly

## Common Issues & Solutions

### Issue 1: 404 Not Found on Notes Endpoints

**Solution:** Run `php artisan route:clear` then verify routes with `php artisan route:list --path=notes`

### Issue 2: "SQLSTATE: Unknown column table_name"

**Solution:** Run `php artisan migrate` to apply the schema changes

### Issue 3: CORS errors on notes endpoints

**Solution:** Ensure NotesController is imported in routes/api.php and routes are within the `middleware('cors')` group

### Issue 4: Arabic text shows as question marks

**Solution:** Ensure database charset is UTF-8. Check in `config/database.php`:

```php
'charset' => 'utf8mb4',
'collation' => 'utf8mb4_unicode_ci',
```

### Issue 5: Textarea won't save

**Solution:** Check browser console for errors. Ensure:

- Table name is not empty
- Content is not empty
- Bearer token is valid and not expired
- API endpoint is correct

## Database Query Examples

Get all notes:

```sql
SELECT * FROM notes ORDER BY table_name, created_at DESC;
```

Get notes for specific table:

```sql
SELECT * FROM notes WHERE table_name = 'عمارة 1' ORDER BY created_at DESC;
```

Count notes by table:

```sql
SELECT table_name, COUNT(*) as count FROM notes GROUP BY table_name;
```

Delete old notes (older than 30 days):

```sql
DELETE FROM notes WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```
