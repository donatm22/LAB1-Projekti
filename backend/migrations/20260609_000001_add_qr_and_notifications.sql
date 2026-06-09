ALTER TABLE "Registrations"
  ADD COLUMN IF NOT EXISTS "qr_token" TEXT,
  ADD COLUMN IF NOT EXISTS "qr_data" TEXT,
  ADD COLUMN IF NOT EXISTS "qr_verified_at" TIMESTAMP WITHOUT TIME ZONE;

CREATE UNIQUE INDEX IF NOT EXISTS "Registrations_qr_token_key"
  ON "Registrations"("qr_token")
  WHERE "qr_token" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "Notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT DEFAULT 'info',
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_notifications_user_read"
  ON "Notifications"("user_id", "is_read");

CREATE INDEX IF NOT EXISTS "idx_notifications_created_at"
  ON "Notifications"("created_at");
