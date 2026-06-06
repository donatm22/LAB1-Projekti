-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'organizer', 'user');

-- CreateTable
CREATE TABLE "Users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "emri" TEXT,
    "email" TEXT,
    "password" TEXT,
    "roli" "user_role",
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "emri_organizates" TEXT,
    "pershkrimi" TEXT,
    "telefoni" TEXT,
    "website" TEXT,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "titulli" TEXT,
    "pershkrimi" TEXT,
    "data_fillimit" TIMESTAMP(6),
    "data_perfundimit" TIMESTAMP(6),
    "lokacioni" TEXT,
    "kapaciteti" BIGINT,
    "statusi" TEXT,
    "organizer_id" UUID DEFAULT gen_random_uuid(),
    "category_id" UUID DEFAULT gen_random_uuid(),
    "imazhi" TEXT,
    "venue_id" UUID,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "registration_id" UUID DEFAULT gen_random_uuid(),
    "event_id" UUID DEFAULT gen_random_uuid(),
    "user_id" UUID DEFAULT gen_random_uuid(),
    "check_in_time" TIMESTAMP(6),
    "check_out_time" TIMESTAMP(6),
    "statusi_checkin" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCategories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "emri" TEXT,

    CONSTRAINT "EventCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSchedules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID DEFAULT gen_random_uuid(),
    "titulli_eventit" TEXT,
    "pershkrimi" TEXT,
    "ora_fillimit" TIMESTAMP(6),
    "ora_mbarimit" TIMESTAMP(6),
    "salla" TEXT,
    "speaker_id" UUID DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventSchedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event_Speakers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID DEFAULT gen_random_uuid(),
    "speaker_id" UUID DEFAULT gen_random_uuid(),
    "tema" TEXT,
    "ora" TIMESTAMP(6),

    CONSTRAINT "Event_Speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event_Sponsors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID DEFAULT gen_random_uuid(),
    "sponsor_id" UUID DEFAULT gen_random_uuid(),
    "shuma" DECIMAL,

    CONSTRAINT "Event_Sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID DEFAULT gen_random_uuid(),
    "user_id" UUID DEFAULT gen_random_uuid(),
    "vleresimi" BIGINT,
    "komenti" TEXT,
    "data" TIMESTAMP(6),

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "registration_id" UUID DEFAULT gen_random_uuid(),
    "shuma" DECIMAL,
    "metoda" TEXT,
    "data" TIMESTAMP(6),
    "statusi" TEXT,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshTokens" (
    "id" SERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "token_jti" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID DEFAULT gen_random_uuid(),
    "user_id" UUID DEFAULT gen_random_uuid(),
    "ticket_id" UUID DEFAULT gen_random_uuid(),
    "data_regjistrimit" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "statusi" TEXT,
    "reminder_sent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Speakers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "emri" TEXT,
    "mbiemri" TEXT,
    "biografia" TEXT,
    "imazhi" TEXT,
    "email" TEXT,

    CONSTRAINT "Speakers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sponsors" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "emri" TEXT,
    "logoja" TEXT,
    "website" TEXT,
    "niveli_sponsorizimit" TEXT,

    CONSTRAINT "Sponsors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketTypes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID DEFAULT gen_random_uuid(),
    "emri_llojit" TEXT,
    "pershkrimi" TEXT,
    "cmimi" DECIMAL,
    "sasia_total" BIGINT,
    "sasia_mbetur" BIGINT,
    "statusi" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID DEFAULT gen_random_uuid(),
    "tipi" TEXT,
    "cmimi" DECIMAL,
    "sasia" BIGINT,

    CONSTRAINT "Tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "emri" TEXT,
    "adresa" TEXT,
    "qyteti" TEXT,
    "kapaciteti" BIGINT,
    "pershkrimi" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schema_migrations" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "executed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_token_jti_key" ON "RefreshTokens"("token_jti");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_token_hash_key" ON "RefreshTokens"("token_hash");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_expires_at" ON "RefreshTokens"("expires_at");

-- CreateIndex
CREATE INDEX "idx_refresh_tokens_user_id" ON "RefreshTokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "schema_migrations_filename_key" ON "schema_migrations"("filename");

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "EventCategories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "Venues"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "Registrations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EventSchedules" ADD CONSTRAINT "EventSchedules_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "EventSchedules" ADD CONSTRAINT "EventSchedules_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "Speakers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Event_Speakers" ADD CONSTRAINT "Event_Speakers_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Event_Speakers" ADD CONSTRAINT "Event_Speakers_speaker_id_fkey" FOREIGN KEY ("speaker_id") REFERENCES "Speakers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Event_Sponsors" ADD CONSTRAINT "Event_Sponsors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Event_Sponsors" ADD CONSTRAINT "Event_Sponsors_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "Sponsors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "Registrations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "RefreshTokens" ADD CONSTRAINT "RefreshTokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Registrations" ADD CONSTRAINT "Registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Registrations" ADD CONSTRAINT "Registrations_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Registrations" ADD CONSTRAINT "Registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "TicketTypes" ADD CONSTRAINT "TicketTypes_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

