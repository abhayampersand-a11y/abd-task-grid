# Mobile conversion spec

The goal is that TaskFlow Pro **feels like a native app on a phone** while
staying the same product on desktop.

## Hard constraints

1. **No functional change.** No API route, Prisma query, Redux slice shape,
   validation rule or permission check may change behaviour. Every button does
   exactly what it does today. If a change requires touching an endpoint, it is
   out of scope.
2. **No palette change.** The indigo brand tokens, `card` styling, radii and
   shadows stay exactly as they are. This is layout, navigation and interaction
   only.
3. **Desktop must not regress.** Everything at `lg` and above keeps its current
   sidebar, tables, multi-column layouts and hover affordances.
4. Breakpoint boundary is Tailwind's **`lg` (1024px)**. Below it is "app mode",
   at and above it is "desktop mode".

---

## 1. Navigation model

**Today (responsive web):** an off-canvas sidebar behind a hamburger, plus a top
bar with search, help, bell, settings and avatar crammed together.

**Target (app):**

- **Bottom tab bar**, fixed, safe-area aware, always visible below `lg`.
  - Member tabs: Home, Groups, Alerts, Profile
  - Admin tabs: Home, Users, Profile
  - Active tab: filled indigo pill with icon + label. Inactive: muted icon.
  - Alerts carries the unread count badge.
  - The hamburger and off-canvas sidebar are **removed** below `lg` — the tab
    bar replaces them entirely.
- **Contextual top bar**, sticky:
  - On a tab root (`/dashboard`, `/groups`, `/notifications`, `/profile`,
    `/admin`): brand row — logo left, bell + avatar right.
  - On a detail route (`/groups/[id]`, `/tasks/[id]`): back arrow + the record's
    title, truncated to one line, with the primary action on the right.
  - The header shrinks its title on scroll only if it can be done with CSS; no
    scroll listeners.
- **Floating action button** bottom-right, clear of the tab bar, on screens with
  one obvious create action (dashboard → create task, groups → create group,
  group detail → assign task). It duplicates an existing button; it never
  introduces a new capability.

## 2. Surfaces

- **Modals become bottom sheets** below `lg`: full width, rounded top corners
  only, slide up from the bottom, drag-handle affordance at the top, backdrop
  dismiss, body scroll locked. At `lg` and above they stay centred dialogs.
- **Sheet footers are sticky** so the primary action is always reachable without
  scrolling to the end of a long form.
- **Dropdown menus become action sheets** below `lg` — anchored popovers are
  fiddly at thumb size. Same items, same handlers.
- **Confirm dialogs** follow the same sheet treatment.

## 3. Lists and tables

- Any `<table>` gets a **stacked-card equivalent** below `lg`. Never a
  horizontally scrolling table as the primary mobile view. Applies to the
  dashboard task table and the admin user table.
- Card rows show: primary label, secondary meta, status/priority chips, the
  person, the date, and progress — in that visual priority.
- Row actions move from a hover-revealed icon row into either the card body or
  an action sheet on the row's overflow button.

## 4. Tabs and filters

- Underlined tabs become a **segmented control**: a pill container with a filled
  active segment, full width, comfortable to tap.
- Filter controls collapse into a **single "Filter" button** that opens a sheet
  containing the same controls stacked full-width, with a count badge showing
  how many filters are active and a "Clear all" action.
- Search stays inline as a full-width pill above the list.
- All of this drives the **same Redux state** the desktop controls use — one
  source of truth, no duplicate filter logic.

## 5. Touch and platform behaviour

- **Minimum 44×44px** hit area for every interactive element.
- **No hover-only affordances.** Anything currently revealed on `:hover` must be
  permanently visible or moved into a menu below `lg`.
- `-webkit-tap-highlight-color: transparent` plus an explicit `:active` state
  (scale or background) so taps feel acknowledged.
- `overscroll-behavior-y: contain` on scrollable panels so a sheet doesn't drag
  the page behind it.
- **Safe-area insets** honoured top and bottom (`env(safe-area-inset-*)`),
  with `viewport-fit=cover`.
- `touch-action: manipulation` to kill the 300ms double-tap delay.
- Inputs use a **16px minimum font size** so iOS Safari does not zoom on focus.
- Text inputs get correct `inputMode` / `autoComplete` so the right keyboard
  appears (email, tel, numeric).
- Momentum scrolling on horizontal strips, with scroll-snap where it reads as a
  carousel (attachment thumbnails).

## 6. Layout rhythm

- Page gutter: `16px` on phones, `24px` at `sm`, `32px` at `lg`.
- Content bottom padding must clear the tab bar and the home indicator.
- Single column below `sm`; two columns at `sm`; existing desktop grids from
  `lg`.
- Headline sizes step down one notch on phones.

---

## Screen-by-screen

| Screen | Mobile treatment |
| --- | --- |
| **Dashboard** (`/dashboard`) | Greeting header. Stat tiles 2-up, horizontally scrollable if they overflow. Task table → stacked cards. Filters → sheet. FAB creates a task. |
| **Dashboard (no groups)** | Centred empty state, illustration scaled down, both CTAs full-width and stacked. |
| **Groups** (`/groups`) | Progress banner full-width, group cards single column, FAB creates a group. |
| **Group detail** (`/groups/[id]`) | Back header with group name. Stats as a compact tile row. Tabs → segmented control. Filters → sheet. Task cards single column. FAB assigns a task. |
| **Task detail** (`/tasks/[id]`) | Back header. Status as a full-width control. Description, checklist, attachments (horizontal snap strip), activity, then comments. Comment composer pinned above the tab bar. Destructive actions inside the overflow sheet. |
| **Notifications** | Full-bleed list, generous rows, swipe not required — dismiss stays an explicit button. |
| **Profile** | Avatar block, then section nav as a segmented control or stacked list; forms single column, sticky save. |
| **Admin overview** | Stat cards 2-up, single column below `sm`. |
| **Admin users** | Table → user cards with inline enable/disable and delete. Pagination stays. |
| **Auth + landing** | Already single-column; verify tap targets, keyboard types and that the CTA is reachable above the fold. |

---

## Out of scope

- Any change to colours, brand or typeface.
- PWA install, service worker, offline support, push notifications.
- Gesture navigation (swipe-back, swipe-to-delete).
- Native wrappers (Capacitor / React Native).
- Route or data-model changes.

## Definition of done

- `tsc`, `eslint` and `next build` all pass.
- Every API endpoint returns what it returned before, verified against the live
  database.
- No horizontal page scroll at 360px, 390px and 430px wide.
- Desktop at `lg`+ is visually unchanged from before this work.
