-- Uploaded picture for a group, mirroring User.avatarUrl/avatarKey: the URL is
-- what clients render, the key is what lets us delete the previous file when
-- the icon is replaced or cleared. Null on every existing group, which keeps
-- showing the colour chip and the first letter of its name.
ALTER TABLE "Group" ADD COLUMN "iconUrl" TEXT;
ALTER TABLE "Group" ADD COLUMN "iconKey" TEXT;
