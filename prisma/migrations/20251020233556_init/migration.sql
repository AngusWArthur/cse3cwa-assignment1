-- CreateTable
CREATE TABLE "TabSet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tabs" JSONB NOT NULL,
    "html" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TabSet_pkey" PRIMARY KEY ("id")
);
