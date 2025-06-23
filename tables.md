## 📊 Supabase Database Tables

### 1. **profiles** (extends Supabase Auth)

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  full_name text,
  bio text,
  role text check (role in ('admin', 'instructor', 'student')) default 'student',
  status text check (status in ('active', 'inactive')) default 'active',
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

```

### 2. **categories**

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  color text,
  created_at timestamp with time zone default now()
);

```

### 3. **courses**

```sql
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  short_description text,
  thumbnail_url text,
  price numeric(10, 2) not null default 0,
  original_price numeric(10, 2),
  category_id uuid references categories(id),
  instructor_id uuid references profiles(id),
  status text check (status in ('draft', 'published', 'archived')) default 'draft',
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')) default 'beginner',
  duration_hours integer default 0,
  total_lessons integer default 0,
  rating numeric(3, 2) default 0,
  total_ratings integer default 0,
  total_students integer default 0,
  featured boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

```

### 4. **lessons**

```sql
create table lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  video_duration integer, -- in seconds
  position integer not null, -- for ordering
  is_free boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

```

### 5. **enrollments**

```sql
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  enrolled_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  progress_percentage numeric(5, 2) default 0,
  unique (user_id, course_id)
);

```

### 6. **progress**

```sql
create table progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  lesson_id uuid references lessons(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  completed boolean default false,
  watched_duration integer default 0, -- in seconds
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id, lesson_id)
);

```

### 7. **purchases**

```sql
create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  amount numeric(10, 2) not null,
  currency text default 'usd',
  status text check (status in ('pending', 'completed', 'failed', 'refunded')) default 'pending',
  purchased_at timestamp with time zone default now(),
  refunded_at timestamp with time zone
);

```

### 8. **reviews**

```sql
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id, course_id)
);

```

### 9. **contact_messages**

```sql
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  newsletter_subscription boolean default false,
  status text check (status in ('new', 'read', 'replied', 'closed')) default 'new',
  created_at timestamp with time zone default now()
);

```

### 10. **newsletter_subscriptions**

```sql
create table newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  last_name text,
  subscribed_at timestamp with time zone default now(),
  unsubscribed_at timestamp with time zone,
  is_active boolean default true
);

```

## 🔗 Key Relationships:

- `profiles` → `courses` (1:N - instructor creates courses)
- `courses` → `lessons` (1:N - course contains lessons)
- `profiles` → `enrollments` → `courses` (N:N - users enroll in courses)
- `profiles` → `progress` → `lessons` (N:N - users track lesson progress)
- `profiles` → `purchases` → `courses` (N:N - users purchase courses)
- `profiles` → `reviews` → `courses` (N:N - users review courses)
- `categories` → `courses` (1:N - category contains courses)

## 📝 Additional Notes:

1. **Row Level Security (RLS)**: You'll need to enable RLS on all tables and create appropriate policies
2. **Indexes**: Consider adding indexes on frequently queried columns like `user_id`, `course_id`, `status`, etc.
3. **Triggers**: You might want to create triggers to automatically update `updated_at` timestamps
4. **Functions**: Consider creating functions to calculate course ratings and progress percentages

These tables cover all the functionality I observed in your current website implementation and provide room for future enhancements like certificates, live streaming, and community features.
