import ving from '#ving/index.mjs';

/**
 * This handler looks up all users with a specified role and sends them an email.
 * @param {Object} job A `BullMQ` job.
 * @param {Object} job.data An object with data needed for this job.
 * @returns {boolean} `true`
 */
export default async function (job) {
    ving.log('jobs').debug(`Test ran with data: ${JSON.stringify(job.data)} which is a ${typeof job.data}`);
    if (job.data.error) {
        throw new Error(job.data.error);
    }
    return true;
}