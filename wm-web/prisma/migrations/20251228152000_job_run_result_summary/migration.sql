-- Add result summary to job runs
ALTER TABLE `JobRun` ADD COLUMN `resultSummary` JSON NULL;
