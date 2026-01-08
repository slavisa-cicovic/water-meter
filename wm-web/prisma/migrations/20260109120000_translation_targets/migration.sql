-- Add target to translations to separate mobile/web dictionaries
ALTER TABLE `Translation`
  ADD COLUMN `target` VARCHAR(191) NOT NULL DEFAULT 'mobile';

DROP INDEX `Translation_locale_key_key` ON `Translation`;
CREATE UNIQUE INDEX `Translation_target_locale_key_key` ON `Translation`(`target`, `locale`, `key`);

DROP INDEX `Translation_locale_idx` ON `Translation`;
CREATE INDEX `Translation_target_locale_idx` ON `Translation`(`target`, `locale`);
