## 📊 Supabase Database Tables

### 1. **profiles** (extends Supabase Auth)

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  full_name text,
  bio text,
  role text CHECK (role IN ('admin', 'creator', 'student')) DEFAULT 'student',
  status text CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

```

### 2. **categories**

```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
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
  thumbnail_url text,
  coursevideo_url text,
  price numeric(10, 2) not null default 0,
  original_price numeric(10, 2),
  category_id uuid references categories(id),
  creator_id uuid references profiles(id),
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
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  section_id uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  video_url text,
  duration integer DEFAULT 0, -- in seconds
  is_free boolean DEFAULT false,
  is_preview boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (section_id, order_index)
);

```

### 5. **enrollments**

```sql
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  purchased_at timestamp with time zone DEFAULT now(),
  amount_paid numeric(10, 2) DEFAULT 0,
  payment_id text, -- For Stripe payment reference
  status text CHECK (status IN ('active', 'completed', 'refunded', 'cancelled')) DEFAULT 'active',
  completion_percentage integer DEFAULT 0,
  last_accessed_at timestamp with time zone DEFAULT now(),
  certificate_issued boolean DEFAULT false,
  certificate_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, course_id)
);

```

### 6. **progress**

```sql
CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completion_percentage integer DEFAULT 0,
  last_position integer DEFAULT 0, -- Video position in seconds
  last_watched_at timestamp with time zone DEFAULT now(),
  watch_time integer DEFAULT 0, -- Total seconds spent watching
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, lesson_id)
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
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_published boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, course_id)
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
