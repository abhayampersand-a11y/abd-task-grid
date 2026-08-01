import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import type {
  ActivityType,
  NotificationType,
  TaskPriority,
  TaskStatus,
} from "../generated/prisma/enums";

for (const file of [".env.local", ".env"]) {
  const full = path.join(process.cwd(), file);
  if (fs.existsSync(full)) process.loadEnvFile(full);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const DEMO_PASSWORD = "Password@123";

/** Deterministic PRNG so every re-seed produces the same demo workspace. */
function makeRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}
const random = makeRandom(20260801);

const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(random() * items.length)];

const between = (min: number, max: number) =>
  min + Math.floor(random() * (max - min + 1));

/** Days from now, normalised to 17:00 local. */
function days(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  date.setHours(17, 0, 0, 0);
  return date;
}

/** Minutes ago, for staggering activity feeds. */
function minutesAgo(offset: number) {
  return new Date(Date.now() - offset * 60_000);
}

// ── People ─────────────────────────────────────────────────────────────────

interface Person {
  fullName: string;
  email: string;
  jobTitle: string;
  bio?: string;
}

const PEOPLE: Person[] = [
  {
    fullName: "Alex Rivera",
    email: "alex@acme.co",
    jobTitle: "Product Manager",
    bio: "Focusing on streamlining enterprise workflows and improving team collaboration efficiency across the EMEA region.",
  },
  {
    fullName: "Sarah Jenkins",
    email: "sarah.j@acme.co",
    jobTitle: "Design Lead",
    bio: "Design systems, accessibility and the occasional strong opinion about spacing scales.",
  },
  {
    fullName: "Marcus Thorne",
    email: "m.thorne@acme.co",
    jobTitle: "Product Manager",
    bio: "Roadmaps, stakeholder wrangling, and shipping on time.",
  },
  {
    fullName: "Elena Rodriguez",
    email: "elena.rod@acme.co",
    jobTitle: "Sr. Developer",
    bio: "Backend infrastructure and database performance.",
  },
  {
    fullName: "Julian Voss",
    email: "jvoss@acme.co",
    jobTitle: "UX Researcher",
    bio: "Talks to users so we do not have to guess.",
  },
  {
    fullName: "Tariq Mahmood",
    email: "t.mahmood@acme.co",
    jobTitle: "QA Engineer",
    bio: "If it can break, it will — and I will find it first.",
  },
  {
    fullName: "David Chen",
    email: "d.chen@acme.co",
    jobTitle: "Frontend Developer",
    bio: "Component libraries and pixel accuracy.",
  },
  {
    fullName: "Sophie Laurent",
    email: "s.laurent@acme.co",
    jobTitle: "Marketing Manager",
    bio: "Campaigns, positioning and launch coordination.",
  },
  { fullName: "Priya Nair", email: "p.nair@acme.co", jobTitle: "Staff Engineer" },
  { fullName: "Tom Okafor", email: "t.okafor@acme.co", jobTitle: "DevOps Engineer" },
  { fullName: "Hannah Weiss", email: "h.weiss@acme.co", jobTitle: "Product Designer" },
  { fullName: "Diego Marín", email: "d.marin@acme.co", jobTitle: "Data Analyst" },
  { fullName: "Grace Lam", email: "g.lam@acme.co", jobTitle: "Engineering Manager" },
  { fullName: "Noah Bergström", email: "n.bergstrom@acme.co", jobTitle: "Backend Developer" },
  { fullName: "Amara Diallo", email: "a.diallo@acme.co", jobTitle: "Content Strategist" },
  { fullName: "Kenji Watanabe", email: "k.watanabe@acme.co", jobTitle: "Mobile Developer" },
  { fullName: "Isabel Ferreira", email: "i.ferreira@acme.co", jobTitle: "Brand Designer" },
  { fullName: "Omar Haddad", email: "o.haddad@acme.co", jobTitle: "Security Engineer" },
  { fullName: "Lena Kowalski", email: "l.kowalski@acme.co", jobTitle: "Scrum Master" },
  { fullName: "Ravi Deshpande", email: "r.deshpande@acme.co", jobTitle: "Solutions Architect" },
  { fullName: "Chloe Dubois", email: "c.dubois@acme.co", jobTitle: "Growth Marketer" },
  { fullName: "Samuel Adeyemi", email: "s.adeyemi@acme.co", jobTitle: "Platform Engineer" },
  { fullName: "Mei Ling Tan", email: "m.tan@acme.co", jobTitle: "Product Designer" },
  { fullName: "Jonas Richter", email: "j.richter@acme.co", jobTitle: "Finance Partner" },
  { fullName: "Aisha Rahman", email: "a.rahman@acme.co", jobTitle: "People Operations" },
  { fullName: "Lucas Moreau", email: "l.moreau@acme.co", jobTitle: "Support Lead" },
  { fullName: "Zara Iqbal", email: "z.iqbal@acme.co", jobTitle: "Technical Writer" },
  { fullName: "Andrei Popescu", email: "a.popescu@acme.co", jobTitle: "SRE" },
  { fullName: "Fiona Gallagher", email: "f.gallagher@acme.co", jobTitle: "Legal Counsel" },
  { fullName: "Yusuf Demir", email: "y.demir@acme.co", jobTitle: "Sales Engineer" },
];

