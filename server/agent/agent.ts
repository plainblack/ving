import { Job, Worker, WorkerOptions } from 'bullmq';
import { WorkerJob } from '../../types/agent';
import { glob } from 'glob';

import { Queue } from 'bullmq';

const queue = new Queue('test');
await queue.add('Test', {});

let modules: Record<string, () => {}> = {};
try {
    const res = await glob(process.cwd() + '/server/agent/jobs/*.ts');
    for (const file of res) {
        const name = file.replace(/^.*?(\w+)\.ts$/, '$1');
        const module = await import('./jobs/' + name);
        modules[name] = module.default;
    }
} catch (err) {
    console.log('--ERROR--:' + err);
}
console.log(modules);


const handler = async (job: Job<WorkerJob>) => {
    console.log('GOT JOB: ', job.id, job.name);
    if (job.data.type in modules) {
        //@ts-expect-error
        modules[job.data.type](job)
    }
}

const options: WorkerOptions = {
    //connection: {
    // host : 'localhost',
    // port: 
    // }
};

const worker = new Worker('test', handler, options);
worker.on('completed', job => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job?.id} has failed with ${err.message}`);
});

console.log('worker started');

await worker.close();

console.log('worker closed');