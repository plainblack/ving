import { Queue } from 'bullmq';
import ving from '#ving/index.mjs';


export const addJob = async (type, data = {}, options = { queueName: 'jobs ' }) => {
    const queue = new Queue(options?.queueName || 'jobs');
    const job = await queue.add(type, data, {
        connection: {
            host: process.env.BULLMQ_REDIS_HOST,
            port: process.env.BULLMQ_REDIS_PORT,
        },
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
