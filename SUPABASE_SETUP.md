# Supabase Setup Guide

This project uses Supabase for authentication (admins only) and database storage.

## Auth Model

- **Members / visitors** — no login required. Recruitment form is fully public/anonymous.
- **Admins** — log in via `/admin/login` (email + password). Must have `role = 'admin'` in the `profiles` table.

---

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign up/log in
2. Click **New Project**
3. Fill in your project details and wait ~2 minutes for provisioning

---

## 2. Get Your API Keys

1. **Settings → API**
2. Copy:
   - **Project URL** (`https://xxxxx.supabase.co`)
   - **anon/public** key

---

## 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 4. Database Tables & Policies

Run these SQL commands in **Database → SQL Editor → New query**.

### 4a. Profiles Table (Admin users only)

```sql
-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null default 'admin',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Only authenticated admins can read their own profile
create policy "Admins can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- No public insert/update — admins are created manually via Supabase dashboard
```

> **Important:** In **Authentication → Settings**, disable **"Enable email sign-ups"** so only manually invited admins can log in.

---

### 4b. Seed an Admin User

After creating a user in **Authentication → Users** (invite by email), run:

```sql
-- Replace with the actual user UUID from Authentication → Users
insert into public.profiles (id, role)
values ('<user-uuid-here>', 'admin')
on conflict (id) do update set role = 'admin';
```

---

### 4c. Applications Table (Anonymous submissions)

```sql
-- Create applications table — no user_id, fully anonymous
create table if not exists public.applications (
  id uuid default gen_random_uuid() primary key,
  full_name text not null,
  email text not null,
  phone text not null,
  reg_number text not null,
  year text not null,
  branch text not null,
  department text not null,
  experience text,
  portfolio_link text,
  github_link text,
  linkedin_link text,
  why_join text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.applications enable row level security;

-- Anyone (including unauthenticated visitors) can submit
create policy "Public can submit applications"
  on public.applications for insert
  to anon, authenticated
  with check (true);

-- Only admins can view all applications
create policy "Admins can view all applications"
  on public.applications for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Only admins can delete applications
create policy "Admins can delete applications"
  on public.applications for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
```

---

### 4d. Migration: If applications table already exists with user_id

```sql
-- Drop user_id column (no longer needed)
alter table public.applications drop column if exists user_id;

-- Drop old policies
drop policy if exists "Users can insert their own applications" on public.applications;
drop policy if exists "Users can view their own applications" on public.applications;
drop policy if exists "Admins can view all applications" on public.applications;

-- Re-create clean policies
create policy "Public can submit applications"
  on public.applications for insert
  to anon, authenticated
  with check (true);

create policy "Admins can view all applications"
  on public.applications for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Admins can delete applications"
  on public.applications for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
```

---

## 5. Authentication Settings

In **Authentication → Settings**:

| Setting | Value |
|---|---|
| Enable email sign-ups | **OFF** |
| Redirect URLs | `http://localhost:3000/**`, `https://yourdomain.com/**` |

Google OAuth is not needed — admin login is email + password only.

---

## 6. Test the Setup

1. `npm run dev`
2. Click **Join Us** in navbar → goes to `/recruitment` (no login needed) ✓
3. Submit the recruitment form → check **Table Editor → applications** ✓
4. Click **Admin Login** in footer → goes to `/admin/login` ✓
5. Log in with admin email + password → redirects to `/admin` ✓
6. Non-admin login attempt → shows "Access denied" ✓

---

## Troubleshooting

**"new row violates row-level security" on form submission**
- Ensure the `"Public can submit applications"` policy targets `to anon`.

**Admin login shows "Access denied"**
- Check the user exists in `public.profiles` with `role = 'admin'`.

**Admin layout redirects to `/admin/login` immediately**
- User is not authenticated or not in `profiles` with admin role — run seed script (4b).

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
