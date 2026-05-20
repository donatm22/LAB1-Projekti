CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "Users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "emri" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "roli" TEXT NOT NULL DEFAULT 'user' CHECK ("roli" IN ('user', 'admin', 'organizer', 'attendee')),
  "created_at" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Organizers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "emri_organizates" TEXT,
  "pershkrimi" TEXT,
  "email" TEXT,
  "telefoni" TEXT,
  "website" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "EventCategories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "emri" TEXT
);

CREATE TABLE IF NOT EXISTS "Venues" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "emri" TEXT,
  "adresa" TEXT,
  "qyteti" TEXT,
  "kapaciteti" BIGINT,
  "pershkrimi" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Sponsors" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "emertimi" TEXT,
  "logoja" TEXT,
  "website" TEXT,
  "niveli_sponsorizimit" TEXT
);

CREATE TABLE IF NOT EXISTS "Speakers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "emri" TEXT,
  "mbiemri" TEXT,
  "biografia" TEXT,
  "imazhi" TEXT,
  "email" TEXT
);

CREATE TABLE IF NOT EXISTS "Events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "titulli" TEXT,
  "pershkrimi" TEXT,
  "data_fillimit" TIMESTAMP WITHOUT TIME ZONE,
  "data_perfundimit" TIMESTAMP WITHOUT TIME ZONE,
  "lokacioni" TEXT,
  "kapaciteti" BIGINT,
  "statusi" TEXT,
  "organizer_id" UUID REFERENCES "Users"("id"),
  "category_id" UUID REFERENCES "EventCategories"("id"),
  "imazhi" TEXT,
  "venue_id" UUID REFERENCES "Venues"("id"),
  "organizer_entity_id" UUID REFERENCES "Organizers"("id")
);

CREATE TABLE IF NOT EXISTS "Tickets" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID REFERENCES "Events"("id"),
  "tipi" TEXT,
  "cmimi" NUMERIC,
  "sasia" BIGINT
);

CREATE TABLE IF NOT EXISTS "TicketTypes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID REFERENCES "Events"("id"),
  "emri_llojit" TEXT,
  "pershkrimi" TEXT,
  "cmimi" NUMERIC,
  "sasia_total" BIGINT,
  "sasia_mbetur" BIGINT,
  "statusi" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Registrations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID REFERENCES "Events"("id"),
  "user_id" UUID REFERENCES "Users"("id"),
  "ticket_id" UUID REFERENCES "Tickets"("id"),
  "data_regjistrimit" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  "statusi" TEXT,
  "reminder_sent" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "Payments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "registration_id" UUID REFERENCES "Registrations"("id"),
  "shuma" NUMERIC,
  "metoda" TEXT,
  "data" TIMESTAMP WITHOUT TIME ZONE,
  "statusi" TEXT
);

CREATE TABLE IF NOT EXISTS "Feedback" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID REFERENCES "Events"("id"),
  "user_id" UUID REFERENCES "Users"("id"),
  "vleresimi" BIGINT,
  "komenti" TEXT,
  "data" TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS "Attendance" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "registration_id" UUID REFERENCES "Registrations"("id"),
  "event_id" UUID REFERENCES "Events"("id"),
  "user_id" UUID REFERENCES "Users"("id"),
  "check_in_time" TIMESTAMP WITHOUT TIME ZONE,
  "check_out_time" TIMESTAMP WITHOUT TIME ZONE,
  "statusi_checkin" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "EventSchedules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID REFERENCES "Events"("id"),
  "titulli_eventit" TEXT,
  "pershkrimi" TEXT,
  "ora_fillimit" TIMESTAMP WITHOUT TIME ZONE,
  "ora_mbarimit" TIMESTAMP WITHOUT TIME ZONE,
  "salla" TEXT,
  "speaker_id" UUID REFERENCES "Speakers"("id"),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Event_Speakers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID REFERENCES "Events"("id"),
  "speaker_id" UUID REFERENCES "Speakers"("id"),
  "tema" TEXT,
  "ora" TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE IF NOT EXISTS "Event_Sponsors" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_id" UUID REFERENCES "Events"("id"),
  "sponsor_id" UUID REFERENCES "Sponsors"("id"),
  "shuma" NUMERIC
);

CREATE TABLE IF NOT EXISTS "RefreshTokens" (
  "id" SERIAL PRIMARY KEY,
  "user_id" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
  "token_jti" TEXT NOT NULL UNIQUE,
  "token_hash" TEXT NOT NULL UNIQUE,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "revoked_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON "RefreshTokens"("user_id");
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON "RefreshTokens"("expires_at");
