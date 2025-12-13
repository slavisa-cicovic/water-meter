-- AlterTable
ALTER TABLE `Account` MODIFY `role` ENUM('admin', 'consumer', 'staff_field', 'staff_backoffice') NOT NULL;
