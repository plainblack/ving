import { defineCommand, showUsage } from "citty";
import { VingJobWorker } from '#ving/jobs/worker.mjs';
import ving from '#ving/index.mjs';

export default defineCommand({
    meta: {
        name: "jobs",
        description: "Manage background jobs",
    },
    args: {
        worker: {
            type: "boolean",
            description: "Start a worker",
            alias: "w",
            default: false,
        },
        queueName: {
            type: "string",
            description: "Set a queue name. Defaults to `jobs`.",
            valueHint: 'jobs',
            default: 'jobs',
            alias: 'q',
        },
        ttl: {
            type: "number",
            description: "How many seconds should the worker run? 0 means run indefinitely. Defaults to `0`.",
            default: 0,
            alias: 't',
        },
        addJob: {
            type: 'string',
            description: 'Specify the type of job you wish to add. Defaults to `Test`',
            default: 'Test',
            alias: 'a',
        },
        jobData: {
            type: "string",
            description: "Specify a JSON string of data you'd like to pass into the job.",
            default: '{}',
            alias: 'd',
        },
    },
    async run({ args, cmd }) {
        try {
            if (args.worker) {
                const worker = new VingJobWorker(args.queueName);
                await worker.start();
                if (args.ttl > 0) {
                    setTimeout(async () => {
                        await worker.end();
                    }, 1000 * args.ttl);
                }
            }
            else if (args.addJob) {
                await ving.addJob(args.addJob, JSON.parse(args.jobData), {
                    queueName: args.queueName,
                });
                if (!args.worker)
                    ving.close();
            }
            else {
                await showUsage(cmd, { meta: { name: 'ving.mjs' } });
            }
        }
        catch (e) {
            ving.log('cli').error(e.message);
        }
    },
});