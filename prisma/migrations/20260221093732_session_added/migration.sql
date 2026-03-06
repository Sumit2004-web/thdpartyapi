-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "providerId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "backPrice" DOUBLE PRECISION,
    "layPrice" DOUBLE PRECISION,
    "backSize" DOUBLE PRECISION,
    "laySize" DOUBLE PRECISION,
    "mname" TEXT,
    "gtype" TEXT,
    "sortPriority" INTEGER,
    "providerTs" BIGINT,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_providerId_eventId_key" ON "Session"("providerId", "eventId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
