import { Queue } from 'bullmq';
import ving from '#ving/index.mjs';
import { useRedis } from '#ving/redis.mjs';

/**
 * Enqueues a job in the jobs system.
 * 
 * @param {string} type Must match the filename (without the `.mjs`) of a job handler.
 * @param {Object} data An object containing whatever data you wish to pass into the job.
 * @param {Object} options An object with optional properties.
 * @param {string} options.queueName The name of the queue to add this job to. Defaults to `jobs`.
 * @param {number} options.delay The number of milliseconds to wait before executing this job. Defaults to running as soon as possible.
 */
export const addJob = async (type, data = {}, options = { queueName: 'jobs ' }) => {
    const queue = new Queue(options?.queueName || 'jobs');
    const job = await queue.add(type, data, {
        connection: useRedis(),
        removeOnComplete: {
            age: 3600, // keep up to 1 hour
            count: 1000, // keep up to 1000 jobs
        },
        removeOnFail: {
            age: 24 * 3600, // keep up to 24 hours
        },
        delay: options?.delay,
    });
    ving.log('jobs').info(`Job ${job.id} ${job.name} enqueued.`);
    await queue.close();
}
