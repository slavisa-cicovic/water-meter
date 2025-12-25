-- Add confirmed status to invoice enums
ALTER TABLE `Invoice`
  MODIFY `status` ENUM('draft', 'confirmed', 'issued', 'paid', 'void') NOT NULL DEFAULT 'draft';

ALTER TABLE `InvoiceOverrideLog`
  MODIFY `prevStatus` ENUM('draft', 'confirmed', 'issued', 'paid', 'void') NOT NULL,
  MODIFY `newStatus` ENUM('draft', 'confirmed', 'issued', 'paid', 'void') NOT NULL;
