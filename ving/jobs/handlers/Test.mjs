import { log } from '#ving/log.mjs';

export default async function (job) {
    log('agent').debug(`Test ran with data: ${JSON.stringify(job.data)}`);
    return true;
}