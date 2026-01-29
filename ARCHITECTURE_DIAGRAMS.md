# Architecture & Flow Diagrams

## 1. User Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERACTION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐
    │  User Double-    │
    │  Clicks Tab      │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────────┐
    │ InspectionTabs       │
    │ handleDoubleClick()   │
    │ - Set editingTabId    │
    │ - Focus input         │
    │ - Select text         │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ User Types Name      │
    │ (RTL Arabic OK)      │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ User Presses Enter   │
    │ or Clicks Away       │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ handleBlur()         │
    │ - Validate input     │
    │ - Check not empty    │
    └────────┬─────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
   Error        Valid
   (Show)       (Call)
      │             │
      └─────┬───────┘
            ▼
    ┌──────────────────────┐
    │ onRenameTab()        │
    │ (if provided)        │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ App Handler:         │
    │ handleRenameTable()  │
    │ - Optimistic update  │
    │ - Save prev tables   │
    │ - Update UI          │
    └────────┬─────────────┘
             │
             ▼
    ┌──────────────────────┐
    │ apiService.          │
    │ renameTable()        │
    │ PATCH /api/tables... │
    └────────┬─────────────┘
             │
      ┌──────┴──────┐
      │             │
      ▼             ▼
   Success      Error
      │             │
      ▼             ▼
    Update    Rollback
    Tab       Tab Name
      │             │
      └─────┬───────┘
            ▼
    ┌──────────────────────┐
    │ Show Message         │
    │ - Success (1.5s)     │
    │ - Error (3s)         │
    └─────────────────────┘
```

---

## 2. API Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      API FLOW                                    │
└─────────────────────────────────────────────────────────────────┘

Frontend                              Backend
┌────────────────┐                  ┌─────────────────┐
│ React App      │                  │ Laravel Server  │
└────────┬───────┘                  └────────┬────────┘
         │                                   │
         │  PATCH /api/tables/1/rename       │
         │──────────────────────────────────>│
         │  {                                 │
         │    "table_name": "جدول جديد",    │
         │    "table_data": [...]            │
         │  }                                │
         │                                   │
         │                          ┌────────▼───────┐
         │                          │ Route Handler  │
         │                          │ renameTable()  │
         │                          └────────┬───────┘
         │                                   │
         │                          ┌────────▼───────┐
         │                          │ Auth Check     │
         │                          │ (Sanctum)      │
         │                          └────────┬───────┘
         │                                   │
         │                          ┌────────▼───────┐
         │                          │ Validation     │
         │                          │ - Required     │
         │                          │ - String       │
         │                          │ - Max 255      │
         │                          └────────┬───────┘
         │                                   │
         │                          ┌────────▼───────┐
         │                          │ Begin          │
         │                          │ Transaction    │
         │                          └────────┬───────┘
         │                                   │
         │                          ┌────────▼───────┐
         │                          │ Update DB      │
         │                          │ tables table   │
         │                          └────────┬───────┘
         │                                   │
         │                          ┌────────▼───────┐
         │                          │ Commit         │
         │                          │ Transaction    │
         │                          └────────┬───────┘
         │                                   │
         │  200 OK                           │
         │  {                                │
         │    "success": true,              │
         │    "message": "تم تحديث...",     │
         │    "data": {id, label, ...}      │
         │  }                               │
         │<──────────────────────────────────│
         │
    ┌────▼─────┐
    │ Update UI │
    │ Show ✅   │
    └──────────┘
```

---

## 3. Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   COMPONENT HIERARCHY                            │
└─────────────────────────────────────────────────────────────────┘

                         App.tsx
                            │
                ┌───────────┬┴────────────┐
                │           │            │
                ▼           ▼            ▼
         UserHeader    InspectionTabs   MainContent
                           │
         ┌─────────────────┬┴────────────┬──────────────┐
         │                 │            │              │
    Tab[0]            Tab[1]       Tab[2]          Message
    ┌───────┐        ┌───────┐    ┌───────┐       ┌─────┐
    │Label│ │        │Label│ │    │Label│ │       │Error│
    │ X   │ │        │ X   │ │    │ X   │ │       │Good │
    └─────┘ │        └─────┘ │    └─────┘ │       └─────┘
     Click  │         Double  │     Click  │      Auto
     Edit   │         Click   │     Edit   │      Dismiss
             │        Input   │             │
             │        ─────   │             │
             │        [Text]  │             │
             │        Enter   │             │
             └────────────────┘             │
                                            │
                        API Response ───────┘
