---
outline: deep
---
# Jobs
Ving uses a jobs server called [BullMQ](http://bullmq.io) to execute potentially long running asynchronous background jobs. 


## Setting Up Redis
To use the jobs system you must first have a Redis server. Then you simply need to add an entry in .env that points to your Redis server like so:

```bash
VING_REDIS="redis://@localhost:6379"
```

You can include a username and password in the URL like so:

```bash
VING_REDIS="redis://user:pass@localhost:6379"
```

**NOTE:** You must enable the setting `maxmemory-policy=noeviction` in your Redis server to prevent it from automatically deleting keys when memory runs low as this will cause problems with the BullMQ system.

## Enqueueing Jobs
To enqueue a job you'd use the following code.

```js
import ving from '#ving/index.mjs';

ving.addJob('Test', { foo: 'bar' }, { delay: 1000 * 60 });
```
That would run a handler called `Test` with the parameter of `{ foo: 'bar' }`, but first it would wait 60 seconds before the job would be run.

You can also enqueue jobs from the [CLI](cli).

```bash
./ving.mjs jobs --addJob Test --jobData '{ "foo": "bar" }'
```

## Running Jobs
Jobs are run by job workers using handlers. The job worker system is run via the [CLI](cli).

```bash
./ving.mjs jobs --worker --ttl 60
```

The above would run a worker for 60 seconds afterwhich the worker would shut down. If you want to run it indefinitely just leave the `ttl` off.

## Job Handlers
At the heart of the jobs system are handlers. Handlers are custom code that knows how to process a job. You can find handlers in the `#ving/jobs/handlers` folder. This is what a simple handler looks like:

```js
import ving from '#ving/index.mjs';

export default async function (job) {
    ving.log('jobs').debug(`Test ran with data: ${JSON.stringify(job.data)}`);
    return true;
}
```

The handler's job is to do whatever needs to be done with `job.data` to complete the job. It should return `true` when done, or `throw` an [ouch](utils) if it fails. 

To create a new job run:

```bash
./ving.mjs jobs -n MyNewHandler
```

## Cron Jobs
You can set up jobs with a `cron` style schedule via the javascript API or the [CLI](cli). However, 2 jobs cannot have the same schedule, and you cannot set them up via the REST API. To get around this you can use the `CronJob` VingRecord which is accessible via the [REST API](../rest/CronJob) or using the built-in Admin UI.

This system works by storing the configuration of your repeating jobs in the `CronJob` VingRecord. When the `CronJob` handler is run it will look for any `CronJob` records that have the same schedule and execute them. When there are no more scheduled jobs that run at that schedule, the CronJob handler will automatically remove the schedule from BullMQ.