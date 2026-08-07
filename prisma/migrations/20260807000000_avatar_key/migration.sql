-- Object key behind User.avatarUrl when the picture lives in our R2 bucket,
-- so replacing or clearing an avatar can delete the file it used to point at.
-- Null for provider-supplied and hand-pasted URLs, which we never delete.
ALTER TABLE "User" ADD COLUMN "avatarKey" TEXT;
