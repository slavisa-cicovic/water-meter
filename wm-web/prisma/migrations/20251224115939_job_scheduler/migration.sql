-- CreateTable
CREATE TABLE `JobDefinition` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `handlerKey` VARCHAR(191) NOT NULL,
    `scheduleType` ENUM('weekly', 'monthly', 'yearly') NOT NULL,
    `scheduleConfig` JSON NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `maxAttempts` INTEGER NOT NULL DEFAULT 3,
    `backoffSeconds` INTEGER NOT NULL DEFAULT 60,
    `nextRunAt` DATETIME(3) NULL,
    `lastRunAt` DATETIME(3) NULL,
    `lockedUntil` DATETIME(3) NULL,
    `lockedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JobDefinition_enabled_nextRunAt_idx`(`enabled`, `nextRunAt`),
    INDEX `JobDefinition_handlerKey_idx`(`handlerKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JobRun` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `status` ENUM('running', 'success', 'failed') NOT NULL,
    `attempt` INTEGER NOT NULL DEFAULT 1,
    `runAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedAt` DATETIME(3) NULL,
    `error` TEXT NULL,

    INDEX `JobRun_jobId_idx`(`jobId`),
    INDEX `JobRun_status_idx`(`status`),
    INDEX `JobRun_runAt_idx`(`runAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JobRun` ADD CONSTRAINT `JobRun_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `JobDefinition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
