-- Indexes shaped after the queries the app actually runs, so read time stays
-- flat as the tables grow. Nothing here touches a column or a row: the
-- migration only drops indexes that a wider one now covers and adds the wider
-- ones, plus the pg_trgm extension the ILIKE '%…%' searches need.
--
-- Against a large, already-live table, run these by hand as
-- CREATE INDEX CONCURRENTLY instead — Prisma runs a migration inside one
-- transaction, which CONCURRENTLY cannot join, so this file would hold a write
-- lock for as long as the build takes.

-- Trigram support for `contains` searches (User.fullName/email, Group.name,
-- Task.title). Without it every such search is a sequential scan.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- DropIndex — each of these is the leading column of a composite added below,
-- so Postgres can still use the new index for the old lookup. Keeping both
-- would only cost write throughput.
DROP INDEX IF EXISTS "User_role_idx";
DROP INDEX IF EXISTS "User_status_idx";
DROP INDEX IF EXISTS "User_createdAt_idx";
DROP INDEX IF EXISTS "GroupMember_userId_idx";
DROP INDEX IF EXISTS "Task_groupId_idx";
DROP INDEX IF EXISTS "Task_assigneeId_idx";
DROP INDEX IF EXISTS "Task_createdById_idx";
DROP INDEX IF EXISTS "TaskComment_taskId_idx";
DROP INDEX IF EXISTS "TaskAttachment_taskId_idx";
DROP INDEX IF EXISTS "ChecklistItem_taskId_idx";
DROP INDEX IF EXISTS "Activity_taskId_idx";
DROP INDEX IF EXISTS "Activity_groupId_idx";
DROP INDEX IF EXISTS "Activity_createdAt_idx";
DROP INDEX IF EXISTS "Notification_createdAt_idx";

-- CreateIndex
CREATE INDEX "User_role_status_fullName_idx" ON "User"("role", "status", "fullName");
CREATE INDEX "User_role_createdAt_idx" ON "User"("role", "createdAt" DESC);
CREATE INDEX "User_fullName_idx" ON "User" USING GIN ("fullName" gin_trgm_ops);
CREATE INDEX "User_email_idx" ON "User" USING GIN ("email" gin_trgm_ops);
CREATE INDEX "User_jobTitle_idx" ON "User" USING GIN ("jobTitle" gin_trgm_ops);
CREATE INDEX "User_mobile_idx" ON "User" USING GIN ("mobile" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Group_name_idx" ON "Group" USING GIN ("name" gin_trgm_ops);
CREATE INDEX "Group_description_idx" ON "Group" USING GIN ("description" gin_trgm_ops);

-- CreateIndex — covers `members: { some: { userId } }`, the semi-join every
-- scoped query runs. Both columns are in the index, so it never reads the table.
CREATE INDEX "GroupMember_userId_groupId_idx" ON "GroupMember"("userId", "groupId");

-- CreateIndex
CREATE INDEX "Task_assigneeId_status_idx" ON "Task"("assigneeId", "status");
CREATE INDEX "Task_assigneeId_dueDate_idx" ON "Task"("assigneeId", "dueDate");
CREATE INDEX "Task_assigneeId_createdAt_idx" ON "Task"("assigneeId", "createdAt" DESC);
CREATE INDEX "Task_groupId_status_idx" ON "Task"("groupId", "status");
CREATE INDEX "Task_groupId_createdAt_idx" ON "Task"("groupId", "createdAt" DESC);
CREATE INDEX "Task_createdById_createdAt_idx" ON "Task"("createdById", "createdAt" DESC);
-- Both halves of a search OR need their own index; leaving one out sends the
-- whole condition back to a sequential scan.
CREATE INDEX "Task_title_idx" ON "Task" USING GIN ("title" gin_trgm_ops);
CREATE INDEX "Task_description_idx" ON "Task" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "TaskComment_taskId_createdAt_idx" ON "TaskComment"("taskId", "createdAt");
CREATE INDEX "TaskAttachment_taskId_createdAt_idx" ON "TaskAttachment"("taskId", "createdAt");
CREATE INDEX "ChecklistItem_taskId_position_idx" ON "ChecklistItem"("taskId", "position");

-- CreateIndex
CREATE INDEX "Activity_taskId_createdAt_idx" ON "Activity"("taskId", "createdAt" DESC);
CREATE INDEX "Activity_groupId_createdAt_idx" ON "Activity"("groupId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt" DESC);
