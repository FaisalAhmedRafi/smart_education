# Smart Education — Frontend

Next.js (App Router) + Tailwind CSS frontend for the Smart Education backend.
Handles login, and role-based dashboards for admin, teacher, and student.

## Stack

- Next.js 14 (App Router), React 18
- Tailwind CSS
- Plain `fetch` wrapper for the API (no extra data-fetching library — kept
  intentionally simple)
- JWT stored in `localStorage`, attached to every request via `lib/api.ts`

## Getting started

1. Make sure the backend is running first (see `smart-education-backend/README.md`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the env file:
   ```bash
   cp .env.example .env.local
   ```
   Update `NEXT_PUBLIC_API_URL` if your backend isn't on `http://localhost:3000/api`.
4. Run the dev server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3001` (or whatever port Next prints — it'll pick
   a different one automatically if 3000 is taken by the backend).

## How auth works

- `lib/auth.tsx` is a React context (`AuthProvider`) that holds the current
  user, wraps the whole app (see `app/layout.tsx`).
- On login, the JWT from `/auth/login` is saved to `localStorage`, then
  `/users/me` is called to load the profile.
- `app/dashboard/layout.tsx` redirects to `/login` if there's no valid
  session — this is what protects the whole `/dashboard/*` tree.
- The sidebar (`components/Sidebar.tsx`) shows different nav items per role,
  matching the backend's `RolesGuard` restrictions — but note the backend
  is still the real enforcement layer; the frontend only hides links a user
  can't use anyway.

## Pages

| Route | Who sees it | What it does |
|---|---|---|
| `/login` | everyone | sign in |
| `/register` | everyone | bootstrap the first admin account |
| `/dashboard` | everyone (post-login) | role-aware overview with counts |
| `/dashboard/users` | admin | create/remove admin, teacher, student accounts |
| `/dashboard/classes` | everyone views; admin manages | class/section list |
| `/dashboard/students` | admin, teacher | student roster, filter by class |
| `/dashboard/attendance` | admin/teacher mark; student views own | bulk mark by class + date, overwrite-safe |
| `/dashboard/grades` | admin/teacher record; student views own | per-student grade entry and history |

## Design

A "school ledger" visual language: warm paper background, slate-navy sidebar,
brass accent, Fraunces for headings, Inter for UI text, IBM Plex Mono for
roll numbers/dates/data. Role badges are styled like small stamps.

## What's next

- The backend README already flags moving off `synchronize: true` before
  production use — do that before you point this frontend at real data.
- No pagination on the dashboard tables yet; fine for a school-sized dataset,
  worth adding if this grows.
- No toast/notification system — success/error states are shown inline per
  page for now.
- Consider adding a "my class" landing for teachers once a teacher is
  assigned to more than one class, so they don't have to reselect it on
  every visit to Attendance/Grades.
  
