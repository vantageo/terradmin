-- CreateEnum
CREATE TYPE "CloudProvider" AS ENUM ('AZURE', 'AWS', 'VCENTER');

-- CreateEnum
CREATE TYPE "VMStatus" AS ENUM ('RUNNING', 'STOPPED', 'DEALLOCATED', 'CREATING', 'DELETING', 'ERROR');

-- CreateTable
CREATE TABLE "VirtualMachine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" "CloudProvider" NOT NULL,
    "status" "VMStatus" NOT NULL DEFAULT 'STOPPED',
    "region" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "ipAddress" TEXT,
    "resourceGroup" TEXT,
    "subscriptionId" TEXT,
    "instanceId" TEXT,
    "tags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VirtualMachine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeploymentLog" (
    "id" TEXT NOT NULL,
    "vmId" TEXT,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeploymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AzureConfig" (
    "id" TEXT NOT NULL DEFAULT 'azure_config',
    "subscriptionId" TEXT NOT NULL,
    "subscriptionName" TEXT NOT NULL,
    "tenantId" TEXT,
    "state" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AzureConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VirtualMachine_provider_idx" ON "VirtualMachine"("provider");

-- CreateIndex
CREATE INDEX "VirtualMachine_status_idx" ON "VirtualMachine"("status");

-- CreateIndex
CREATE INDEX "DeploymentLog_vmId_idx" ON "DeploymentLog"("vmId");

-- CreateIndex
CREATE INDEX "DeploymentLog_createdAt_idx" ON "DeploymentLog"("createdAt");