```

---

## 4. State Management Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT                              │
└─────────────────────────────────────────────────────────────────┘

InspectionTabs Component State:
┌──────────────────────────────────────┐
│ editingTabId: string | null          │  ← Which tab is editing?
│ editingValue: string                 │  ← Current input value
│ isLoading: boolean                   │  ← API call in progress?
│ error: string | null                 │  ← Error message
│ success: string | null               │  ← Success message
│ inputRef: React.Ref                  │  ← Input element ref
└──────────────────────────────────────┘

App Component State:
┌──────────────────────────────────────┐
│ userTablesData: {                    │
│   [email]: {                         │
│     tables: [                        │
│       {                              │
│         id: string                   │
│         label: string   ◄── Updated  │
│         data: string[][]             │
│         columnHeaders: string[]      │
│         notes: string                │
│       },                             │
│       ...                            │
│     ]                                │
│     activeTableId: string            │
│   }                                  │
│ }                                    │
└──────────────────────────────────────┘

Redux/Context? Not used - local state is sufficient
```

---

## 5. Database Update Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE TRANSACTION                           │
└─────────────────────────────────────────────────────────────────┘

Request arrives at backend
        ↓
Authorization check
        ↓
Input validation
        ↓
BEGIN TRANSACTION
        │
        ├─ SELECT table WHERE id=? AND user_id=?
        │  └─ Verify table exists and user owns it
        │
        ├─ UPDATE tables SET label=?, last_updated=NOW() WHERE id=?
        │  └─ Update only the label field
        │
        ├─ Check if update successful
        │  ├─ Yes → COMMIT TRANSACTION
        │  │
        │  └─ No → ROLLBACK TRANSACTION
        │         Return error 500
        │
        └─ Return success 200 with updated data

Guarantee: Either ALL updates succeed or NONE
          (Atomicity principle)
```

---

## 6. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING                                │
└─────────────────────────────────────────────────────────────────┘

Frontend Error Scenarios:
┌────────────────┐
│ Empty Name     │ ──► Frontend Validation ──► Show Error ──► Exit
└────────────────┘

┌────────────────────┐
│ Network Error      │ ──► Catch Block ──► Rollback ──► Show Error ──► Exit
└────────────────────┘

┌────────────────────┐
│ API Returns 500    │ ──► Catch Block ──► Rollback ──► Show Error ──► Exit
└────────────────────┘

┌────────────────────┐
│ API Returns 403    │ ──► Catch Block ──► Rollback ──► Show Error ──► Exit
└────────────────────┘

Backend Error Scenarios:
┌────────────────────┐
│ Validation Fails   │ ──► Return 422 ──► Frontend Shows Error ──► Exit
└────────────────────┘

┌────────────────────┐
│ Table Not Found    │ ──► Return 404 ──► Frontend Shows Error ──► Exit
└────────────────────┘

┌────────────────────┐
│ DB Error           │ ──► Rollback ──► Return 500 ──► Frontend Shows Error ──► Exit
└────────────────────┘

Recovery Strategy: Optimistic + Rollback
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Update UI immediately (optimistic)
2. Save original state
3. Attempt API call
4. Success? ──► Keep new state
5. Error? ──► Restore original state
```

---

## 7. Authorization Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHORIZATION                                │
└─────────────────────────────────────────────────────────────────┘

PATCH /api/tables/{tableId}/rename
        │
        ▼
Sanctum Middleware
├─ Is user authenticated? (Bearer token valid?)
│  ├─ No ──► 401 Unauthorized ──► Stop
│  │
│  └─ Yes ──► Continue
│
▼
TableController::renameTable()
├─ Get table from DB
│
├─ Check: table.user_id === auth()->user()->id OR auth()->user()->isAdmin()
│  │
│  ├─ No (User is neither owner nor admin)
│  │  └──► 403 Forbidden ──► "غير مصرح" ──► Stop
│  │
│  └─ Yes ──► Continue with update
│
▼
Update Allowed
├─ Validate input
├─ Update database
└─ Return success

