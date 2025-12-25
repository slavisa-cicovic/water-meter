-- Add status and soft delete to tariffs
ALTER TABLE `Tariff`
  ADD COLUMN `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  ADD COLUMN `deletedAt` DATETIME(3) NULL;

CREATE INDEX `Tariff_status_idx` ON `Tariff`(`status`);
CREATE INDEX `Tariff_deletedAt_idx` ON `Tariff`(`deletedAt`);
