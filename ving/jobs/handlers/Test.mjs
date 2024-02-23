import ving from '#ving/index.mjs';

export default async function (job) {
    ving.log('agent').debug(`Test ran with data: ${JSON.stringify(job.data)}`);
    return true;
}