-- CreateTable
CREATE TABLE "MatchingDonationLog" (
    "id" SERIAL NOT NULL,
    "donorId" TEXT NOT NULL,
    "donationId" INTEGER NOT NULL,
    "matchedAmount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectSlug" TEXT NOT NULL,

    CONSTRAINT "MatchingDonationLog_pkey" PRIMARY KEY ("id")
);
