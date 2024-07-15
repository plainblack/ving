import ving from '#ving/index.mjs';
import { getJobsForHandler, killJob } from "#ving/jobs/queue.mjs";
import { useKind } from '#ving/record/utils.mjs';

/**
 * This handler executes all cron jobs at the same schedule in the CronJob VingRecord.
 * @param {Object} A `BullMQ` job.
 * @returns {boolean} `true`
 */
export default async function (job) {
    ving.log('jobs').info(`Running CronJobs at schedule ${JSON.stringify(job.data.schedule)}`);
    const cronJobs = await useKind('CronJob');
    const records = await cronJobs.findMany({ schedule: job.data.schedule });
    if (records.length == 0) {
        ving.log('jobs').info(`No CronJobs found at schedule ${JSON.stringify(job.data.schedule)}. Removing schedule.`);
        const jobs = await getJobsForHandler('CronJob');
        for (const rjob of jobs) {
            if (job.data.schedule == rjob.data.schedule)
                await killJob(rjob.id);
        }
    }
    else {
        for (const record of records) {
            await record.queueJob();
        }
    }
    return true;
}