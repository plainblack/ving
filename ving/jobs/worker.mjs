import { Worker } from 'bullmq';
import ving from '#ving/index.mjs';
import { useRedis } from '#ving/redis.mjs';
import { jobHandlers } from '#ving/jobs/map.mjs';

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


        this.worker = new Worker(
            this.#queueName,
            async (job) => {
                ving.log('jobs').info(`got job ${job.id} ${job.name}`);
                if (job.name in jobHandlers) {
                    jobHandlers[job.name](job);
                }
                else {
                    const message = `No job handler for job ${job.id} ${job.name}`;
                    ving.log('jobs').error(message);
                    throw ving.ouch(501, message);
                }
            },
            {
                connection: useRedis(),
            }
        );

        this.worker.on('completed', job => {
            ving.log('jobs').info(`${job.id} ${job.name} has completed`);
        });

        this.worker.on('failed', (job, err) => {
            ving.log('jobs').error(`${job.id} ${job.name} has failed with ${err.message}`);
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