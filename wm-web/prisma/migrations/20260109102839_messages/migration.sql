-- CreateTable
CREATE TABLE `MessageThread` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `lastMessageAt` DATETIME(3) NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MessageThread_accountId_idx`(`accountId`),
    INDEX `MessageThread_lastMessageAt_idx`(`lastMessageAt`),
    INDEX `MessageThread_archivedAt_idx`(`archivedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` VARCHAR(191) NOT NULL,
    `threadId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `senderType` ENUM('mobile', 'web') NOT NULL,
    `senderAccountId` VARCHAR(191) NULL,
    `readAtMobile` DATETIME(3) NULL,
    `readAtWeb` DATETIME(3) NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Message_threadId_createdAt_idx`(`threadId`, `createdAt`),
    INDEX `Message_senderType_readAtWeb_idx`(`senderType`, `readAtWeb`),
    INDEX `Message_senderType_readAtMobile_idx`(`senderType`, `readAtMobile`),
    INDEX `Message_archivedAt_idx`(`archivedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MessageThread` ADD CONSTRAINT `MessageThread_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_threadId_fkey` FOREIGN KEY (`threadId`) REFERENCES `MessageThread`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderAccountId_fkey` FOREIGN KEY (`senderAccountId`) REFERENCES `Account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
