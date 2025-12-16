-- CreateTable
CREATE TABLE `Meter` (
    `id` VARCHAR(191) NOT NULL,
    `serialNumber` VARCHAR(191) NOT NULL,
    `groupCode` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'inactive', 'removed') NOT NULL DEFAULT 'active',
    `installedAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Meter_serialNumber_key`(`serialNumber`),
    INDEX `Meter_groupCode_idx`(`groupCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MeterConsumer` (
    `meterId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,

    INDEX `MeterConsumer_accountId_idx`(`accountId`),
    PRIMARY KEY (`meterId`, `accountId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MeterConsumer` ADD CONSTRAINT `MeterConsumer_meterId_fkey` FOREIGN KEY (`meterId`) REFERENCES `Meter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MeterConsumer` ADD CONSTRAINT `MeterConsumer_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

