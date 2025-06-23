
## 🧱 Supabase Tables (Minimal Setup)

### 1. **users**

Built-in by Supabase Auth — no need to create manually. But you can extend it with a `profiles` table:

```sql
-- Profiles table (linked to auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text check (role in ('admin', 'instructor', 'student')) default 'student',
  created_at timestamp default now()
);
```

---

### 2. **courses**

```sql
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  thumbnail_url text,
  price numeric(10, 2) not null default 0,
  created_by uuid references profiles(id),
  created_at timestamp default now()
);
```

---

### 3. **lessons**

```sql
create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  video_url text not null,
  position integer not null,  -- for ordering
  created_at timestamp default now()
);
```

---

### 4. **enrollments**

```sql
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  enrolled_at timestamp default now(),
  unique (user_id, course_id)
);
```

---

### 5. **progress**

(Optional for tracking lesson completion)

```sql
create table progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  completed boolean default false,
  completed_at timestamp
);
```

---

### 6. **purchases**

(To store Stripe or other payment info)

```sql
create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  course_id uuid references courses(id),
  stripe_payment_id text,
  purchased_at timestamp default now()
);
```

---

## 🧩 Relationships Summary:

* `profiles` ←→ `courses` (1\:N by instructor)
* `courses` ←→ `lessons` (1\:N)
* `profiles` ←→ `enrollments` ←→ `courses` (N\:N)
* `profiles` ←→ `progress` (tracks lesson completion)
* `profiles` ←→ `purchases` ←→ `courses`


