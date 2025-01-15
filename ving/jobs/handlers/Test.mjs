import ving from '#ving/index.mjs';

/**
 * This handler does nothing other that write to the log with whatever data was passed in. 
 * If the data passed in has an element called `error` then the handler will throw that message in an Error object.
 * @param {Object} A `BullMQ` job.
 * @returns {boolean} `true`
 */
export default async function (job) {
    ving.log('jobs').debug(`Test ran with data: ${JSON.stringify(job.data)} which is a ${typeof job.data}`);
    if (job.data.error) {
        throw new Error(job.data.error);
    }
    return true;
}