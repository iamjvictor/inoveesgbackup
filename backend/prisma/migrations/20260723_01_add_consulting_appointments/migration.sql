-- CreateEnum
CREATE TYPE "ConsultingAppointmentStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "consulting_appointments" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "requestedByUserId" UUID,
    "orderId" UUID,
    "serviceId" UUID,
    "status" "ConsultingAppointmentStatus" NOT NULL DEFAULT 'REQUESTED',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "meetingUrl" TEXT,
    "notes" TEXT,
    "cancellationReason" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consulting_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "consulting_appointments_organizationId_status_idx"
ON "consulting_appointments"("organizationId", "status");

CREATE INDEX "consulting_appointments_startsAt_status_idx"
ON "consulting_appointments"("startsAt", "status");

CREATE INDEX "consulting_appointments_requestedByUserId_idx"
ON "consulting_appointments"("requestedByUserId");

-- AddForeignKey
ALTER TABLE "consulting_appointments"
ADD CONSTRAINT "consulting_appointments_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "consulting_appointments"
ADD CONSTRAINT "consulting_appointments_requestedByUserId_fkey"
FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "consulting_appointments"
ADD CONSTRAINT "consulting_appointments_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "consulting_appointments"
ADD CONSTRAINT "consulting_appointments_serviceId_fkey"
FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Keep appointment data inaccessible through the public Data API until
-- explicit user-facing policies are defined. Backend/service-role access is
-- unaffected by RLS.
ALTER TABLE "consulting_appointments" ENABLE ROW LEVEL SECURITY;
