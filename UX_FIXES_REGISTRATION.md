# UX Fixes - Registration Form

**Date:** 2026-02-01
**Issue:** Registration form didn't adapt to different user roles

---

## Issues Fixed

### 1. Auto-select role from URL query params ✅

**Problem:**
- User selects "Заказчик" on role selection page
- Gets redirected to `/auth/register?role=client`
- But role was not auto-selected, defaulted to "Работник"

**Solution:**
- Added `useSearchParams` hook
- Added `useEffect` to read `role` query param on mount
- Auto-sets `selectedRole` state when role param is present

**Code:**
```typescript
const searchParams = useSearchParams()

useEffect(() => {
  const roleParam = searchParams.get('role')
  if (roleParam && (roleParam === 'worker' || roleParam === 'client' || roleParam === 'shef')) {
    setSelectedRole(roleParam as Role)
  }
}, [searchParams])
```

---

### 2. Change field label for Client role ✅

**Problem:**
- Field showed "Полное имя" (Full Name) for all roles
- Clients are companies/agencies, not individuals
- Needed to show "Название компании" (Company Name) for clients

**Solution:**
- Made label conditional based on `selectedRole`
- Shows "Название компании" when role is 'client'
- Shows "Полное имя" for other roles

**Code:**
```typescript
<label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
  {selectedRole === 'client' ? 'Название компании' : 'Полное имя'}
</label>
```

---

### 3. Update icon and placeholder for Client role ✅

**Problem:**
- Icon was "User" for all roles
- Placeholder was "Иван Петров" (person name) for all roles

**Solution:**
- Changed icon to "Building" for client role
- Changed placeholder to "ООО \"Строймонтаж\"" for client role
- Keeps "User" icon and "Иван Петров" for other roles

**Code:**
```typescript
{selectedRole === 'client' ? (
  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
) : (
  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
)}

<input
  placeholder={selectedRole === 'client' ? 'ООО "Строймонтаж"' : 'Иван Петров'}
  // ...
/>
```

---

## User Flow After Fix

1. User lands on `/role-select` page
2. User clicks "Заказчик" (Client)
3. Redirects to `/auth/register?role=client`
4. **Client role is now auto-selected** (highlighted in orange)
5. Form shows "Название компании" field with Building icon
6. Placeholder shows "ООО \"Строймонтаж\""
7. User enters company name and completes registration
8. Profile created as client with company information

---

## File Modified

- `app/auth/register/page.tsx` (510 lines)
  - Added `useSearchParams` import
  - Added query param reading logic
  - Made label conditional
  - Made icon conditional
  - Made placeholder conditional

---

## Testing Checklist

### Manual Testing Required:

- [ ] Go to `/role-select`
- [ ] Click "Заказчик"
- [ ] Verify redirected to `/auth/register?role=client`
- [ ] Verify "Заказчик" role is auto-selected (orange highlight)
- [ ] Verify field shows "Название компании" label
- [ ] Verify Building icon is displayed
- [ ] Verify placeholder shows "ООО \"Строймонтаж\""
- [ ] Enter company name and register
- [ ] Verify profile created correctly

### Test Other Roles:

- [ ] Select "Работник" - verify "Полное имя" label and User icon
- [ ] Select "Шеф" - verify "Полное имя" label and User icon

---

## Notes

- The backend still uses the `full_name` field for all roles
- For clients, `full_name` stores the company name
- This is intentional to keep the data model simple
- The database schema already supports this pattern
- Client profiles are created via `client_profiles` table
- Worker profiles are created via `worker_profiles` table

---

## Next Steps

After this fix is deployed:

1. Test the registration flow end-to-end
2. Verify client can create shifts
3. Verify worker can apply to shifts
4. Continue with smoke testing of Client Flow

---

## Impact

**User Experience:**
- ✅ Role is now pre-selected correctly
- ✅ Form adapts to user type
- ✅ Clear distinction between individual and company registration
- ✅ Better first impression for clients

**Technical:**
- ✅ No breaking changes to database
- ✅ No breaking changes to API
- ✅ Backward compatible
- ✅ Minimal code changes (3 small edits)

---

**Status:** ✅ Complete
**Ready for testing:** Yes
**Requires deployment:** Yes (Next.js rebuild)
