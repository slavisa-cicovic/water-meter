-- CreateTable
CREATE TABLE `Tariff` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `basePrice` DECIMAL(12, 2) NOT NULL,
    `greenLimit` INTEGER NOT NULL,
    `blueLimit` INTEGER NOT NULL,
    `blueMultiplier` DECIMAL(5, 2) NOT NULL,
    `redMultiplier` DECIMAL(5, 2) NOT NULL,
    `validFrom` DATETIME(3) NOT NULL,
    `validTo` DATETIME(3) NULL,
    `groupCode` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `meterId` VARCHAR(191) NULL,
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `status` ENUM('draft', 'issued', 'paid', 'void') NOT NULL DEFAULT 'draft',
    `consumption` INTEGER NOT NULL,
    `unitPrice` DECIMAL(12, 2) NOT NULL,
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `vatRate` DECIMAL(5, 2) NOT NULL,
    `vatAmount` DECIMAL(12, 2) NOT NULL,
    `totalAmount` DECIMAL(12, 2) NOT NULL,
    `tariffId` VARCHAR(191) NULL,
    `tariffSnapshot` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Invoice_accountId_idx`(`accountId`),
    INDEX `Invoice_meterId_idx`(`meterId`),
    INDEX `Invoice_periodStart_idx`(`periodStart`),
    INDEX `Invoice_periodEnd_idx`(`periodEnd`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceLine` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `type` ENUM('consumption', 'fee', 'vat') NOT NULL,
    `description` VARCHAR(191) NULL,
    `quantity` DECIMAL(12, 3) NULL,
    `unitPrice` DECIMAL(12, 2) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,

    INDEX `InvoiceLine_invoiceId_idx`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceReadingLink` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `readingId` VARCHAR(191) NOT NULL,
    `role` ENUM('start', 'end') NOT NULL,

    INDEX `InvoiceReadingLink_invoiceId_idx`(`invoiceId`),
    INDEX `InvoiceReadingLink_readingId_idx`(`readingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_meterId_fkey` FOREIGN KEY (`meterId`) REFERENCES `Meter`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_tariffId_fkey` FOREIGN KEY (`tariffId`) REFERENCES `Tariff`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceLine` ADD CONSTRAINT `InvoiceLine_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceReadingLink` ADD CONSTRAINT `InvoiceReadingLink_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceReadingLink` ADD CONSTRAINT `InvoiceReadingLink_readingId_fkey` FOREIGN KEY (`readingId`) REFERENCES `Reading`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

