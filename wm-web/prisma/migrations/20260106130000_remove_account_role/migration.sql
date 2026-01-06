-- Backfill account role links before dropping legacy role column
INSERT INTO `AccountRoleLink` (`accountId`, `roleId`, `createdAt`)
SELECT `Account`.`id`, `Role`.`id`, NOW()
FROM `Account`
INNER JOIN `Role` ON `Role`.`slug` = `Account`.`role`
LEFT JOIN `AccountRoleLink`
  ON `AccountRoleLink`.`accountId` = `Account`.`id`
  AND `AccountRoleLink`.`roleId` = `Role`.`id`
WHERE `AccountRoleLink`.`accountId` IS NULL;

-- AlterTable
ALTER TABLE `Account` DROP COLUMN `role`;

-- AlterTable
ALTER TABLE `ReadingEdit` MODIFY `editorRole` VARCHAR(191) NOT NULL;
