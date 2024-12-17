import ving from '#ving/index.mjs';

/**
 * This handler does nothing other that write to the log with whatever data was passed in. 
 * @param {Object} A `BullMQ` job.
 * @returns {boolean} `true`
 */
export default async function (job) {
    ving.log('jobs').debug(`Test ran with data: ${JSON.stringify(job.data)} which is a ${typeof job.data}`);
    return true;
}