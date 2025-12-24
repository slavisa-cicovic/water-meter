-- CreateTable
CREATE TABLE `InvoiceOverrideLog` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `prevStatus` ENUM('draft', 'issued', 'paid', 'void') NOT NULL,
    `newStatus` ENUM('draft', 'issued', 'paid', 'void') NOT NULL,
    `reason` VARCHAR(191) NULL,
    `jobRunId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `InvoiceOverrideLog_invoiceId_idx`(`invoiceId`),
    INDEX `InvoiceOverrideLog_adminId_idx`(`adminId`),
    INDEX `InvoiceOverrideLog_jobRunId_idx`(`jobRunId`),
    INDEX `InvoiceOverrideLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `InvoiceOverrideLog` ADD CONSTRAINT `InvoiceOverrideLog_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceOverrideLog` ADD CONSTRAINT `InvoiceOverrideLog_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceOverrideLog` ADD CONSTRAINT `InvoiceOverrideLog_jobRunId_fkey` FOREIGN KEY (`jobRunId`) REFERENCES `JobRun`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
