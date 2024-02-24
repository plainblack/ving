import ving from '#ving/index.mjs';

/**
 * This handler does nothing other that write to the log with whatever data was passed in. 
 * @param {Object} A `BullMQ` job.
 * @returns `true`
 */
export default async function (job) {
    ving.log('jobs').info(`Instanciating S3File ${job.data.id}`);
    const s3files = await ving.useKind('S3File');
    const s3file = await s3files.findOrDie(job.data.id);
    if (s3file.get('status') == 'ready') {
        ving.log('jobs').info(`S3File ${job.data.id} is in ready state.`);
        return true;
    }
    ving.log('jobs').info(`S3File ${job.data.id} should be cleaned up.`);
    await s3file.delete();
    return true;
}