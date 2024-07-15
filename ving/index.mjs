import { useCache } from '#ving/cache.mjs';
import { log } from '#ving/log.mjs';
import { sendMail } from '#ving/email/send.mjs';
import { addJob } from '#ving/jobs/queue.mjs';
import { ouch } from '#ving/utils/ouch.mjs';
import { sleep } from '#ving/utils/sleep.mjs';
import { miniHash } from '#ving/utils/miniHash.mjs';
//import { useKind } from '#ving/record/utils.mjs'
import { useDB } from '#ving/drizzle/db.mjs'
import { useRedis } from '#ving/redis.mjs'
import { getConfig } from '#ving/config.mjs';

/**
 * Exports a list of the most useful features of Ving from a single import location.
 * 
 * @returns an object containing the following:
 * 
 * useDB() - the same as the result of `useDB()` from '#ving/drizzle/db.mjs'
 * useCache() - the same as the result of `useCache()` from '#ving/cache.mjs'
 * log() - the same as `log` from '#ving/log.mjs'
 * sendMail() - the same as `sendMail` from '#ving/email/send.mjs'
 * sleep() - the same as `sleep` from '#ving/utils/sleep.mjs'
 * miniHash() - the same as `miniHash` from '#ving/utils/miniHash.mjs'
 * addJob() - the same as `addJob` from '#ving/jobs/queue.mjs'
 * ouch() - the same as `ouch` from '#ving/utils/ouch.mjs'
 * getConfig() - the sames `getConfig` from '#ving/config.mjs'
 * useKind() - the same as `useKind` from '#ving/record/VingRecord.mjs'
 * close() - closes the connections mysql, redis/BullMQ, and redis/cache
 */
export default {
    useDB,
    useCache,
    log,
    sendMail,
    sleep,
    miniHash,
    addJob,
    ouch,
    getConfig,
    //useKind,
    close: async () => {
        await useDB().session.client.pool.end();
        await useCache().disconnect();
        await useRedis().disconnect();
    }
}