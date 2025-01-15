import Test from "#ving/jobs/handlers/Test.mjs";
import DeleteUnusedS3File from "#ving/jobs/handlers/DeleteUnusedS3File.mjs";
import CronJob from "#ving/jobs/handlers/CronJob.mjs";
import EmailRole from "#ving/jobs/handlers/EmailRole.mjs";

export const jobHandlers = {
    Test,
    DeleteUnusedS3File,
    CronJob,
    EmailRole
}