/** A couple of pending/disabled accounts so the admin table shows every state. */
const PENDING_INDEXES = new Set([5, 18, 26]);
const DISABLED_INDEXES = new Set([6, 22]);

function mobileFor(index: number) {
  const block = String(120 + index * 7).padStart(3, "0");
  const line = String(1000 + index * 137).slice(-4);
  return `+1 (555) ${block}-${line}`;
}

// ── Groups ─────────────────────────────────────────────────────────────────

interface GroupSpec {
  name: string;
  description: string;
  visibility: "PUBLIC" | "PRIVATE";
  colorKey: string;
  ownerIndex: number;
  memberIndexes: number[];
  titles: string[];
}

const GROUPS: GroupSpec[] = [
  {
    name: "Product Design Squad",
    description:
      "Coordinating all UI/UX initiatives, design system updates, and cross-functional user research projects for the Q4 roadmap.",
    visibility: "PUBLIC",
    colorKey: "indigo",
    ownerIndex: 0,
    memberIndexes: [0, 1, 4, 6, 2, 10, 16, 22, 26, 12, 18, 5],
    titles: [
      "Finalize V2 Design System tokens",
      "Stakeholder Sync: Dashboard UI",
      "Icon Library Migration",
      "Quarterly Design Audit",
      "User Interview Summary",
      "Implement multi-layer tonal elevation system",
      "Redesign the empty-state illustrations",
      "Accessibility pass on all form controls",
      "Motion guidelines for page transitions",
      "Dark mode colour ramp exploration",
      "Component API naming conventions",
      "Mobile navigation prototype",
      "Design QA for the release candidate",
      "Consolidate the spacing scale",
    ],
  },
  {
    name: "Backend Infrastructure",
    description:
      "Database scaling, API optimization, and security protocols for the enterprise tier.",
    visibility: "PRIVATE",
    colorKey: "emerald",
    ownerIndex: 3,
    memberIndexes: [3, 0, 5, 8, 9, 13, 17, 21, 27],
    titles: [
      "Partition the activity log table",
      "Rotate API signing keys",
      "Add read replicas for reporting queries",
      "Migrate background jobs to the new queue",
      "Rate limit the public search endpoint",
      "Audit N+1 queries in the task list",
      "Introduce connection pooling metrics",
      "Backfill missing created_at timestamps",
      "Harden webhook signature verification",
      "Cache group membership lookups",
      "Upgrade the Postgres driver",
      "Write the failover drill runbook",
    ],
  },
  {
    name: "Q2 Marketing Strategy",
    description:
      "Coordination for social media, PPC, and event sponsorships for the upcoming product launch.",
    visibility: "PUBLIC",
    colorKey: "amber",
    ownerIndex: 7,
    memberIndexes: [7, 0, 2, 11, 14, 16, 20, 23, 25, 26, 29, 24, 19, 4],
    titles: [
      "Launch webinar landing page",
      "Q2 paid channel budget split",
      "Refresh the customer case study library",
      "Conference booth logistics",
      "Email nurture sequence rewrite",
      "Competitive positioning one-pager",
      "Partner co-marketing agreement",
      "SEO audit for the docs site",
      "Launch-day social calendar",
      "Analyst briefing deck",
      "Pricing page A/B test",
      "Customer testimonial video",
      "Community AMA scheduling",
    ],
  },
  {
    name: "Executive Board",
    description:
      "High-level decision making and strategic planning for annual company goals.",
    visibility: "PRIVATE",
    colorKey: "rose",
    ownerIndex: 2,
    memberIndexes: [2, 0, 12, 23, 24, 28],
    titles: [
      "Approve the FY27 hiring plan",
      "Board deck for the Q3 review",
      "Annual security posture summary",
      "Vendor consolidation proposal",
      "Compensation banding review",
      "Office lease renewal decision",
      "Product strategy offsite agenda",
      "Quarterly OKR calibration",
      "Insurance renewal sign-off",
    ],
  },
];

