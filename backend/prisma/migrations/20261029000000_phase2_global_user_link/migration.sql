-- Implements: Phase 2 - PGXSports Shared Wallet Integration
--
-- NOT APPLIED to any database as part of this task - no live Postgres
-- instance is configured/reachable for PGXSports in this environment.
-- Written by hand (not via `prisma migrate dev`, which requires a live
-- DATABASE_URL) to match Prisma's own generated migration shape exactly.
-- A person with a real staging DATABASE_URL must run this via
-- `npx prisma migrate deploy` (or `migrate dev` in a dev DB) before the
-- GlobalUserLink/HandoffNonce models can be used against real data.

-- CreateTable
CREATE TABLE "global_user_links" (
    "id" TEXT NOT NULL,
    "globalUserId" TEXT NOT NULL,
    "pgxsportsUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "global_user_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handoff_nonces" (
    "id" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "globalUserId" TEXT NOT NULL,
    "consumedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "handoff_nonces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "global_user_links_globalUserId_key" ON "global_user_links"("globalUserId");

-- CreateIndex
CREATE UNIQUE INDEX "global_user_links_pgxsportsUserId_key" ON "global_user_links"("pgxsportsUserId");

-- CreateIndex
CREATE UNIQUE INDEX "handoff_nonces_nonce_key" ON "handoff_nonces"("nonce");

-- AddForeignKey
ALTER TABLE "global_user_links" ADD CONSTRAINT "global_user_links_pgxsportsUserId_fkey" FOREIGN KEY ("pgxsportsUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
