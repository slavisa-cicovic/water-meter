-- CreateTable
CREATE TABLE `Reading` (
    `id` VARCHAR(191) NOT NULL,
    `meterId` VARCHAR(191) NOT NULL,
    `readerAccountId` VARCHAR(191) NOT NULL,
    `readAt` DATETIME(3) NOT NULL,
    `method` ENUM('remote', 'manual', 'photo_ocr') NOT NULL,
    `value` INTEGER NOT NULL,
    `originalValue` INTEGER NOT NULL,
    `imageFilename` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Reading_meterId_idx`(`meterId`),
    INDEX `Reading_readerAccountId_idx`(`readerAccountId`),
    INDEX `Reading_readAt_idx`(`readAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReadingEdit` (
    `id` VARCHAR(191) NOT NULL,
    `readingId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `editorRole` ENUM('admin', 'consumer', 'staff_field', 'staff_backoffice') NOT NULL,
    `value` INTEGER NOT NULL,
    `reason` TEXT NULL,
    `editedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ReadingEdit_readingId_idx`(`readingId`),
    INDEX `ReadingEdit_accountId_idx`(`accountId`),
    INDEX `ReadingEdit_editedAt_idx`(`editedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reading` ADD CONSTRAINT `Reading_meterId_fkey` FOREIGN KEY (`meterId`) REFERENCES `Meter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reading` ADD CONSTRAINT `Reading_readerAccountId_fkey` FOREIGN KEY (`readerAccountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReadingEdit` ADD CONSTRAINT `ReadingEdit_readingId_fkey` FOREIGN KEY (`readingId`) REFERENCES `Reading`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReadingEdit` ADD CONSTRAINT `ReadingEdit_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
