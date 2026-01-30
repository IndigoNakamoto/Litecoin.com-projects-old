-- CreateEnum
CREATE TYPE "DonationType" AS ENUM ('fiat', 'crypto', 'stock');

-- CreateTable
CREATE TABLE "tokens" (
    "id" SERIAL NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "refreshed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "project_slug" TEXT NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "donation_type" "DonationType" NOT NULL,
    "pledgeAmount" DECIMAL(18,8) NOT NULL,
    "asset_symbol" TEXT,
    "asset_description" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "donor_email" TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "tax_receipt" BOOLEAN NOT NULL DEFAULT false,
    "join_mailing_list" BOOLEAN NOT NULL DEFAULT false,
    "social_x" TEXT,
    "social_x_image_src" TEXT,
    "social_facebook" TEXT,
    "social_Facebook_image_src" TEXT,
    "social_linkedin" TEXT,
    "social_LinkedIn_image_src" TEXT,
    "donation_uuid" TEXT,
    "pledge_id" TEXT,
    "deposit_address" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "transaction_hash" TEXT,
    "converted_at" TIMESTAMP(3),
    "net_value_amount" DECIMAL(65,30),
    "net_value_currency" TEXT,
    "gross_amount" DECIMAL(65,30),
    "payout_amount" DECIMAL(10,2),
    "payout_currency" TEXT,
    "external_id" TEXT,
    "campaign_id" TEXT,
    "value_at_donation_time_usd" DECIMAL(10,2),
    "currency" TEXT,
    "amount" DECIMAL(10,2),
    "status" TEXT,
    "timestampms" TIMESTAMP(3),
    "eid" TEXT,
    "payment_method" TEXT,
    "event_data" JSONB,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" SERIAL NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "donation_id" INTEGER NOT NULL,
    "eid" TEXT,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "donations_donation_uuid_key" ON "donations"("donation_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "donations_pledge_id_key" ON "donations"("pledge_id");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_eid_key" ON "webhook_events"("eid");

-- AddForeignKey
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "donations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
