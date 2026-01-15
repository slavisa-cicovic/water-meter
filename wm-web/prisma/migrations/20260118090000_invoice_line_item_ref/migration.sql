-- AlterTable
ALTER TABLE `InvoiceLine` ADD COLUMN `invoiceLineItemId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `InvoiceLine_invoiceLineItemId_idx` ON `InvoiceLine`(`invoiceLineItemId`);

-- AddForeignKey
ALTER TABLE `InvoiceLine` ADD CONSTRAINT `InvoiceLine_invoiceLineItemId_fkey` FOREIGN KEY (`invoiceLineItemId`) REFERENCES `InvoiceLineItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
