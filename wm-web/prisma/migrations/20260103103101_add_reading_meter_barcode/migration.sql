-- AlterTable
ALTER TABLE `Meter` ADD COLUMN `barcode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Reading` ADD COLUMN `barcodeFinal` VARCHAR(191) NULL,
    ADD COLUMN `barcodeRaw` VARCHAR(191) NULL,
    ADD COLUMN `barcodeStatus` ENUM('pending', 'accepted', 'rejected') NULL,
    ADD COLUMN `barcodeUpdatedAt` DATETIME(3) NULL,
    ADD COLUMN `barcodeUpdatedBy` VARCHAR(191) NULL;