// ── Content pools ──────────────────────────────────────────────────────────

const DESCRIPTIONS = [
  "Pull the current numbers together, agree the approach with the group, and write up the decision so nobody has to re-litigate it later.",
  "This has been sitting in the backlog for two cycles. Scope it down to something shippable this sprint and park the rest.",
  "Blocked on input from the wider team — chase the outstanding answers, then push it over the line.",
  "Straightforward once the prerequisites land. Keep the change small and reversible.",
  "Needs a written summary at the end so the rest of the group can pick it up without a handover call.",
  "Check this against the spec before starting; the requirements changed after the last review.",
];

const CHECKLIST_POOL = [
  "Gather the requirements",
  "Draft the approach",
  "Review with the group",
  "Implement the change",
  "Write the tests",
  "Update the documentation",
  "Ship to staging",
  "Confirm with stakeholders",
];

const COMMENTS = [
  "Picked this up this morning — should have something to show by Thursday.",
  "Blocked on the API change landing first. Moving it to next week unless that ships.",
  "Nice work on this. One small note: can we keep the naming consistent with the rest of the module?",
  "I've added the notes to the shared doc, linked in the description.",
  "This is bigger than we scoped. Suggest splitting the second half into its own task.",
  "Confirmed with the wider group — we're good to proceed as written.",
  "Reopened: the edge case with empty input still throws.",
  "Latest revision is up. Ready for another look whenever you have a moment.",
];

const ATTACHMENTS = [
  { name: "Elevation_Specs_v2.pdf", mimeType: "application/pdf", sizeBytes: 2_516_582 },
  { name: "dashboard-mockup-final.png", mimeType: "image/png", sizeBytes: 4_299_161 },
  { name: "Q3_metrics.xlsx", mimeType: "application/vnd.ms-excel", sizeBytes: 812_004 },
  { name: "architecture-diagram.svg", mimeType: "image/svg+xml", sizeBytes: 148_220 },
  { name: "research-notes.docx", mimeType: "application/msword", sizeBytes: 331_776 },
  { name: "launch-checklist.pdf", mimeType: "application/pdf", sizeBytes: 604_112 },
];

const STATUS_WEIGHTS: TaskStatus[] = [
  "BACKLOG",
  "BACKLOG",
  "TODO",
  "TODO",
  "TODO",
  "IN_PROGRESS",
  "IN_PROGRESS",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
  "COMPLETED",
  "COMPLETED",
];

const PRIORITY_WEIGHTS: TaskPriority[] = [
  "LOW",
  "LOW",
  "MEDIUM",
  "MEDIUM",
  "MEDIUM",
  "MEDIUM",
  "HIGH",
  "HIGH",
  "HIGH",
  "URGENT",
];

function progressFor(status: TaskStatus) {
  switch (status) {
    case "BACKLOG":
      return 0;
    case "TODO":
      return between(0, 20);
    case "IN_PROGRESS":
      return between(30, 70);
    case "IN_REVIEW":
      return between(75, 95);
    case "COMPLETED":
      return 100;
  }
}

