import { defineCommand, showUsage } from "citty";
import { VingJobWorker } from '#ving/jobs/worker.mjs';
import { pause, resume, drain } from '#ving/jobs/queue.mjs';
import { generateJobHandler } from '#ving/generator/jobhandler.mjs';
import ving from '#ving/index.mjs';

export default defineCommand({
    meta: {
        name: "jobs",
        description: "Manage background jobs",
    },
    args: {
        queueName: {
            type: "string",
            description: "Set a queue name. Defaults to `jobs`.",
            valueHint: 'jobs',
            default: 'jobs',
            alias: 'q',
        },
        drain: {
            type: "boolean",
            description: "Delete all waiting and delayed jobs in the queue.",
            alias: "D",
            default: false,
        },
        pause: {
            type: "boolean",
            description: "Stop workers from executing jobs in the queue.",
            alias: "P",
            default: false,
        },
        resume: {
            type: "boolean",
            description: "Resume workers executing jobs in the queue.",
            alias: "R",
            default: false,
        },
        worker: {
            type: "boolean",
            description: "Start a worker",
            alias: "w",
            default: false,
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
            alias: 'j',
        },
        cron: {
            type: "string",
            description: "Specify a 5 parameter cron string for how often the new job should run.",
            valueHint: '* * * * * ',
            alias: 'c',
        },
        repeat: {
            type: "number",
            description: "Specify a number of milliseconds to wait before this job is executed again.",
            valueHint: 30000,
            alias: 'r',
        },
        delay: {
            type: "number",
            description: "The number of milliseconds to wait before executing this job.",
            valueHint: 30000,
            alias: 'd',
        },
        priority: {
            type: "number",
            description: "A number ranging from `1` to `2097152` where `1` is the highest possible priority. Defaults to `2097152`.",
            valueHint: 100,
            alias: 'p',
        },
        handler: {
            type: 'string',
            description: 'Generate a new job handler with the specified name.',
            alias: 'n',
            valueHint: 'SomeThing',
        },
    },
    async run({ args, cmd }) {
        try {
            if (args.drain) {
                await drain({ queueName: args.queueName });
                ving.close();
            }
            else if (args.pause) {
                await pause({ queueName: args.queueName });
                ving.close();
            }
            else if (args.resume) {
                await resume({ queueName: args.queueName });
                ving.close();
            }
            else if (args.worker) {
                const worker = new VingJobWorker(args.queueName);
                await worker.start();
                if (args.ttl > 0) {
                    setTimeout(async () => {
                        await worker.end();
                    }, 1000 * args.ttl);
                }
            }
            else if (args.handler) {
                await generateJobHandler({ name: args.handler });
                ving.close();
            }
            else if (args.addJob) {
                const params = { queueName: args.queueName };
                if (args.cron)
                    params.cron = args.cron;
                if (args.repeat)
                    params.repeat = args.repeat;
                if (args.priority)
                    params.priority = args.priority;
                if (args.delay)
                    params.delay = args.delay;
                await ving.addJob(args.addJob, JSON.parse(args.jobData), params);
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