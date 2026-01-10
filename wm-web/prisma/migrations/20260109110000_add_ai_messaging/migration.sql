-- Add AI sender type and message status tracking
ALTER TABLE `Message`
  MODIFY `senderType` ENUM('mobile', 'web', 'ai') NOT NULL;

ALTER TABLE `Message`
  ADD COLUMN `status` ENUM('received', 'processing', 'ai_replied', 'needs_human', 'human_replied', 'closed') NULL;
