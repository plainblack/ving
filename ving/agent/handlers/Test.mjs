import { log } from '#ving/log.mjs';

export default function (job) {
    log('agent').debug(`Test ran with data: ` + JSON.stringify(job.data));
    return true;
}