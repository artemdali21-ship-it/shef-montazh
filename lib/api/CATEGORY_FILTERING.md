# Category Filtering - SQL Queries

## Overview

Category filtering is implemented using PostgreSQL array operations. The `categories` column in `worker_profiles` table stores an array of category IDs.

## Database Schema

```sql
-- worker_profiles table
CREATE TABLE worker_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  categories TEXT[],  -- Array of category IDs
  ...
);

-- Index for faster category filtering
CREATE INDEX idx_worker_profiles_categories ON worker_profiles USING GIN(categories);
```

## Filter Operations

### 1. Find workers with ANY of selected categories (OR logic)

Uses the `overlaps` operator (`&&` in SQL) to find workers that have at least one matching category.

**Supabase Query:**
```typescript
let query = supabase
  .from('worker_profiles')
  .select('*, user:users(*)')

if (categories.length > 0) {
  // Find workers with ANY of the selected categories
  query = query.overlaps('categories', categories)
}
```

**Raw SQL:**
```sql
SELECT * FROM worker_profiles
WHERE categories && ARRAY['montazhnik', 'elektrik'];
-- Returns workers who are montazhnik OR elektrik
```

### 2. Find workers with ALL selected categories (AND logic)

Uses the `contains` operator (`@>` in SQL) to find workers that have all specified categories.

**Supabase Query:**
```typescript
if (categories.length > 0) {
  // Find workers with ALL selected categories
  query = query.contains('categories', categories)
}
```

**Raw SQL:**
```sql
SELECT * FROM worker_profiles
WHERE categories @> ARRAY['montazhnik', 'elektrik'];
-- Returns workers who are BOTH montazhnik AND elektrik
```

### 3. Find workers with specific single category

**Supabase Query:**
```typescript
query = query.contains('categories', [categoryId])
```

**Raw SQL:**
```sql
SELECT * FROM worker_profiles
WHERE 'montazhnik' = ANY(categories);
-- Returns workers who have montazhnik in their categories
```

## Shift Category Filtering

Shifts use a single `category` field (not an array).

**Supabase Query:**
```typescript
let query = supabase
  .from('shifts')
  .select('*')

if (categories.length > 0) {
  // Find shifts that match ANY of the selected categories
  query = query.in('category', categories)
}
```

**Raw SQL:**
```sql
SELECT * FROM shifts
WHERE category IN ('montazhnik', 'elektrik');
-- Returns shifts for montazhnik OR elektrik
```

## Performance Notes

- **GIN Index**: The GIN (Generalized Inverted Index) on the `categories` column makes array operations very fast
- **Overlaps vs Contains**:
  - Use `overlaps` (&&) for OR logic - faster for filtering
  - Use `contains` (@>) for AND logic - when you need exact match
- **Array operations** are optimized in PostgreSQL and perform well even with large datasets

## Example Usage in Components

### Worker Search (OR logic)
```typescript
// User selects: [montazhnik, elektrik]
// Returns workers who are montazhnik OR elektrik OR both
const result = await searchWorkers({
  categories: ['montazhnik', 'elektrik']
})
```

### Shift Search
```typescript
// User selects: [montazhnik, elektrik]
// Returns shifts for montazhnik OR elektrik
const result = await searchShifts({
  categories: ['montazhnik', 'elektrik']
})
```

## Category IDs

Valid category IDs (from `/lib/constants/categories.ts`):
- `montazhnik` - Монтажник
- `dekorator` - Декоратор
- `elektrik` - Электрик
- `svarshchik` - Сварщик
- `alpinist` - Альпинист
- `butafor` - Бутафор
- `raznorabochiy` - Разнорабочий

## Migration

If you need to update existing data:

```sql
-- Update old category names to new IDs
UPDATE worker_profiles
SET categories = ARRAY['montazhnik']
WHERE categories = ARRAY['Монтажник'];

-- Add category to existing workers
UPDATE worker_profiles
SET categories = array_append(categories, 'elektrik')
WHERE user_id = 'xxx';

-- Remove category
UPDATE worker_profiles
SET categories = array_remove(categories, 'elektrik')
WHERE user_id = 'xxx';
```
