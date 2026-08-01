# TaskFlow Pro

Group-based task management for teams. Members create groups, assign work to
each other inside those groups, and track it to completion. A single
administrator manages the user directory but never assigns tasks.

## Stack

| Concern        | Choice                                                      |
| -------------- | ----------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack), React 19.2               |
| Database       | Neon Postgres via Prisma 7 + `@prisma/adapter-pg`            |
| Client state   | Redux Toolkit + RTK Query                                    |
| Styling        | Tailwind CSS v4 (CSS-first theme in `app/globals.css`)       |
| Validation     | Zod v4 — the same schemas run on the client and the server   |
| Auth           | HTTP-only JWT session cookie (`jose`) + `bcryptjs` hashing   |
| Icons / toasts | `lucide-react`, `sonner`                                     |

## Getting started

### 1. Create a Neon database

Sign in at [console.neon.tech](https://console.neon.tech), create a project,
and copy **both** connection strings from the dashboard.

### 2. Configure the environment

```bash
cp .env.example .env
```

Fill in:

| Variable         | Purpose                                                          |
| ---------------- | ---------------------------------------------------------------- |
| `DATABASE_URL`   | Neon **pooled** string (host contains `-pooler`) — used at runtime |
| `DIRECT_URL`     | Neon **direct** string — used by migrations                       |
| `AUTH_SECRET`    | 32+ random chars: `openssl rand -base64 32`                       |
| `ADMIN_*`        | Credentials for the single seeded administrator                   |

### 3. Create the schema and seed demo data

```bash
pnpm install          # runs `prisma generate` via postinstall
pnpm db:deploy        # applies prisma/migrations to Neon
pnpm db:seed          # admin + 8 members + 3 groups + 10 tasks
```

Use `pnpm db:push` instead of `db:deploy` if you prefer schema-sync without
migration history.

### 4. Run it

```bash
pnpm dev
```

Seeded logins (printed at the end of the seed run):

| Role   | Identifier              | Password        |
| ------ | ----------------------- | --------------- |
| Admin  | `ADMIN_EMAIL` from .env | `ADMIN_PASSWORD` |
| Member | `alex@acme.co`          | `Password@123`  |

Every seeded member shares the same demo password. Sign-in accepts either the
email address or the mobile number.

## Scripts

| Script            | Does                                            |
| ----------------- | ----------------------------------------------- |
| `pnpm dev`        | Dev server                                      |
| `pnpm build`      | `prisma generate` then a production build       |
| `pnpm typecheck`  | `tsc --noEmit`                                  |
| `pnpm lint`       | ESLint                                          |
| `pnpm db:migrate` | Create a new migration from schema changes      |
| `pnpm db:deploy`  | Apply existing migrations (use in CI/deploy)    |
| `pnpm db:push`    | Sync schema without migration files             |
| `pnpm db:seed`    | Reset and re-seed demo data                     |
| `pnpm db:studio`  | Prisma Studio                                   |

## Project layout

```
app/
  (marketing)/page.tsx        Landing page
  (auth)/sign-in|sign-up      Authentication
  (app)/                      Signed-in shell (sidebar + topbar)
    dashboard/                Widgets, empty state, group grid
    groups/                   Group list, group dashboard with task tabs
    tasks/[taskId]/           Task details, comments, activity timeline
    notifications/            Notification centre
    profile/                  Personal info, security, billing
    admin/                    Admin overview + user management
  api/                        Route handlers (the only DB access path)
components/
  ui/                         Button, field, modal, tabs, badge, pagination…
  layout/                     Sidebar, topbar, global search, notification bell
  dashboard|groups|tasks|…    Feature components
lib/
  db.ts                       Prisma client (adapter-pg)
  jwt.ts / session.ts         Token helpers / cookie helpers
  api.ts                      Route-handler guards + error envelope
  validation.ts               Zod schemas shared with the client
  serialize.ts                Prisma rows → DTOs
store/
  api.ts                      RTK Query endpoints
  ui-slice.ts                 Sidebar, active tab, task filters
prisma/
  schema.prisma, seed.ts, migrations/
proxy.ts                      Route guard (Next 16 renamed middleware → proxy)
```

## How authorisation works

Three layers, deliberately redundant:

1. **`proxy.ts`** — optimistic redirect. Unauthenticated visitors going
   anywhere but `/`, `/sign-in`, `/sign-up` are bounced to sign-in;
   non-admins are bounced off `/admin/*`.
2. **`requireUser()` / `requireAdmin()`** — every route handler re-reads the
   session and re-checks the user's status against the database, so a disabled
   account loses access immediately rather than at cookie expiry.
3. **`requireMembership(groupId, userId)`** — group and task queries are always
   scoped to `group.members.some({ userId })`, so tasks in groups you don't
   belong to are invisible rather than merely forbidden.

Within a group: the task **creator** can re-scope a task (title, description,
assignee, priority, due date); the **assignee** can report progress (status,
progress, checklist). Both can comment. Group **owners** additionally manage
membership and can delete the group.

## Notes

- **Attachments** are stored as metadata only (`name`, `url`, `sizeBytes`,
  `mimeType`). Wire up S3/UploadThing/Vercel Blob in
  `components/tasks/assign-task-modal.tsx` (`onFilesPicked`) and swap the
  placeholder `url`.
- **`generated/`** is gitignored — `prisma generate` recreates the client on
  install and build.
- Next.js 16 renamed `middleware.ts` to `proxy.ts` and made `cookies()`,
  `headers()`, `params` and `searchParams` async-only.
