import { vingSession, vingBody } from '../../helpers';
import { cache } from '../../cache';
export default defineEventHandler(async (event) => {
    const session = vingSession(event);
    const body = await vingBody(event);
    cache.set('system-wide-alert', body, body.ttl);
    return body;
});