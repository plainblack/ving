import Test from './handlers/Test.mjs';
import DeleteUnusedS3File from './handlers/DeleteUnusedS3File.mjs';
import CronJob from './handlers/CronJob.mjs';

export const jobHandlers = {
    Test,
    DeleteUnusedS3File,
    CronJob
}