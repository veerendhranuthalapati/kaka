-- Email lowercase conflict check (stop with ids if duplicates would merge)
DO $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO conflict_count
  FROM (
    SELECT lower(trim(email)) AS norm, array_agg(id::text) AS ids
    FROM "User"
    GROUP BY lower(trim(email))
    HAVING COUNT(*) > 1
  ) d;
  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'EMAIL_LOWER_CONFLICT: % groups', conflict_count;
  END IF;
END $$;

UPDATE "User" SET email = lower(trim(email)) WHERE email <> lower(trim(email));

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_email_lowercase_check";
ALTER TABLE "User" ADD CONSTRAINT "User_email_lowercase_check" CHECK (email = lower(email));
