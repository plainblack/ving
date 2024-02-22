import { Worker } from 'bullmq';
import { ouch } from '#ving/utils/ouch.mjs';
import fs from 'fs';
import { log } from '#ving/log.mjs';

/** 
 * A class for running Ving jobs
 * @class
 */
export class VingJobWorker {

    #modules = {};

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
        try {
            const sourcePath = './ving/agent/handlers';
            const files = fs.readdirSync(sourcePath);
            for (const file of files) {
                const name = file.replace(/^.*?(\w+)\.mjs$/, '$1');
                const module = await import(`#ving/agent/handlers/${file}`);
                this.#modules[name] = module.default;
            }
        } catch (err) {
            log('agent').error(err);
        }

        this.worker = new Worker(
            this.#queueName,
            async (job) => {
                log('agent').info(`got job ${job.id} ${job.name}`);
                if (job.name in this.#modules) {
                    this.#modules[job.name](job)
                }
                else {
                    const message = `No job handler for job ${job.id} ${job.name}`;
                    log('agent').error(message);
                    throw ouch(501, message);
                }
            },
            {
                connection: {
                    host: process.env.BULLMQ_REDIS_HOST,
                    port: process.env.BULLMQ_REDIS_PORT,
                }
            }
        );

        this.worker.on('completed', job => {
            log('agent').info(`${job.id} ${job.name} has completed`);
        });

        this.worker.on('failed', (job, err) => {
            log('agent').error(`${job.id} ${job.name} has failed with ${err.message}`);
        });

        log('agent').info(`worker started`);
    }

    /**
     * shut down the worker
     */
    async end() {
        await this.worker.close();
        log('agent').info(`worker ended`);
    }

}