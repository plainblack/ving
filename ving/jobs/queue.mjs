import { Queue } from 'bullmq';
import ving from '#ving/index.mjs';
import { useRedis } from '#ving/redis.mjs';

/**
 * Get BullMQ queue object.
 * @param {Object} options An object with optional properties.
 * @param {string} options.queueName The name of the queue. Defaults to `jobs`.
 * @returns {Queue} A queue object.
 * @example
 * getQueue();
 */
export const getQueue = (options = {}) => {
    const queue = new Queue(options?.queueName || 'jobs');
    return queue;
}

/**
 * Enqueues a job in the jobs system.
 * 
 * @param {string} type Must match the filename (without the `.mjs`) of a job handler.
 * @param {Object} data An object containing whatever data you wish to pass into the job.
 * @param {Object} options An object with optional properties.
 * @param {string} options.queueName The name of the queue to add this job to. Defaults to `jobs`.
 * @param {number} options.delay The number of milliseconds to wait before executing this job. Defaults to running as soon as possible.
 * @param {number} options.priority A number ranging from `1` to `2097152` where `1` is the highest possible priority. Defaults to `2097152`.
 * @param {number} options.repeat Specify a number of milliseconds to wait before this job is executed again. Leave blank for no repeat.
 * @param {string} options.cron Specify a cron string for how often this job should be executed. Leave blank for no repeat.
 * @example
 * await addJob('Test', {foo:'bar'});
 */
export const addJob = async (type, data = {}, options = { queueName: 'jobs' }) => {
    const queue = getQueue(options);
    const jobOptions = {
        connection: useRedis(),
        removeOnComplete: {
            age: 3600, // keep up to 1 hour
            count: 1000, // keep up to 1000 jobs
        },
        removeOnFail: {
            age: 24 * 3600, // keep up to 24 hours
        },
        priority: 2097152
    }
    if (options?.delay)
        jobOptions.delay = options?.delay;
    if (options?.priority)
        jobOptions.priority = options?.priority;
    if (options?.repeat)
        jobOptions.repeat = { every: options?.repeat };
    if (options?.cron)
        jobOptions.repeat = { cron: options?.cron };
    const job = await queue.add(type, data, jobOptions);
    ving.log('jobs').info(`Job ${job.id} ${job.name} enqueued.`);
    await queue.close();
}

/**
 * Stop workers from executing jobs in the queue.
 * @param {Object} options An object with optional properties.
 * @param {string} options.queueName The name of the queue. Defaults to `jobs`.
 * @example 
 * await pause();
 */
export const pause = async (options = {}) => {
    const queue = getQueue(options);
    await queue.pause();
    queue.disconnect();
    ving.log('jobs').info(`Queue ${queue.name} paused.`);
}

/**
 * Resume workers executing jobs in the queue. Undo `pause()`.
 * @param {Object} options An object with optional properties.
 * @param {string} options.queueName The name of the queue. Defaults to `jobs`.
 * @example 
 * await resume();
 */
export const resume = async (options = {}) => {
    const queue = getQueue(options);
    await queue.resume();
    queue.disconnect();
    ving.log('jobs').info(`Queue ${queue.name} resumed.`);
}

/**
 * Delete all waiting and delayed jobs in the queue.
 * @param {Object} options An object with optional properties.
 * @param {string} options.queueName The name of the queue. Defaults to `jobs`.
 * @example 
 * await drain();
 */
export const drain = async (options = {}) => {
    const queue = getQueue(options);
    await queue.drain();
    queue.disconnect();
    ving.log('jobs').info(`Queue ${queue.name} drained.`);
}