Authorization Rules:
━━━━━━━━━━━━━━━━━━━━━━━━
✓ User can rename their own tables
✓ Admin can rename any table
✗ User cannot rename other users' tables
```

---

## 8. Input Validation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INPUT VALIDATION                              │
└─────────────────────────────────────────────────────────────────┘

Frontend Validation:
┌─────────────────────────┐
│ User types in input     │
│ onBlur event triggered  │
└────────┬────────────────┘
         │
         ├─ Is value empty or whitespace only?
         │  ├─ Yes ──► Show Error ──► "اسم الجدول لا يمكن أن يكون فارغاً" ──► Stop
         │  │
         │  └─ No ──► Continue
         │
         └─ Value looks good, proceed to API

Backend Validation:
┌─────────────────────────────────────┐
│ Receive table_name parameter        │
└────────┬────────────────────────────┘
         │
         ├─ Laravel Validate::
         │  ├─ Required? (not null, not empty)
         │  │  ├─ No ──► 422 Unprocessable Entity ──► Stop
         │  │  └─ Yes ──► Continue
         │  │
         │  ├─ String type?
         │  │  ├─ No ──► 422 Unprocessable Entity ──► Stop
         │  │  └─ Yes ──► Continue
         │  │
         │  └─ Max 255 characters?
         │     ├─ No ──► 422 Unprocessable Entity ──► Stop
         │     └─ Yes ──► Continue to DB update
         │
         └─ All validations pass ✓

Result: Multi-layer validation ensures data integrity
```

---

## 9. RTL/Arabic Support

```
┌─────────────────────────────────────────────────────────────────┐
│                  RTL SUPPORT FOR ARABIC                          │
└─────────────────────────────────────────────────────────────────┘

Component Level:
┌────────────────────────────────────────┐
│ <InspectionTabs ... dir="rtl">         │
│   ┌────────────────────────────────┐   │
│   │ Tab Content                    │   │
│   │                                │   │
│   │ Right ◄────────────► Left     │   │
│   │  (for Arabic)      (for LTR)   │   │
│   └────────────────────────────────┘   │
│ </InspectionTabs>                      │
└────────────────────────────────────────┘

Input Field Level:
┌────────────────────────────────────────┐
│ <input dir="rtl" ... />                │
│                                        │
│ Typing order: Right to Left            │
│ Text alignment: Right (RTL)            │
│ Character support: Arabic ✓            │
└────────────────────────────────────────┘

CSS Support:
┌────────────────────────────────────────┐
│ Text direction: rtl                    │
│ Text alignment: right                  │
│ Padding: right (instead of left)       │
│ Margin: right (instead of left)        │
└────────────────────────────────────────┘

Browser Support:
┌────────────────────────────────────────┐
│ Chrome:  ✓ Full support               │
│ Firefox: ✓ Full support               │
│ Safari:  ✓ Full support               │
│ Edge:    ✓ Full support               │
└────────────────────────────────────────┘
```

---

## 10. Performance Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│                   PERFORMANCE                                    │
└─────────────────────────────────────────────────────────────────┘

Optimistic Updates:
┌──────────────────────────┐
│ 1. Update UI immediately │ (0ms - User sees change instantly)
│ 2. Make API call         │ (async - happens in background)
│ 3. If success, keep UI   │ (confirm change)
│ 4. If error, rollback UI │ (revert change)
│                          │
│ Net effect: Perceived    │
│ performance is instant!  │
└──────────────────────────┘

State Management:
┌──────────────────────────┐
│ ✓ Minimal state updates  │
│ ✓ Only changed fields    │
│ ✓ No unnecessary re-renders
│ ✓ Efficient array mapping
└──────────────────────────┘

Database:
┌──────────────────────────┐
│ ✓ Single UPDATE query    │
│ ✓ Indexed primary key    │
│ ✓ Transaction overhead   │
│   (worth it for integrity)
└──────────────────────────┘

Network:
┌──────────────────────────┐
│ ✓ PATCH (not PUT)        │
│ ✓ Minimal payload        │
│ ✓ JSON compression       │
│ ✓ Single round-trip      │
└──────────────────────────┘
```

---

## Legend

```
──►  Flow direction
▼    Next step
│    Continuation
├─   Branch point
└─   Final destination
*    Special attention
✓    Success/Enabled
✗    Failure/Disabled
◄──►  Bidirectional
```
