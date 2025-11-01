/*
  Warnings:

  - You are about to drop the column `ipAddress` on the `VirtualMachine` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VirtualMachine" DROP COLUMN "ipAddress",
ADD COLUMN     "computerName" TEXT,
ADD COLUMN     "disks" JSONB,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "networkInterfaces" JSONB,
ADD COLUMN     "osType" TEXT,
ADD COLUMN     "powerState" TEXT,
ADD COLUMN     "privateIpAddress" TEXT,
ADD COLUMN     "provisioningState" TEXT,
ADD COLUMN     "publicIpAddress" TEXT,
ADD COLUMN     "vmId" TEXT;

-- CreateTable
CREATE TABLE "ResourceGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "provider" "CloudProvider" NOT NULL DEFAULT 'AZURE',
    "provisioningState" TEXT,
    "tags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResourceGroup_name_key" ON "ResourceGroup"("name");

-- CreateIndex
CREATE INDEX "ResourceGroup_subscriptionId_idx" ON "ResourceGroup"("subscriptionId");

-- CreateIndex
CREATE INDEX "ResourceGroup_provider_idx" ON "ResourceGroup"("provider");

-- CreateIndex
CREATE INDEX "VirtualMachine_resourceGroup_idx" ON "VirtualMachine"("resourceGroup");
