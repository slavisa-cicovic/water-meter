-- AlterTable
ALTER TABLE `Meter` ADD COLUMN `type` ENUM('automatic', 'mechanical') NOT NULL DEFAULT 'mechanical';

