-- Add tariff override to consumer profile
ALTER TABLE `ConsumerProfile` ADD COLUMN `tariffId` VARCHAR(191) NULL;

CREATE INDEX `ConsumerProfile_tariffId_idx` ON `ConsumerProfile`(`tariffId`);

ALTER TABLE `ConsumerProfile`
  ADD CONSTRAINT `ConsumerProfile_tariffId_fkey`
  FOREIGN KEY (`tariffId`) REFERENCES `Tariff`(`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
