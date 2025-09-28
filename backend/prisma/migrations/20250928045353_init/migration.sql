-- CreateTable
CREATE TABLE "public"."VideoRequest" (
    "id" SERIAL NOT NULL,
    "actorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "syncRequest" JSONB,
    "syncResponse" JSONB,
    "whatsappResponse" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoRequest_pkey" PRIMARY KEY ("id")
);
