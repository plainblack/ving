import { useCache } from '#ving/cache.mjs';
import { log } from '#ving/log.mjs';
import { sendMail } from '#ving/email/send.mjs';
import { addJob } from '#ving/jobs/queue.mjs';
import { ouch } from '#ving/utils/ouch.mjs';
import { useKind } from '#ving/record/VingRecord.mjs'
import { useDB } from '#ving/drizzle/db.mjs'
import { useRedis } from '#ving/jobs/connection.mjs'

/**
 * Exports a list of the most useful features of Ving from a single import location.
 * 
 * @returns an object containing the following:
 * 
 * cache - the same as the result of `useCache()` from '#ving/cache.mjs'
 * log() - the same as `log` from '#ving/log.mjs'
 * sendMail() - the same as `sendMail` from '#ving/email/send.mjs'
 * addJob() - the same as `addJob` from '#ving/jobs/queue.mjs'
 * ouch() - the same as `ouch` from '#ving/utils/ouch.mjs'
 * useKind() - the same as `useKind` from '#ving/record/VingRecord.mjs'
 * close() - closes the connections mysql, redis/BullMQ, and redis/cache
 */
export default {
    cache: useCache(),
    log,
    sendMail,
    addJob,
    ouch,
    useKind,
    close: async () => {
        await useDB().session.client.pool.end();
        await useCache().disconnect();
        await useRedis().disconnect();
    }
}