// ── Seed ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("→ Clearing existing data…");
  await db.notification.deleteMany();
  await db.activity.deleteMany();
  await db.taskComment.deleteMany();
  await db.taskAttachment.deleteMany();
  await db.checklistItem.deleteMany();
  await db.task.deleteMany();
  await db.groupMember.deleteMany();
  await db.group.deleteMany();
  await db.user.deleteMany();

  // One hash for every demo account keeps the seed fast (bcrypt is deliberately slow).
  const demoHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const adminHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD ?? "Admin@12345",
    10,
  );

  console.log("→ Creating the administrator…");
  const adminEmail = (process.env.ADMIN_EMAIL ?? "admin@taskflow.pro").toLowerCase();
  await db.user.create({
    data: {
      id: randomUUID(),
      fullName: "TaskFlow Administrator",
      email: adminEmail,
      mobile: process.env.ADMIN_MOBILE ?? "+1 (555) 000-0001",
      passwordHash: adminHash,
      jobTitle: "Super Admin",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`→ Creating ${PEOPLE.length} members…`);
  // Ids are generated up front so related rows can go in via `createMany`.
  // Widened to `string` — randomUUID()'s template-literal type is too narrow
  // to match the plain `string` columns it ends up in.
  const userIds: string[] = PEOPLE.map(() => randomUUID());

  await db.user.createMany({
    data: PEOPLE.map((person, index) => ({
      id: userIds[index],
      fullName: person.fullName,
      email: person.email,
      mobile: mobileFor(index),
      passwordHash: demoHash,
      jobTitle: person.jobTitle,
      bio: person.bio ?? null,
      status: PENDING_INDEXES.has(index)
        ? ("PENDING" as const)
        : DISABLED_INDEXES.has(index)
          ? ("DISABLED" as const)
          : ("ACTIVE" as const),
      // Stagger registrations across the last ~5 months.
      createdAt: days(-(index * 5 + between(0, 4))),
    })),
  });

  console.log(`→ Creating ${GROUPS.length} groups…`);
  const groupIds: string[] = GROUPS.map(() => randomUUID());

  for (const [index, spec] of GROUPS.entries()) {
    await db.group.create({
      data: {
        id: groupIds[index],
        name: spec.name,
        description: spec.description,
        visibility: spec.visibility,
        colorKey: spec.colorKey,
        createdById: userIds[spec.ownerIndex],
        createdAt: days(-(180 - index * 35)),
        members: {
          create: spec.memberIndexes.map((memberIndex) => ({
            userId: userIds[memberIndex],
            role: memberIndex === spec.ownerIndex ? "OWNER" : "MEMBER",
          })),
        },
      },
    });
  }

  console.log("→ Creating tasks…");
  const taskRows: {
    id: string;
    groupId: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    progress: number;
    dueDate: Date | null;
    completedAt: Date | null;
    createdById: string;
    assigneeId: string;
    createdAt: Date;
  }[] = [];

  for (const [groupIndex, spec] of GROUPS.entries()) {
    for (const title of spec.titles) {
      const members = spec.memberIndexes;
      const assigneeIndex = pick(members);
      let creatorIndex = pick(members);
      // A task assigned by you to yourself is a note, not delegation.
      if (creatorIndex === assigneeIndex) {
        creatorIndex = members[(members.indexOf(assigneeIndex) + 1) % members.length];
      }

      const status = pick(STATUS_WEIGHTS);
      const createdAt = minutesAgo(between(60, 60 * 24 * 45));

      taskRows.push({
        id: randomUUID(),
        groupId: groupIds[groupIndex],
        title,
        description: pick(DESCRIPTIONS),
        priority: pick(PRIORITY_WEIGHTS),
        status,
        progress: progressFor(status),
        // A fifth of tasks deliberately have no deadline.
        dueDate: random() < 0.2 ? null : days(between(-12, 30)),
        completedAt: status === "COMPLETED" ? minutesAgo(between(60, 4320)) : null,
        createdById: userIds[creatorIndex],
        assigneeId: userIds[assigneeIndex],
        createdAt,
      });
    }
  }

  /**
   * Spotlight pass — with 30 people sharing 48 tasks, uniform assignment leaves
   * the demo account with almost nothing and every dashboard widget reading
   * zero. Reserve a designed slice for Alex so each stat card, filter and tab
   * has something real behind it.
   */
  const ALEX = userIds[0];
  const spotlight: {
    status: TaskStatus;
    dueOffset: number | null;
    priority?: TaskPriority;
  }[] = [
    { status: "BACKLOG", dueOffset: null },
    { status: "TODO", dueOffset: 9 },
    { status: "TODO", dueOffset: 21, priority: "LOW" },
    { status: "TODO", dueOffset: 0, priority: "URGENT" }, // due today
    { status: "IN_PROGRESS", dueOffset: 3, priority: "HIGH" },
    { status: "IN_PROGRESS", dueOffset: -4, priority: "URGENT" }, // overdue
    { status: "IN_PROGRESS", dueOffset: 6 },
    { status: "IN_REVIEW", dueOffset: -2, priority: "HIGH" }, // overdue
    { status: "IN_REVIEW", dueOffset: 5 },
    { status: "COMPLETED", dueOffset: -9 },
    { status: "COMPLETED", dueOffset: -6, priority: "HIGH" },
    { status: "COMPLETED", dueOffset: -3 },
    { status: "COMPLETED", dueOffset: -15, priority: "LOW" },
  ];

  // Spread them over the groups Alex belongs to, skipping tasks he created.
  const alexGroupIds = GROUPS.filter((spec) =>
    spec.memberIndexes.includes(0),
  ).map((spec) => groupIds[GROUPS.indexOf(spec)]);

  const candidates = taskRows.filter(
    (task) => alexGroupIds.includes(task.groupId) && task.createdById !== ALEX,
  );

  spotlight.forEach((plan, index) => {
    // Stride through the pool so the slice spans all four groups.
    const task = candidates[(index * 3 + 1) % candidates.length];
    if (!task || task.assigneeId === ALEX) return;

    task.assigneeId = ALEX;
    task.status = plan.status;
    task.progress = progressFor(plan.status);
    task.dueDate = plan.dueOffset === null ? null : days(plan.dueOffset);
    task.completedAt =
      plan.status === "COMPLETED" ? minutesAgo(between(60, 4320)) : null;
    if (plan.priority) task.priority = plan.priority;
  });

  // …and a handful he assigned to other people, for the second tab.
  taskRows
    .filter((task) => alexGroupIds.includes(task.groupId))
    .filter((task) => task.assigneeId !== ALEX && task.createdById !== ALEX)
    .slice(0, 9)
    .forEach((task) => {
      task.createdById = ALEX;
    });

  await db.task.createMany({ data: taskRows });

  console.log("→ Adding checklists, comments, attachments…");
  const checklistRows: {
    taskId: string;
    label: string;
    done: boolean;
    position: number;
  }[] = [];
  const commentRows: {
    taskId: string;
    authorId: string;
    body: string;
    createdAt: Date;
  }[] = [];
  const attachmentRows: {
    taskId: string;
    name: string;
    url: string;
    sizeBytes: number;
    mimeType: string;
    uploadedById: string;
  }[] = [];
  const activityRows: {
    type: ActivityType;
    message: string;
    actorId: string;
    taskId: string;
    groupId: string;
    createdAt: Date;
  }[] = [];
  const notificationRows: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link: string;
    read: boolean;
    createdAt: Date;
  }[] = [];

  const nameById = new Map(
    userIds.map((id, index) => [id, PEOPLE[index].fullName]),
  );

  for (const task of taskRows) {
    const group = GROUPS[groupIds.indexOf(task.groupId)];
    const memberIds = group.memberIndexes.map((index) => userIds[index]);

    // Checklist on roughly two thirds of tasks, matching the task's progress.
    if (random() < 0.65) {
      const size = between(2, 5);
      const labels = [...CHECKLIST_POOL]
        .sort(() => random() - 0.5)
        .slice(0, size);
      const doneCount = Math.round((task.progress / 100) * size);

      labels.forEach((label, position) => {
        checklistRows.push({
          taskId: task.id,
          label,
          done: position < doneCount,
          position,
        });
      });
    }

    activityRows.push({
      type: "TASK_CREATED",
      message: `${nameById.get(task.createdById)} created this task`,
      actorId: task.createdById,
      taskId: task.id,
      groupId: task.groupId,
      createdAt: task.createdAt,
    });

    if (task.status !== "TODO" && task.status !== "BACKLOG") {
      activityRows.push({
        type: "STATUS_CHANGED",
        message: `Moved to ${task.status.replace("_", " ").toLowerCase()}`,
        actorId: task.assigneeId,
        taskId: task.id,
        groupId: task.groupId,
        createdAt: minutesAgo(between(30, 2880)),
      });
    }

    // Comments on about half of the tasks.
    if (random() < 0.5) {
      const count = between(1, 3);
      for (let i = 0; i < count; i += 1) {
        const authorId = pick(memberIds);
        const createdAt = minutesAgo(between(15, 10080));

        commentRows.push({
          taskId: task.id,
          authorId,
          body: pick(COMMENTS),
          createdAt,
        });
        activityRows.push({
          type: "COMMENT_ADDED",
          message: `${nameById.get(authorId)} commented`,
          actorId: authorId,
          taskId: task.id,
          groupId: task.groupId,
          createdAt,
        });

        // Notify the other side of the task about the comment.
        const recipient =
          authorId === task.assigneeId ? task.createdById : task.assigneeId;
        if (random() < 0.5) {
          notificationRows.push({
            userId: recipient,
            type: "NEW_COMMENT",
            title: "New comment",
            body: `${nameById.get(authorId)} commented on "${task.title}".`,
            link: `/tasks/${task.id}`,
            read: random() < 0.6,
            createdAt,
          });
        }
      }
    }

    // Attachments on a quarter of tasks.
    if (random() < 0.25) {
      const file = pick(ATTACHMENTS);
      const uploadedById = pick(memberIds);

      attachmentRows.push({
        taskId: task.id,
        name: file.name,
        url: "#",
        sizeBytes: file.sizeBytes,
        mimeType: file.mimeType,
        uploadedById,
      });
      activityRows.push({
        type: "ATTACHMENT_ADDED",
        message: `${nameById.get(uploadedById)} attached ${file.name}`,
        actorId: uploadedById,
        taskId: task.id,
        groupId: task.groupId,
        createdAt: minutesAgo(between(30, 7200)),
      });
    }

    notificationRows.push({
      userId: task.assigneeId,
      type: task.status === "COMPLETED" ? "TASK_COMPLETED" : "TASK_ASSIGNED",
      title:
        task.status === "COMPLETED" ? "Task completed" : "New task assigned",
      body:
        task.status === "COMPLETED"
          ? `"${task.title}" was marked complete.`
          : `${nameById.get(task.createdById)} assigned you "${task.title}".`,
      link: `/tasks/${task.id}`,
      read: random() < 0.65,
      createdAt: task.createdAt,
    });
  }

  await db.checklistItem.createMany({ data: checklistRows });
  await db.taskComment.createMany({ data: commentRows });
  await db.taskAttachment.createMany({ data: attachmentRows });
  await db.activity.createMany({ data: activityRows });
  await db.notification.createMany({ data: notificationRows });

  console.log("\n✔ Seed complete.\n");
  console.log(`  ${PEOPLE.length} members + 1 administrator`);
  console.log(`  ${GROUPS.length} groups`);
  console.log(`  ${taskRows.length} tasks`);
  console.log(`  ${checklistRows.length} checklist items`);
  console.log(`  ${commentRows.length} comments`);
  console.log(`  ${attachmentRows.length} attachments`);
  console.log(`  ${activityRows.length} activity entries`);
  console.log(`  ${notificationRows.length} notifications\n`);
  console.log("  Admin  ", adminEmail, "/", process.env.ADMIN_PASSWORD ?? "Admin@12345");
  console.log("  Demo   ", PEOPLE[0].email, "/", DEMO_PASSWORD);
  console.log("  (every seeded member uses the same demo password)\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
