
import { Queue } from 'bullmq';

const myQueue = new Queue('foo');

async function addJobs() {
    await myQueue.add('myJobName', { foo: 'bar' });
    await myQueue.add('myJobName', { qux: 'baz' });
}

await addJobs();


import { Worker } from 'bullmq';

const worker = new Worker('foo', async job => {
    // Will print { foo: 'bar'} for the first job
    // and { qux: 'baz' } for the second.
    console.log(job.data);
});

setTimeout(async () => {
    await worker.close();
    await myQueue.close();
    //await worker.disconnect();
    // process.exit();
}, 1000);
