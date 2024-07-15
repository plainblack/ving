import ving from '#ving/index.mjs';
import { useKind } from '#ving/record/utils.mjs';

/**
 * This handler deletes a S3File if it does not achieve a ready state by the time this job runs. 
 * @param {Object} A `BullMQ` job.
 * @returns {boolean} `true`
 */
export default async function (job) {
    ving.log('jobs').info(`Instanciating S3File ${job.data.id}`);
    const s3files = await useKind('S3File');
    const s3file = await s3files.findOrDie(job.data.id);
    if (s3file.get('status') == 'ready') {
        ving.log('jobs').info(`S3File ${job.data.id} is in ready state.`);
        return true;
    }
    ving.log('jobs').info(`S3File ${job.data.id} should be cleaned up.`);
    await s3file.delete();
    return true;
}