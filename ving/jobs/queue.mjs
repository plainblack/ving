import { Queue } from 'bullmq';
import ving from '#ving/index.mjs';
import { useRedis } from '#ving/redis.mjs';
import { jobHandlers } from '#ving/jobs/map.mjs';
import { isObject } from '#ving/utils/identify.mjs';

/**
 * Get BullMQ queue object.
 * @param {Object} options An object with optional properties.
 * @param {string} options.queueName The name of the queue. Defaults to `jobs`.
 * @returns {Queue} A queue object.
 * @example
 * getQueue();
 */
export const getQueue = (options = {}) => {
    const params = { connection: useRedis() };
    if (params.connection.isCluster) {
        params.prefix = '{vingjobs}';
    }
    const queue = new Queue(options?.queueName || 'jobs', params);
    return queue;
}

const handlerNames = [];
/**
 * Get a list of handler names
 * @returns {string[]} A queue object.
 * @example
 * getHandlerNames();
 */
export const getHandlerNames = () => {
    return Object.keys(jobHandlers);
}

/**
 * Enqueues a job in the jobs system.
 * 
 * @param {string} type Must match the filename (without the `.mjs`) of a job handler.
 * @param {Object|Undefined} data An object containing whatever data you wish to pass into the job.
 * @param {Object} options An object with optional properties.
 * @param {string} options.queueName The name of the queue to add this job to. Defaults to `jobs`.
 * @param {number} options.delay The number of milliseconds to wait before executing this job. Defaults to running as soon as possible.
 * @param {number} options.priority A number ranging from `1` to `2097152` where `1` is the highest possible priority. Defaults to `2097152`.
 * @param {number} options.repeat Specify a number of milliseconds to wait before this job is executed again. Leave blank for no repeat.
 * @param {string} options.cron Specify a cron string for how often this job should be executed. Leave blank for no repeat.
 * @returns {Job} Returns the created job.
 * @example
 * await addJob('Test', {foo:'bar'});
 */
export const addJob = async (type, data = {}, options = { queueName: 'jobs' }) => {
    if (!(getHandlerNames().includes(type)))
        throw ving.ouch(404, `Job handler ${type} is not available.`);
    if (!isObject(data)) {
        throw ving.ouch(442, `Data must be an object.`);
    }
    const queue = getQueue(options);
    const jobOptions = {
        removeOnComplete: {
            age: 3600, // keep up to 1 hour
            count: 1000, // keep up to 1000 jobs
        },
        removeOnFail: {
            age: 24 * 3600 * 3, // keep up to 72 hours
        },
        priority: 2097152,
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000 * 60, // 1 minute
        },
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
    return job;
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
    await queue.close();
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
    await queue.close();
    ving.log('jobs').info(`Queue ${queue.name} resumed.`);
}

/**
 * Delete the queue and everything in it.
 * @param {Object} options An object with optional properties.
 * @param {string} options.queueName The name of the queue. Defaults to `jobs`.
 * @example 
 * await obliterate();
 */
export const obliterate = async (options = {}) => {
    const queue = getQueue(options);
    await queue.obliterate();
    await queue.close();
    ving.log('jobs').info(`Queue ${queue.name} obliterated.`);
}

/**
 * Get a list of all the jobs in the queue.
 * @param {Object} options An object with optional properties.
 * @param {string} options.queueName The name of the queue. Defaults to `jobs`.
 * @param { string[]} options.status An array of statuses to fetch. Can be any of `active`, `prioritized`, `delayed`, `failed`, `paused` or `completed`. Defaults to `['active','prioritized','delayed']`.
 * @example 
 * await getJobs();
 */
export const getJobs = async (options = {}) => {
    const queue = getQueue(options);
    const jobs = await queue.getJobs(options?.status || ['active', 'prioritized', 'delayed'], 0, 100, true);
    await queue.close();
    return jobs;
}

/**
 * Get a list of jobs in the queue with a specific handler name.
 * @param {string} handler The name of the handler to search for.
 * @param {Object} options An object with optional properties.
 * @param {string} options.queueName The name of the queue. Defaults to `jobs`.
 * @param { string[]} options.status An array of statuses to fetch. Can be any of `active`, `prioritized`, `delayed`, `failed`, `paused` or `completed`. Defaults to `['active','prioritized','delayed']`.
 * @example 
 * await getJobsForHandler();
 */
export const getJobsForHandler = async (handler, options = {}) => {
    const queue = getQueue(options);
    let iterator = 1;
    const out = [];
    while (out.length < 100) {
        const jobs = await queue.getJobs(options?.status || ['active', 'prioritized', 'delayed'], (iterator * 100) - 100, iterator * 100, true);
        for (const job of jobs) {
            if (job.name == handler)
                out.push(job);
        }
        if (jobs.length == 0)
            break;
        iterator++;
    }
    await queue.close();
    return out;
}

/**
 * Remove a job from the queue.
 * @param {Object} options An object with optional properties.
 * @param {string} options.queueName The name of the queue. Defaults to `jobs`.
 * @returns {boolean} `true` on success, `false` on fail.
 * @example 
 * await killJob('14');
 */
export const killJob = async (jobId, options = {}) => {
    const queue = getQueue(options);
    const job = await queue.getJob(jobId);
    let out = true;
    if (job) {
        await job.remove();
        ving.log('jobs').info(`Job ${jobId} removed.`);

    }
    else {
        ving.log('jobs').error(`Job ${jobId} not found`);
        out = false;
    }
    await queue.close();
    return out;
}