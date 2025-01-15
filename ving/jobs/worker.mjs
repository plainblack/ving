import { Worker } from 'bullmq';
import ving from '#ving/index.mjs';
import { useRedis } from '#ving/redis.mjs';
import { jobHandlers } from '#ving/jobs/map.mjs';
import { addJob } from '#ving/jobs/queue.mjs';
/** 
 * A class for running Ving jobs
 * @class
 */
export class VingJobWorker {

    #queueName = '';

    /** A reference to the `BullMQ` worker created by this object */
    worker = undefined;

    /**
     * Instanciate a new worker
     * 
     * @param {string} queueName A string reprepsenting the name of the queue for this worker to attach to. Defaults to `jobs`.
     */
    constructor(queueName = 'jobs') {
        this.#queueName = queueName;
    }


    /**
     *  Start the worker
     */

    async start() {

        const params = { connection: useRedis() };
        if (params.connection.isCluster) {
            params.prefix = '{vingjobs}';
        }
        this.worker = new Worker(
            this.#queueName,
            async (job) => {
                ving.log('jobs').info(`got job ${job.id} ${job.name}`);
                ving.log('jobs').debug(`job ${job.id} parameters: ${JSON.stringify(job.data)

                    }`);
                if (job.name in jobHandlers) {
                    await jobHandlers[job.name](job);
                }
                else {
                    const message = `No job handler for job ${job.id} ${job.name}`;
                    ving.log('jobs').error(message);
                    throw ving.ouch(501, message);
                }
            },
            { ...params }
        );

        this.worker.on('completed', job => {
            ving.log('jobs').info(`${job.id} ${job.name} has completed`);
        });

        this.worker.on('failed', async (job, err) => {
            ving.log('jobs').error(`${job.id} ${job.name} has errored with ${err.message} using data ${JSON.stringify(job.data)}`);
            if (job.attemptsMade >= job.opts.attempts) {
                ving.log('jobs').error(`CRITICAL: ${job.id} ${job.name} aborted after ${job.attemptsMade} attempts`);
                await ving.addJob('EmailRole', {
                    role: 'admin',
                    subject: `Job ${job.name} aborted`,
                    message: `Job ${job.name} aborted after ${job.attemptsMade} attempts.
                    
                    Job Id: ${job.id}
                    Error: ${err.message}
                    Data: 
                    ${JSON.stringify(job.data)}`,
                });
            }
        });
        ving.log('jobs').info(`worker started`);
    }

    /**
     * shut down the worker
     */
    async end() {
        await this.worker.close();
        ving.log('jobs').info(`worker ended`);
        ving.close();
    }

}