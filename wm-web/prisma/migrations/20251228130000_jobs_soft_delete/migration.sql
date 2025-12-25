-- Add soft delete to job definitions
ALTER TABLE `JobDefinition` ADD COLUMN `deletedAt` DATETIME(3) NULL;

CREATE INDEX `JobDefinition_deletedAt_idx` ON `JobDefinition`(`deletedAt`);
