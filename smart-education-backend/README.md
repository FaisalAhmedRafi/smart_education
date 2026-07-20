# Smart Education — Backend

School management API built with NestJS, TypeORM, and PostgreSQL. Covers
users/auth, classes, students, attendance, and grades with role-based
access control (Admin / Teacher / Student).

## Stack

- NestJS 10
- TypeORM + PostgreSQL
- Passport JWT for auth
- class-validator / class-transformer for request validation and response
  shaping

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the env file and fill in your local Postgres credentials:
   ```bash
   cp .env.example .env
   ```
3. Create the database (name must match `DB_NAME` in `.env`):
   ```bash
   createdb smart_education
   ```
4. Start Postgres, then run the app in dev mode:
   ```bash
   npm run start:dev
   ```
   On first run, `synchronize: true` (dev only, see `app.module.ts`) will
   create all tables automatically. The API is served under `/api`, e.g.
   `http://localhost:3000/api/auth/login`.

## Roles

- **admin** — full access: manage users, classes, students; can also mark
  attendance and record grades.
- **teacher** — mark attendance, record grades, view students/classes.
- **student** — view their own grades and attendance only.

There's no signed-up "first admin" seed yet. To bootstrap, either:
- Temporarily allow `POST /api/auth/register` to be called with
  `"role": "admin"` (it's open by design so you can create the first
  account), then tighten it later, or
- Insert an admin row directly into the `users` table (remember the
  password must be a bcrypt hash).

## API overview

All routes are prefixed with `/api`. Except `/auth/*`, everything requires
`Authorization: Bearer <token>`.

| Method | Route | Roles | Notes |
|---|---|---|---|
| POST | `/auth/register` | public | creates a user + returns a token |
| POST | `/auth/login` | public | returns `{ accessToken }` |
| GET | `/users/me` | any authenticated | current user profile |
| GET/POST/PATCH/DELETE | `/users` | admin | manage accounts |
| GET | `/classes` | any authenticated | list classes |
| POST/PATCH/DELETE | `/classes` | admin | manage classes |
| GET | `/students` | admin, teacher | optional `?classRoomId=` filter |
| POST/PATCH/DELETE | `/students` | admin | manage student profiles |
| POST | `/attendance` | admin, teacher | bulk mark attendance for a class/date |
| GET | `/attendance/class/:classRoomId?date=` | admin, teacher | roll call for a day |
| GET | `/attendance/student/:studentId` | any authenticated | a student's history |
| POST | `/grades` | admin, teacher | record a grade |
| GET | `/grades/student/:studentId` | any authenticated* | *students can only view their own |
| PATCH/DELETE | `/grades/:id` | admin, teacher | edit/remove a grade |

## Example requests

Register the first admin:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"School Admin","email":"admin@school.com","password":"admin123","role":"admin"}'
```

Log in:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"admin123"}'
```

Mark attendance:
```bash
curl -X POST http://localhost:3000/api/attendance \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "classRoomId": "<class-uuid>",
    "date": "2026-07-17",
    "entries": [
      { "studentId": "<student-uuid>", "status": "present" },
      { "studentId": "<student-uuid-2>", "status": "absent" }
    ]
  }'
```

## What's next

- Swap `synchronize: true` for TypeORM migrations before deploying
  (`npm run migration:generate` / `migration:run` are already wired up).
- Add a `subjects` module if you want subjects managed independently of
  free-text strings on `grades`.
- Add rate limiting / helmet for production hardening.
- Connect the frontend (`smart-education-frontend`) to these endpoints.
