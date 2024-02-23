import { useCache } from '#ving/cache.mjs';
import { log } from '#ving/log.mjs';
import { sendMail } from '#ving/email/send.mjs';
import { addJob } from '#ving/jobs/queue.mjs';
import { ouch } from '#ving/utils/ouch.mjs';
import { useKind } from '#ving/record/VingRecord.mjs'
import { useDB } from '#ving/drizzle/db.mjs'

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
    }
}