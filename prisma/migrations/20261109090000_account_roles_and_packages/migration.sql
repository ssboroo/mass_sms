CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

ALTER TABLE "User"
  ALTER COLUMN "email" DROP NOT NULL,
  ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER';

ALTER TABLE "CreditAccount"
  ADD COLUMN "packageCode" TEXT NOT NULL DEFAULT 'STARTER',
  ADD COLUMN "packageCredits" BIGINT NOT NULL DEFAULT 0;

CREATE INDEX "User_role_createdAt_idx" ON "User"("role", "createdAt");
